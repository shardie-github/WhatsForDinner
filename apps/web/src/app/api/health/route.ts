import { NextRequest, NextResponse } from 'next/server';
import { withTelemetry } from '@/lib/telemetry/api-middleware';

/**
 * Simple health check endpoint (Edge-compatible)
 * Used by Vercel validation and monitoring
 */
export const runtime = 'edge';

async function handler(_req: NextRequest) {
  return NextResponse.json(
    {
      ok: true,
      ts: Date.now(),
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
}

export const GET = withTelemetry(handler);
