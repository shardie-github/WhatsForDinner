#!/usr/bin/env tsx
/**
 * Preflight Checks
 * 
 * Checks environment variables, database connectivity, and base table presence.
 * Writes report to /reports/exec/preflight_report.md
 * 
 * Usage:
 *   tsx scripts/agents/preflight.ts
 * 
 * Environment:
 *   SUPABASE_DB_URL (required) - PostgreSQL connection string
 */

import { query } from '../lib/db';
import { logger } from '../lib/logger';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface PreflightCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

async function runPreflight() {
  logger.info('Running preflight checks...');
  const checks: PreflightCheck[] = [];

  // Check environment variables
  const requiredEnvVars = ['SUPABASE_DB_URL'];
  const optionalEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SLACK_WEBHOOK_URL'];

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar] || process.env[envVar.replace('SUPABASE_DB_URL', 'DATABASE_URL')]) {
      checks.push({ name: `Env: ${envVar}`, status: 'pass', message: 'Set' });
    } else {
      checks.push({ name: `Env: ${envVar}`, status: 'fail', message: 'Missing' });
    }
  }

  for (const envVar of optionalEnvVars) {
    if (process.env[envVar]) {
      checks.push({ name: `Env: ${envVar}`, status: 'pass', message: 'Set' });
    } else {
      checks.push({ name: `Env: ${envVar}`, status: 'warn', message: 'Optional, not set' });
    }
  }

  // Check database connectivity
  try {
    await query('SELECT 1');
    checks.push({ name: 'DB: Connectivity', status: 'pass', message: 'Connected' });
  } catch (error) {
    checks.push({
      name: 'DB: Connectivity',
      status: 'fail',
      message: `Failed: ${(error as Error).message}`,
    });
  }

  // Check base tables
  const requiredTables = ['events', 'spend', 'metrics_daily'];
  for (const table of requiredTables) {
    try {
      const result = await query(
        `SELECT EXISTS(
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = $1
        ) as exists`,
        [table]
      );
      if (result[0].exists) {
        checks.push({ name: `Table: ${table}`, status: 'pass', message: 'Exists' });
      } else {
        checks.push({ name: `Table: ${table}`, status: 'fail', message: 'Missing' });
      }
    } catch (error) {
      checks.push({
        name: `Table: ${table}`,
        status: 'fail',
        message: `Error: ${(error as Error).message}`,
      });
    }
  }

  // Generate report
  const passCount = checks.filter((c) => c.status === 'pass').length;
  const failCount = checks.filter((c) => c.status === 'fail').length;
  const warnCount = checks.filter((c) => c.status === 'warn').length;

  const report = `# Preflight Report

**Generated:** ${new Date().toISOString()}

## Summary

- ✅ Passed: ${passCount}
- ❌ Failed: ${failCount}
- ⚠️  Warnings: ${warnCount}

## Checks

${checks
  .map((check) => {
    const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
    return `- ${icon} **${check.name}**: ${check.message}`;
  })
  .join('\n')}

## Next Steps

${failCount > 0 ? '❌ **Preflight failed.** Please fix issues before proceeding.' : '✅ **Preflight passed.** Safe to proceed.'}
`;

  const reportPath = join(process.cwd(), 'reports', 'exec', 'preflight_report.md');
  writeFileSync(reportPath, report);
  logger.info(`✅ Preflight report written to ${reportPath}`);

  // Print summary
  console.log('\n📊 Preflight Results:\n');
  checks.forEach((check) => {
    const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${check.name}: ${check.message}`);
  });

  if (failCount > 0) {
    logger.error(`❌ Preflight failed: ${failCount} check(s) failed`);
    process.exit(1);
  } else {
    logger.info('✅ Preflight passed');
    process.exit(0);
  }
}

runPreflight().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
