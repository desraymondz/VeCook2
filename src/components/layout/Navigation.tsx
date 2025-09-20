'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const [isCookingMode, setIsCookingMode] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">👩‍🍳</span>
              <span className="text-xl font-bold text-gray-900">VeCook</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/meal-planning" 
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Meal Planning
            </Link>
            <Link 
              href="/recipes" 
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Recipes
            </Link>
            <Link 
              href="/gesture-test" 
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Gesture Test
            </Link>
            <button
              onClick={() => setIsCookingMode(!isCookingMode)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isCookingMode 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isCookingMode ? 'Exit Cooking' : 'Start Cooking'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}