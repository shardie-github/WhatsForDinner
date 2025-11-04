/**
 * Phase 1 Guardrail: Health Endpoint - Ready
 * Kubernetes-style readiness check - indicates the service is ready to accept traffic
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  const start = Date.now();
  
  try {
    const checks: Record<string, { status: string; error?: string }> = {};
    let allHealthy = true;

    // Database readiness check
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        checks.database = {
          status: error ? 'not_ready' : 'ready',
          ...(error && { error: error.message }),
        };
        
        if (error) {
          allHealthy = false;
        }
      } catch (err) {
        checks.database = {
          status: 'not_ready',
          error: err instanceof Error ? err.message : 'Unknown error',
        };
        allHealthy = false;
      }
    } else {
      checks.database = {
        status: 'not_ready',
        error: 'Database credentials not configured',
      };
      allHealthy = false;
    }

    const responseTime = Date.now() - start;

    return NextResponse.json({
      status: allHealthy ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks,
      responseTime,
    }, {
      status: allHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - start,
    }, { status: 503 });
  }
}
