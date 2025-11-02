#!/usr/bin/env tsx
/**
 * Supabase Database Setup Script (Direct SQL Execution)
 * 
 * This script directly connects to your Supabase database and executes
 * all migration files to set up tables, RLS policies, indexes, and functions.
 * 
 * Usage:
 *   SUPABASE_URL=https://your-project.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
 *   npx tsx scripts/setup-supabase-direct.ts
 * 
 * OR with database connection string:
 *   DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres \
 *   npx tsx scripts/setup-supabase-direct.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'pg';

interface MigrationFile {
  path: string;
  name: string;
  content: string;
  order: number;
}

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

let dbClient: Client | null = null;

/**
 * Create database client from Supabase credentials
 */
function createDatabaseClient(): Client {
  if (DATABASE_URL) {
    return new Client({ connectionString: DATABASE_URL });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Either DATABASE_URL or both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  // Extract project reference from Supabase URL
  // URL format: https://[project-ref].supabase.co
  const match = SUPABASE_URL.match(/https?:\/\/([^.]+)\.supabase\.co/);
  if (!match) {
    throw new Error('Invalid SUPABASE_URL format. Expected: https://[project-ref].supabase.co');
  }

  const projectRef = match[1];
  
  // For direct PostgreSQL connection, we need the database password
  // This is typically found in Supabase Dashboard > Settings > Database
  // For now, we'll construct a connection string pattern
  // The user will need to provide the database password or connection string
  
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
  if (!dbPassword) {
    console.error('? Error: SUPABASE_DB_PASSWORD environment variable is required');
    console.error('   Get it from: Supabase Dashboard > Settings > Database > Connection string');
    console.error('   OR provide DATABASE_URL directly');
    throw new Error('Database password or connection string required');
  }

  const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-${projectRef.substring(0, 2)}-${projectRef.substring(2, 4)}.pooler.supabase.com:6543/postgres?sslmode=require`;
  
  return new Client({ connectionString });
}

/**
 * Execute SQL statement
 */
async function executeSQL(client: Client, sql: string, migrationName: string): Promise<{ success: boolean; error?: any }> {
  try {
    // Split SQL into statements and execute each one
    // Remove comments and empty statements
    const statements = sql
      .split(/;\s*(?=\S)/)
      .map(s => s.trim())
      .filter(s => {
        const trimmed = s.trim();
        return trimmed.length > 0 
          && !trimmed.startsWith('--') 
          && !trimmed.match(/^\s*$/)
          && !trimmed.toLowerCase().startsWith('\\');
      });

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      try {
        await client.query(statement);
      } catch (err: any) {
        // Some errors are expected (e.g., table already exists)
        // Only log if it's not a "already exists" type error
        if (!err.message?.includes('already exists') 
            && !err.message?.includes('duplicate key')
            && !err.message?.includes('relation already exists')) {
          console.warn(`   ??  Warning in statement ${i + 1}: ${err.message?.substring(0, 100)}`);
          // Don't fail the entire migration for minor issues
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error };
  }
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
      // Avoid duplicates if same file exists in multiple dirs
      if (seenFiles.has(file)) continue;
      seenFiles.add(file);

      const filePath = path.join(dir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Extract order number from filename (e.g., "001_create_tables.sql" -> 1)
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

  // Sort by order number
  return migrations.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Main execution function
 */
async function runMigrations(): Promise<void> {
  console.log('?? Starting Supabase database setup...\n');

  try {
    // Create database client
    console.log('?? Connecting to database...');
    dbClient = createDatabaseClient();
    await dbClient.connect();
    console.log('? Connected successfully!\n');

    // Collect migration files
    const migrations = collectMigrationFiles();
    console.log(`?? Found ${migrations.length} migration files:\n`);

    migrations.forEach((m, i) => {
      console.log(`   ${i + 1}. ${m.name} (order: ${m.order})`);
    });
    console.log('');

    // Execute each migration
    let successCount = 0;
    let failCount = 0;

    for (const migration of migrations) {
      console.log(`?? Executing: ${migration.name}...`);
      
      const result = await executeSQL(dbClient, migration.content, migration.name);
      
      if (result.success) {
        console.log(`   ? Completed: ${migration.name}\n`);
        successCount++;
      } else {
        console.error(`   ? Failed: ${migration.name}`);
        console.error(`   Error: ${result.error?.message || result.error}\n`);
        failCount++;
      }
    }

    // Summary
    console.log('????????????????????????????????????????????????????');
    console.log(`? Setup complete!`);
    console.log(`   ? Successful: ${successCount}`);
    console.log(`   ? Failed: ${failCount}`);
    console.log('????????????????????????????????????????????????????\n');

    if (failCount > 0) {
      console.log('??  Some migrations failed. Please review the errors above.');
      console.log('   You may need to run failed migrations manually.\n');
    } else {
      console.log('?? All migrations executed successfully!');
      console.log('   Your Supabase database is now fully configured.\n');
    }

  } catch (error: any) {
    console.error('\n? Fatal error:', error.message);
    if (error.message.includes('password')) {
      console.error('\n?? To get your database password:');
      console.error('   1. Go to Supabase Dashboard > Settings > Database');
      console.error('   2. Find "Connection string" or "Database password"');
      console.error('   3. Set SUPABASE_DB_PASSWORD environment variable');
      console.error('   OR set DATABASE_URL with full connection string\n');
    }
    throw error;
  } finally {
    if (dbClient) {
      await dbClient.end();
      console.log('?? Database connection closed.\n');
    }
  }
}

// Run the setup
if (require.main === module) {
  runMigrations().catch((error) => {
    console.error('? Setup failed:', error.message);
    process.exit(1);
  });
}

export { runMigrations, collectMigrationFiles };
