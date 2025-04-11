import { useState, useEffect } from 'react';

// Key for storing search history in localStorage
const SEARCH_HISTORY_KEY = 'brand-kiln-search-history';
// Maximum number of search terms to keep
const MAX_HISTORY_ITEMS = 10;

export const useSearchHistory = () => {
  // Initialize search history from localStorage
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const storedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (error) {
      console.error('Error loading search history from localStorage:', error);
      return [];
    }
  });

  // Update localStorage whenever search history changes
  useEffect(() => {
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
    } catch (error) {
      console.error('Error saving search history to localStorage:', error);
    }
  }, [searchHistory]);

  // Add a search term to history (at the beginning, for recency)
  const addSearchTerm = (term: string): void => {
    if (!term.trim()) return;
    
    setSearchHistory(prev => {
      // Remove the term if it already exists (to move it to the top)
      const filteredHistory = prev.filter(item => item.toLowerCase() !== term.toLowerCase());
      
      // Add the new term at the beginning and limit the length
      return [term, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
    });
  };

  // Remove a search term from history
  const removeSearchTerm = (term: string): void => {
    setSearchHistory(prev => prev.filter(item => item !== term));
  };

  // Clear the entire search history
  const clearSearchHistory = (): void => {
    setSearchHistory([]);
  };

  return {
    searchHistory,
    addSearchTerm,
    removeSearchTerm,
    clearSearchHistory
  };
};
