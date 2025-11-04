/**
 * Phase 1 Guardrail: Health Endpoint - Liveness
 * Kubernetes-style liveness check - indicates the service is alive
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const start = Date.now();
  
  try {
    // Simple liveness check - just verify the process is running
    const responseTime = Date.now() - start;
    
    return NextResponse.json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime,
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'dead',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - start,
    }, { status: 503 });
  }
}
