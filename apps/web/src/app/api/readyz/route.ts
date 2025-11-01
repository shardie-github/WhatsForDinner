import { NextResponse } from 'next/server';
import { healthCheckSystem } from '@/lib/healthCheck';

/**
 * Readiness probe endpoint
 * Checks if the application is ready to accept traffic
 * This is more comprehensive than healthz and includes dependency checks
 */
export async function GET() {
  const start = Date.now();
  
  try {
    // Run full health checks
    const health = await healthCheckSystem.runHealthChecks();
    
    const totalDuration = Date.now() - start;
    
    // Determine readiness based on critical checks
    const criticalChecks = ['database', 'api_endpoints', 'external_services'];
    const criticalStatuses = health.checks
      .filter(check => criticalChecks.includes(check.name))
      .map(check => check.status);
    
    // Ready if all critical checks are healthy, degraded if some are degraded, not ready if any are unhealthy
    let readinessStatus: 'ready' | 'degraded' | 'not_ready' = 'ready';
    if (criticalStatuses.some(s => s === 'unhealthy')) {
      readinessStatus = 'not_ready';
    } else if (criticalStatuses.some(s => s === 'degraded')) {
      readinessStatus = 'degraded';
    }
    
    const response = {
      status: readinessStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      buildSha: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      responseTime: totalDuration,
      checks: health.checks.reduce((acc, check) => {
        acc[check.name] = {
          status: check.status,
          duration: check.duration,
          message: check.message,
        };
        return acc;
      }, {} as Record<string, any>),
    };
    
    // Return 200 if ready, 503 if not ready, 200 with degraded status if degraded
    const httpStatus = readinessStatus === 'not_ready' ? 503 : 200;
    
    return NextResponse.json(response, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - start,
      },
      { status: 503 }
    );
  }
}
