import Link from 'next/link';
import type { Recipe } from '@/lib/types';
import { formatCookingTime, calculateCaloriesPerServing } from '@/lib/cooking-utils';

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
}

export default function RecipeCard({ recipe, className = '' }: RecipeCardProps) {
  const caloriesPerServing = calculateCaloriesPerServing(recipe);
  
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  };

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <div className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden ${className}`}>
        {/* Recipe Image */}
        <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
          {recipe.imageUrl ? (
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl">🍳</div>
          )}
        </div>
        
        {/* Recipe Content */}
        <div className="p-4">
          {/* Title and Description */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {recipe.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {recipe.description}
          </p>
          
          {/* Recipe Stats */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                ⏱️ {formatCookingTime(recipe.cookingTime)}
              </span>
              <span className="flex items-center gap-1">
                👥 {recipe.servings}
              </span>
              <span className="flex items-center gap-1">
                🔥 {caloriesPerServing} cal
              </span>
            </div>
          </div>
          
          {/* Tags and Difficulty */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {recipe.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  +{recipe.tags.length - 3}
                </span>
              )}
            </div>
            
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColors[recipe.difficulty]}`}>
              {recipe.difficulty}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}