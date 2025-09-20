import { STORAGE_KEYS } from './constants';
import type { UserPreferences, CookingSession } from './types';

// Safe localStorage wrapper that handles SSR
const isClient = typeof window !== 'undefined';

export const storage = {
  get: <T>(key: string): T | null => {
    if (!isClient) return null;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (!isClient) return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    if (!isClient) return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  clear: (): void => {
    if (!isClient) return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Session storage wrapper
export const sessionStorage = {
  get: <T>(key: string): T | null => {
    if (!isClient) return null;
    
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from sessionStorage key "${key}":`, error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (!isClient) return;
    
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to sessionStorage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    if (!isClient) return;
    
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  }
};

// Specific storage functions for VeCook data
export const userPreferencesStorage = {
  get: (): UserPreferences | null => {
    return storage.get<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
  },

  set: (preferences: UserPreferences): void => {
    storage.set(STORAGE_KEYS.USER_PREFERENCES, preferences);
  },

  update: (updates: Partial<UserPreferences>): void => {
    const current = userPreferencesStorage.get();
    if (current) {
      userPreferencesStorage.set({ ...current, ...updates, lastUpdated: new Date() });
    }
  }
};

export const cookingSessionStorage = {
  get: (): CookingSession | null => {
    return sessionStorage.get<CookingSession>(STORAGE_KEYS.COOKING_SESSION);
  },

  set: (session: CookingSession): void => {
    sessionStorage.set(STORAGE_KEYS.COOKING_SESSION, session);
  },

  clear: (): void => {
    sessionStorage.remove(STORAGE_KEYS.COOKING_SESSION);
  }
};

// Recipe history storage
export const recipeHistoryStorage = {
  get: (): string[] => {
    return storage.get<string[]>(STORAGE_KEYS.RECIPE_HISTORY) || [];
  },

  add: (recipeId: string): void => {
    const history = recipeHistoryStorage.get();
    const updatedHistory = [recipeId, ...history.filter(id => id !== recipeId)].slice(0, 20); // Keep last 20
    storage.set(STORAGE_KEYS.RECIPE_HISTORY, updatedHistory);
  },

  remove: (recipeId: string): void => {
    const history = recipeHistoryStorage.get();
    const updatedHistory = history.filter(id => id !== recipeId);
    storage.set(STORAGE_KEYS.RECIPE_HISTORY, updatedHistory);
  },

  clear: (): void => {
    storage.remove(STORAGE_KEYS.RECIPE_HISTORY);
  }
};

// Generic storage with versioning
export const versionedStorage = {
  get: <T>(key: string, currentVersion: string): T | null => {
    const item = storage.get<{ data: T; version: string; timestamp: string }>(key);
    
    if (!item) return null;
    
    // Check version compatibility
    if (item.version !== currentVersion) {
      console.warn(`Storage version mismatch for ${key}. Expected: ${currentVersion}, Found: ${item.version}`);
      storage.remove(key);
      return null;
    }
    
    return item.data;
  },

  set: <T>(key: string, data: T, version: string): void => {
    const item = {
      data,
      version,
      timestamp: new Date().toISOString()
    };
    storage.set(key, item);
  }
};

// Storage utilities
export const storageUtils = {
  // Get storage size in bytes
  getStorageSize: (): number => {
    if (!isClient) return 0;
    
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  },

  // Check if storage is available
  isStorageAvailable: (): boolean => {
    if (!isClient) return false;
    
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  // Clear all VeCook data
  clearAllVeCookData: (): void => {
    if (!isClient) return;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      storage.remove(key);
    });
  },

  // Export all VeCook data
  exportData: (): Record<string, unknown> => {
    if (!isClient) return {};
    
    const data: Record<string, unknown> = {};
    Object.values(STORAGE_KEYS).forEach(key => {
      const value = storage.get(key);
      if (value !== null) {
        data[key] = value;
      }
    });
    return data;
  },

  // Import VeCook data
  importData: (data: Record<string, unknown>): void => {
    if (!isClient) return;
    
    Object.entries(data).forEach(([key, value]) => {
      if (Object.values(STORAGE_KEYS).includes(key as typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS])) {
        storage.set(key, value);
      }
    });
  }
};