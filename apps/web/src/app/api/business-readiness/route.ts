/**
 * Business Readiness API
 * Endpoint for accessing business readiness reports and metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { businessReadinessOrchestrator } from '@/lib/businessReadinessOrchestrator';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tenant ID from user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 });
    }

    // Generate business readiness report
    const report = await businessReadinessOrchestrator.generateBusinessReadinessReport(
      profile.tenant_id
    );

    // Get business metrics
    const metrics = await businessReadinessOrchestrator.getBusinessMetrics(
      profile.tenant_id
    );

    return NextResponse.json({
      report,
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating business readiness report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'initialize') {
      await businessReadinessOrchestrator.initialize();
      return NextResponse.json({ success: true, message: 'Systems initialized' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
