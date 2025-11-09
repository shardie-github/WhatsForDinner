import { NextResponse } from 'next/server';

/**
 * Simple health check endpoint (Edge-compatible)
 * Used by Vercel validation and monitoring
 */
export const runtime = 'edge';

export async function GET() {
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
