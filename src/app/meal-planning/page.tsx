export default function MealPlanningPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Meal Planning
        </h1>
        <p className="text-gray-600 mb-8">
          Personalized meal recommendations based on your activity and preferences
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-green-900 mb-2">
            Coming Soon!
          </h2>
          <p className="text-green-700">
            AI-powered meal planning with Google Fit integration will be implemented in upcoming tasks.
          </p>
        </div>
      </div>
    </div>
  );
}