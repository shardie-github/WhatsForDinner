#!/usr/bin/env tsx
/**
 * Nomad Monorepo Wire Doctor
 * 
 * Auto-fixes common miswires:
 * - CORS/CSRF headers
 * - Missing env binding
 * - GPT/AdMob disabled without consent
 * - Fallbacks to house-ads/noop analytics
 * - RLS policy gaps (suggests with diffs/migration files)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { readFile } from 'fs/promises';

interface Fix {
  id: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  file?: string;
  fix: () => Promise<void>;
  rollback?: () => Promise<void>;
}

const fixes: Fix[] = [];

async function checkCSRFHeaders(): Promise<Fix | null> {
  // Check middleware.ts for CSRF protection
  const middlewarePath = join(process.cwd(), 'apps', 'web', 'src', 'app', 'middleware.ts');
  
  if (!existsSync(middlewarePath)) {
    return {
      id: 'csrf-middleware-missing',
      description: 'CSRF middleware file missing',
      severity: 'critical',
      file: middlewarePath,
      fix: async () => {
        const content = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // CSRF protection
  const origin = request.headers.get('origin');
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];
  
  if (request.method !== 'GET' && origin && !allowedOrigins.includes(origin)) {
    return new NextResponse('Invalid origin', { status: 403 });
  }
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
`;
        writeFileSync(middlewarePath, content);
      },
    };
  }

  const content = readFileSync(middlewarePath, 'utf-8');
  if (!content.includes('CSRF') && !content.includes('origin')) {
    return {
      id: 'csrf-missing',
      description: 'CSRF protection missing in middleware',
      severity: 'critical',
      file: middlewarePath,
      fix: async () => {
        // Inject CSRF check
        const lines = content.split('\n');
        const insertIndex = lines.findIndex(l => l.includes('export function middleware'));
        if (insertIndex >= 0) {
          lines.splice(insertIndex + 2, 0, 
            '  // CSRF protection',
            '  const origin = request.headers.get("origin");',
            '  const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || [];',
            '  ',
            '  if (request.method !== "GET" && origin && !allowedOrigins.includes(origin)) {',
            '    return new NextResponse("Invalid origin", { status: 403 });',
            '  }',
          );
          writeFileSync(middlewarePath, lines.join('\n'));
        }
      },
    };
  }

  return null;
}

async function checkEnvFallbacks(): Promise<Fix[]> {
  const foundFixes: Fix[] = [];
  
  // Check analytics adapter fallback
  const analyticsPath = join(process.cwd(), 'packages', 'adapters', 'analytics', 'index.ts');
  if (existsSync(analyticsPath)) {
    const content = readFileSync(analyticsPath, 'utf-8');
    if (!content.includes('noop') && !content.includes('fallback')) {
      foundFixes.push({
        id: 'analytics-noop-fallback',
        description: 'Analytics adapter missing noop fallback',
        severity: 'warning',
        file: analyticsPath,
        fix: async () => {
          const noopContent = `import { createNoopAdapter } from './noop';
export function getAnalyticsAdapter() {
  const provider = process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'posthog' : 'noop';
  if (provider === 'noop') {
    return createNoopAdapter();
  }
  // ... existing code
}
`;
          // Append or modify
          writeFileSync(analyticsPath, content + '\n' + noopContent);
        },
      });
    }
  }

  // Check ads adapter fallback
  const adsPath = join(process.cwd(), 'packages', 'adapters', 'ads', 'index.ts');
  if (existsSync(adsPath)) {
    const content = readFileSync(adsPath, 'utf-8');
    if (!content.includes('house') && !content.includes('fallback')) {
      foundFixes.push({
        id: 'ads-house-fallback',
        description: 'Ads adapter missing house fallback',
        severity: 'warning',
        file: adsPath,
        fix: async () => {
          const houseContent = `import { createHouseAds } from './house';
export function getAdsAdapter() {
  // Check consent first
  const hasConsent = checkConsent();
  if (!hasConsent) {
    return createNoopAds();
  }
  
  // Fallback chain: AdMob -> GPT -> House
  if (process.env.ADMOB_APP_ID) {
    return createAdMobAdapter();
  }
  if (typeof window !== 'undefined') {
    return createGPTAdapter();
  }
  return createHouseAds(); // Always available
}
`;
          writeFileSync(adsPath, content + '\n' + houseContent);
        },
      });
    }
  }

  return foundFixes;
}

async function checkRLSPolicies(): Promise<Fix[]> {
  const foundFixes: Fix[] = [];
  
  // Check if RLS migration exists
  const migrationDir = join(process.cwd(), 'packages', 'server', 'db', 'migrations');
  if (!existsSync(migrationDir)) {
    return foundFixes;
  }

  // Check for meal_plans RLS
  const schemaPath = join(process.cwd(), 'packages', 'server', 'src', 'db', 'schema.ts');
  if (existsSync(schemaPath)) {
    const content = readFileSync(schemaPath, 'utf-8');
    
    if (content.includes('mealPlans') && !content.includes('RLS')) {
      foundFixes.push({
        id: 'rls-meal-plans',
        description: 'RLS policy missing for meal_plans table',
        severity: 'critical',
        fix: async () => {
          const migrationContent = `-- Migration: Add RLS for meal_plans
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own meal plans"
  ON meal_plans
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Household members can view household meal plans"
  ON meal_plans
  FOR SELECT
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );
`;
          const migrationFile = join(migrationDir, `${Date.now()}_rls_meal_plans.sql`);
          writeFileSync(migrationFile, migrationContent);
                  },
      });
    }
  }

  return foundFixes;
}

async function main() {
    );
  
  const allFixes: Fix[] = [];
  
  // Run diagnostics
  const csrfFix = await checkCSRFHeaders();
  if (csrfFix) allFixes.push(csrfFix);
  
  allFixes.push(...(await checkEnvFallbacks()));
  allFixes.push(...(await checkRLSPolicies()));
  
    
  for (const fix of allFixes) {
    const icon = {
      critical: '??',
      warning: '??',
      info: '??',
    }[fix.severity];
    
              }
  
  if (allFixes.length === 0) {
        return;
  }
  
  // Apply fixes
    for (const fix of allFixes) {
    try {
      await fix.fix();
          } catch (error) {
      console.error(`? Failed to fix ${fix.id}:`, error);
    }
  }
  
    }

if (import.meta.url === `file://${process.argv[1]}` || require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main as runWireDoctor };