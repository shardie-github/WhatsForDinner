#!/usr/bin/env tsx
/**
 * Simplified Supabase Setup Script
 * 
 * This script generates a consolidated SQL migration file and provides
 * instructions for executing it via Supabase Dashboard or CLI.
 * 
 * Usage:
 *   npx tsx scripts/setup-supabase-simple.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface MigrationFile {
  path: string;
  name: string;
  content: string;
  order: number;
}

/**
 * Read and collect all migration files
 */
function collectMigrationFiles(): MigrationFile[] {
  const migrations: MigrationFile[] = [];
  const migrationDirs = [
    path.join(process.cwd(), 'whats-for-dinner/supabase/migrations'),
    path.join(process.cwd(), 'supabase/migrations'),
  ];

  const seenFiles = new Set<string>();

  for (const dir of migrationDirs) {
    if (!fs.existsSync(dir)) {
      continue;
    }

    const files = fs.readdirSync(dir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      // Avoid duplicates
      if (seenFiles.has(file)) continue;
      seenFiles.add(file);

      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Extract order number from filename
      const match = file.match(/^(\d+)/);
      const order = match ? parseInt(match[1], 10) : 999;

      migrations.push({
        path: filePath,
        name: file,
        content,
        order
      });
    }
  }

  return migrations.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Main execution function
 */
async function generateConsolidatedMigration(): Promise<void> {
  console.log('?? Generating consolidated Supabase migration...\n');

  const migrations = collectMigrationFiles();
  console.log(`?? Found ${migrations.length} migration files:\n`);

  migrations.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.name} (order: ${m.order})`);
  });
  console.log('');

  // Create consolidated migration
  const header = `-- ============================================================
-- Consolidated Supabase Migration
-- Generated: ${new Date().toISOString()}
-- 
-- This file contains all database migrations for the Whats-For-Dinner app.
-- Execute this file in your Supabase SQL Editor or via CLI.
-- ============================================================\n\n`;

  const consolidatedSQL = header + migrations
    .map(m => `-- ============================================================
-- Migration: ${m.name}
-- Source: ${m.path}
-- ============================================================\n${m.content}\n`)
    .join('\n\n');

  // Write to file
  const outputPath = path.join(process.cwd(), 'supabase_setup.sql');
  fs.writeFileSync(outputPath, consolidatedSQL);

  console.log(`? Consolidated migration file created!\n`);
  console.log(`?? File: ${outputPath}\n`);
  console.log('????????????????????????????????????????????????????');
  console.log('?? Next Steps:\n');
  console.log('1. Via Supabase Dashboard (Recommended):');
  console.log('   a. Go to your Supabase project dashboard');
  console.log('   b. Navigate to SQL Editor');
  console.log('   c. Copy and paste the contents of supabase_setup.sql');
  console.log('   d. Click "Run" to execute\n');
  console.log('2. Via Supabase CLI:');
  console.log('   supabase db push --file supabase_setup.sql\n');
  console.log('3. Via psql (if you have connection string):');
  console.log('   psql <connection-string> < supabase_setup.sql\n');
  console.log('????????????????????????????????????????????????????\n');
}

// Run
if (require.main === module) {
  generateConsolidatedMigration().catch((error) => {
    console.error('? Error:', error.message);
    process.exit(1);
  });
}

export { generateConsolidatedMigration, collectMigrationFiles };
