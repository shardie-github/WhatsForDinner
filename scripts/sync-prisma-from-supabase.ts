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
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('sync-prisma-from-supabase-ts');
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  logger.error('❌ Error: DATABASE_URL environment variable is not set');
  logger.error('');
  logger.error('Set it in .env.local or export it:');
  logger.error('export DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"');
  process.exit(1);
}

logger.info('🔄 Syncing Prisma schema from Supabase...\n');

// Backup current schema
const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma');
if (existsSync(schemaPath)) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `prisma/schema.prisma.backup.${timestamp}`;
  logger.info('📦 Backing up current schema to ${backupPath}...');
  copyFileSync(schemaPath, backupPath);
}

try {
  // Pull schema from database
  logger.info('🔍 Introspecting Supabase database...');
  execSync('npx prisma db pull', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL },
  });

  // Format the schema
  logger.info('\n✨ Formatting schema...');
  execSync('npx prisma format', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL },
  });

  // Generate client
  logger.info('\n🔨 Generating Prisma client...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL, PRISMA_CLIENT_ENGINE_TYPE: 'wasm' },
  });

  logger.info('\n✅ Prisma schema synced from Supabase!');
  logger.info('');
  logger.info('Next steps:');
  logger.info('  1. Review prisma/schema.prisma');
  logger.info('  2. Commit changes if everything looks good');
  logger.info('  3. Run: pnpm prisma migrate dev (if you need to create migrations')');
} catch (error) {
  logger.error('\n❌ Error syncing schema:', { error });
  process.exit(1);
}
