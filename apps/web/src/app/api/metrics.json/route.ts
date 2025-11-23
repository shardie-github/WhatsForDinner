/**
 * Performance Intelligence Layer: JSON Dashboard Endpoint
 * Returns metrics in JSON format for external consumption
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('route');

server';

export const runtime = 'edge';
export const revalidate = 60;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Fetch dashboard data (reuse logic from dashboard route)
    const dashboardRes = await fetch(
      `${request.nextUrl.origin}/api/metrics/dashboard`,
      {
        headers: {
          'x-internal-request': 'true',
        },
      }
    );

    if (!dashboardRes.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    const dashboardData = await dashboardRes.json();

    // Return as JSON file
    return NextResponse.json(dashboardData, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    logger.error('Metrics JSON error:', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      {
        error: 'Failed to generate metrics JSON',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
