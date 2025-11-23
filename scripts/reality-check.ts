#!/usr/bin/env tsx
/**
 * Reality Check Script
 * Validates that backend is "REAL, NOT THEORETICAL"
 * 
 * Checks:
 * - Required env vars are present
 * - Supabase REST API connectivity
 * - Postgres via Prisma connectivity
 * - Realtime subscription test
 * - Storage upload/download (if configured)
 * 
 * Exit code: 0 if all checks pass, 1 otherwise
 */

import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('reality-check-ts');
interface CheckResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

const results: CheckResult[] = [];

function addResult(result: CheckResult) {
  results.push(result);
  const icon = result.passed ? '✅' : '❌';
  logger.info('${icon} ${result.name}${result.error ? `: ${result.error}` : ''}');
  if (result.details) {
    logger.info('   Details:', { result.details });
  }
}

async function checkEnvVars(): Promise<boolean> {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
    'PRISMA_CLIENT_ENGINE_TYPE',
  ];

  const missing: string[] = [];
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    addResult({
      name: 'Environment Variables',
      passed: false,
      error: `Missing: ${missing.join(', ')}`,
    });
    return false;
  }

  // Check PRISMA_CLIENT_ENGINE_TYPE is wasm
  if (process.env.PRISMA_CLIENT_ENGINE_TYPE !== 'wasm') {
    addResult({
      name: 'Prisma Engine Type',
      passed: false,
      error: `Expected 'wasm', got '${process.env.PRISMA_CLIENT_ENGINE_TYPE}'`,
    });
    return false;
  }

  addResult({
    name: 'Environment Variables',
    passed: true,
    details: { engineType: process.env.PRISMA_CLIENT_ENGINE_TYPE },
  });
  return true;
}

async function checkSupabaseREST(): Promise<boolean> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      addResult({
        name: 'Supabase REST API',
        passed: false,
        error: 'Missing credentials',
      });
      return false;
    }

    const supabase = createClient(url, key);
    const start = Date.now();
    
    // Try a simple query
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    const latency = Date.now() - start;

    if (error) {
      addResult({
        name: 'Supabase REST API',
        passed: false,
        error: error.message,
      });
      return false;
    }

    addResult({
      name: 'Supabase REST API',
      passed: true,
      details: { latency: `${latency}ms`, dataCount: data?.length ?? 0 },
    });
    return true;
  } catch (error) {
    addResult({
      name: 'Supabase REST API',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

async function checkPrisma(): Promise<boolean> {
  try {
    const prisma = new PrismaClient();
    const start = Date.now();
    
    // Simple query
    await prisma.$queryRaw`SELECT 1`;
    
    const latency = Date.now() - start;
    
    await prisma.$disconnect();

    addResult({
      name: 'Prisma Database',
      passed: true,
      details: { latency: `${latency}ms` },
    });
    return true;
  } catch (error) {
    addResult({
      name: 'Prisma Database',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

async function checkRealtime(): Promise<boolean> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      addResult({
        name: 'Realtime Subscription',
        passed: false,
        error: 'Missing credentials',
      });
      return false;
    }

    const supabase = createClient(url, key);
    
    // Subscribe to a channel
    const channel = supabase.channel('reality-check');
    
    return new Promise((resolve) => {
      let received = false;
      const timeout = setTimeout(() => {
        channel.unsubscribe();
        addResult({
          name: 'Realtime Subscription',
          passed: received,
          error: received ? undefined : 'Timeout waiting for subscription confirmation',
        });
        resolve(received);
      }, 5000);

      channel
        .on('subscribe', () => {
          received = true;
          clearTimeout(timeout);
          channel.unsubscribe();
          addResult({
            name: 'Realtime Subscription',
            passed: true,
            details: { subscribed: true },
          });
          resolve(true);
        })
        .subscribe();
    });
  } catch (error) {
    addResult({
      name: 'Realtime Subscription',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

async function checkStorage(): Promise<boolean> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.NEXT_PUBLIC_UPLOAD_BUCKET || 'public';

    if (!url || !key) {
      addResult({
        name: 'Storage Upload/Download',
        passed: false,
        error: 'Missing credentials',
      });
      return false;
    }

    const supabase = createClient(url, key);
    
    // Test upload
    const testContent = `reality-check-${Date.now()}`;
    const testPath = `reality-check/${Date.now()}.txt`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(testPath, testContent, {
        contentType: 'text/plain',
        upsert: true,
      });

    if (uploadError) {
      addResult({
        name: 'Storage Upload/Download',
        passed: false,
        error: `Upload failed: ${uploadError.message}`,
      });
      return false;
    }

    // Test download
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(testPath);

    if (downloadError) {
      addResult({
        name: 'Storage Upload/Download',
        passed: false,
        error: `Download failed: ${downloadError.message}`,
      });
      return false;
    }

    // Cleanup
    await supabase.storage.from(bucket).remove([testPath]);

    const downloadedText = await downloadData.text();
    const matches = downloadedText === testContent;

    addResult({
      name: 'Storage Upload/Download',
      passed: matches,
      error: matches ? undefined : 'Downloaded content does not match',
      details: { uploaded: testContent.length, downloaded: downloadedText.length },
    });
    return matches;
  } catch (error) {
    addResult({
      name: 'Storage Upload/Download',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

async function main() {
  logger.info('🔍 Running Reality Check...\n');

  const checks = [
    checkEnvVars(),
    checkSupabaseREST(),
    checkPrisma(),
    checkRealtime(),
  ];

  // Only check storage if bucket is configured
  if (process.env.NEXT_PUBLIC_UPLOAD_BUCKET) {
    checks.push(checkStorage());
  }

  const results = await Promise.all(checks);
  const allPassed = results.every((r) => r);

  logger.info('\n' + '='.repeat(50'));
  logger.info('allPassed ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED');
  logger.info('='.repeat(50'));

  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  logger.error('Fatal error:', { error });
  process.exit(1);
});
