#!/usr/bin/env tsx
/**
 * Database Verifier
 * 
 * Verifies database schema: tables, columns, indexes, RLS, policies.
 * Exit non-zero on failure.
 * 
 * Usage:
 *   tsx scripts/agents/verify_db.ts
 * 
 * Environment:
 *   SUPABASE_DB_URL (required) - PostgreSQL connection string
 */

import { Client } from 'pg';

const DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!DB_URL) {
  console.error('❌ SUPABASE_DB_URL or DATABASE_URL required');
  process.exit(1);
}

interface VerificationResult {
  check: string;
  status: 'pass' | 'fail';
  message: string;
}

async function verifyDatabase() {
  const client = new Client({ connectionString: DB_URL });
  const results: VerificationResult[] = [];

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check tables exist
    const requiredTables = ['events', 'spend', 'metrics_daily'];
    for (const table of requiredTables) {
      const result = await client.query(
        `SELECT EXISTS(
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = $1
        ) as exists`,
        [table]
      );
      if (result.rows[0].exists) {
        results.push({ check: `Table: ${table}`, status: 'pass', message: 'Exists' });
      } else {
        results.push({ check: `Table: ${table}`, status: 'fail', message: 'Missing' });
      }
    }

    // Check columns exist (sample: events table)
    const requiredColumns = {
      events: ['id', 'event_name', 'event_time', 'user_id', 'metadata'],
      spend: ['id', 'platform', 'date', 'spend', 'impressions', 'clicks'],
      metrics_daily: ['id', 'date', 'mrr', 'active_users', 'new_users'],
    };

    for (const [table, columns] of Object.entries(requiredColumns)) {
      for (const column of columns) {
        const result = await client.query(
          `SELECT EXISTS(
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = $1 
            AND column_name = $2
          ) as exists`,
          [table, column]
        );
        if (result.rows[0].exists) {
          results.push({
            check: `Column: ${table}.${column}`,
            status: 'pass',
            message: 'Exists',
          });
        } else {
          results.push({
            check: `Column: ${table}.${column}`,
            status: 'fail',
            message: 'Missing',
          });
        }
      }
    }

    // Check indexes exist
    const requiredIndexes = ['idx_events_name_time', 'idx_spend_platform_dt', 'idx_metrics_day'];
    for (const index of requiredIndexes) {
      const result = await client.query(
        `SELECT EXISTS(
          SELECT 1 FROM pg_indexes 
          WHERE schemaname = 'public' AND indexname = $1
        ) as exists`,
        [index]
      );
      if (result.rows[0].exists) {
        results.push({ check: `Index: ${index}`, status: 'pass', message: 'Exists' });
      } else {
        results.push({ check: `Index: ${index}`, status: 'fail', message: 'Missing' });
      }
    }

    // Check RLS enabled
    const tablesWithRLS = ['events', 'spend', 'metrics_daily'];
    for (const table of tablesWithRLS) {
      const result = await client.query(
        `SELECT relrowsecurity as rls_enabled
         FROM pg_class c
         JOIN pg_namespace n ON c.relnamespace = n.oid
         WHERE n.nspname = 'public' AND c.relname = $1`,
        [table]
      );
      if (result.rows.length > 0 && result.rows[0].rls_enabled) {
        results.push({ check: `RLS: ${table}`, status: 'pass', message: 'Enabled' });
      } else {
        results.push({ check: `RLS: ${table}`, status: 'fail', message: 'Not enabled' });
      }
    }

    // Check policies exist (at least 1 per table)
    for (const table of tablesWithRLS) {
      const result = await client.query(
        `SELECT COUNT(*) as count
         FROM pg_policies 
         WHERE schemaname = 'public' AND tablename = $1`,
        [table]
      );
      const count = parseInt(result.rows[0].count);
      if (count >= 1) {
        results.push({
          check: `Policies: ${table}`,
          status: 'pass',
          message: `${count} policy(ies) found`,
        });
      } else {
        results.push({
          check: `Policies: ${table}`,
          status: 'fail',
          message: 'No policies found',
        });
      }
    }

    // Check functions exist
    const requiredFunctions = [
      'upsert_events',
      'upsert_spend',
      'recompute_metrics_daily',
      'system_healthcheck',
    ];
    for (const func of requiredFunctions) {
      const result = await client.query(
        `SELECT EXISTS(
          SELECT 1 FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE n.nspname = 'public' AND p.proname = $1
        ) as exists`,
        [func]
      );
      if (result.rows[0].exists) {
        results.push({ check: `Function: ${func}`, status: 'pass', message: 'Exists' });
      } else {
        results.push({ check: `Function: ${func}`, status: 'fail', message: 'Missing' });
      }
    }

    // Print results
    console.log('\n📊 Verification Results:\n');
    let passCount = 0;
    let failCount = 0;

    for (const result of results) {
      const icon = result.status === 'pass' ? '✅' : '❌';
      console.log(`${icon} ${result.check}: ${result.message}`);
      if (result.status === 'pass') passCount++;
      else failCount++;
    }

    console.log(`\n📈 Summary: ${passCount} passed, ${failCount} failed\n`);

    if (failCount > 0) {
      console.error('❌ Verification failed. Please apply migrations.');
      process.exit(1);
    } else {
      console.log('✅ All checks passed.');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error verifying database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifyDatabase().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
