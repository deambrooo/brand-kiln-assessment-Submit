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
    return [
      // Japanese brands
      'Toyota', 'Honda', 'Nissan', 'Suzuki', 'Lexus', 'Acura', 'Mazda', 'Mitsubishi', 'Subaru', 'Infiniti', 
      // US brands
      'Ford', 'Chevrolet', 'Cadillac', 'Jeep', 'Dodge', 'Chrysler', 'GMC', 'Buick', 'Lincoln', 'Tesla',
      // European brands
      'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Porsche', 'Jaguar', 'Land Rover', 'Volvo', 'Ferrari', 'Lamborghini',
      // Korean brands
      'Hyundai', 'Kia', 'Genesis',
      // Indian brands
      'Mahindra', 'Tata', 'Maruti Suzuki', 'Force Motors', 'Hindustan Motors'
    ];
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
      'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Supra', 'Land Cruiser', 'Yaris'],
      'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Fit', 'HR-V', 'Odyssey'],
      'Ford': ['F-150', 'Escape', 'Explorer', 'Mustang', 'Focus', 'Ranger', 'Bronco'],
      'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'M3', 'M5', 'i8'],
      'Mercedes': ['C-Class', 'E-Class', 'GLC', 'S-Class', 'AMG GT', 'G-Wagon', 'EQS'],
      'Audi': ['A4', 'A6', 'Q5', 'Q7', 'R8', 'e-tron', 'TT'],
      'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck', 'Roadster'],
      'Nissan': ['Altima', 'Maxima', 'Rogue', 'Pathfinder', 'GTR', '370Z', 'Leaf'],
      'Suzuki': ['Swift', 'Vitara', 'Jimny', 'S-Cross', 'Ignis', 'Baleno'],
      'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Kona'],
      'Kia': ['Forte', 'Optima', 'Sportage', 'Sorento', 'Telluride', 'Soul'],
      'Chevrolet': ['Malibu', 'Impala', 'Equinox', 'Tahoe', 'Silverado', 'Corvette', 'Camaro'],
      'Lexus': ['ES', 'IS', 'RX', 'GX', 'LX', 'LC', 'LS'],
      'Acura': ['ILX', 'TLX', 'RDX', 'MDX', 'NSX']
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
  
  // Generate a reliable image URL based on car make and model
  // Using specific images that are more reliable than random unsplash searches
  const imageUrls: Record<string, string> = {
    // Japanese brands
    'Toyota': 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg',
    'Honda': 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg',
    'Nissan': 'https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg',
    'Suzuki': 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg',
    'Lexus': 'https://images.pexels.com/photos/248687/pexels-photo-248687.jpeg',
    'Acura': 'https://images.pexels.com/photos/248747/pexels-photo-248747.jpeg',
    'Mazda': 'https://images.pexels.com/photos/1082655/pexels-photo-1082655.jpeg',
    'Mitsubishi': 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg',
    'Subaru': 'https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg',
    'Infiniti': 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg',
    
    // US brands
    'Ford': 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg',
    'Chevrolet': 'https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg',
    'Tesla': 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg',
    'Cadillac': 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg',
    'Jeep': 'https://images.pexels.com/photos/119435/pexels-photo-119435.jpeg',
    'Dodge': 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg',
    'Chrysler': 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg',
    'GMC': 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg',
    'Buick': 'https://images.pexels.com/photos/35967/mini-cooper-auto-model-vehicle.jpg',
    'Lincoln': 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg',
    
    // European brands
    'BMW': 'https://images.pexels.com/photos/100656/pexels-photo-100656.jpeg',
    'Mercedes': 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg',
    'Audi': 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg',
    'Volkswagen': 'https://images.pexels.com/photos/1164778/pexels-photo-1164778.jpeg',
    'Porsche': 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg',
    'Jaguar': 'https://images.pexels.com/photos/136872/pexels-photo-136872.jpeg',
    'Land Rover': 'https://images.pexels.com/photos/1638459/pexels-photo-1638459.jpeg',
    'Volvo': 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg',
    'Ferrari': 'https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg',
    'Lamborghini': 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg',
    
    // Korean brands
    'Hyundai': 'https://images.pexels.com/photos/627678/pexels-photo-627678.jpeg',
    'Kia': 'https://images.pexels.com/photos/1035108/pexels-photo-1035108.jpeg',
    'Genesis': 'https://images.pexels.com/photos/248747/pexels-photo-248747.jpeg',
    
    // Indian brands
    'Mahindra': 'https://images.pexels.com/photos/1638459/pexels-photo-1638459.jpeg',
    'Tata': 'https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg',
    'Maruti Suzuki': 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg',
    'Force Motors': 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg',
    'Hindustan Motors': 'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg'
  };
  
  const imageUrl = imageUrls[apiCar.make as keyof typeof imageUrls] || 'https://images.pexels.com/photos/3166786/pexels-photo-3166786.jpeg';
  
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
      const popularBrands = [
        'Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Tesla', 'Nissan', 'Suzuki', 
        'Mahindra', 'Tata', 'Volkswagen', 'Maruti Suzuki', 'Jeep', 'Kia', 'Hyundai'
      ];
      const brandsToFetch = brands && brands.length > 0 ? brands : popularBrands;
      
      // Generate some fallback cars for demo purposes
      for (const brand of brandsToFetch) {
        // Use our fallback models - expanded to include more models like Swift and GTR
        const fallbackModels = {
          // Japanese brands
          'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Supra', 'Land Cruiser', 'Yaris', 'Prius', 'Avalon', 'Venza', 'Sienna'],
          'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Fit', 'HR-V', 'Odyssey', 'Insight', 'Ridgeline', 'Passport'],
          'Nissan': ['Altima', 'Maxima', 'Rogue', 'Pathfinder', 'GTR', '370Z', 'Leaf', 'Sentra', 'Murano', 'Kicks', 'Frontier', 'Titan'],
          'Suzuki': ['Swift', 'Vitara', 'Jimny', 'S-Cross', 'Ignis', 'Baleno', 'Ciaz', 'Ertiga', 'XL6', 'Dzire', 'Alto'],
          'Mazda': ['Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-9', 'MX-5 Miata', 'RX-8', 'RX-7'],
          'Mitsubishi': ['Outlander', 'Eclipse Cross', 'Mirage', 'Pajero', 'Lancer', 'Evolution', 'Montero'],
          'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'WRX', 'STI', 'BRZ'],
          'Lexus': ['ES', 'IS', 'LS', 'RX', 'GX', 'LX', 'LC', 'RC', 'NX', 'UX', 'GS'],
          'Acura': ['ILX', 'TLX', 'RDX', 'MDX', 'NSX', 'RSX', 'TSX', 'RLX'],
          'Infiniti': ['Q50', 'Q60', 'QX50', 'QX60', 'QX80', 'G35', 'G37', 'FX35'],
          
          // US brands
          'Ford': ['F-150', 'Escape', 'Explorer', 'Mustang', 'Focus', 'Ranger', 'Bronco', 'Edge', 'Expedition', 'Maverick', 'EcoSport', 'Mach-E'],
          'Chevrolet': ['Malibu', 'Impala', 'Equinox', 'Tahoe', 'Silverado', 'Corvette', 'Camaro', 'Suburban', 'Blazer', 'Traverse', 'Colorado', 'Bolt'],
          'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck', 'Roadster', 'Semi'],
          'Cadillac': ['CT4', 'CT5', 'XT4', 'XT5', 'XT6', 'Escalade', 'CTS', 'ATS', 'SRX', 'Lyriq'],
          'Jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Wagoneer', 'Commander'],
          'Dodge': ['Charger', 'Challenger', 'Durango', 'Journey', 'Viper', 'RAM 1500', 'RAM 2500'],
          'Chrysler': ['300', 'Pacifica', 'Voyager', 'Town & Country', 'PT Cruiser', 'Sebring'],
          'GMC': ['Sierra', 'Yukon', 'Terrain', 'Acadia', 'Canyon', 'Hummer EV', 'Savana'],
          'Buick': ['Enclave', 'Encore', 'Envision', 'Regal', 'LaCrosse', 'Verano'],
          'Lincoln': ['Navigator', 'Aviator', 'Corsair', 'Nautilus', 'MKZ', 'Continental', 'Town Car'],
          
          // European brands
          'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'M3', 'M5', 'i8', '7 Series', 'X1', 'X7', 'Z4', 'i4', 'iX'],
          'Mercedes': ['C-Class', 'E-Class', 'GLC', 'S-Class', 'AMG GT', 'G-Wagon', 'EQS', 'GLA', 'GLE', 'CLA', 'A-Class', 'SL'],
          'Audi': ['A4', 'A6', 'Q5', 'Q7', 'R8', 'e-tron', 'TT', 'A3', 'A8', 'Q3', 'Q8', 'RS6', 'S4'],
          'Volkswagen': ['Golf', 'Passat', 'Tiguan', 'Atlas', 'Jetta', 'Arteon', 'ID.4', 'Taos', 'Polo', 'Touareg', 'Beetle'],
          'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Boxster', 'Cayman', '718'],
          'Jaguar': ['F-Pace', 'XF', 'XE', 'I-Pace', 'F-Type', 'XJ', 'E-Pace'],
          'Land Rover': ['Range Rover', 'Discovery', 'Defender', 'Evoque', 'Velar', 'Sport', 'LR4'],
          'Volvo': ['XC90', 'XC60', 'XC40', 'S60', 'S90', 'V60', 'V90', 'C40'],
          'Ferrari': ['Roma', 'Portofino', 'SF90', 'F8', '812', '296', 'LaFerrari'],
          'Lamborghini': ['Aventador', 'Huracan', 'Urus', 'Revuelto', 'Gallardo', 'Murcielago', 'Countach'],
          
          // Korean brands
          'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Kona', 'Ioniq', 'Venue', 'Accent', 'Veloster', 'Nexo', 'Ioniq 5'],
          'Kia': ['Forte', 'Optima', 'Sportage', 'Sorento', 'Telluride', 'Soul', 'Stinger', 'Niro', 'Seltos', 'K5', 'EV6', 'Rio'],
          'Genesis': ['G70', 'G80', 'G90', 'GV70', 'GV80', 'GV60', 'Electrified G80'],
          
          // Indian brands
          'Mahindra': ['XUV700', 'Thar', 'Scorpio', 'XUV300', 'Bolero', 'Marazzo', 'KUV100', 'XUV500', 'TUV300', 'Alturas G4'],
          'Tata': ['Nexon', 'Harrier', 'Safari', 'Punch', 'Tiago', 'Altroz', 'Tigor', 'Hexa', 'Nano', 'Sierra EV'],
          'Maruti Suzuki': ['Swift', 'Baleno', 'Brezza', 'Dzire', 'WagonR', 'Alto', 'Ertiga', 'Ciaz', 'S-Presso', 'Celerio', 'Jimny'],
          'Force Motors': ['Gurkha', 'Trax', 'Traveller', 'Cruiser'],
          'Hindustan Motors': ['Ambassador', 'Contessa']
        };
        
        const models = fallbackModels[brand as keyof typeof fallbackModels] || [];
        
        // For each brand, add models - include more models for variety
        for (const model of models) {
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
      const searchTerm = query.toLowerCase().trim();
      filteredCars = filteredCars.filter(car => {
        const brand = car.brand.toLowerCase();
        const model = car.model.toLowerCase();
        const bodyType = (car.bodyType || '').toLowerCase();
        const fuelType = car.fuelType.toLowerCase();
        const yearStr = car.year.toString();
        
        // Check if any specific field contains the search term
        return (
          brand.includes(searchTerm) || 
          model.includes(searchTerm) || 
          bodyType.includes(searchTerm) || 
          fuelType.includes(searchTerm) ||
          yearStr.includes(searchTerm) ||
          // Also check combined text for multi-word searches
          `${brand} ${model}`.includes(searchTerm)
        );
      });
      
      // If no results, try for specific models across all brands
      if (filteredCars.length === 0) {
        // Handle special case searches for specific models
        const specificModels: Record<string, string> = {
          // Japanese models
          'gtr': 'Nissan GTR',
          'skyline': 'Nissan GTR',
          'swift': 'Suzuki Swift',
          'civic': 'Honda Civic',
          'accord': 'Honda Accord',
          'corolla': 'Toyota Corolla',
          'camry': 'Toyota Camry',
          'supra': 'Toyota Supra',
          'rx7': 'Mazda RX-7',
          'miata': 'Mazda MX-5 Miata',
          'lancer': 'Mitsubishi Lancer',
          'evo': 'Mitsubishi Evolution',
          
          // US models
          'mustang': 'Ford Mustang',
          'f150': 'Ford F-150',
          'bronco': 'Ford Bronco',
          'camaro': 'Chevrolet Camaro',
          'corvette': 'Chevrolet Corvette',
          'silverado': 'Chevrolet Silverado',
          'tesla': 'Tesla Model 3',
          'model3': 'Tesla Model 3',
          'models': 'Tesla Model S',
          'modelx': 'Tesla Model X',
          'modely': 'Tesla Model Y',
          'wrangler': 'Jeep Wrangler',
          'cherokee': 'Jeep Cherokee',
          'escalade': 'Cadillac Escalade',
          'challenger': 'Dodge Challenger',
          'charger': 'Dodge Charger',
          'ram': 'Dodge RAM 1500',
          
          // European models
          'bmw': 'BMW 3 Series',
          '911': 'Porsche 911',
          'cayenne': 'Porsche Cayenne',
          'benz': 'Mercedes C-Class',
          'cclass': 'Mercedes C-Class',
          'eclass': 'Mercedes E-Class',
          'sclass': 'Mercedes S-Class',
          'gwagon': 'Mercedes G-Wagon',
          'a4': 'Audi A4',
          'r8': 'Audi R8',
          'tt': 'Audi TT',
          'golf': 'Volkswagen Golf',
          'jetta': 'Volkswagen Jetta',
          'beetle': 'Volkswagen Beetle',
          'ferrari': 'Ferrari Roma',
          'lambo': 'Lamborghini Aventador',
          'range rover': 'Land Rover Range Rover',
          'discovery': 'Land Rover Discovery',
          'defender': 'Land Rover Defender',
          
          // Korean models
          'sonata': 'Hyundai Sonata',
          'elantra': 'Hyundai Elantra',
          'tucson': 'Hyundai Tucson',
          'santafe': 'Hyundai Santa Fe',
          'telluride': 'Kia Telluride',
          'k5': 'Kia K5',
          'soul': 'Kia Soul',
          'sportage': 'Kia Sportage',
          'g70': 'Genesis G70',
          'g80': 'Genesis G80',
          
          // Indian models
          'alto': 'Maruti Suzuki Alto',
          'wagonr': 'Maruti Suzuki WagonR',
          'brezza': 'Maruti Suzuki Brezza',
          'dzire': 'Maruti Suzuki Dzire',
          'baleno': 'Suzuki Baleno',
          'thar': 'Mahindra Thar',
          'scorpio': 'Mahindra Scorpio',
          'xuv700': 'Mahindra XUV700',
          'xuv500': 'Mahindra XUV500',
          'xuv300': 'Mahindra XUV300',
          'bolero': 'Mahindra Bolero',
          'nexon': 'Tata Nexon',
          'harrier': 'Tata Harrier',
          'safari': 'Tata Safari',
          'tiago': 'Tata Tiago',
          'nano': 'Tata Nano',
          'altroz': 'Tata Altroz',
          'ambassador': 'Hindustan Motors Ambassador',
          'contessa': 'Hindustan Motors Contessa',
          'gurkha': 'Force Motors Gurkha'
        };
        
        if (specificModels[searchTerm]) {
          const [specificBrand, specificModel] = specificModels[searchTerm].split(' ');
          
          // Check all cars for the specific brand and model
          filteredCars = cars.filter(car => 
            car.brand.toLowerCase() === specificBrand.toLowerCase() && 
            car.model.toLowerCase().includes(specificModel.toLowerCase())
          );
        }
      }
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