import type { Recipe } from './types';

/**
 * Sample recipes for development and testing
 */
export const sampleRecipes: Recipe[] = [
  {
    id: 'classic-spaghetti-carbonara',
    title: 'Classic Spaghetti Carbonara',
    description: 'A traditional Italian pasta dish with eggs, cheese, and pancetta. Creamy, rich, and absolutely delicious!',
    difficulty: 'medium',
    cookingTime: 25,
    servings: 4,
    imageUrl: '/images/recipes/carbonara.jpg',
    tags: ['italian', 'pasta', 'dinner', 'comfort-food', 'quick'],
    ingredients: [
      { name: 'spaghetti', amount: 400, unit: 'g' },
      { name: 'pancetta or guanciale', amount: 150, unit: 'g', alternatives: ['bacon'] },
      { name: 'large eggs', amount: 3, unit: 'whole' },
      { name: 'Pecorino Romano cheese', amount: 100, unit: 'g', alternatives: ['Parmesan cheese'] },
      { name: 'black pepper', amount: 1, unit: 'tsp' },
      { name: 'salt', amount: 1, unit: 'tsp' },
      { name: 'olive oil', amount: 1, unit: 'tbsp' }
    ],
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        instruction: 'Bring a large pot of salted water to boil. Add spaghetti and cook according to package directions until al dente.',
        duration: 10,
        tips: ['Save 1 cup of pasta water before draining', 'Salt the water generously - it should taste like seawater']
      },
      {
        id: 'step-2',
        stepNumber: 2,
        instruction: 'While pasta cooks, cut pancetta into small cubes and cook in a large skillet over medium heat until crispy.',
        duration: 8,
        tips: ['No need to add oil - pancetta will render its own fat', 'Cook until golden and crispy']
      },
      {
        id: 'step-3',
        stepNumber: 3,
        instruction: 'In a bowl, whisk together eggs, grated cheese, and freshly ground black pepper.',
        duration: 3,
        tips: ['Use room temperature eggs for best results', 'Grate cheese fresh for better melting']
      },
      {
        id: 'step-4',
        stepNumber: 4,
        instruction: 'Drain pasta and immediately add to the skillet with pancetta. Remove from heat.',
        duration: 2,
        tips: ['Work quickly to prevent eggs from scrambling', 'Keep some pasta water handy']
      },
      {
        id: 'step-5',
        stepNumber: 5,
        instruction: 'Pour egg mixture over hot pasta and toss quickly. Add pasta water if needed to create a creamy sauce.',
        duration: 2,
        tips: ['The heat from pasta will cook the eggs gently', 'Add pasta water gradually until creamy']
      }
    ],
    nutrition: {
      calories: 520,
      protein: 22,
      carbs: 65,
      fat: 18,
      fiber: 3,
      sugar: 2
    }
  },
  {
    id: 'chicken-stir-fry',
    title: 'Quick Chicken Stir Fry',
    description: 'A healthy and colorful stir fry with tender chicken and crisp vegetables in a savory sauce.',
    difficulty: 'easy',
    cookingTime: 20,
    servings: 4,
    imageUrl: '/images/recipes/chicken-stir-fry.jpg',
    tags: ['asian', 'healthy', 'quick', 'dinner', 'gluten-free', 'one-pot'],
    ingredients: [
      { name: 'chicken breast', amount: 500, unit: 'g' },
      { name: 'broccoli florets', amount: 200, unit: 'g' },
      { name: 'bell peppers', amount: 2, unit: 'whole' },
      { name: 'carrots', amount: 2, unit: 'medium' },
      { name: 'garlic cloves', amount: 3, unit: 'whole' },
      { name: 'fresh ginger', amount: 1, unit: 'tbsp' },
      { name: 'soy sauce', amount: 3, unit: 'tbsp' },
      { name: 'sesame oil', amount: 1, unit: 'tbsp' },
      { name: 'vegetable oil', amount: 2, unit: 'tbsp' },
      { name: 'cornstarch', amount: 1, unit: 'tbsp' },
      { name: 'green onions', amount: 2, unit: 'whole' }
    ],
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        instruction: 'Cut chicken into bite-sized pieces and toss with cornstarch. Let sit for 5 minutes.',
        duration: 5,
        tips: ['Cornstarch helps create a tender texture', 'Cut against the grain for tenderness']
      },
      {
        id: 'step-2',
        stepNumber: 2,
        instruction: 'Prepare all vegetables: cut bell peppers into strips, slice carrots, mince garlic and ginger.',
        duration: 8,
        tips: ['Having everything prepped makes stir-frying much easier', 'Keep vegetables similar in size for even cooking']
      },
      {
        id: 'step-3',
        stepNumber: 3,
        instruction: 'Heat vegetable oil in a large wok or skillet over high heat. Add chicken and cook until golden.',
        duration: 5,
        tips: ['Don\'t overcrowd the pan', 'Let chicken develop a golden crust before stirring']
      },
      {
        id: 'step-4',
        stepNumber: 4,
        instruction: 'Add garlic and ginger, stir for 30 seconds. Add vegetables and stir-fry for 3-4 minutes.',
        duration: 4,
        tips: ['Vegetables should be crisp-tender', 'Keep everything moving in the pan']
      },
      {
        id: 'step-5',
        stepNumber: 5,
        instruction: 'Add soy sauce and sesame oil. Toss everything together and garnish with green onions.',
        duration: 2,
        tips: ['Taste and adjust seasoning', 'Serve immediately over rice']
      }
    ],
    nutrition: {
      calories: 280,
      protein: 32,
      carbs: 12,
      fat: 12,
      fiber: 4,
      sugar: 8
    }
  },
  {
    id: 'chocolate-chip-cookies',
    title: 'Perfect Chocolate Chip Cookies',
    description: 'Soft, chewy chocolate chip cookies that are crispy on the edges and tender in the center.',
    difficulty: 'easy',
    cookingTime: 45,
    servings: 24,
    imageUrl: '/images/recipes/chocolate-chip-cookies.jpg',
    tags: ['dessert', 'baked', 'sweet', 'family-friendly', 'comfort-food'],
    ingredients: [
      { name: 'all-purpose flour', amount: 300, unit: 'g' },
      { name: 'butter', amount: 200, unit: 'g' },
      { name: 'brown sugar', amount: 150, unit: 'g' },
      { name: 'granulated sugar', amount: 100, unit: 'g' },
      { name: 'large eggs', amount: 2, unit: 'whole' },
      { name: 'vanilla extract', amount: 2, unit: 'tsp' },
      { name: 'baking soda', amount: 1, unit: 'tsp' },
      { name: 'salt', amount: 1, unit: 'tsp' },
      { name: 'chocolate chips', amount: 200, unit: 'g' }
    ],
    steps: [
      {
        id: 'step-1',
        stepNumber: 1,
        instruction: 'Preheat oven to 375°F (190°C). Line baking sheets with parchment paper.',
        duration: 5,
        temperature: 375,
        tips: ['Parchment prevents sticking and ensures even browning']
      },
      {
        id: 'step-2',
        stepNumber: 2,
        instruction: 'In a bowl, whisk together flour, baking soda, and salt. Set aside.',
        duration: 3,
        tips: ['Whisking ensures even distribution of leavening agents']
      },
      {
        id: 'step-3',
        stepNumber: 3,
        instruction: 'Cream butter with both sugars until light and fluffy, about 3-4 minutes.',
        duration: 4,
        tips: ['Room temperature butter creams better', 'Proper creaming creates tender cookies']
      },
      {
        id: 'step-4',
        stepNumber: 4,
        instruction: 'Beat in eggs one at a time, then vanilla extract.',
        duration: 2,
        tips: ['Add eggs one at a time to prevent curdling']
      },
      {
        id: 'step-5',
        stepNumber: 5,
        instruction: 'Gradually mix in flour mixture until just combined. Fold in chocolate chips.',
        duration: 3,
        tips: ['Don\'t overmix - this can make cookies tough']
      },
      {
        id: 'step-6',
        stepNumber: 6,
        instruction: 'Drop rounded tablespoons of dough onto prepared baking sheets, spacing 2 inches apart.',
        duration: 5,
        tips: ['Use a cookie scoop for uniform size', 'Leave space for spreading']
      },
      {
        id: 'step-7',
        stepNumber: 7,
        instruction: 'Bake for 9-11 minutes until edges are golden but centers still look soft.',
        duration: 10,
        temperature: 375,
        tips: ['Don\'t overbake - cookies continue cooking on hot pan', 'Centers should look slightly underdone']
      },
      {
        id: 'step-8',
        stepNumber: 8,
        instruction: 'Cool on baking sheet for 5 minutes, then transfer to wire rack.',
        duration: 5,
        tips: ['Cooling on the pan finishes the cooking process']
      }
    ],
    nutrition: {
      calories: 180,
      protein: 3,
      carbs: 24,
      fat: 9,
      fiber: 1,
      sugar: 16
    }
  }
];

/**
 * Get recipe by ID
 */
export function getRecipeById(id: string): Recipe | undefined {
  return sampleRecipes.find(recipe => recipe.id === id);
}

/**
 * Get recipes by tags
 */
export function getRecipesByTags(tags: string[]): Recipe[] {
  if (tags.length === 0) return sampleRecipes;
  
  return sampleRecipes.filter(recipe =>
    tags.some(tag => recipe.tags.includes(tag.toLowerCase()))
  );
}

/**
 * Get recipes by difficulty
 */
export function getRecipesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Recipe[] {
  return sampleRecipes.filter(recipe => recipe.difficulty === difficulty);
}

/**
 * Get quick recipes (under 30 minutes)
 */
export function getQuickRecipes(): Recipe[] {
  return sampleRecipes.filter(recipe => recipe.cookingTime <= 30);
}