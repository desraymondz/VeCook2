import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <span className="text-8xl">👩‍🍳</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-green-600">VeCook</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your AI-powered cooking companion with hands-free navigation, personalized meal planning, 
            and caring guidance that feels like having a mom in the kitchen.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/recipes">
              <Button size="lg" className="w-full sm:w-auto">
                Start Cooking 🍳
              </Button>
            </Link>
            <Link href="/meal-planning">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Plan Meals 📋
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-lg font-semibold mb-2">Personalized Meal Planning</h3>
            <p className="text-gray-600 text-sm">
              AI adjusts recipes based on your activity level and dietary preferences
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">🙌</div>
            <h3 className="text-lg font-semibold mb-2">Hands-Free Navigation</h3>
            <p className="text-gray-600 text-sm">
              Point left or right to navigate recipes without touching your device
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Assistance</h3>
            <p className="text-gray-600 text-sm">
              Raise your hand for real-time cooking help and mistake recovery
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="text-lg font-semibold mb-2">Content Creation</h3>
            <p className="text-gray-600 text-sm">
              Record and share your cooking journey on social media
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Ready to transform your cooking experience?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of home cooks who&apos;ve discovered the joy of AI-assisted cooking
          </p>
          <Link href="/recipes">
            <Button variant="secondary" size="lg">
              Get Started Today
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
