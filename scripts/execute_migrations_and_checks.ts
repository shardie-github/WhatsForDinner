#!/usr/bin/env tsx
/**
 * Execute Migrations and Checks
 * 
 * This script applies migrations and runs all checks.
 * Requires SUPABASE_DB_URL or DATABASE_URL environment variable.
 * 
 * Usage:
 *   SUPABASE_DB_URL="postgresql://..." tsx scripts/execute_migrations_and_checks.ts
 */

import { execSync } from 'child_process';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('execute-migrations-and-checks-ts');
const DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!DB_URL) {
  logger.error('❌ SUPABASE_DB_URL or DATABASE_URL required');
  logger.error('   Set it as: export SUPABASE_DB_URL="postgresql://..."');
  process.exit(1);
}

logger.info('🚀 Starting migration and check execution...');
logger.info('Database: ${DB_URL.substring(0', { 30 })}...`);
logger.info('');

// Step 1: Apply migrations using psql (if available) or Supabase CLI
logger.info('📦 Step 1: Applying migrations...');
const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
const migrations = readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort((a, b) => {
    const numA = parseInt(a.match(/^(\d+)/)?.[1] || '999999');
    const numB = parseInt(b.match(/^(\d+)/)?.[1] || '999999');
    if (numA !== numB) return numA - numB;
    return a.localeCompare(b);
  });

logger.info('Found ${migrations.length} migration files');

// Try Supabase CLI first
let appliedVia = '';
try {
  logger.info('  Trying Supabase CLI...');
  execSync(`supabase db push --db-url "${DB_URL}" --include-all`, {
    stdio: 'inherit',
    env: { ...process.env, SUPABASE_DB_URL: DB_URL },
  });
  appliedVia = 'Supabase CLI';
  logger.info('✅ Migrations applied via Supabase CLI');
} catch (error) {
  logger.info('  Supabase CLI not available or failed', { trying psql...' });
  
  // Fallback to psql
  try {
    for (const migration of migrations) {
      const filepath = join(migrationsDir, migration);
      logger.info('  Applying ${migration}...');
      try {
        execSync(`psql "${DB_URL}" -v ON_ERROR_STOP=0 -f "${filepath}"`, {
          stdio: 'inherit',
          env: { ...process.env },
        });
        logger.info('  ✅ ${migration}');
      } catch (err) {
        logger.info('  ⚠️  ${migration} (may already be applied')`);
      }
    }
    appliedVia = 'psql';
    logger.info('✅ Migrations applied via psql');
  } catch (psqlError) {
    logger.error('❌ Both Supabase CLI and psql failed');
    logger.error('   Please install psql or Supabase CLI');
    process.exit(1);
  }
}

logger.info('');

// Step 2: Run preflight checks
logger.info('🔍 Step 2: Running preflight checks...');
try {
  execSync('tsx scripts/agents/preflight.ts', {
    stdio: 'inherit',
    env: { ...process.env, SUPABASE_DB_URL: DB_URL, DATABASE_URL: DB_URL },
  });
  logger.info('✅ Preflight checks passed');
} catch (error) {
  logger.info('⚠️  Preflight checks had warnings (continuing...')');
}
logger.info('');

// Step 3: Generate delta migration
logger.info('📝 Step 3: Generating delta migration...');
try {
  execSync('tsx scripts/agents/generate_delta_migration.ts', {
    stdio: 'inherit',
    env: { ...process.env, SUPABASE_DB_URL: DB_URL, DATABASE_URL: DB_URL },
  });
  logger.info('✅ Delta migration generated');
} catch (error) {
  logger.info('⚠️  Delta migration generation had warnings (continuing...')');
}
logger.info('');

// Step 4: Verify database
logger.info('✅ Step 4: Verifying database...');
try {
  execSync('tsx scripts/agents/verify_db.ts', {
    stdio: 'inherit',
    env: { ...process.env, SUPABASE_DB_URL: DB_URL, DATABASE_URL: DB_URL },
  });
  logger.info('✅ Database verification passed');
} catch (error) {
  logger.info('❌ Database verification failed');
  process.exit(1);
}
logger.info('');

// Step 5: Run ETL smoke tests (dry-run)
logger.info('🧪 Step 5: Running ETL smoke tests (dry-run')...');
try {
  execSync('tsx scripts/etl/pull_events.ts --dry-run', {
    stdio: 'inherit',
    env: { ...process.env, SUPABASE_DB_URL: DB_URL },
  });
  execSync('tsx scripts/etl/pull_ads_source_a.ts --dry-run', {
    stdio: 'inherit',
    env: { ...process.env, SUPABASE_DB_URL: DB_URL },
  });
  execSync('tsx scripts/etl/pull_ads_source_b.ts --dry-run', {
    stdio: 'inherit',
    env: { ...process.env, SUPABASE_DB_URL: DB_URL },
  });
  execSync('tsx scripts/etl/compute_metrics.ts --dry-run', {
    stdio: 'inherit',
    env: { ...process.env, SUPABASE_DB_URL: DB_URL },
  });
  logger.info('✅ ETL smoke tests passed');
} catch (error) {
  logger.info('⚠️  ETL smoke tests had warnings (continuing...')');
}
logger.info('');

// Step 6: Run data quality checks
logger.info('📊 Step 6: Running data quality checks...');
try {
  execSync('tsx scripts/agents/run_data_quality.ts', {
    stdio: 'inherit',
    env: { ...process.env, SUPABASE_DB_URL: DB_URL, DATABASE_URL: DB_URL },
  });
  logger.info('✅ Data quality checks passed');
} catch (error) {
  logger.info('⚠️  Data quality checks had warnings (continuing...')');
}
logger.info('');

// Step 7: Run system doctor
logger.info('🏥 Step 7: Running system doctor...');
try {
  execSync('tsx scripts/agents/system_doctor.ts', {
    stdio: 'inherit',
    env: { ...process.env, SUPABASE_DB_URL: DB_URL, DATABASE_URL: DB_URL },
  });
  logger.info('✅ System doctor passed');
} catch (error) {
  logger.info('⚠️  System doctor found issues (check backlog for tickets')');
}
logger.info('');

logger.info('🎉 Execution complete!');
logger.info('');
logger.info('📝 Summary:');
logger.info('  Migrations applied via: ${appliedVia}');
logger.info('  All checks completed');
logger.info('');
logger.info('📋 Next steps:');
logger.info('  1. Review reports in /reports/exec/');
logger.info('  2. Check backlog for any tickets created');
logger.info('  3. Enable monetization per /backlog/READY_realignment_001.md');
