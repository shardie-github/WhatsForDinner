#!/usr/bin/env tsx
/**
 * ETL: Pull Events
 * 
 * Pulls application events (signups, activations, meal plans) into events table.
 * Supports --dry-run mode.
 * 
 * Usage:
 *   tsx scripts/etl/pull_events.ts [--dry-run] [--start=YYYY-MM-DD] [--end=YYYY-MM-DD]
 * 
 * Environment:
 *   SUPABASE_DB_URL (required) - PostgreSQL connection string
 */

import { query } from '../lib/db';
import { retry } from '../lib/retry';
import { logger } from '../lib/logger';

const DRY_RUN = process.argv.includes('--dry-run');
const START_DATE = process.argv.find((arg) => arg.startsWith('--start='))?.split('=')[1];
const END_DATE = process.argv.find((arg) => arg.startsWith('--end='))?.split('=')[1];

async function pullEvents() {
  logger.info('Starting events ETL...');
  logger.info(`Dry-run: ${DRY_RUN}`);

  if (DRY_RUN) {
    logger.info('[DRY-RUN] Would pull events from application');
    logger.info('[DRY-RUN] Would insert into events table');
    logger.info('✅ Dry-run complete');
    return;
  }

  try {
    // In a real implementation, this would:
    // 1. Fetch events from application API or event stream
    // 2. Transform events to match schema
    // 3. Upsert using upsert_events function

    // Example: Fetch events (mock)
    const mockEvents = [
      {
        event_name: 'signup',
        event_time: new Date().toISOString(),
        user_id: 'user_123',
        metadata: { source: 'web' },
      },
    ];

    logger.info(`Found ${mockEvents.length} events to process`);

    // Upsert events using retry
    for (const event of mockEvents) {
      await retry(async () => {
        await query(
          `SELECT * FROM public.upsert_events($1::jsonb)`,
          [JSON.stringify(event)]
        );
      });
    }

    logger.info(`✅ Processed ${mockEvents.length} events`);
  } catch (error) {
    logger.error('Failed to pull events:', error);
    process.exit(1);
  }
}

pullEvents().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});
