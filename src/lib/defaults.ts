import type { UserPreferences, GestureConfig, CookingSession } from './types';
import { GESTURE_CONFIG, COOKING_CONSTANTS } from './constants';

/**
 * Default user preferences
 */
export const defaultUserPreferences: UserPreferences = {
  googleFitConnected: false,
  dietaryPreferences: [],
  activityLevel: 'moderate',
  lastUpdated: new Date(),
};

/**
 * Default gesture configuration
 */
export const defaultGestureConfig: GestureConfig = {
  sensitivity: GESTURE_CONFIG.DEFAULT_SENSITIVITY,
  cooldownMs: GESTURE_CONFIG.DEFAULT_COOLDOWN_MS,
  requiredConfidence: GESTURE_CONFIG.DEFAULT_CONFIDENCE,
};

/**
 * Create a new cooking session
 */
export function createCookingSession(recipeId: string, servings?: number): CookingSession {
  return {
    recipeId,
    currentStep: 0,
    startTime: new Date(),
    adjustedPortions: servings || COOKING_CONSTANTS.DEFAULT_SERVINGS,
    aiInteractions: [],
    status: 'active',
  };
}

/**
 * Common cooking units and their conversions
 */
export const cookingUnits = {
  volume: {
    // Base unit: milliliters (ml)
    conversions: {
      'ml': 1,
      'l': 1000,
      'tsp': 4.92892,
      'tbsp': 14.7868,
      'cup': 236.588,
      'fl oz': 29.5735,
      'pint': 473.176,
      'quart': 946.353,
      'gallon': 3785.41,
    },
    display: ['ml', 'l', 'tsp', 'tbsp', 'cup', 'fl oz']
  },
  weight: {
    // Base unit: grams (g)
    conversions: {
      'g': 1,
      'kg': 1000,
      'oz': 28.3495,
      'lb': 453.592,
    },
    display: ['g', 'kg', 'oz', 'lb']
  },
  temperature: {
    // Celsius and Fahrenheit
    units: ['°C', '°F']
  }
};

/**
 * Common dietary restrictions with descriptions
 */
export const dietaryRestrictionsInfo = {
  'vegetarian': {
    description: 'No meat, poultry, or fish',
    severity: 'moderate',
    commonAllergens: []
  },
  'vegan': {
    description: 'No animal products',
    severity: 'high',
    commonAllergens: ['dairy', 'eggs', 'honey']
  },
  'gluten-free': {
    description: 'No wheat, barley, rye, or gluten',
    severity: 'high',
    commonAllergens: ['wheat', 'barley', 'rye']
  },
  'dairy-free': {
    description: 'No milk or dairy products',
    severity: 'moderate',
    commonAllergens: ['milk', 'cheese', 'butter', 'cream']
  },
  'nut-free': {
    description: 'No tree nuts or peanuts',
    severity: 'severe',
    commonAllergens: ['almonds', 'walnuts', 'peanuts', 'cashews', 'pistachios']
  },
  'low-carb': {
    description: 'Limited carbohydrates',
    severity: 'low',
    commonAllergens: []
  },
  'keto': {
    description: 'Very low carb, high fat',
    severity: 'moderate',
    commonAllergens: []
  },
  'paleo': {
    description: 'No grains, legumes, or processed foods',
    severity: 'moderate',
    commonAllergens: ['grains', 'legumes', 'processed foods']
  },
  'halal': {
    description: 'Islamic dietary laws',
    severity: 'high',
    commonAllergens: ['pork', 'alcohol']
  },
  'kosher': {
    description: 'Jewish dietary laws',
    severity: 'high',
    commonAllergens: ['pork', 'shellfish', 'mixing meat and dairy']
  }
};

/**
 * Sample recipe tags for filtering
 */
export const recipeTags = [
  // Meal types
  'breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer',
  
  // Cooking methods
  'baked', 'grilled', 'fried', 'steamed', 'roasted', 'slow-cooked', 'no-cook',
  
  // Cuisine types
  'italian', 'mexican', 'asian', 'indian', 'mediterranean', 'american', 'french',
  
  // Characteristics
  'quick', 'healthy', 'comfort-food', 'spicy', 'sweet', 'savory', 'one-pot',
  
  // Seasons
  'summer', 'winter', 'spring', 'fall', 'holiday',
  
  // Special occasions
  'party', 'date-night', 'family-friendly', 'meal-prep'
];

/**
 * Error messages for common validation failures
 */
export const errorMessages = {
  required: (field: string) => `${field} is required`,
  invalid: (field: string) => `${field} is invalid`,
  tooShort: (field: string, min: number) => `${field} must be at least ${min} characters`,
  tooLong: (field: string, max: number) => `${field} must be no more than ${max} characters`,
  outOfRange: (field: string, min: number, max: number) => `${field} must be between ${min} and ${max}`,
  notSupported: (field: string) => `${field} is not supported`,
  networkError: 'Network error. Please check your connection and try again.',
  storageError: 'Unable to save data. Please check your browser settings.',
  cameraError: 'Unable to access camera. Please check permissions.',
  gestureError: 'Gesture recognition failed. Using manual controls.',
  aiError: 'AI assistant is temporarily unavailable. Please try again later.',
};