#!/usr/bin/env tsx

// Seed script for local development
// Generates sample data: recipes, household, meal plans

interface SeedData {
  recipes: unknown[];
  households: unknown[];
  mealPlans: unknown[];
}

const seedData: SeedData = {
  recipes: [
    {
      id: '1',
      title: 'Grilled Salmon with Vegetables',
      description: 'Healthy and delicious',
      ingredients: [
        { name: 'Salmon', amount: 200, unit: 'g' },
        { name: 'Broccoli', amount: 150, unit: 'g' },
      ],
      steps: ['Marinate salmon', 'Grill for 10 minutes', 'Serve with vegetables'],
      macros: { calories: 350, protein: 30, carbs: 10, fat: 20 },
    },
  ],
  households: [
    {
      id: '1',
      name: 'Smith Family',
      members: [],
    },
  ],
  mealPlans: [],
};


export default seedData;
