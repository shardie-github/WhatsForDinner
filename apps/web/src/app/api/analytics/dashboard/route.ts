import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// This endpoint provides analytics data for the user dashboard
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Get date ranges
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get user analytics events
    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1000);

    if (eventsError) {
      console.error('Error fetching analytics events:', eventsError);
    }

    // Get recipe metrics
    const { data: recipeMetrics, error: recipeError } = await supabase
      .from('recipe_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .limit(1000);

    if (recipeError) {
      console.error('Error fetching recipe metrics:', recipeError);
    }

    // Calculate stats
    const totalRecipes = recipeMetrics?.length || 0;
    const recipesToday = recipeMetrics?.filter(
      (r) => new Date(r.generated_at) >= dayAgo
    ).length || 0;
    const recipesThisWeek = recipeMetrics?.filter(
      (r) => new Date(r.generated_at) >= weekAgo
    ).length || 0;
    const recipesThisMonth = recipeMetrics?.filter(
      (r) => new Date(r.generated_at) >= monthAgo
    ).length || 0;

    // Get popular ingredients
    const ingredientCounts: Record<string, number> = {};
    recipeMetrics?.forEach((recipe) => {
      recipe.ingredients_used?.forEach((ingredient: string) => {
        ingredientCounts[ingredient] = (ingredientCounts[ingredient] || 0) + 1;
      });
    });
    const popularIngredients = Object.entries(ingredientCounts)
      .map(([ingredient, count]) => ({ ingredient, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get cuisine preferences
    const cuisineCounts: Record<string, number> = {};
    recipeMetrics?.forEach((recipe) => {
      if (recipe.cuisine_type) {
        cuisineCounts[recipe.cuisine_type] = (cuisineCounts[recipe.cuisine_type] || 0) + 1;
      }
    });
    const cuisinePreferences = Object.entries(cuisineCounts)
      .map(([cuisine, count]) => ({ cuisine, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate average metrics
    const avgCookTime = recipeMetrics?.length
      ? recipeMetrics.reduce((sum, r) => {
          const time = parseInt(r.cook_time?.replace(/[^\d]/g, '') || '0');
          return sum + time;
        }, 0) / recipeMetrics.length
      : 0;

    const avgCalories = recipeMetrics?.length
      ? recipeMetrics.reduce((sum, r) => sum + (r.calories || 0), 0) / recipeMetrics.length
      : 0;

    const avgLatency = recipeMetrics?.length
      ? recipeMetrics.reduce((sum, r) => sum + (r.api_latency_ms || 0), 0) / recipeMetrics.length
      : 0;

    // Get event counts by type
    const eventCounts: Record<string, number> = {};
    events?.forEach((event) => {
      eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1;
    });

    // Create time series data for recipes (last 7 days)
    const daysData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = new Date(dateStr);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayRecipes = recipeMetrics?.filter(
        (r) => {
          const recipeDate = new Date(r.generated_at);
          return recipeDate >= dayStart && recipeDate < dayEnd;
        }
      ).length || 0;

      daysData.push({
        date: dateStr,
        recipes: dayRecipes,
      });
    }

    // Calculate success rate
    const totalGenerations = events?.filter((e) => e.event_type === 'recipe_generation_started').length || 0;
    const successfulGenerations = events?.filter((e) => e.event_type === 'recipe_generation_completed').length || 0;
    const successRate = totalGenerations > 0 ? (successfulGenerations / totalGenerations) * 100 : 0;

    return NextResponse.json({
      summary: {
        totalRecipes,
        recipesToday,
        recipesThisWeek,
        recipesThisMonth,
        avgCookTime: Math.round(avgCookTime),
        avgCalories: Math.round(avgCalories),
        avgLatency: Math.round(avgLatency),
        successRate: Math.round(successRate * 100) / 100,
      },
      popularIngredients,
      cuisinePreferences,
      timeSeriesData: daysData,
    });
  } catch (error: any) {
    // Error handled: Error fetching analytics dashboard data:
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', message: error.message },
      { status: 500 }
    );
  }
}
