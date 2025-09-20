// Core data types for VeCook application

export interface Recipe {
  id: string;
  title: string;
  description: string;
  steps: RecipeStep[];
  ingredients: Ingredient[];
  nutrition: NutritionInfo;
  difficulty: 'easy' | 'medium' | 'hard';
  cookingTime: number; // minutes
  servings: number;
  tags: string[];
  imageUrl?: string;
}

export interface RecipeStep {
  id: string;
  stepNumber: number;
  instruction: string;
  duration?: number; // minutes
  temperature?: number;
  tips?: string[];
  imageUrl?: string;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  alternatives?: string[];
}

export interface NutritionInfo {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
}

export interface UserPreferences {
  googleFitConnected: boolean;
  dietaryPreferences: DietaryPreference[];
  activityLevel: ActivityLevel;
  lastUpdated: Date;
}

export interface DietaryPreference {
  type: 'allergy' | 'preference' | 'restriction';
  value: string;
  severity?: 'mild' | 'moderate' | 'severe';
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface CookingSession {
  recipeId: string;
  currentStep: number;
  startTime: Date;
  endTime?: Date;
  adjustedPortions: number;
  aiInteractions: AIInteraction[];
  recordingBlob?: Blob;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
}

export interface AIInteraction {
  timestamp: Date;
  userMessage: string;
  aiResponse: string;
  context: 'help_request' | 'mistake_fix' | 'general_question';
}

export interface GestureState {
  isActive: boolean;
  currentGesture: GestureType | null;
  confidence: number;
  lastDetected: Date;
}

export type GestureType = 'point_right' | 'point_left' | 'hand_raise' | 'thumbs_up' | 'stop';

export interface GestureConfig {
  sensitivity: number;
  cooldownMs: number;
  requiredConfidence: number;
}

// Additional utility types
export interface RecipeFilter {
  difficulty?: 'easy' | 'medium' | 'hard';
  maxCookingTime?: number;
  tags?: string[];
  dietaryRestrictions?: string[];
  servings?: number;
}

export interface CookingTimer {
  id: string;
  stepId: string;
  duration: number; // seconds
  startTime: Date;
  isActive: boolean;
  label: string;
}

export interface PortionAdjustment {
  originalServings: number;
  targetServings: number;
  multiplier: number;
}

// Error types
export interface VeCookError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: VeCookError;
}

// Storage types
export interface StorageItem<T> {
  data: T;
  timestamp: Date;
  version: string;
}