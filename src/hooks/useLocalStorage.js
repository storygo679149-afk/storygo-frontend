import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage values with React state
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value if key doesn't exist
 * @returns {Array} - [storedValue, setValue, removeValue]
 */
const useLocalStorage = (key, initialValue) => {
  // Get initial value from localStorage or use default
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      
      if (item !== null) {
        // Handle JSON objects
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      }
      
      // Return initial value (handle function initializers)
      return initialValue instanceof Function ? initialValue() : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    try {
      if (storedValue === null || storedValue === undefined) {
        window.localStorage.removeItem(key);
      } else {
        const valueToStore = typeof storedValue === 'object' 
          ? JSON.stringify(storedValue) 
          : String(storedValue);
        window.localStorage.setItem(key, valueToStore);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== e.oldValue) {
        try {
          if (e.newValue === null) {
            setStoredValue(null);
          } else {
            try {
              setStoredValue(JSON.parse(e.newValue));
            } catch {
              setStoredValue(e.newValue);
            }
          }
        } catch (error) {
          console.error('Error handling storage change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  // Set value function
  const setValue = useCallback((value) => {
    try {
      setStoredValue(prevValue => {
        const newValue = value instanceof Function ? value(prevValue) : value;
        return newValue;
      });
    } catch (error) {
      console.error(`Error updating localStorage key "${key}":`, error);
    }
  }, [key]);

  // Remove value function
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(null);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key]);

  // Check if key exists
  const exists = storedValue !== null && storedValue !== undefined;

  return [storedValue, setValue, removeValue, exists];
};

// Specific hooks using useLocalStorage
export const useRecentSearches = (maxItems = 10) => {
  const [searches, setSearches] = useLocalStorage('recentSearches', []);

  const addSearch = useCallback((query) => {
    if (!query || query.trim().length === 0) return;
    
    setSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== query.toLowerCase());
      return [query, ...filtered].slice(0, maxItems);
    });
  }, [setSearches, maxItems]);

  const removeSearch = useCallback((query) => {
    setSearches(prev => prev.filter(s => s !== query));
  }, [setSearches]);

  const clearSearches = useCallback(() => {
    setSearches([]);
  }, [setSearches]);

  return {
    searches: searches || [],
    addSearch,
    removeSearch,
    clearSearches
  };
};

export const usePlaybackSettings = () => {
  const [settings, setSettings] = useLocalStorage('playbackSettings', {
    volume: 0.7,
    playbackSpeed: 1.0,
    autoPlay: true,
    saveProgress: true
  });

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, [setSettings]);

  return {
    settings,
    updateSetting
  };
};

export default useLocalStorage;