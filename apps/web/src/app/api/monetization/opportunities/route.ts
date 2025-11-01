/**
 * Monetization Opportunities API
 */

import { NextRequest, NextResponse } from 'next/server';
import { monetizationHub } from '@/lib/monetizationHub';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 });
    }

    // Get upsell opportunities
    const opportunities = await monetizationHub.identifyUpsellOpportunities(
      user.id,
      profile.tenant_id
    );

    // Get revenue forecast
    const forecast = await monetizationHub.forecastRevenue(profile.tenant_id, '3m');

    // Get strategies
    const strategies = await monetizationHub.getMonetizationStrategies();

    return NextResponse.json({
      opportunities,
      forecast,
      strategies,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting monetization opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to get opportunities' },
      { status: 500 }
    );
  }
}
