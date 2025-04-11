import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import SearchBar from '@/components/search-bar';
import FilterPanel from '@/components/filter-panel';
import CarCard from '@/components/car-card';
import { Car } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useSearchHistory } from '@/lib/use-search-history';
import CarDetailsModal from '@/components/car-details-modal';
import BuyMessageModal from '@/components/buy-message-modal';
import ChatWidget from '@/components/chat-widget';

export default function HomePage() {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showCarDetails, setShowCarDetails] = useState(false);
  const [showBuyMessage, setShowBuyMessage] = useState(false);
  const [filters, setFilters] = useState({
    query: '',
    brands: [] as string[],
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    fuelTypes: [] as string[],
    seatingCapacity: undefined as number | undefined,
    bodyTypes: [] as string[],
    sortBy: 'price',
    sortOrder: 'asc' as 'asc' | 'desc',
  });
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { addSearchTerm } = useSearchHistory();
  const { toast } = useToast();
  const observer = useRef<IntersectionObserver | null>(null);
  const CARS_PER_PAGE = 10;

  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (filters.query) params.append('query', filters.query);
    if (filters.brands.length > 0) params.append('brands', filters.brands.join(','));
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.fuelTypes.length > 0) params.append('fuelTypes', filters.fuelTypes.join(','));
    if (filters.seatingCapacity !== undefined) params.append('seatingCapacity', filters.seatingCapacity.toString());
    if (filters.bodyTypes.length > 0) params.append('bodyTypes', filters.bodyTypes.join(','));
    
    params.append('sortBy', filters.sortBy);
    params.append('sortOrder', filters.sortOrder);
    params.append('limit', CARS_PER_PAGE.toString());
    params.append('offset', (page * CARS_PER_PAGE).toString());
    
    return `/api/cars/search?${params.toString()}`;
  };

  const {
    data: carsData,
    isLoading,
    error,
    isFetching,
  } = useQuery<Car[]>({
    queryKey: [buildQueryString()],
    keepPreviousData: true,
  });

  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      addSearchTerm(query);
    }
    
    setFilters(prev => ({ ...prev, query }));
    setPage(0);
    setHasMore(true);
  }, [addSearchTerm]);

  const handleFilterChange = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0);
    setHasMore(true);
  }, []);

  const lastCarElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isFetching) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && carsData && carsData.length > 0) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, isFetching, hasMore, carsData]);

  useEffect(() => {
    if (carsData && carsData.length < CARS_PER_PAGE) {
      setHasMore(false);
    }
  }, [carsData]);

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load cars. Please try again later.",
      variant: "destructive",
    });
  }

  const handleViewDetails = (car: Car) => {
    setSelectedCar(car);
    setShowCarDetails(true);
  };

  const handleBuyNow = (car: Car) => {
    setSelectedCar(car);
    setShowBuyMessage(true);
  };

  return (
    <main className="container mx-auto px-4 py-6 flex-1">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden sticky top-16 z-30 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
          <button 
            id="filterToggle" 
            className="w-full px-4 py-2 flex items-center justify-between text-sm font-medium"
            onClick={() => document.getElementById('filterPanel')?.classList.toggle('hidden')}
          >
            <span>Filters & Sort</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Filter Panel */}
        <FilterPanel 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar (Mobile) */}
          <div className="md:hidden mb-4">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Results Header */}
          <div className="flex flex-wrap justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Find Your Perfect Car</h1>
            
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Sort by:</label>
              <div className="relative inline-block">
                <select 
                  className="pl-3 pr-8 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-primary focus:border-primary appearance-none"
                  value={`${filters.sortBy}_${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('_');
                    handleFilterChange({ 
                      sortBy, 
                      sortOrder: sortOrder as 'asc' | 'desc' 
                    });
                  }}
                >
                  <option value="relevance_asc">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="year_desc">Newest First</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Results Count */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {isLoading ? 'Loading cars...' : 
              carsData?.length ? 
              `Showing ${page * CARS_PER_PAGE + 1}-${page * CARS_PER_PAGE + carsData.length} cars` : 
              'No cars found matching your criteria'}
          </p>
          
          {/* Car Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {carsData?.map((car, index) => (
              <div
                key={car.id}
                ref={index === carsData.length - 1 ? lastCarElementRef : null}
              >
                <CarCard 
                  car={car} 
                  onViewDetails={() => handleViewDetails(car)} 
                  onBuyNow={() => handleBuyNow(car)}
                />
              </div>
            ))}
          </div>
          
          {/* Loading More Indicator */}
          {(isLoading || isFetching) && (
            <div className="py-6 flex justify-center">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading more cars...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedCar && (
        <>
          <CarDetailsModal 
            car={selectedCar}
            isOpen={showCarDetails}
            onClose={() => setShowCarDetails(false)}
            onBuyNow={() => {
              setShowCarDetails(false);
              setShowBuyMessage(true);
            }}
          />
          
          <BuyMessageModal
            isOpen={showBuyMessage}
            onClose={() => setShowBuyMessage(false)}
          />
        </>
      )}
      
      {/* Chat Widget */}
      <ChatWidget />
    </main>
  );
}
