import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Car } from '@shared/schema';
import { useSearchHistory } from '@/lib/use-search-history';
import { useDebounce } from '@/hooks/use-debounce';
import { Search, Clock, Car as CarIcon } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedValue = useDebounce(inputValue, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { searchHistory } = useSearchHistory();

  // Get car suggestions based on the input
  const { data: suggestions } = useQuery<Car[]>({
    queryKey: [debouncedValue.length > 2 ? `/api/cars/search?query=${debouncedValue}&limit=5` : null],
    enabled: debouncedValue.length > 2,
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue);
    setShowSuggestions(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  // Handle clicks outside of suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search when debounced value changes
  useEffect(() => {
    if (debouncedValue.length > 2) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => inputValue.length > 0 && setShowSuggestions(true)}
            className="w-full p-2.5 pl-10 text-sm"
            placeholder="Search for cars (e.g., Mustang, SUV, Toyota)"
          />
        </div>
      </form>
      
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 max-h-60 overflow-auto"
        >
          {/* Recent Searches */}
          {searchHistory.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
                Recent Searches
              </div>
              {searchHistory.slice(0, 3).map((term, index) => (
                <div
                  key={`history-${index}`}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={() => handleSuggestionClick(term)}
                >
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{term}</span>
                </div>
              ))}
            </>
          )}
          
          {/* Car Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
                Car Suggestions
              </div>
              {suggestions.map((car) => (
                <div
                  key={car.id}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  onClick={() => handleSuggestionClick(`${car.brand} ${car.model}`)}
                >
                  <CarIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{car.brand} {car.model}</span>
                </div>
              ))}
            </>
          )}
          
          {/* No Suggestions */}
          {(!suggestions || suggestions.length === 0) && debouncedValue.length > 2 && (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              No matching cars found
            </div>
          )}
          
          {/* Short Query */}
          {debouncedValue.length > 0 && debouncedValue.length <= 2 && (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              Type at least 3 characters to search
            </div>
          )}
        </div>
      )}
    </div>
  );
}
