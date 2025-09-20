'use client';

import { useState, useMemo } from 'react';
import type { Recipe } from '@/lib/types';
import RecipeCard from './RecipeCard';
import Button from '@/components/ui/Button';

interface RecipeListProps {
  recipes: Recipe[];
  title?: string;
  showFilters?: boolean;
}

export default function RecipeList({ 
  recipes, 
  title = 'Recipes',
  showFilters = true 
}: RecipeListProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [maxCookingTime, setMaxCookingTime] = useState<number>(180); // 3 hours
  
  // Get unique tags and difficulties
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    recipes.forEach(recipe => {
      recipe.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [recipes]);
  
  const difficulties = ['easy', 'medium', 'hard'];
  
  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      // Difficulty filter
      if (selectedDifficulty !== 'all' && recipe.difficulty !== selectedDifficulty) {
        return false;
      }
      
      // Tag filter
      if (selectedTag !== 'all' && !recipe.tags.includes(selectedTag)) {
        return false;
      }
      
      // Cooking time filter
      if (recipe.cookingTime > maxCookingTime) {
        return false;
      }
      
      return true;
    });
  }, [recipes, selectedDifficulty, selectedTag, maxCookingTime]);
  
  const clearFilters = () => {
    setSelectedDifficulty('all');
    setSelectedTag('all');
    setMaxCookingTime(180);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <span className="text-gray-500">
          {filteredRecipes.length} of {recipes.length} recipes
        </span>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All levels</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All categories</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Cooking Time Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max cooking time: {maxCookingTime}min
              </label>
              <input
                type="range"
                min="15"
                max="180"
                step="15"
                value={maxCookingTime}
                onChange={(e) => setMaxCookingTime(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Recipe Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No recipes found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters to see more recipes.
          </p>
          <Button onClick={clearFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}