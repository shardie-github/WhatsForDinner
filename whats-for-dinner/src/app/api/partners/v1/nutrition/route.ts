import { NextRequest, NextResponse } from 'next/server';
import { partnerAPIGateway } from '@/lib/partner-api/apiGateway';
import { z } from 'zod';

const NutritionAnalysisSchema = z.object({
  ingredients: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    unit: z.string(),
  })),
  servings: z.number().optional(),
});

const NutritionQuerySchema = z.object({
  recipe_id: z.string().optional(),
  ingredients: z.string().optional(), // JSON string of ingredients array
  servings: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      );
    }

    const auth = await partnerAPIGateway.authenticateRequest(apiKey);
    if (!auth) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!auth.apiKey.permissions.includes('nutrition:read')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = NutritionAnalysisSchema.parse(body);

    // Analyze nutrition
    const nutrition = await analyzeNutrition(validatedData.ingredients, validatedData.servings || 1);

    // Log API request
    const startTime = Date.now();
    await partnerAPIGateway.logRequest(
      auth.partner.id,
      auth.apiKey.id,
      '/api/partners/v1/nutrition',
      'POST',
      200,
      Date.now() - startTime,
      request.headers.get('user-agent') || undefined,
      request.ip || undefined
    );

    return NextResponse.json({
      nutrition,
      meta: {
        partner_id: auth.partner.id,
        request_id: crypto.randomUUID(),
      }
    });

  } catch (error) {
    console.error('API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      );
    }

    const auth = await partnerAPIGateway.authenticateRequest(apiKey);
    if (!auth) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!auth.apiKey.permissions.includes('nutrition:read')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      recipe_id: searchParams.get('recipe_id'),
      ingredients: searchParams.get('ingredients'),
      servings: searchParams.get('servings'),
    };

    const validatedParams = NutritionQuerySchema.parse(queryParams);

    let nutrition;

    if (validatedParams.recipe_id) {
      // Get nutrition from recipe
      const supabase = createClient();
      const { data: recipe, error } = await supabase
        .from('recipes')
        .select('ingredients, nutrition')
        .eq('id', validatedParams.recipe_id)
        .single();

      if (error || !recipe) {
        return NextResponse.json(
          { error: 'Recipe not found' },
          { status: 404 }
        );
      }

      if (recipe.nutrition) {
        nutrition = recipe.nutrition;
      } else {
        // Calculate nutrition from ingredients
        const ingredients = recipe.ingredients.map((ing: any) => ({
          name: ing.name,
          amount: parseFloat(ing.amount) || 0,
          unit: ing.unit || 'g'
        }));
        nutrition = await analyzeNutrition(ingredients, parseInt(validatedParams.servings || '1'));
      }
    } else if (validatedParams.ingredients) {
      // Parse ingredients from query parameter
      const ingredients = JSON.parse(validatedParams.ingredients);
      nutrition = await analyzeNutrition(ingredients, parseInt(validatedParams.servings || '1'));
    } else {
      return NextResponse.json(
        { error: 'Either recipe_id or ingredients parameter is required' },
        { status: 400 }
      );
    }

    // Log API request
    const startTime = Date.now();
    await partnerAPIGateway.logRequest(
      auth.partner.id,
      auth.apiKey.id,
      '/api/partners/v1/nutrition',
      'GET',
      200,
      Date.now() - startTime,
      request.headers.get('user-agent') || undefined,
      request.ip || undefined
    );

    return NextResponse.json({
      nutrition,
      meta: {
        partner_id: auth.partner.id,
        request_id: crypto.randomUUID(),
      }
    });

  } catch (error) {
    console.error('API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Analyze nutrition for given ingredients
 */
async function analyzeNutrition(ingredients: Array<{name: string, amount: number, unit: string}>, servings: number = 1) {
  // This is a simplified nutrition analysis
  // In a real implementation, you would use a nutrition database API like USDA FoodData Central
  
  const nutritionPerServing = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0,
    saturated_fat: 0,
    trans_fat: 0,
    vitamin_a: 0,
    vitamin_c: 0,
    calcium: 0,
    iron: 0,
  };

  // Mock nutrition data for common ingredients
  const nutritionDatabase: Record<string, any> = {
    'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74, cholesterol: 85, saturated_fat: 1, trans_fat: 0, vitamin_a: 0, vitamin_c: 0, calcium: 15, iron: 1 },
    'brown rice': { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8, sugar: 0.4, sodium: 5, cholesterol: 0, saturated_fat: 0.2, trans_fat: 0, vitamin_a: 0, vitamin_c: 0, calcium: 20, iron: 0.8 },
    'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.5, sodium: 33, cholesterol: 0, saturated_fat: 0.1, trans_fat: 0, vitamin_a: 567, vitamin_c: 89, calcium: 47, iron: 0.7 },
    'olive oil': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 2, cholesterol: 0, saturated_fat: 14, trans_fat: 0, vitamin_a: 0, vitamin_c: 0, calcium: 1, iron: 0.6 },
    'onion': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2, sodium: 4, cholesterol: 0, saturated_fat: 0, trans_fat: 0, vitamin_a: 0, vitamin_c: 7, calcium: 23, iron: 0.2 },
    'garlic': { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1, sugar: 1, sodium: 17, cholesterol: 0, saturated_fat: 0.1, trans_fat: 0, vitamin_a: 0, vitamin_c: 31, calcium: 181, iron: 1.7 },
    'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5, cholesterol: 0, saturated_fat: 0, trans_fat: 0, vitamin_a: 833, vitamin_c: 14, calcium: 10, iron: 0.3 },
  };

  // Calculate nutrition for each ingredient
  for (const ingredient of ingredients) {
    const normalizedName = ingredient.name.toLowerCase().trim();
    const nutritionData = nutritionDatabase[normalizedName];
    
    if (nutritionData) {
      // Convert amount to grams if needed
      let amountInGrams = ingredient.amount;
      if (ingredient.unit === 'lb') {
        amountInGrams = ingredient.amount * 453.592;
      } else if (ingredient.unit === 'oz') {
        amountInGrams = ingredient.amount * 28.3495;
      } else if (ingredient.unit === 'cup') {
        amountInGrams = ingredient.amount * 240; // Approximate for most ingredients
      } else if (ingredient.unit === 'tbsp') {
        amountInGrams = ingredient.amount * 15;
      } else if (ingredient.unit === 'tsp') {
        amountInGrams = ingredient.amount * 5;
      }

      // Add nutrition values (assuming nutrition data is per 100g)
      const multiplier = amountInGrams / 100;
      
      for (const [key, value] of Object.entries(nutritionData)) {
        if (key in nutritionPerServing) {
          (nutritionPerServing as any)[key] += value * multiplier;
        }
      }
    }
  }

  // Calculate per serving
  const totalNutrition = {
    calories: Math.round(nutritionPerServing.calories / servings),
    protein: Math.round(nutritionPerServing.protein / servings * 10) / 10,
    carbs: Math.round(nutritionPerServing.carbs / servings * 10) / 10,
    fat: Math.round(nutritionPerServing.fat / servings * 10) / 10,
    fiber: Math.round(nutritionPerServing.fiber / servings * 10) / 10,
    sugar: Math.round(nutritionPerServing.sugar / servings * 10) / 10,
    sodium: Math.round(nutritionPerServing.sodium / servings),
    cholesterol: Math.round(nutritionPerServing.cholesterol / servings),
    saturated_fat: Math.round(nutritionPerServing.saturated_fat / servings * 10) / 10,
    trans_fat: Math.round(nutritionPerServing.trans_fat / servings * 10) / 10,
    vitamin_a: Math.round(nutritionPerServing.vitamin_a / servings),
    vitamin_c: Math.round(nutritionPerServing.vitamin_c / servings),
    calcium: Math.round(nutritionPerServing.calcium / servings),
    iron: Math.round(nutritionPerServing.iron / servings * 10) / 10,
  };

  return {
    per_serving: totalNutrition,
    total_servings: servings,
    ingredients_analyzed: ingredients.length,
    analysis_timestamp: new Date().toISOString(),
  };
}