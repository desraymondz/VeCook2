import type { 
  Recipe, 
  RecipeStep, 
  Ingredient, 
  UserPreferences, 
  CookingSession,
  DietaryPreference 
} from './types';
import { COOKING_CONSTANTS, DIETARY_RESTRICTIONS } from './constants';

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate recipe data
 */
export function validateRecipe(recipe: Partial<Recipe>): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!recipe.id?.trim()) {
    errors.push('Recipe ID is required');
  }

  if (!recipe.title?.trim()) {
    errors.push('Recipe title is required');
  }

  if (!recipe.description?.trim()) {
    errors.push('Recipe description is required');
  }

  // Steps validation
  if (!recipe.steps || recipe.steps.length === 0) {
    errors.push('Recipe must have at least one step');
  } else {
    recipe.steps.forEach((step, index) => {
      const stepErrors = validateRecipeStep(step);
      if (!stepErrors.isValid) {
        errors.push(`Step ${index + 1}: ${stepErrors.errors.join(', ')}`);
      }
    });
  }

  // Ingredients validation
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    errors.push('Recipe must have at least one ingredient');
  } else {
    recipe.ingredients.forEach((ingredient, index) => {
      const ingredientErrors = validateIngredient(ingredient);
      if (!ingredientErrors.isValid) {
        errors.push(`Ingredient ${index + 1}: ${ingredientErrors.errors.join(', ')}`);
      }
    });
  }

  // Numeric validations
  if (typeof recipe.cookingTime !== 'number' || recipe.cookingTime <= 0) {
    errors.push('Cooking time must be a positive number');
  }

  if (typeof recipe.servings !== 'number' || recipe.servings < COOKING_CONSTANTS.MIN_SERVINGS || recipe.servings > COOKING_CONSTANTS.MAX_SERVINGS) {
    errors.push(`Servings must be between ${COOKING_CONSTANTS.MIN_SERVINGS} and ${COOKING_CONSTANTS.MAX_SERVINGS}`);
  }

  // Difficulty validation
  if (!['easy', 'medium', 'hard'].includes(recipe.difficulty as string)) {
    errors.push('Difficulty must be easy, medium, or hard');
  }

  // Nutrition validation
  if (recipe.nutrition) {
    if (typeof recipe.nutrition.calories !== 'number' || recipe.nutrition.calories < 0) {
      errors.push('Calories must be a non-negative number');
    }
    if (typeof recipe.nutrition.protein !== 'number' || recipe.nutrition.protein < 0) {
      errors.push('Protein must be a non-negative number');
    }
    if (typeof recipe.nutrition.carbs !== 'number' || recipe.nutrition.carbs < 0) {
      errors.push('Carbs must be a non-negative number');
    }
    if (typeof recipe.nutrition.fat !== 'number' || recipe.nutrition.fat < 0) {
      errors.push('Fat must be a non-negative number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate recipe step
 */
export function validateRecipeStep(step: Partial<RecipeStep>): ValidationResult {
  const errors: string[] = [];

  if (!step.id?.trim()) {
    errors.push('Step ID is required');
  }

  if (typeof step.stepNumber !== 'number' || step.stepNumber <= 0) {
    errors.push('Step number must be a positive number');
  }

  if (!step.instruction?.trim()) {
    errors.push('Step instruction is required');
  }

  if (step.duration !== undefined && (typeof step.duration !== 'number' || step.duration <= 0)) {
    errors.push('Step duration must be a positive number');
  }

  if (step.temperature !== undefined && (typeof step.temperature !== 'number' || step.temperature <= 0)) {
    errors.push('Temperature must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate ingredient
 */
export function validateIngredient(ingredient: Partial<Ingredient>): ValidationResult {
  const errors: string[] = [];

  if (!ingredient.name?.trim()) {
    errors.push('Ingredient name is required');
  }

  if (typeof ingredient.amount !== 'number' || ingredient.amount <= 0) {
    errors.push('Ingredient amount must be a positive number');
  }

  if (!ingredient.unit?.trim()) {
    errors.push('Ingredient unit is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate user preferences
 */
export function validateUserPreferences(preferences: Partial<UserPreferences>): ValidationResult {
  const errors: string[] = [];

  if (typeof preferences.googleFitConnected !== 'boolean') {
    errors.push('Google Fit connection status must be a boolean');
  }

  if (!['sedentary', 'light', 'moderate', 'active', 'very_active'].includes(preferences.activityLevel as string)) {
    errors.push('Activity level must be one of: sedentary, light, moderate, active, very_active');
  }

  if (preferences.dietaryPreferences) {
    preferences.dietaryPreferences.forEach((pref, index) => {
      const prefErrors = validateDietaryPreference(pref);
      if (!prefErrors.isValid) {
        errors.push(`Dietary preference ${index + 1}: ${prefErrors.errors.join(', ')}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate dietary preference
 */
export function validateDietaryPreference(preference: Partial<DietaryPreference>): ValidationResult {
  const errors: string[] = [];

  if (!['allergy', 'preference', 'restriction'].includes(preference.type as string)) {
    errors.push('Type must be allergy, preference, or restriction');
  }

  if (!preference.value?.trim()) {
    errors.push('Value is required');
  }

  if (preference.severity && !['mild', 'moderate', 'severe'].includes(preference.severity)) {
    errors.push('Severity must be mild, moderate, or severe');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate cooking session
 */
export function validateCookingSession(session: Partial<CookingSession>): ValidationResult {
  const errors: string[] = [];

  if (!session.recipeId?.trim()) {
    errors.push('Recipe ID is required');
  }

  if (typeof session.currentStep !== 'number' || session.currentStep < 0) {
    errors.push('Current step must be a non-negative number');
  }

  if (!(session.startTime instanceof Date)) {
    errors.push('Start time must be a valid Date');
  }

  if (session.endTime && !(session.endTime instanceof Date)) {
    errors.push('End time must be a valid Date');
  }

  if (typeof session.adjustedPortions !== 'number' || session.adjustedPortions <= 0) {
    errors.push('Adjusted portions must be a positive number');
  }

  if (!['active', 'paused', 'completed', 'abandoned'].includes(session.status as string)) {
    errors.push('Status must be active, paused, completed, or abandoned');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if dietary restriction is supported
 */
export function isSupportedDietaryRestriction(restriction: string): boolean {
  return DIETARY_RESTRICTIONS.includes(restriction.toLowerCase() as typeof DIETARY_RESTRICTIONS[number]);
}

/**
 * Validate portion adjustment
 */
export function validatePortionAdjustment(
  originalServings: number,
  targetServings: number
): ValidationResult {
  const errors: string[] = [];

  if (originalServings <= 0) {
    errors.push('Original servings must be positive');
  }

  if (targetServings < COOKING_CONSTANTS.MIN_SERVINGS || targetServings > COOKING_CONSTANTS.MAX_SERVINGS) {
    errors.push(`Target servings must be between ${COOKING_CONSTANTS.MIN_SERVINGS} and ${COOKING_CONSTANTS.MAX_SERVINGS}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}