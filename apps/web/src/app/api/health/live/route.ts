/**
 * Liveness Probe Endpoint
 * 
 * Simple check to verify the service is running.
 * Used by Kubernetes/Docker health checks.
 * 
 * GET /api/health/live
 */

import { NextResponse } from 'next/server';
import { createLivenessHandler } from '@whats-for-dinner/utils';

const livenessHandler = createLivenessHandler();

export async function GET() {
  const response = livenessHandler();
  return NextResponse.json(
    JSON.parse(await response.text()),
    {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    }
  );
}
