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

const CAR_API_TOKEN = process.env.CAR_API_TOKEN;
const CAR_API_SECRET = process.env.CAR_API_SECRET;
const CAR_API_BASE_URL = 'https://api.carprovider.com';

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
        'X-API-Token': CAR_API_TOKEN || '',
        'X-API-Secret': CAR_API_SECRET || '',
        'Content-Type': 'application/json'
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
    const data = await fetchFromAPI('/car/brands');
    return data;
  } catch (error) {
    log(`Failed to fetch car brands: ${(error as Error).message}`, 'car-api');
    // Provide fallback brands if API fails
    return ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Tesla'];
  }
}

// Get all models for a specific make/brand
export async function getCarModels(make: string): Promise<string[]> {
  try {
    const data = await fetchFromAPI('/car/models', { make });
    return data;
  } catch (error) {
    log(`Failed to fetch car models: ${(error as Error).message}`, 'car-api');
    // Provide some fallback models if API fails
    const fallbackModels = {
      'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander'],
      'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot'],
      'Ford': ['F-150', 'Escape', 'Explorer', 'Mustang'],
      'BMW': ['3 Series', '5 Series', 'X3', 'X5'],
      'Mercedes': ['C-Class', 'E-Class', 'GLC', 'S-Class'],
      'Audi': ['A4', 'A6', 'Q5', 'Q7'],
      'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y']
    };
    return fallbackModels[make as keyof typeof fallbackModels] || [];
  }
}

// Get car types (body styles)
export async function getCarTypes(): Promise<string[]> {
  try {
    const data = await fetchFromAPI('/car/types');
    return data;
  } catch (error) {
    log(`Failed to fetch car types: ${(error as Error).message}`, 'car-api');
    // Provide fallback body types if API fails
    return ['Sedan', 'SUV', 'Hatchback', 'Convertible', 'Coupe', 'Pickup'];
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
    
    // Build search parameters
    const searchParams: Record<string, string> = {};
    
    if (query) {
      searchParams.query = query;
    }
    
    if (brands && brands.length > 0) {
      searchParams.brand = brands.join(',');
    }
    
    if (minPrice !== undefined) {
      searchParams.minPrice = minPrice.toString();
    }
    
    if (maxPrice !== undefined) {
      searchParams.maxPrice = maxPrice.toString();
    }
    
    if (bodyTypes && bodyTypes.length > 0) {
      searchParams.bodyType = bodyTypes.join(',');
    }
    
    if (year) {
      searchParams.year = year.toString();
    }
    
    // Set pagination parameters
    searchParams.limit = limit.toString();
    searchParams.offset = offset.toString();
    
    try {
      // Search for cars using the real API
      const apiCars = await fetchFromAPI('/car/search', searchParams);
      
      // Map the API response to our Car schema
      cars = apiCars.map((apiCar: any, index: number) => mapApiCarToCar(apiCar, index));
    } catch (error) {
      log(`Error fetching from real API, using fallback data: ${(error as Error).message}`, 'car-api');
      
      // If the API call fails, use some fallback data
      const popularBrands = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Tesla'];
      const brandsToFetch = brands && brands.length > 0 ? brands : popularBrands;
      
      // Generate some fallback cars for demo purposes
      for (const brand of brandsToFetch.slice(0, 3)) {
        // Use our fallback models
        const fallbackModels = {
          'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander'],
          'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot'],
          'Ford': ['F-150', 'Escape', 'Explorer', 'Mustang'],
          'BMW': ['3 Series', '5 Series', 'X3', 'X5'],
          'Mercedes': ['C-Class', 'E-Class', 'GLC', 'S-Class'],
          'Audi': ['A4', 'A6', 'Q5', 'Q7'],
          'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y']
        };
        
        const models = fallbackModels[brand as keyof typeof fallbackModels] || [];
        
        // For each brand, add models
        for (const model of models.slice(0, 3)) {
          // Current year and previous year
          const currentYear = new Date().getFullYear();
          const years = [currentYear, currentYear - 1, currentYear - 2];
          
          years.forEach((year, idx) => {
            cars.push(mapApiCarToCar({
              make: brand,
              model: model,
              year: year,
              type: bodyTypes && bodyTypes.length > 0 ? bodyTypes[0] : (idx % 2 === 0 ? 'Sedan' : 'SUV')
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
    // Try to get the car directly from the API
    try {
      const car = await fetchFromAPI(`/car/${id}`);
      return mapApiCarToCar(car, id);
    } catch (directFetchError) {
      log(`Direct car fetch failed, searching in cache: ${(directFetchError as Error).message}`, 'car-api');
      
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
    }
  } catch (error) {
    log(`Failed to get car by ID: ${(error as Error).message}`, 'car-api');
    return undefined;
  }
}