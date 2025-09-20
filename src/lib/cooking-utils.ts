import type { Recipe, Ingredient, PortionAdjustment, NutritionInfo } from './types';
import { COOKING_CONSTANTS, ACTIVITY_MULTIPLIERS } from './constants';

/**
 * Calculate portion adjustment multiplier
 */
export function calculatePortionMultiplier(
  originalServings: number,
  targetServings: number
): PortionAdjustment {
  const multiplier = targetServings / originalServings;
  
  return {
    originalServings,
    targetServings,
    multiplier: Math.round(multiplier * 100) / 100, // Round to 2 decimal places
  };
}

/**
 * Adjust ingredient amounts based on serving size
 */
export function adjustIngredientAmounts(
  ingredients: Ingredient[],
  multiplier: number
): Ingredient[] {
  return ingredients.map(ingredient => ({
    ...ingredient,
    amount: Math.round(ingredient.amount * multiplier * 100) / 100,
  }));
}

/**
 * Adjust nutrition information based on serving size
 */
export function adjustNutritionInfo(
  nutrition: NutritionInfo,
  multiplier: number
): NutritionInfo {
  return {
    calories: Math.round(nutrition.calories * multiplier),
    protein: Math.round(nutrition.protein * multiplier * 10) / 10,
    carbs: Math.round(nutrition.carbs * multiplier * 10) / 10,
    fat: Math.round(nutrition.fat * multiplier * 10) / 10,
    fiber: nutrition.fiber ? Math.round(nutrition.fiber * multiplier * 10) / 10 : undefined,
    sugar: nutrition.sugar ? Math.round(nutrition.sugar * multiplier * 10) / 10 : undefined,
  };
}

/**
 * Adjust recipe for target servings
 */
export function adjustRecipeServings(recipe: Recipe, targetServings: number): Recipe {
  const adjustment = calculatePortionMultiplier(recipe.servings, targetServings);
  
  return {
    ...recipe,
    servings: targetServings,
    ingredients: adjustIngredientAmounts(recipe.ingredients, adjustment.multiplier),
    nutrition: adjustNutritionInfo(recipe.nutrition, adjustment.multiplier),
  };
}

/**
 * Calculate recommended servings based on activity level
 */
export function calculateRecommendedServings(
  baseServings: number,
  activityLevel: keyof typeof ACTIVITY_MULTIPLIERS
): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  const recommended = Math.round(baseServings * multiplier);
  
  // Ensure within reasonable bounds
  return Math.max(
    COOKING_CONSTANTS.MIN_SERVINGS,
    Math.min(COOKING_CONSTANTS.MAX_SERVINGS, recommended)
  );
}

/**
 * Convert cooking time to human-readable format
 */
export function formatCookingTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Convert temperature between Celsius and Fahrenheit
 */
export function convertTemperature(
  temperature: number,
  from: 'C' | 'F',
  to: 'C' | 'F'
): number {
  if (from === to) return temperature;
  
  if (from === 'C' && to === 'F') {
    return Math.round((temperature * 9/5) + 32);
  }
  
  if (from === 'F' && to === 'C') {
    return Math.round((temperature - 32) * 5/9);
  }
  
  return temperature;
}

/**
 * Format ingredient amount with proper units
 */
export function formatIngredientAmount(ingredient: Ingredient): string {
  const { amount, unit, name } = ingredient;
  
  // Handle fractional amounts
  if (amount < 1 && amount > 0) {
    const fraction = convertToFraction(amount);
    return `${fraction} ${unit} ${name}`;
  }
  
  // Handle whole numbers
  if (amount === Math.floor(amount)) {
    return `${amount} ${unit} ${name}`;
  }
  
  // Handle decimals
  return `${amount.toFixed(1)} ${unit} ${name}`;
}

/**
 * Convert decimal to common cooking fractions
 */
function convertToFraction(decimal: number): string {
  const fractions = [
    { decimal: 0.125, fraction: '1/8' },
    { decimal: 0.25, fraction: '1/4' },
    { decimal: 0.333, fraction: '1/3' },
    { decimal: 0.5, fraction: '1/2' },
    { decimal: 0.667, fraction: '2/3' },
    { decimal: 0.75, fraction: '3/4' },
  ];
  
  const closest = fractions.reduce((prev, curr) => 
    Math.abs(curr.decimal - decimal) < Math.abs(prev.decimal - decimal) ? curr : prev
  );
  
  // If the difference is small enough, use the fraction
  if (Math.abs(closest.decimal - decimal) < 0.05) {
    return closest.fraction;
  }
  
  return decimal.toFixed(2);
}

/**
 * Calculate total recipe calories per serving
 */
export function calculateCaloriesPerServing(recipe: Recipe): number {
  return Math.round(recipe.nutrition.calories / recipe.servings);
}

/**
 * Estimate cooking difficulty score (1-10)
 */
export function calculateDifficultyScore(recipe: Recipe): number {
  let score = 1;
  
  // Base difficulty
  switch (recipe.difficulty) {
    case 'easy': score += 1; break;
    case 'medium': score += 3; break;
    case 'hard': score += 5; break;
  }
  
  // Number of steps
  score += Math.min(recipe.steps.length * 0.2, 2);
  
  // Cooking time
  if (recipe.cookingTime > 60) score += 1;
  if (recipe.cookingTime > 120) score += 1;
  
  // Number of ingredients
  score += Math.min(recipe.ingredients.length * 0.1, 1);
  
  return Math.min(Math.round(score), 10);
}

/**
 * Check if recipe matches dietary restrictions
 */
export function matchesDietaryRestrictions(
  recipe: Recipe,
  restrictions: string[]
): boolean {
  if (restrictions.length === 0) return true;
  
  const recipeTags = recipe.tags.map(tag => tag.toLowerCase());
  
  return restrictions.every(restriction => {
    const restrictionLower = restriction.toLowerCase();
    return recipeTags.includes(restrictionLower);
  });
}

/**
 * Generate cooking timeline for recipe steps
 */
export function generateCookingTimeline(recipe: Recipe): Array<{
  stepNumber: number;
  instruction: string;
  startTime: number; // minutes from start
  duration: number; // minutes
}> {
  let currentTime = 0;
  
  return recipe.steps.map(step => {
    const timeline = {
      stepNumber: step.stepNumber,
      instruction: step.instruction,
      startTime: currentTime,
      duration: step.duration || 5, // Default 5 minutes if not specified
    };
    
    currentTime += timeline.duration;
    return timeline;
  });
}