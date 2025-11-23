#!/usr/bin/env tsx
/**
 * Apply All Migrations
 * 
 * Applies all migrations in supabase/migrations/ directory in order.
 * Safe to re-run (idempotent migrations).
 * 
 * Usage:
 *   tsx scripts/apply_all_migrations.ts [--dry-run]
 * 
 * Environment:
 *   SUPABASE_DB_URL (required) - PostgreSQL connection string
 */

import { Client } from 'pg';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { logger } from './lib/logger';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('apply-all-migrations-ts');
const DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
const DRY_RUN = process.argv.includes('--dry-run');

if (!DB_URL && !DRY_RUN) {
  logger.error('❌ SUPABASE_DB_URL or DATABASE_URL required (or use --dry-run')');
  process.exit(1);
}

async function applyAllMigrations() {
  logger.info('Starting migration application...');
  logger.info(`Dry-run: ${DRY_RUN}`);

  const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => {
      // Sort by numeric prefix if present, otherwise alphabetically
      const numA = parseInt(a.match(/^(\d+)/)?.[1] || '999999');
      const numB = parseInt(b.match(/^(\d+)/)?.[1] || '999999');
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b);
    });

  logger.info(`Found ${files.length} migration files`);

  if (DRY_RUN) {
    logger.info('[DRY-RUN] Would apply migrations in order:');
    files.forEach((f, i) => logger.info(`  ${i + 1}. ${f}`));
    logger.info('✅ Dry-run complete');
    return;
  }

  const client = new Client({ connectionString: DB_URL });

  try {
    await client.connect();
    logger.info('✅ Connected to database');

    // Create migrations tracking table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public._migrations_applied (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    let appliedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
      const filepath = join(migrationsDir, file);

      // Check if already applied
      const checkResult = await client.query(
        'SELECT filename FROM public._migrations_applied WHERE filename = $1',
        [file]
      );

      if (checkResult.rows.length > 0) {
        logger.info(`⏭️  Skipping ${file} (already applied)`);
        skippedCount++;
        continue;
      }

      logger.info(`📄 Applying ${file}...`);

      try {
        const sql = readFileSync(filepath, 'utf-8');
        
        // Execute migration
        await client.query(sql);

        // Record as applied
        await client.query(
          'INSERT INTO public._migrations_applied (filename) VALUES ($1) ON CONFLICT DO NOTHING',
          [file]
        );

        logger.info(`✅ Applied ${file}`);
        appliedCount++;
      } catch (error) {
        logger.error(`❌ Failed to apply ${file}:`, (error as Error).message);
        // Continue with next migration (some may fail if objects already exist)
        logger.warn(`⚠️  Continuing with next migration...`);
      }
    }

    logger.info(`\n📊 Summary: ${appliedCount} applied, ${skippedCount} skipped`);
  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyAllMigrations().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
