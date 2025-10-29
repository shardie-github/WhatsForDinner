import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { headers } from 'next/headers';
import { z } from 'zod';

const SAMPLE_INGREDIENTS = [
  'chicken breast',
  'rice',
  'tomatoes',
  'onions',
  'garlic',
  'olive oil',
  'pasta',
  'cheese',
  'eggs',
  'bread',
];

/**
 * POST /api/pantry/seed-sample
 * Seeds sample ingredients into user's pantry
 */
export async function POST(req: Request) {
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
        updated_at: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      count: data.length,
      ingredients: SAMPLE_INGREDIENTS,
    });
  } catch (error) {
    console.error('Error seeding sample data:', error);
    return NextResponse.json(
      { error: 'Failed to seed sample data' },
      { status: 500 }
    );
  }
}
