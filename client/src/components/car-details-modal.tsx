import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Car } from '@shared/schema';
import { useWishlist } from '@/lib/use-wishlist';
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Share2, 
  Check 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CarDetailsModalProps {
  car: Car;
  isOpen: boolean;
  onClose: () => void;
  onBuyNow: () => void;
}

export default function CarDetailsModal({ car, isOpen, onClose, onBuyNow }: CarDetailsModalProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(car.id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Mock multiple images based on the car's single image
  const images = [
    car.imageUrl,
    // We'll simulate different angles of the same car by using the same image
    car.imageUrl,
    car.imageUrl,
    car.imageUrl,
    car.imageUrl
  ];
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div>
          {/* Car Gallery */}
          <div className="relative h-64 sm:h-72 md:h-80 bg-gray-200 dark:bg-gray-700">
            <img 
              src={images[currentImageIndex]} 
              alt={`${car.brand} ${car.model}`} 
              className="w-full h-full object-cover"
            />
            
            {/* Gallery Navigation */}
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <button 
                className="bg-white/70 dark:bg-gray-800/70 rounded-full w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                className="bg-white/70 dark:bg-gray-800/70 rounded-full w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
            
            {/* Wishlist Button */}
            <button 
              className={`absolute top-4 right-4 bg-white/70 dark:bg-gray-800/70 rounded-full w-8 h-8 flex items-center justify-center ${
                inWishlist ? 'text-red-500' : 'text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(car);
              }}
            >
              <Heart className={inWishlist ? "fill-current" : ""} size={18} />
            </button>
            
            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {currentImageIndex + 1}/{images.length}
            </div>
          </div>
          
          {/* Car Details Content */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{car.brand} {car.model}</h2>
                <p className="text-gray-600 dark:text-gray-400">{car.year} {car.bodyType || ''}</p>
              </div>
              <div className="text-2xl font-bold text-primary-500">${car.price.toLocaleString()}</div>
            </div>
            
            {/* Key Specifications */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto text-gray-500 dark:text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-sm font-medium">{car.fuelType}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto text-gray-500 dark:text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-sm font-medium">{car.transmission}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto text-gray-500 dark:text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-sm font-medium">{car.seatingCapacity} Seats</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto text-gray-500 dark:text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-sm font-medium">{car.mileage?.toLocaleString() || '0'} mi</p>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="flex -mb-px space-x-8">
                <button className="text-primary-500 border-primary-500 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
                  Overview
                </button>
                <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 whitespace-nowrap py-2 px-1 border-b-2 border-transparent font-medium text-sm">
                  Features
                </button>
                <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 whitespace-nowrap py-2 px-1 border-b-2 border-transparent font-medium text-sm">
                  Specifications
                </button>
                <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 whitespace-nowrap py-2 px-1 border-b-2 border-transparent font-medium text-sm">
                  Reviews
                </button>
              </nav>
            </div>
            
            {/* Overview Content */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Description</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {car.description || `The ${car.brand} ${car.model} is a ${car.year} ${car.fuelType.toLowerCase()} vehicle with ${car.seatingCapacity} seats and ${car.transmission.toLowerCase()} transmission.`}
              </p>
              
              <h3 className="font-semibold text-lg mb-3">Key Features</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-secondary-500 mr-2" />
                  {car.year} Model Year
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-secondary-500 mr-2" />
                  {car.transmission} Transmission
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-secondary-500 mr-2" />
                  {car.fuelType} Engine
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-secondary-500 mr-2" />
                  {car.seatingCapacity} Seater
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-secondary-500 mr-2" />
                  {car.bodyType || 'Standard'} Body Type
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-secondary-500 mr-2" />
                  {car.mileage?.toLocaleString() || '0'} Miles
                </li>
              </ul>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="default"
                  className="flex-1"
                  onClick={() => {
                    // In a real app, this would open a contact form
                    alert('Contact Seller functionality would be implemented here');
                  }}
                >
                  Contact Seller
                </Button>
                <Button 
                  variant="secondary"
                  className="flex-1"
                  onClick={onBuyNow}
                >
                  Buy Now
                </Button>
                <Button 
                  variant="outline"
                  className="sm:flex-initial"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
