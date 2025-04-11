import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API routes for cars
  app.get("/api/cars", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const cars = await storage.getCars(limit, offset);
      res.json(cars);
    } catch (error) {
      console.error("Error fetching cars:", error);
      res.status(500).json({ message: "Failed to fetch cars" });
    }
  });

  app.get("/api/cars/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const car = await storage.getCarById(id);
      
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      
      res.json(car);
    } catch (error) {
      console.error("Error fetching car:", error);
      res.status(500).json({ message: "Failed to fetch car" });
    }
  });

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
      
      const params = searchSchema.parse({
        query: req.query.query,
        brands: req.query.brands ? (req.query.brands as string).split(',') : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        fuelTypes: req.query.fuelTypes ? (req.query.fuelTypes as string).split(',') : undefined,
        seatingCapacity: req.query.seatingCapacity ? Number(req.query.seatingCapacity) : undefined,
        bodyTypes: req.query.bodyTypes ? (req.query.bodyTypes as string).split(',') : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        limit: req.query.limit ? Number(req.query.limit) : 10,
        offset: req.query.offset ? Number(req.query.offset) : 0,
      });
      
      const cars = await storage.searchCars(
        params.query,
        params.brands,
        params.minPrice,
        params.maxPrice,
        params.fuelTypes,
        params.seatingCapacity,
        params.bodyTypes,
        params.sortBy,
        params.sortOrder,
        params.limit,
        params.offset
      );
      
      res.json(cars);
    } catch (error) {
      console.error("Error searching cars:", error);
      res.status(500).json({ message: "Failed to search cars" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
