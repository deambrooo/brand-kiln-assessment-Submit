import { users, type User, type InsertUser, cars, type Car, type InsertCar } from "@shared/schema";
import { db } from "./db";
import { eq, like, and, or, between, desc, asc } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Car operations
  getCars(limit: number, offset: number): Promise<Car[]>;
  getCarById(id: number): Promise<Car | undefined>;
  searchCars(
    query?: string, 
    brands?: string[], 
    minPrice?: number, 
    maxPrice?: number, 
    fuelTypes?: string[], 
    seatingCapacity?: number, 
    bodyTypes?: string[],
    sortBy?: string,
    sortOrder?: string,
    limit?: number,
    offset?: number
  ): Promise<Car[]>;
  
  // For authentication session storage
  sessionStore: session.SessionStore;
}

// Database implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Car methods
  async getCars(limit: number = 10, offset: number = 0): Promise<Car[]> {
    return await db
      .select()
      .from(cars)
      .limit(limit)
      .offset(offset);
  }

  async getCarById(id: number): Promise<Car | undefined> {
    const [car] = await db
      .select()
      .from(cars)
      .where(eq(cars.id, id));
    return car;
  }

  async searchCars(
    query?: string, 
    brands?: string[], 
    minPrice?: number, 
    maxPrice?: number, 
    fuelTypes?: string[], 
    seatingCapacity?: number, 
    bodyTypes?: string[],
    sortBy: string = 'price',
    sortOrder: string = 'asc',
    limit: number = 10,
    offset: number = 0
  ): Promise<Car[]> {
    let conditions = [];

    // Search query (brand or model)
    if (query) {
      conditions.push(
        or(
          like(cars.brand, `%${query}%`),
          like(cars.model, `%${query}%`)
        )
      );
    }

    // Brand filter
    if (brands && brands.length > 0) {
      conditions.push(
        or(...brands.map(brand => eq(cars.brand, brand)))
      );
    }

    // Price range filter
    if (minPrice !== undefined && maxPrice !== undefined) {
      conditions.push(between(cars.price, minPrice, maxPrice));
    } else if (minPrice !== undefined) {
      conditions.push(cars.price >= minPrice);
    } else if (maxPrice !== undefined) {
      conditions.push(cars.price <= maxPrice);
    }

    // Fuel type filter
    if (fuelTypes && fuelTypes.length > 0) {
      conditions.push(
        or(...fuelTypes.map(fuelType => eq(cars.fuelType, fuelType)))
      );
    }

    // Seating capacity filter
    if (seatingCapacity) {
      conditions.push(eq(cars.seatingCapacity, seatingCapacity));
    }

    // Body type filter
    if (bodyTypes && bodyTypes.length > 0) {
      conditions.push(
        or(...bodyTypes.map(bodyType => eq(cars.bodyType, bodyType)))
      );
    }

    // Build query with filters
    let query_builder = db.select().from(cars);
    
    if (conditions.length > 0) {
      query_builder = query_builder.where(and(...conditions));
    }

    // Add sorting
    if (sortBy && sortOrder) {
      // @ts-ignore: Dynamic property access
      const columnToSort = cars[sortBy];
      if (columnToSort) {
        if (sortOrder.toLowerCase() === 'desc') {
          query_builder = query_builder.orderBy(desc(columnToSort));
        } else {
          query_builder = query_builder.orderBy(asc(columnToSort));
        }
      }
    }

    // Add pagination
    query_builder = query_builder.limit(limit).offset(offset);

    return await query_builder;
  }
}

// For development/testing, we can use an in-memory storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cars: Map<number, Car>;
  currentUserId: number;
  currentCarId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.cars = new Map();
    this.currentUserId = 1;
    this.currentCarId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Seed with some sample cars for development
    this.seedCars();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Car methods
  async getCars(limit: number = 10, offset: number = 0): Promise<Car[]> {
    const allCars = Array.from(this.cars.values());
    return allCars.slice(offset, offset + limit);
  }

  async getCarById(id: number): Promise<Car | undefined> {
    return this.cars.get(id);
  }

  async searchCars(
    query?: string, 
    brands?: string[], 
    minPrice?: number, 
    maxPrice?: number, 
    fuelTypes?: string[], 
    seatingCapacity?: number, 
    bodyTypes?: string[],
    sortBy: string = 'price',
    sortOrder: string = 'asc',
    limit: number = 10,
    offset: number = 0
  ): Promise<Car[]> {
    let filteredCars = Array.from(this.cars.values());

    // Apply filters
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filteredCars = filteredCars.filter(car => 
        car.brand.toLowerCase().includes(lowercaseQuery) || 
        car.model.toLowerCase().includes(lowercaseQuery)
      );
    }

    if (brands && brands.length > 0) {
      filteredCars = filteredCars.filter(car => brands.includes(car.brand));
    }

    if (minPrice !== undefined) {
      filteredCars = filteredCars.filter(car => car.price >= minPrice);
    }

    if (maxPrice !== undefined) {
      filteredCars = filteredCars.filter(car => car.price <= maxPrice);
    }

    if (fuelTypes && fuelTypes.length > 0) {
      filteredCars = filteredCars.filter(car => fuelTypes.includes(car.fuelType));
    }

    if (seatingCapacity) {
      filteredCars = filteredCars.filter(car => car.seatingCapacity === seatingCapacity);
    }

    if (bodyTypes && bodyTypes.length > 0) {
      filteredCars = filteredCars.filter(car => bodyTypes.includes(car.bodyType || ''));
    }

    // Apply sorting
    if (sortBy) {
      filteredCars.sort((a, b) => {
        // @ts-ignore: Dynamic property access
        const aValue = a[sortBy];
        // @ts-ignore: Dynamic property access
        const bValue = b[sortBy];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'desc' 
            ? bValue.localeCompare(aValue) 
            : aValue.localeCompare(bValue);
        } else {
          return sortOrder === 'desc' 
            ? (bValue as number) - (aValue as number) 
            : (aValue as number) - (bValue as number);
        }
      });
    }

    // Apply pagination
    return filteredCars.slice(offset, offset + limit);
  }

  // Seed method for development testing
  private seedCars() {
    const carData: Omit<Car, 'id'>[] = [
      {
        brand: 'Ford',
        model: 'Mustang GT',
        year: 2022,
        price: 45999,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        seatingCapacity: 4,
        mileage: 25000,
        bodyType: 'Coupe',
        description: 'The Ford Mustang GT Premium comes with a powerful 5.0L V8 engine producing 460 horsepower.',
        imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      },
      {
        brand: 'Mercedes-Benz',
        model: 'E-Class',
        year: 2023,
        price: 58200,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        seatingCapacity: 5,
        mileage: 12000,
        bodyType: 'Sedan',
        description: 'Luxurious and powerful with premium comfort features.',
        imageUrl: 'https://images.unsplash.com/photo-1595908129746-57ca1a63dd4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      },
      {
        brand: 'Tesla',
        model: 'Model 3',
        year: 2023,
        price: 42990,
        fuelType: 'Electric',
        transmission: 'Automatic',
        seatingCapacity: 5,
        mileage: 18000,
        bodyType: 'Sedan',
        description: 'Revolutionary electric vehicle with autopilot features.',
        imageUrl: 'https://images.unsplash.com/photo-1623080522068-3b6af3be9d52?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      },
      {
        brand: 'Toyota',
        model: 'Corolla',
        year: 2022,
        price: 21550,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        seatingCapacity: 5,
        mileage: 5000,
        bodyType: 'Sedan',
        description: 'Reliable and fuel-efficient compact sedan.',
        imageUrl: 'https://images.unsplash.com/photo-1542230387-bfc77d70f34f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      },
      {
        brand: 'BMW',
        model: 'X5',
        year: 2023,
        price: 63900,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        seatingCapacity: 7,
        mileage: 30000,
        bodyType: 'SUV',
        description: 'Luxury SUV with powerful performance and spacious interior.',
        imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      },
      {
        brand: 'Honda',
        model: 'Civic',
        year: 2022,
        price: 22350,
        fuelType: 'Petrol',
        transmission: 'Manual',
        seatingCapacity: 5,
        mileage: 8500,
        bodyType: 'Hatchback',
        description: 'Sporty and efficient compact car with advanced tech features.',
        imageUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      },
      {
        brand: 'Audi',
        model: 'Q7',
        year: 2023,
        price: 57500,
        fuelType: 'Diesel',
        transmission: 'Automatic',
        seatingCapacity: 7,
        mileage: 15000,
        bodyType: 'SUV',
        description: 'Premium luxury SUV with quattro all-wheel drive.',
        imageUrl: 'https://images.unsplash.com/photo-1614377282888-0d84e3c01a0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      },
      {
        brand: 'Chevrolet',
        model: 'Camaro',
        year: 2022,
        price: 39000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        seatingCapacity: 4,
        mileage: 20000,
        bodyType: 'Coupe',
        description: 'Iconic American muscle car with aggressive styling.',
        imageUrl: 'https://images.unsplash.com/photo-1585503418537-88331351ad99?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      },
      {
        brand: 'Toyota',
        model: 'RAV4',
        year: 2023,
        price: 28500,
        fuelType: 'Hybrid',
        transmission: 'Automatic',
        seatingCapacity: 5,
        mileage: 10000,
        bodyType: 'SUV',
        description: 'Reliable compact SUV with excellent fuel economy.',
        imageUrl: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      },
      {
        brand: 'Porsche',
        model: '911',
        year: 2023,
        price: 115000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        seatingCapacity: 2,
        mileage: 5000,
        bodyType: 'Coupe',
        description: 'Legendary sports car with uncompromising performance.',
        imageUrl: 'https://images.unsplash.com/photo-1611651338590-5a8e5d6ccf9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      },
      {
        brand: 'Volkswagen',
        model: 'Golf',
        year: 2022,
        price: 24500,
        fuelType: 'Petrol',
        transmission: 'Manual',
        seatingCapacity: 5,
        mileage: 12000,
        bodyType: 'Hatchback',
        description: 'Versatile hatchback with German engineering.',
        imageUrl: 'https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      },
      {
        brand: 'Hyundai',
        model: 'Tucson',
        year: 2023,
        price: 27000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        seatingCapacity: 5,
        mileage: 8000,
        bodyType: 'SUV',
        description: 'Modern compact SUV with bold styling and tech features.',
        imageUrl: 'https://images.unsplash.com/photo-1605618313023-df957d610656?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
      }
    ];

    carData.forEach(car => {
      const id = this.currentCarId++;
      this.cars.set(id, { ...car, id });
    });
  }
}

// Choose which storage implementation to use based on environment
export const storage = process.env.NODE_ENV === 'production' 
  ? new DatabaseStorage() 
  : new MemStorage();
