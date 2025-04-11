import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SlidersHorizontal } from 'lucide-react';

interface FilterValues {
  query: string;
  brands: string[];
  minPrice: number | undefined;
  maxPrice: number | undefined;
  fuelTypes: string[];
  seatingCapacity: number | undefined;
  bodyTypes: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface FilterPanelProps {
  filters: FilterValues;
  onFilterChange: (filters: Partial<FilterValues>) => void;
}

export default function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterValues>(filters);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (field: keyof FilterValues, value: any) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: 'fuelTypes' | 'bodyTypes', value: string, checked: boolean) => {
    setLocalFilters(prev => {
      const currentValues = [...prev[field]];
      if (checked) {
        if (!currentValues.includes(value)) {
          currentValues.push(value);
        }
      } else {
        const index = currentValues.indexOf(value);
        if (index > -1) {
          currentValues.splice(index, 1);
        }
      }
      return { ...prev, [field]: currentValues };
    });
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
    setShowMobileFilters(false);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      query: '',
      brands: [],
      minPrice: undefined,
      maxPrice: undefined,
      fuelTypes: [],
      seatingCapacity: undefined,
      bodyTypes: [],
      sortBy: 'price',
      sortOrder: 'asc' as 'asc' | 'desc',
    };
    
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
    setShowMobileFilters(false);
  };

  const availableBrands = [
    'Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Tesla', 'Chevrolet', 
    'Volkswagen', 'Hyundai', 'Nissan', 'Porsche', 'Lexus', 'Kia'
  ];

  return (
    <aside id="filterPanel" className={`${showMobileFilters ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0 space-y-6`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="font-semibold text-lg mb-4 flex items-center">
          <SlidersHorizontal className="h-5 w-5 text-primary mr-2" />
          Filters
        </h2>
        
        {/* Brand filter */}
        <div className="mb-4">
          <Label className="block text-sm font-medium mb-2">Brand</Label>
          <div className="relative">
            <Select
              value={localFilters.brands.length === 1 ? localFilters.brands[0] : ""}
              onValueChange={(value) => {
                if (value === "") {
                  handleInputChange('brands', []);
                } else {
                  handleInputChange('brands', [value]);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Brands</SelectItem>
                {availableBrands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Price Range */}
        <div className="mb-4">
          <Label className="block text-sm font-medium mb-2">Price Range</Label>
          <div className="flex items-center space-x-2">
            <Input 
              type="number" 
              placeholder="Min" 
              className="w-full"
              value={localFilters.minPrice || ''}
              onChange={(e) => handleInputChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            />
            <span className="text-gray-500 dark:text-gray-400">to</span>
            <Input 
              type="number" 
              placeholder="Max" 
              className="w-full"
              value={localFilters.maxPrice || ''}
              onChange={(e) => handleInputChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </div>
        
        {/* Fuel Type */}
        <div className="mb-4">
          <Label className="block text-sm font-medium mb-2">Fuel Type</Label>
          <div className="space-y-2">
            {['Petrol', 'Diesel', 'Electric', 'Hybrid'].map(fuelType => (
              <div key={fuelType} className="flex items-center">
                <Checkbox 
                  id={`fuel-${fuelType}`} 
                  checked={localFilters.fuelTypes.includes(fuelType)}
                  onCheckedChange={(checked) => handleCheckboxChange('fuelTypes', fuelType, checked as boolean)}
                />
                <Label htmlFor={`fuel-${fuelType}`} className="ml-2 text-sm">{fuelType}</Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Seating Capacity */}
        <div className="mb-4">
          <Label className="block text-sm font-medium mb-2">Seating Capacity</Label>
          <div className="relative">
            <Select
              value={localFilters.seatingCapacity?.toString() || ""}
              onValueChange={(value) => {
                handleInputChange('seatingCapacity', value ? Number(value) : undefined);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="2">2 Seater</SelectItem>
                <SelectItem value="4">4 Seater</SelectItem>
                <SelectItem value="5">5 Seater</SelectItem>
                <SelectItem value="7">7 Seater</SelectItem>
                <SelectItem value="8">8+ Seater</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Body Type */}
        <div className="mb-4">
          <Label className="block text-sm font-medium mb-2">Body Type</Label>
          <div className="space-y-2">
            {['Sedan', 'SUV', 'Hatchback', 'Convertible', 'Coupe', 'Pickup'].map(bodyType => (
              <div key={bodyType} className="flex items-center">
                <Checkbox 
                  id={`body-${bodyType}`}
                  checked={localFilters.bodyTypes.includes(bodyType)}
                  onCheckedChange={(checked) => handleCheckboxChange('bodyTypes', bodyType, checked as boolean)}
                />
                <Label htmlFor={`body-${bodyType}`} className="ml-2 text-sm">{bodyType}</Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            onClick={handleApplyFilters}
            className="w-full"
          >
            Apply Filters
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleResetFilters}
            className="w-full"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </aside>
  );
}
