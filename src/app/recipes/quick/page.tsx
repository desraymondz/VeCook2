import RecipeList from '@/components/recipe/RecipeList';
import { getQuickRecipes } from '@/lib/sample-data';

export default function QuickRecipesPage() {
  const quickRecipes = getQuickRecipes();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Quick Recipes
        </h1>
        <p className="text-gray-600">
          Delicious meals ready in 30 minutes or less
        </p>
      </div>
      
      <RecipeList 
        recipes={quickRecipes} 
        title="Quick & Easy"
        showFilters={false}
      />
    </div>
  );
}