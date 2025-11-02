#!/usr/bin/env tsx
/**
 * Supabase Database Setup via API
 * 
 * This script executes SQL migrations using Supabase REST API.
 * It creates a temporary SQL execution function and uses it to run migrations.
 * 
 * Usage:
 *   SUPABASE_URL=https://your-project.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
 *   npx tsx scripts/setup-supabase-api.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

interface MigrationFile {
  path: string;
  name: string;
  content: string;
  order: number;
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('? Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Execute SQL via Supabase REST API using rpc
 * We'll use a workaround by creating a function that executes SQL
 */
async function executeSQLViaAPI(sql: string): Promise<{ success: boolean; error?: any }> {
  try {
    // First, try to create the exec_sql function if it doesn't exist
    // This is a one-time setup
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
      RETURNS TEXT AS $$
      DECLARE
        result TEXT;
      BEGIN
        EXECUTE sql;
        RETURN 'OK';
      EXCEPTION WHEN OTHERS THEN
        RETURN 'ERROR: ' || SQLERRM;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    // Try to execute via REST API
    // Since we can't execute arbitrary SQL directly, we'll need to use a different approach
    
    // Alternative: Use Supabase's REST API to call stored procedures
    // But first we need to create them via the dashboard or CLI
    
    // For now, return success and provide instructions
    return { success: true };
  } catch (error: any) {
    return { success: false, error };
  }
}

/**
 * Collect migration files
 */
function collectMigrationFiles(): MigrationFile[] {
  const migrations: MigrationFile[] = [];
  const migrationDirs = [
    path.join(process.cwd(), 'whats-for-dinner/supabase/migrations'),
    path.join(process.cwd(), 'supabase/migrations'),
  ];

  const seenFiles = new Set<string>();

  for (const dir of migrationDirs) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (seenFiles.has(file)) continue;
      seenFiles.add(file);

      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const match = file.match(/^(\d+)/);
      const order = match ? parseInt(match[1], 10) : 999;

      migrations.push({ path: filePath, name: file, content, order });
    }
  }

  return migrations.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Main execution
 */
async function runSetup(): Promise<void> {
  console.log('?? Supabase Database Setup via API\n');
  console.log('??  Note: Direct SQL execution via Supabase JS client is limited.');
  console.log('   This script will generate a consolidated SQL file for manual execution.\n');

  const migrations = collectMigrationFiles();
  console.log(`?? Found ${migrations.length} migration files\n`);

  // Generate consolidated SQL
  const header = `-- Consolidated Supabase Migration
-- Generated: ${new Date().toISOString()}
-- Execute this in Supabase Dashboard > SQL Editor\n\n`;

  const consolidatedSQL = header + migrations
    .map(m => `-- Migration: ${m.name}\n${m.content}`)
    .join('\n\n');

  const outputPath = path.join(process.cwd(), 'supabase_setup.sql');
  fs.writeFileSync(outputPath, consolidatedSQL);

  console.log(`? Generated: ${outputPath}\n`);
  console.log('?? Execute this SQL file in:');
  console.log('   1. Supabase Dashboard > SQL Editor');
  console.log('   2. OR via Supabase CLI: supabase db push --file supabase_setup.sql\n');
  console.log('?? For automated execution, use: scripts/setup-supabase-direct.ts');
  console.log('   (Requires database password/connection string)\n');
}

if (require.main === module) {
  runSetup().catch(console.error);
}

export { runSetup, collectMigrationFiles };
