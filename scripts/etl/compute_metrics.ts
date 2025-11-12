#!/usr/bin/env tsx
/**
 * ETL: Compute Metrics
 * 
 * Computes daily metrics by calling recompute_metrics_daily function.
 * Supports --dry-run mode.
 * 
 * Usage:
 *   tsx scripts/etl/compute_metrics.ts [--dry-run] [--start=YYYY-MM-DD] [--end=YYYY-MM-DD]
 * 
 * Environment:
 *   SUPABASE_DB_URL (required) - PostgreSQL connection string
 */

import { query } from '../lib/db';
import { logger } from '../lib/logger';

const DRY_RUN = process.argv.includes('--dry-run');
const START_DATE =
  process.argv.find((arg) => arg.startsWith('--start='))?.split('=')[1] ||
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Default: 7 days ago
const END_DATE =
  process.argv.find((arg) => arg.startsWith('--end='))?.split('=')[1] ||
  new Date().toISOString().split('T')[0]; // Default: today

async function computeMetrics() {
  logger.info('Starting metrics computation...');
  logger.info(`Dry-run: ${DRY_RUN}`);
  logger.info(`Date range: ${START_DATE} to ${END_DATE}`);

  if (DRY_RUN) {
    logger.info('[DRY-RUN] Would call recompute_metrics_daily(start, end)');
    logger.info(`[DRY-RUN] Would compute metrics for ${START_DATE} to ${END_DATE}`);
    logger.info('✅ Dry-run complete');
    return;
  }

  try {
    // Call recompute_metrics_daily function
    const results = await query(
      `SELECT * FROM public.recompute_metrics_daily($1::DATE, $2::DATE)`,
      [START_DATE, END_DATE]
    );

    logger.info(`✅ Computed metrics for ${results.length} days`);
    logger.info(`Sample: ${JSON.stringify(results[0] || {}, null, 2)}`);
  } catch (error) {
    logger.error('Failed to compute metrics:', error);
    process.exit(1);
  }
}

computeMetrics().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
