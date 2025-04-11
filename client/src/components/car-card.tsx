import { useState } from 'react';
import { Car } from '@shared/schema';
import { useWishlist } from '@/lib/use-wishlist';
import { Heart } from 'lucide-react';

interface CarCardProps {
  car: Car;
  onViewDetails: () => void;
  onBuyNow: () => void;
}

export default function CarCard({ car, onViewDetails, onBuyNow }: CarCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(car.id);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:transform hover:scale-[1.02] hover:shadow-lg">
      <div className="relative">
        <div className={`w-full h-48 bg-gray-200 dark:bg-gray-700 ${imageLoaded ? 'hidden' : 'flex items-center justify-center'}`}>
          <svg className="w-10 h-10 text-gray-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <img 
          src={car.imageUrl} 
          alt={`${car.brand} ${car.model}`} 
          className={`w-full h-48 object-cover ${imageLoaded ? 'block' : 'hidden'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        <button 
          className={`absolute top-2 right-2 w-8 h-8 rounded-full ${inWishlist 
            ? 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400' 
            : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400'} 
            flex items-center justify-center transition-colors duration-200`}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(car);
          }}
        >
          <Heart className={inWishlist ? "fill-current" : ""} size={18} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-3">
          <p className="font-medium">${car.price.toLocaleString()}</p>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{car.brand} {car.model}</h3>
        
        {/* Car details */}
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{car.fuelType}</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{car.seatingCapacity} Seats</span>
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>{car.mileage?.toLocaleString() || '0'} mi</span>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="mt-4 flex space-x-2">
          <button 
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium py-2 rounded transition"
            onClick={onViewDetails}
          >
            View Details
          </button>
          <button 
            className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-white text-sm font-medium py-2 rounded transition"
            onClick={onBuyNow}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
