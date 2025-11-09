/**
 * Enable Monetization Channels
 * One-click enablement for all channels
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check admin access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { channels } = await request.json();

    // Update monetization settings
    const settings = {
      affiliate_enabled: channels.includes('affiliate'),
      api_monetization_enabled: channels.includes('api'),
      data_insights_enabled: channels.includes('data'),
      marketplace_enabled: channels.includes('marketplace'),
      automated_upsells_enabled: channels.includes('upsells'),
      updated_at: new Date().toISOString(),
    };

    await supabase
      .from('monetization_settings')
      .upsert(settings, { onConflict: 'id' });

    return NextResponse.json({
      success: true,
      message: 'Monetization channels enabled',
      enabled: channels,
    });
  } catch (error) {
    console.error('Enable monetization error:', error);
    return NextResponse.json(
      { error: 'Failed to enable channels' },
      { status: 500 }
    );
  }
}
