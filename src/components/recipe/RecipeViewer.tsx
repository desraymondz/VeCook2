'use client';

import { useState } from 'react';
import type { Recipe } from '@/lib/types';
import { formatCookingTime, formatIngredientAmount } from '@/lib/cooking-utils';
import Button from '@/components/ui/Button';

interface RecipeViewerProps {
  recipe: Recipe;
  currentStep: number;
  onStepChange: (step: number) => void;
  adjustedServings?: number;
}

export default function RecipeViewer({ 
  recipe, 
  currentStep, 
  onStepChange,
  adjustedServings = recipe.servings 
}: RecipeViewerProps) {
  const [showIngredients, setShowIngredients] = useState(true);
  
  const currentStepData = recipe.steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === recipe.steps.length - 1;
  
  // Calculate serving multiplier for ingredient adjustments
  const servingMultiplier = adjustedServings / recipe.servings;
  
  const adjustedIngredients = recipe.ingredients.map(ingredient => ({
    ...ingredient,
    amount: Math.round(ingredient.amount * servingMultiplier * 100) / 100
  }));

  const handlePrevious = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      onStepChange(currentStep + 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      {/* Recipe Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
        <p className="text-gray-600 mb-4">{recipe.description}</p>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            ⏱️ {formatCookingTime(recipe.cookingTime)}
          </span>
          <span className="flex items-center gap-1">
            👥 {adjustedServings} servings
          </span>
          <span className="flex items-center gap-1">
            📊 {recipe.difficulty}
          </span>
        </div>
      </div>

      {/* Ingredients Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowIngredients(!showIngredients)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors"
        >
          <span>{showIngredients ? '▼' : '▶'}</span>
          Ingredients ({adjustedIngredients.length})
        </button>
        
        {showIngredients && (
          <div className="mt-4 grid md:grid-cols-2 gap-2">
            {adjustedIngredients.map((ingredient, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                <span className="text-gray-800">
                  {formatIngredientAmount(ingredient)}
                </span>
                {ingredient.alternatives && (
                  <span className="text-xs text-gray-500 ml-auto">
                    or {ingredient.alternatives.join(', ')}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Step Display */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Step {currentStep + 1} of {recipe.steps.length}
          </h2>
          {currentStepData?.duration && (
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              ⏱️ {currentStepData.duration} min
            </span>
          )}
        </div>
        
        <div className="cooking-mode">
          <p className="step-text text-gray-800 leading-relaxed mb-4">
            {currentStepData?.instruction}
          </p>
          
          {currentStepData?.temperature && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <span className="text-orange-800 font-medium">
                🌡️ Temperature: {currentStepData.temperature}°F
              </span>
            </div>
          )}
          
          {currentStepData?.tips && currentStepData.tips.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Tips:</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                {currentStepData.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
          className="flex items-center gap-2"
        >
          ← Previous
        </Button>
        
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-2">Progress</div>
          <div className="flex gap-1">
            {recipe.steps.map((_, index) => (
              <button
                key={index}
                onClick={() => onStepChange(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-green-600'
                    : index < currentStep
                    ? 'bg-green-300'
                    : 'bg-gray-200'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        <Button
          onClick={handleNext}
          disabled={isLastStep}
          className="flex items-center gap-2"
        >
          {isLastStep ? 'Complete' : 'Next →'}
        </Button>
      </div>
    </div>
  );
}