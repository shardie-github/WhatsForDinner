import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { headers } from 'next/headers';
import { z } from 'zod';
import { withCSRFProtection } from '@/lib/csrf-middleware';
import { NextRequest } from 'next/server';

// Canadian pantry staples - optimized for solo users
const SAMPLE_INGREDIENTS = [
  // Proteins
  'chicken breast',
  'eggs',
  'ground beef',
  'salmon fillet',
  // Grains & Starches
  'rice',
  'pasta',
  'bread',
  'potatoes',
  // Vegetables
  'tomatoes',
  'onions',
  'garlic',
  'bell peppers',
  'carrots',
  'broccoli',
  // Pantry Staples
  'olive oil',
  'cheese',
  'butter',
  'milk',
  'flour',
  'sugar',
  'salt',
  'black pepper',
];

/**
 * POST /api/pantry/seed-sample
 * Seeds sample ingredients into user's pantry
 */
async function handler(req: NextRequest) {
  try {
    const headersList = await headers();
    
    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if sample data already seeded
    const { data: existing } = await supabase
      .from('pantry_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_sample', true)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({
        message: 'Sample data already seeded',
        count: existing.length,
      });
    }

    // Get user's tenant_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.tenant_id) {
      return NextResponse.json(
        { error: 'No tenant found for user' },
        { status: 400 }
      );
    }

    // Insert sample ingredients
    const itemsToInsert = SAMPLE_INGREDIENTS.map(ingredient => ({
      user_id: user.id,
      tenant_id: profile.tenant_id,
      ingredient,
      is_sample: true,
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('pantry_items')
      .insert(itemsToInsert)
      .select();

    if (error) {
      throw error;
    }

    // Update onboarding state
    await supabase
      .from('onboarding_state')
      .upsert({
        user_id: user.id,
        sample_data_seeded: true,
        pantry_prefilled: true,
        updated_at: new Date().toISOString(),
      });

    // Track event for analytics
    await supabase
      .from('events')
      .insert({
        user_id: user.id,
        event_name: 'pantry_prefilled',
        occurred_at: new Date().toISOString(),
        props: {
          ingredient_count: data.length,
          source: 'onboarding',
        },
      });

    return NextResponse.json({
      success: true,
      count: data.length,
      ingredients: SAMPLE_INGREDIENTS,
      message: 'Pantry pre-filled with Canadian staples. Ready to generate your first meal plan!',
      next_step: 'generate_meal_plan',
    });
  } catch (error) {
    // Error handled: Error seeding sample data:
    return NextResponse.json(
      { error: 'Failed to seed sample data' },
      { status: 500 }
    );
  }
}

export const POST = (req: NextRequest) => withCSRFProtection(handler, req);
