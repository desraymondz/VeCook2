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