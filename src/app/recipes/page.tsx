export default function RecipesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Recipe Collection
        </h1>
        <p className="text-gray-600 mb-8">
          Discover delicious recipes with AI-powered cooking assistance
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            Coming Soon!
          </h2>
          <p className="text-blue-700">
            Recipe browsing and cooking interface will be implemented in the next tasks.
          </p>
        </div>
      </div>
    </div>
  );
}