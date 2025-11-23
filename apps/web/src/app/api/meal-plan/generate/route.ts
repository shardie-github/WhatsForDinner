import { NextRequest, NextResponse } from 'next/server';
import { generateWeeklyMealPlan } from '@/lib/services/meal-plan-generator';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { withCSRFProtection } from '@/lib/csrf-middleware';

async function handler(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { pantryItems, preferences } = body;

    // Get pantry items from database
    const { data: pantryData } = await supabase
      .from('pantry_items')
      .select('ingredient')
      .eq('user_id', user.id);

    const pantryItemNames = pantryData?.map((item) => item.ingredient) || pantryItems || [];

    // Recipe generation function
    const generateRecipeFn = async (ingredients: string[], prefs: string) => {
      // Call your existing recipe generation API
      const response = await fetch(`${request.nextUrl.origin}/api/dinner/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          preferences: prefs,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipes');
      }

      return await response.json();
    };

    const mealPlan = await generateWeeklyMealPlan(
      pantryItemNames,
      preferences || {},
      generateRecipeFn
    );

    return NextResponse.json({ mealPlan });
  } catch (error) {
    // Error handled: Meal plan generation error:
    return NextResponse.json(
      { error: error.message || 'Failed to generate meal plan' },
      { status: 500 }
    );
  }
}

export const POST = (req: NextRequest) => withCSRFProtection(handler, req);
