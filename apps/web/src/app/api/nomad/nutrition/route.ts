import { NextRequest, NextResponse } from 'next/server';

// GET /api/nomad/nutrition - Get nutrition data for food item
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q'); // Food item name or barcode
    const barcode = searchParams.get('barcode');

    if (!query && !barcode) {
      return NextResponse.json({ error: 'Query or barcode required' }, { status: 400 });
    }

    // Integration with Nutrition APIs
    // Option 1: Edamam Nutrition API
    // Option 2: Nutritionix API
    // Option 3: Open Food Facts (barcode lookup)

    if (barcode) {
      // Use Open Food Facts for barcode lookup
      const openFoodFactsUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
      
      try {
        const response = await fetch(openFoodFactsUrl);
        const data = await response.json();

        if (data.status === 1 && data.product) {
          const product = data.product;
          return NextResponse.json({
            name: product.product_name || product.product_name_en || 'Unknown',
            calories: product.nutriments?.['energy-kcal_100g'] || null,
            protein: product.nutriments?.['proteins_100g'] || null,
            carbs: product.nutriments?.['carbohydrates_100g'] || null,
            fat: product.nutriments?.['fat_100g'] || null,
            fiber: product.nutriments?.['fiber_100g'] || null,
            image: product.image_url || null,
            brand: product.brands || null,
          });
        }
      } catch (error) {
        console.error('Open Food Facts API error:', error);
      }
    }

    // Fallback: Use Edamam Nutrition API (requires API key)
    // const edamamUrl = `https://api.edamam.com/api/nutrition-data?app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_API_KEY}&ingr=${encodeURIComponent(query)}`;
    
    // For now, return mock data
    return NextResponse.json({
      name: query || 'Food Item',
      calories: Math.floor(Math.random() * 500) + 100,
      protein: (Math.random() * 20 + 5).toFixed(1),
      carbs: (Math.random() * 50 + 10).toFixed(1),
      fat: (Math.random() * 30 + 5).toFixed(1),
      fiber: (Math.random() * 10).toFixed(1),
      source: 'mock',
    });
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
