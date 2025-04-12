import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import * as carApi from "./car-api";
import { log } from "./vite";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API routes for cars
  app.get("/api/cars", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      // Use real car API instead of storage
      const cars = await carApi.searchCars({ limit, offset });
      res.json(cars);
    } catch (error) {
      log("Error fetching cars: " + (error as Error).message, "api");
      res.status(500).json({ message: "Failed to fetch cars" });
    }
  });

  // Get car brands
  app.get("/api/car-brands", async (req, res) => {
    try {
      const brands = await carApi.getCarBrands();
      res.json(brands);
    } catch (error) {
      log("Error fetching car brands: " + (error as Error).message, "api");
      res.status(500).json({ message: "Failed to fetch car brands" });
    }
  });

  // Get car body types
  app.get("/api/car-types", async (req, res) => {
    try {
      const types = await carApi.getCarTypes();
      res.json(types);
    } catch (error) {
      log("Error fetching car types: " + (error as Error).message, "api");
      res.status(500).json({ message: "Failed to fetch car types" });
    }
  });

  // This route needs to be defined before the /api/cars/:id route to avoid conflict
  app.get("/api/cars/search", async (req, res) => {
    try {
      const searchSchema = z.object({
        query: z.string().optional(),
        brands: z.array(z.string()).optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        fuelTypes: z.array(z.string()).optional(),
        seatingCapacity: z.number().optional(),
        bodyTypes: z.array(z.string()).optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        limit: z.number().min(1).max(50).optional(),
        offset: z.number().min(0).optional(),
      });
      
      // Extract and process query parameters
      const params = {
        query: req.query.query as string | undefined,
        brands: req.query.brands ? (req.query.brands as string).split(',') : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        fuelTypes: req.query.fuelTypes ? (req.query.fuelTypes as string).split(',') : undefined,
        seatingCapacity: req.query.seatingCapacity ? Number(req.query.seatingCapacity) : undefined,
        bodyTypes: req.query.bodyTypes ? (req.query.bodyTypes as string).split(',') : undefined,
        sortBy: req.query.sortBy as string | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        offset: req.query.offset ? Number(req.query.offset) : 0,
      };
      
      // Use real car API
      const cars = await carApi.searchCars(params);
      
      res.json(cars);
    } catch (error) {
      log("Error searching cars: " + (error as Error).message, "api");
      res.status(500).json({ message: "Failed to search cars" });
    }
  });

  app.get("/api/cars/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const car = await carApi.getCarById(id);
      
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      
      res.json(car);
    } catch (error) {
      log("Error fetching car: " + (error as Error).message, "api");
      res.status(500).json({ message: "Failed to fetch car" });
    }
  });

  // Account management routes
  app.delete("/api/user", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID not found" });
      }
      
      // Delete user from database
      await storage.deleteUser(userId);
      
      // Logout the user
      req.logout((err) => {
        if (err) {
          return res.status(500).json({ message: "Error during logout" });
        }
        res.status(200).json({ message: "Account deleted successfully" });
      });
    } catch (error) {
      log("Error deleting user account: " + (error as Error).message, "api");
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
