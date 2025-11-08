#!/usr/bin/env tsx
/**
 * Sync Prisma Schema from Supabase Database
 * 
 * This script introspects the actual Supabase database and updates prisma/schema.prisma
 * to match what's actually in Supabase.
 * 
 * Usage:
 *   tsx scripts/sync-prisma-from-supabase.ts
 * 
 * Requires DATABASE_URL environment variable to be set.
 */

import { execSync } from 'child_process';
import { existsSync, copyFileSync } from 'fs';
import { join } from 'path';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  console.error('');
  console.error('Set it in .env.local or export it:');
  console.error("export DATABASE_URL='postgresql://postgres:PASSWORD@db.ghqyxhbyyirveptgwoqm.supabase.co:5432/postgres?sslmode=require'");
  process.exit(1);
}

console.log('🔄 Syncing Prisma schema from Supabase...\n');

// Backup current schema
const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
if (existsSync(schemaPath)) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `prisma/schema.prisma.backup.${timestamp}`;
  console.log(`📦 Backing up current schema to ${backupPath}...`);
  copyFileSync(schemaPath, backupPath);
}

try {
  // Pull schema from database
  console.log('🔍 Introspecting Supabase database...');
  execSync('npx prisma db pull', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL },
  });

  // Format the schema
  console.log('\n✨ Formatting schema...');
  execSync('npx prisma format', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL },
  });

  // Generate client
  console.log('\n🔨 Generating Prisma client...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL, PRISMA_CLIENT_ENGINE_TYPE: 'wasm' },
  });

  console.log('\n✅ Prisma schema synced from Supabase!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Review prisma/schema.prisma');
  console.log('  2. Commit changes if everything looks good');
  console.log('  3. Run: pnpm prisma migrate dev (if you need to create migrations)');
} catch (error) {
  console.error('\n❌ Error syncing schema:', error);
  process.exit(1);
}
