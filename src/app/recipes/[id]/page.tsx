'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRecipeById } from '@/lib/sample-data';
import { adjustRecipeServings } from '@/lib/cooking-utils';
import { createCookingSession } from '@/lib/defaults';
import { cookingSessionStorage } from '@/lib/storage';
import RecipeViewer from '@/components/recipe/RecipeViewer';
import StepNavigator from '@/components/recipe/StepNavigator';
import Button from '@/components/ui/Button';
import type { Recipe } from '@/lib/types';

export default function RecipePage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.id as string;
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [adjustedServings, setAdjustedServings] = useState(4);
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [showNavigator, setShowNavigator] = useState(true);

  useEffect(() => {
    const foundRecipe = getRecipeById(recipeId);
    if (foundRecipe) {
      setRecipe(foundRecipe);
      setAdjustedServings(foundRecipe.servings);
      
      // Check if there's an existing cooking session
      const existingSession = cookingSessionStorage.get();
      if (existingSession && existingSession.recipeId === recipeId) {
        setCurrentStep(existingSession.currentStep);
        setAdjustedServings(existingSession.adjustedPortions);
        setIsCookingMode(existingSession.status === 'active');
      }
    }
  }, [recipeId]);

  const handleStartCooking = () => {
    if (!recipe) return;
    
    const session = createCookingSession(recipe.id, adjustedServings);
    cookingSessionStorage.set(session);
    setIsCookingMode(true);
    setCurrentStep(0);
  };

  const handleStopCooking = () => {
    cookingSessionStorage.clear();
    setIsCookingMode(false);
    setCurrentStep(0);
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    
    // Update cooking session if in cooking mode
    if (isCookingMode) {
      const session = cookingSessionStorage.get();
      if (session) {
        cookingSessionStorage.set({
          ...session,
          currentStep: step
        });
      }
    }
  };

  const handleServingsChange = (servings: number) => {
    setAdjustedServings(servings);
    
    // Update cooking session if active
    if (isCookingMode) {
      const session = cookingSessionStorage.get();
      if (session) {
        cookingSessionStorage.set({
          ...session,
          adjustedPortions: servings
        });
      }
    }
  };

  if (!recipe) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Recipe Not Found</h1>
          <p className="text-gray-600 mb-4">
            The recipe you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.push('/recipes')}>
            Back to Recipes
          </Button>
        </div>
      </div>
    );
  }

  const adjustedRecipe = adjustRecipeServings(recipe, adjustedServings);

  return (
    <div className={`min-h-screen ${isCookingMode ? 'bg-green-50 cooking-mode' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cooking Mode Header */}
        {isCookingMode && (
          <div className="bg-green-600 text-white rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👩‍🍳</span>
                <div>
                  <h2 className="font-semibold">Cooking Mode Active</h2>
                  <p className="text-green-100 text-sm">
                    Use gestures or buttons to navigate steps
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNavigator(!showNavigator)}
                  className="px-3 py-1 bg-green-700 hover:bg-green-800 rounded text-sm transition-colors"
                >
                  {showNavigator ? 'Hide' : 'Show'} Steps
                </button>
                <Button
                  variant="secondary"
                  onClick={handleStopCooking}
                  size="sm"
                >
                  Stop Cooking
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Step Navigator - Sidebar */}
          {showNavigator && (
            <div className="lg:col-span-1">
              <StepNavigator
                recipe={adjustedRecipe}
                currentStep={currentStep}
                onStepChange={handleStepChange}
                className="sticky top-4"
              />
            </div>
          )}

          {/* Main Recipe Content */}
          <div className={showNavigator ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {/* Recipe Controls */}
            {!isCookingMode && (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Servings
                      </label>
                      <select
                        value={adjustedServings}
                        onChange={(e) => handleServingsChange(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        {[1, 2, 3, 4, 6, 8, 10, 12].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <Button onClick={handleStartCooking} size="lg">
                    🍳 Start Cooking
                  </Button>
                </div>
              </div>
            )}

            {/* Recipe Viewer */}
            <RecipeViewer
              recipe={adjustedRecipe}
              currentStep={currentStep}
              onStepChange={handleStepChange}
              adjustedServings={adjustedServings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}