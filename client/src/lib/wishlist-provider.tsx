import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { Car } from '@shared/schema';

// Key for storing wishlist in localStorage
const WISHLIST_STORAGE_KEY = 'brand-kiln-wishlist';

type WishlistContextType = {
  wishlist: Car[];
  isInWishlist: (carId: number) => boolean;
  addToWishlist: (car: Car) => void;
  removeFromWishlist: (carId: number) => void;
  toggleWishlist: (car: Car) => void;
  clearWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  // Initialize wishlist from localStorage
  const [wishlist, setWishlist] = useState<Car[]>(() => {
    if (typeof window === 'undefined') return [];
    
    try {
      const storedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return storedWishlist ? JSON.parse(storedWishlist) : [];
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
      return [];
    }
  });

  // Update localStorage whenever wishlist changes
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
    }
  }, [wishlist]);

  // Check if a car is in the wishlist
  const isInWishlist = (carId: number): boolean => {
    return wishlist.some(car => car.id === carId);
  };

  // Add car to wishlist
  const addToWishlist = (car: Car): void => {
    if (!isInWishlist(car.id)) {
      setWishlist(prev => [...prev, car]);
    }
  };

  // Remove car from wishlist
  const removeFromWishlist = (carId: number): void => {
    setWishlist(prev => prev.filter(car => car.id !== carId));
  };

  // Toggle car in wishlist (add if not present, remove if present)
  const toggleWishlist = (car: Car): void => {
    if (isInWishlist(car.id)) {
      removeFromWishlist(car.id);
    } else {
      addToWishlist(car);
    }
  };

  // Clear the entire wishlist
  const clearWishlist = (): void => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}