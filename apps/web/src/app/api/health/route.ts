import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  const start = Date.now();
  
  try {
    // Basic health check
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      buildSha: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: { status: 'unknown', duration: 0 }
      }
    };

    // Test database connectivity if available
    if (supabaseUrl && supabaseServiceKey) {
      const dbStart = Date.now();
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        const dbDuration = Date.now() - dbStart;
        
        healthData.checks.database = {
          status: error ? 'error' : 'healthy',
          duration: dbDuration,
          error: error?.message
        };
        
        if (error) {
          healthData.status = 'unhealthy';
        }
      } catch (err) {
        const dbDuration = Date.now() - dbStart;
        healthData.checks.database = {
          status: 'error',
          duration: dbDuration,
          error: err instanceof Error ? err.message : 'Unknown error'
        };
        healthData.status = 'unhealthy';
      }
    }

    const totalDuration = Date.now() - start;
    healthData.uptime = process.uptime();
    healthData.responseTime = totalDuration;

    return NextResponse.json(healthData, {
      status: healthData.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - start
    }, { status: 500 });
  }
}