import { NextRequest, NextResponse } from 'next/server';
import { withTelemetry } from '@/lib/telemetry/api-middleware';

/**
 * Health check endpoint with environment variable validation
 * Used by Vercel validation and monitoring
 * Validates that all required environment variables are present
 */
export const runtime = 'edge';

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

async function handler(_req: NextRequest) {
  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);

  return NextResponse.json(
    {
      ok: missing.length === 0,
      missing,
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      status: missing.length === 0 ? 200 : 503,
    }
  );
}

export const GET = withTelemetry(handler);
