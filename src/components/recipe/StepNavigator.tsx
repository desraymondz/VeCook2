'use client';

import type { Recipe } from '@/lib/types';

interface StepNavigatorProps {
  recipe: Recipe;
  currentStep: number;
  onStepChange: (step: number) => void;
  className?: string;
}

export default function StepNavigator({ 
  recipe, 
  currentStep, 
  onStepChange, 
  className = '' 
}: StepNavigatorProps) {
  const progress = ((currentStep + 1) / recipe.steps.length) * 100;

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{currentStep + 1} of {recipe.steps.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {recipe.steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => onStepChange(index)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              index === currentStep
                ? 'bg-green-100 border-2 border-green-300'
                : index < currentStep
                ? 'bg-green-50 border border-green-200'
                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Step Number/Status */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                index === currentStep
                  ? 'bg-green-600 text-white'
                  : index < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              
              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-medium ${
                    index === currentStep ? 'text-green-800' : 'text-gray-700'
                  }`}>
                    Step {index + 1}
                  </span>
                  {step.duration && (
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                      {step.duration}min
                    </span>
                  )}
                </div>
                <p className={`text-xs line-clamp-2 ${
                  index === currentStep ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {step.instruction}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={() => onStepChange(Math.min(recipe.steps.length - 1, currentStep + 1))}
            disabled={currentStep === recipe.steps.length - 1}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}