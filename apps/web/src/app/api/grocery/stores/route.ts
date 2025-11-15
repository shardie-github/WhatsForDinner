/**
 * Grocery Stores API
 * Get available grocery stores and their configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { groceryManager } from '@/lib/grocery/grocery-manager';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await groceryManager.initialize();
    const stores = groceryManager.getStores();
    const config = groceryManager.getConfig();

    return NextResponse.json({
      success: true,
      data: {
        stores,
        config,
      },
    });
  } catch (error) {
    console.error('Grocery stores API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load stores' },
      { status: 500 }
    );
  }
}
