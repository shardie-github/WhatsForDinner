#!/usr/bin/env tsx
/**
 * Delta Migration Generator
 * 
 * Introspects database and generates a migration file containing ONLY missing objects.
 * Idempotent: Safe to re-run, never duplicates.
 * 
 * Usage:
 *   tsx scripts/agents/generate_delta_migration.ts
 * 
 * Environment:
 *   SUPABASE_DB_URL (required) - PostgreSQL connection string
 */

import { Client } from 'pg';
import { writeFileSync } from 'fs';
import { join } from 'path';

const DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!DB_URL) {
  console.error('❌ SUPABASE_DB_URL or DATABASE_URL required');
  process.exit(1);
}

interface MissingObject {
  type: 'extension' | 'table' | 'column' | 'index' | 'function' | 'policy';
  name: string;
  sql: string;
}

async function generateDeltaMigration() {
  const client = new Client({ connectionString: DB_URL });
  const missing: MissingObject[] = [];

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check extensions
    const extensions = ['pgcrypto', 'pg_trgm'];
    for (const ext of extensions) {
      const result = await client.query(
        `SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = $1) as exists`,
        [ext]
      );
      if (!result.rows[0].exists) {
        missing.push({
          type: 'extension',
          name: ext,
          sql: `CREATE EXTENSION IF NOT EXISTS ${ext};`,
        });
      }
    }

    // Check tables
    const tables = [
      {
        name: 'events',
        sql: `CREATE TABLE IF NOT EXISTS public.events (
    id BIGSERIAL PRIMARY KEY,
    event_name TEXT NOT NULL,
    event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`,
      },
      {
        name: 'spend',
        sql: `CREATE TABLE IF NOT EXISTS public.spend (
    id BIGSERIAL PRIMARY KEY,
    platform TEXT NOT NULL,
    date DATE NOT NULL,
    spend DECIMAL(10, 2) NOT NULL DEFAULT 0,
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    conversions BIGINT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(platform, date)
);`,
      },
      {
        name: 'metrics_daily',
        sql: `CREATE TABLE IF NOT EXISTS public.metrics_daily (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    mrr DECIMAL(10, 2) NOT NULL DEFAULT 0,
    active_users INTEGER NOT NULL DEFAULT 0,
    new_users INTEGER NOT NULL DEFAULT 0,
    activation_rate DECIMAL(5, 2) DEFAULT 0,
    retention_7d DECIMAL(5, 2) DEFAULT 0,
    retention_30d DECIMAL(5, 2) DEFAULT 0,
    cac DECIMAL(10, 2) DEFAULT 0,
    ltv DECIMAL(10, 2) DEFAULT 0,
    ltv_cac_ratio DECIMAL(5, 2) DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`,
      },
    ];

    for (const table of tables) {
      const result = await client.query(
        `SELECT EXISTS(
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = $1
        ) as exists`,
        [table.name]
      );
      if (!result.rows[0].exists) {
        missing.push({
          type: 'table',
          name: table.name,
          sql: table.sql,
        });
      }
    }

    // Check indexes
    const indexes = [
      {
        name: 'idx_events_name_time',
        sql: `CREATE INDEX IF NOT EXISTS idx_events_name_time ON public.events(event_name, event_time DESC);`,
      },
      {
        name: 'idx_spend_platform_dt',
        sql: `CREATE INDEX IF NOT EXISTS idx_spend_platform_dt ON public.spend(platform, date DESC);`,
      },
      {
        name: 'idx_metrics_day',
        sql: `CREATE INDEX IF NOT EXISTS idx_metrics_day ON public.metrics_daily(date DESC);`,
      },
    ];

    for (const idx of indexes) {
      const result = await client.query(
        `SELECT EXISTS(
          SELECT 1 FROM pg_indexes 
          WHERE schemaname = 'public' AND indexname = $1
        ) as exists`,
        [idx.name]
      );
      if (!result.rows[0].exists) {
        missing.push({
          type: 'index',
          name: idx.name,
          sql: idx.sql,
        });
      }
    }

    // Check functions (simplified - just check if they exist)
    const functions = ['upsert_events', 'upsert_spend', 'recompute_metrics_daily', 'system_healthcheck'];
    for (const func of functions) {
      const result = await client.query(
        `SELECT EXISTS(
          SELECT 1 FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE n.nspname = 'public' AND p.proname = $1
        ) as exists`,
        [func]
      );
      if (!result.rows[0].exists) {
        // Functions are complex, reference the main migration file
        missing.push({
          type: 'function',
          name: func,
          sql: `-- Function ${func} missing. Please apply /supabase/migrations/000000000800_upsert_functions.sql`,
        });
      }
    }

    // Check RLS policies
    const policies = [
      { table: 'events', name: 'events_select_policy' },
      { table: 'spend', name: 'spend_select_policy' },
      { table: 'metrics_daily', name: 'metrics_daily_select_policy' },
    ];

    for (const policy of policies) {
      const result = await client.query(
        `SELECT EXISTS(
          SELECT 1 FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = $1 
          AND policyname = $2
        ) as exists`,
        [policy.table, policy.name]
      );
      if (!result.rows[0].exists) {
        missing.push({
          type: 'policy',
          name: policy.name,
          sql: `CREATE POLICY ${policy.name} ON public.${policy.table}
    FOR SELECT
    USING (true);`,
        });
      }
    }

    // Generate migration file if missing objects found
    if (missing.length > 0) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `${timestamp}_delta.sql`;
      const filepath = join(process.cwd(), 'supabase', 'migrations', filename);

      let sql = `-- Delta Migration: Only Missing Objects
-- Generated: ${new Date().toISOString()}
-- Idempotent: Safe to re-run

`;

      for (const obj of missing) {
        sql += `-- ${obj.type.toUpperCase()}: ${obj.name}\n`;
        sql += `${obj.sql}\n\n`;
      }

      writeFileSync(filepath, sql);
      console.log(`✅ Generated delta migration: ${filepath}`);
      console.log(`   Missing objects: ${missing.length}`);
      missing.forEach((m) => console.log(`   - ${m.type}: ${m.name}`));
    } else {
      console.log('✅ No missing objects found. Database is up to date.');
    }
  } catch (error) {
    console.error('❌ Error generating delta migration:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

generateDeltaMigration().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
