import { Car } from '@shared/schema';
import fetch from 'node-fetch';
import { log } from './vite';

// Cache mechanism to reduce API calls
const CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes
const cache: {
  [key: string]: {
    timestamp: number;
    data: any;
  }
} = {};

const CAR_API_KEY = process.env.CAR_API_KEY;
const CAR_API_BASE_URL = 'https://car-data.p.rapidapi.com';

// Function to check if cache is valid
const isCacheValid = (key: string): boolean => {
  if (!cache[key]) return false;
  return Date.now() - cache[key].timestamp < CACHE_EXPIRY;
};

// Wrapper for API calls with caching
async function fetchFromAPI(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  try {
    // Build query string
    const queryParams = new URLSearchParams(params).toString();
    const url = `${CAR_API_BASE_URL}${endpoint}${queryParams ? `?${queryParams}` : ''}`;
    
    // Check cache first
    const cacheKey = url;
    if (isCacheValid(cacheKey)) {
      log(`Using cached data for: ${url}`, 'car-api');
      return cache[cacheKey].data;
    }
    
    // Make actual API request if no valid cache exists
    log(`Fetching from API: ${url}`, 'car-api');
    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': CAR_API_KEY || '',
        'X-RapidAPI-Host': 'car-data.p.rapidapi.com'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the response
    cache[cacheKey] = {
      timestamp: Date.now(),
      data
    };
    
    return data;
  } catch (error) {
    log(`API Error: ${(error as Error).message}`, 'car-api');
    throw error;
  }
}

// Get all available car makes/brands
export async function getCarBrands(): Promise<string[]> {
  try {
    const data = await fetchFromAPI('/makes');
    return data;
  } catch (error) {
    log(`Failed to fetch car brands: ${(error as Error).message}`, 'car-api');
    return [];
  }
}

// Get all models for a specific make/brand
export async function getCarModels(make: string): Promise<string[]> {
  try {
    const data = await fetchFromAPI('/models', { make });
    return data;
  } catch (error) {
    log(`Failed to fetch car models: ${(error as Error).message}`, 'car-api');
    return [];
  }
}

// Get car types (body styles)
export async function getCarTypes(): Promise<string[]> {
  try {
    const data = await fetchFromAPI('/types');
    return data;
  } catch (error) {
    log(`Failed to fetch car types: ${(error as Error).message}`, 'car-api');
    return [];
  }
}

// Convert external API car data to our Car schema
function mapApiCarToCar(apiCar: any, index: number): Car {
  // Generate a semi-realistic price based on year and index
  const basePrice = 10000;
  const yearFactor = (apiCar.year - 2000) * 1000; 
  const randomFactor = Math.floor(Math.random() * 5000);
  const price = basePrice + yearFactor + randomFactor;
  
  // Choose random fuel type and transmission
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
  const transmissions = ['Automatic', 'Manual'];
  const fuelType = fuelTypes[Math.floor(Math.random() * fuelTypes.length)];
  const transmission = transmissions[Math.floor(Math.random() * transmissions.length)];
  
  // Generate seating capacity based on type
  let seatingCapacity = 5; // default
  if (apiCar.type?.toLowerCase().includes('suv')) {
    seatingCapacity = 7;
  } else if (apiCar.type?.toLowerCase().includes('coupe') || apiCar.type?.toLowerCase().includes('convertible')) {
    seatingCapacity = 2;
  }
  
  // Generate image URL based on car make and model
  const imageUrl = `https://source.unsplash.com/800x600/?car,${apiCar.make},${apiCar.model}`;
  
  return {
    id: (index + 1),
    brand: apiCar.make,
    model: apiCar.model,
    year: apiCar.year,
    price: price,
    fuelType: fuelType,
    transmission: transmission,
    seatingCapacity: seatingCapacity,
    mileage: Math.floor(Math.random() * 100000), // Random mileage
    bodyType: apiCar.type || null,
    description: `${apiCar.year} ${apiCar.make} ${apiCar.model} - ${apiCar.type || 'Sedan'}. Fuel type: ${fuelType}, Transmission: ${transmission}.`,
    imageUrl: imageUrl
  };
}

// Search for cars with various filters
export async function searchCars(params: {
  query?: string;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  fuelTypes?: string[];
  seatingCapacity?: number;
  bodyTypes?: string[];
  year?: number;
  limit?: number;
  offset?: number;
}): Promise<Car[]> {
  try {
    const { 
      query, brands, minPrice, maxPrice, fuelTypes, 
      seatingCapacity, bodyTypes, year, limit = 10, offset = 0 
    } = params;

    // Build API parameters
    const apiParams: Record<string, string> = {};
    
    if (brands && brands.length === 1) {
      apiParams.make = brands[0];
    }
    
    if (bodyTypes && bodyTypes.length === 1) {
      apiParams.type = bodyTypes[0];
    }
    
    if (year) {
      apiParams.year = year.toString();
    }
    
    // Get cars from API
    let cars: Car[] = [];
    
    // If searching for a specific make/brand
    if (apiParams.make) {
      const models = await fetchFromAPI('/models', { make: apiParams.make });
      
      // For each model, get year data
      for (const model of models.slice(0, 5)) { // Limit to 5 models to avoid too many API calls
        const modelYears = await fetchFromAPI('/years', { 
          make: apiParams.make, 
          model 
        });
        
        // For each year, create a car entry
        modelYears.forEach((year: number, index: number) => {
          cars.push(mapApiCarToCar({
            make: apiParams.make,
            model,
            year,
            type: bodyTypes && bodyTypes.length > 0 ? bodyTypes[0] : 'Sedan'
          }, cars.length));
        });
      }
    } else {
      // If no specific make is requested, get some popular brands
      const popularBrands = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes-Benz', 'Audi', 'Tesla'];
      const brandsToFetch = brands && brands.length > 0 ? brands : popularBrands;
      
      for (const brand of brandsToFetch.slice(0, 3)) { // Limit to 3 brands
        const models = await fetchFromAPI('/models', { make: brand });
        
        // For each brand, get up to 3 models
        for (const model of models.slice(0, 3)) {
          const modelYears = await fetchFromAPI('/years', { 
            make: brand, 
            model 
          });
          
          // For each model, use the latest 2 years
          const latestYears = modelYears.sort((a: number, b: number) => b - a).slice(0, 2);
          latestYears.forEach((year: number) => {
            cars.push(mapApiCarToCar({
              make: brand,
              model,
              year,
              type: bodyTypes && bodyTypes.length > 0 ? bodyTypes[0] : null
            }, cars.length));
          });
        }
      }
    }
    
    // Apply client-side filtering
    let filteredCars = cars;
    
    // Apply text search if query is provided
    if (query) {
      const searchTerms = query.toLowerCase().split(' ');
      filteredCars = filteredCars.filter(car => {
        const carText = `${car.brand} ${car.model} ${car.year} ${car.bodyType || ''} ${car.fuelType}`.toLowerCase();
        return searchTerms.every(term => carText.includes(term));
      });
    }
    
    // Filter by brands if multiple brands are selected
    if (brands && brands.length > 0) {
      filteredCars = filteredCars.filter(car => brands.includes(car.brand));
    }
    
    // Price range filter
    if (minPrice !== undefined) {
      filteredCars = filteredCars.filter(car => car.price >= minPrice);
    }
    if (maxPrice !== undefined) {
      filteredCars = filteredCars.filter(car => car.price <= maxPrice);
    }
    
    // Fuel type filter
    if (fuelTypes && fuelTypes.length > 0) {
      filteredCars = filteredCars.filter(car => fuelTypes.includes(car.fuelType));
    }
    
    // Seating capacity filter
    if (seatingCapacity !== undefined) {
      filteredCars = filteredCars.filter(car => car.seatingCapacity === seatingCapacity);
    }
    
    // Body type filter
    if (bodyTypes && bodyTypes.length > 0) {
      filteredCars = filteredCars.filter(car => car.bodyType && bodyTypes.includes(car.bodyType));
    }
    
    // Sort results by price (default)
    filteredCars.sort((a, b) => a.price - b.price);
    
    // Apply pagination
    return filteredCars.slice(offset, offset + limit);
    
  } catch (error) {
    log(`Failed to search cars: ${(error as Error).message}`, 'car-api');
    return [];
  }
}

// Get a specific car by ID
export async function getCarById(id: number): Promise<Car | undefined> {
  try {
    // Check if we have this car in any of our cached search results
    for (const cacheKey in cache) {
      if (cache[cacheKey].data && Array.isArray(cache[cacheKey].data)) {
        const car = cache[cacheKey].data.find((car: Car) => car.id === id);
        if (car) return car;
      }
    }
    
    // If not found in cache, do a broad search and try to find by ID
    const allCars = await searchCars({ limit: 100 });
    return allCars.find(car => car.id === id);
  } catch (error) {
    log(`Failed to get car by ID: ${(error as Error).message}`, 'car-api');
    return undefined;
  }
}