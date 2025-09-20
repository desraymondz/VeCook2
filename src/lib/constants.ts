// Application constants

export const APP_CONFIG = {
  name: 'VeCook',
  description: 'Your AI Cooking Assistant',
  version: '2.0.0',
} as const;

export const STORAGE_KEYS = {
  USER_PREFERENCES: 'vecook_user_preferences',
  COOKING_SESSION: 'vecook_cooking_session',
  RECIPE_HISTORY: 'vecook_recipe_history',
} as const;

export const GESTURE_CONFIG = {
  DEFAULT_SENSITIVITY: 0.7,
  DEFAULT_COOLDOWN_MS: 1000,
  DEFAULT_CONFIDENCE: 0.8,
  CAMERA_WIDTH: 640,
  CAMERA_HEIGHT: 480,
} as const;

export const COOKING_CONSTANTS = {
  DEFAULT_SERVINGS: 4,
  MIN_SERVINGS: 1,
  MAX_SERVINGS: 12,
  STEP_TRANSITION_DELAY: 500, // ms
} as const;

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.0,
  light: 1.1,
  moderate: 1.2,
  active: 1.3,
  very_active: 1.4,
} as const;

export const DIETARY_RESTRICTIONS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'low-carb',
  'keto',
  'paleo',
  'halal',
  'kosher',
] as const;