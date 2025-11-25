import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication (admin only)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you may want to add admin check)
    // For now, allow any authenticated user

    // Fetch all YC metrics in parallel
    const [
      activeUsersResult,
      activationResult,
      retentionResult,
      funnelResult,
      mrrResult,
      unitEconomicsResult,
      channelResult,
    ] = await Promise.all([
      supabase.rpc('get_active_users'),
      supabase.rpc('calculate_activation_rate', { days_after_signup: 7 }),
      supabase.rpc('calculate_retention', {
        cohort_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        days_after_signup: 7,
      }),
      supabase.rpc('get_conversion_funnel'),
      supabase.rpc('calculate_mrr'),
      supabase.rpc('calculate_unit_economics'),
      supabase.rpc('get_channel_metrics'),
    ]);

    return NextResponse.json({
      activeUsers: activeUsersResult.data || [],
      activation: activationResult.data?.[0] || null,
      retention: retentionResult.data?.[0] || null,
      funnel: funnelResult.data?.[0] || null,
      revenue: mrrResult.data?.[0] || null,
      unitEconomics: unitEconomicsResult.data?.[0] || null,
      channels: channelResult.data || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching YC metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
