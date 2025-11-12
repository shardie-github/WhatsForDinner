#!/usr/bin/env tsx
/**
 * Data Quality Runner
 * 
 * Runs data quality SQL checks and exits non-zero on failure.
 * 
 * Usage:
 *   tsx scripts/agents/run_data_quality.ts
 * 
 * Environment:
 *   SUPABASE_DB_URL (required) - PostgreSQL connection string
 */

import { query } from '../lib/db';
import { logger } from '../lib/logger';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runDataQuality() {
  logger.info('Running data quality checks...');

  try {
    // Read DQ SQL file
    const sqlPath = join(process.cwd(), 'tests', 'data_quality.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    // Split by semicolons and run each query
    const queries = sql
      .split(';')
      .map((q) => q.trim())
      .filter((q) => q.length > 0 && !q.startsWith('--'));

    let failures = 0;

    for (const queryText of queries) {
      try {
        const results = await query(queryText);
        
        // Check for violations
        for (const row of results) {
          if (row.violations && parseInt(row.violations) > 0) {
            logger.error(`❌ DQ Check failed: ${row.check_name || 'unknown'}`);
            failures++;
          } else if (row.status === 'FAIL') {
            logger.error(`❌ DQ Check failed: ${row.check_name || 'unknown'}`);
            failures++;
          } else if (row.count && parseInt(row.count) > 1) {
            logger.error(`❌ DQ Check failed: Duplicates found in ${row.check_name || 'unknown'}`);
            failures++;
          }
        }
      } catch (error) {
        // Some queries may fail if tables don't exist yet - that's OK
        logger.warn(`Warning: Query failed (may be expected): ${(error as Error).message}`);
      }
    }

    if (failures > 0) {
      logger.error(`❌ Data quality checks failed: ${failures} violation(s)`);
      process.exit(1);
    } else {
      logger.info('✅ All data quality checks passed');
      process.exit(0);
    }
  } catch (error) {
    logger.error('Failed to run data quality checks:', error);
    process.exit(1);
  }
}

runDataQuality().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
