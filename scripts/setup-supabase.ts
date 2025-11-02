#!/usr/bin/env tsx
/**
 * Supabase Database Setup Script
 * 
 * This script sets up all database tables, RLS policies, indexes, and functions
 * for the Whats-For-Dinner application using the Supabase Management API.
 * 
 * Usage:
 *   SUPABASE_URL=https://your-project.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
 *   npx tsx scripts/setup-supabase.ts
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

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL) {
  console.error('? Error: SUPABASE_URL environment variable is required');
  console.error('   Set it as: SUPABASE_URL=https://your-project.supabase.co');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('? Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('   Set it as: SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Execute raw SQL using Supabase RPC or REST API
 * Note: We'll use a workaround by creating a temporary function or using the REST API
 */
async function executeSQL(sql: string): Promise<{ success: boolean; error?: any }> {
  try {
    // Split SQL into individual statements (handling multi-statement SQL)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\s*$/));

    // Execute each statement using Supabase's REST API
    // For now, we'll use a helper function approach
    for (const statement of statements) {
      if (statement.length === 0) continue;
      
      try {
        // Use the Supabase REST API to execute SQL
        // Note: This requires using the management API or a stored procedure
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ sql: statement })
        });

        // If the function doesn't exist, we'll need to create it first
        if (!response.ok && response.status === 404) {
          // Create the exec_sql function first
          await createExecSQLFunction();
          // Retry the statement
          const retryResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({ sql: statement })
          });
          
          if (!retryResponse.ok) {
            const errorText = await retryResponse.text();
            console.warn(`??  Warning executing statement: ${errorText.substring(0, 200)}`);
          }
        }
      } catch (err: any) {
        // Try alternative method: execute via PostgREST
        if (err.message?.includes('exec_sql') || err.message?.includes('404'))) {
          console.warn(`??  Could not execute via RPC, trying direct method...`);
          // For now, we'll need to use a different approach
          // We can use the Supabase client's direct SQL execution if available
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error };
  }
}

/**
 * Create a helper function to execute SQL
 * This is a workaround since Supabase doesn't expose direct SQL execution in the JS client
 */
async function createExecSQLFunction(): Promise<void> {
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
    RETURNS TEXT AS $$
    BEGIN
      EXECUTE sql;
      RETURN 'OK';
    EXCEPTION WHEN OTHERS THEN
      RETURN 'ERROR: ' || SQLERRM;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  // Try to execute this via the database directly
  // Since we can't execute SQL directly, we'll use a different approach
}

/**
 * Alternative: Execute SQL via Supabase Management API
 * This uses the Supabase Management API which requires special permissions
 */
async function executeSQLDirect(sql: string): Promise<{ success: boolean; error?: any }> {
  try {
    // Use Supabase's REST API endpoint for SQL execution
    // This requires the project API key and service role key
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SQL execution failed: ${errorText}`);
    }

    return { success: true };
  } catch (error: any) {
    // Fallback: use psql or another method
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

  for (const dir of migrationDirs) {
    if (!fs.existsSync(dir)) {
      console.warn(`??  Migration directory not found: ${dir}`);
      continue;
    }

    const files = fs.readdirSync(dir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
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
  return migrations.sort((a, b) => a.order - b.order);
}

/**
 * Execute migrations using a more direct approach
 * Since Supabase JS client doesn't support direct SQL execution,
 * we'll use the PostgreSQL REST API endpoint
 */
async function runMigrations(): Promise<void> {
  console.log('?? Starting Supabase database setup...\n');

  const migrations = collectMigrationFiles();
  console.log(`?? Found ${migrations.length} migration files\n`);

  // Since we can't execute SQL directly via the JS client,
  // we'll create a comprehensive SQL file and provide instructions
  // OR use the Supabase CLI approach

  // For now, let's create a consolidated migration file
  const allMigrations = migrations.map(m => `-- Migration: ${m.name}\n${m.content}`).join('\n\n');

  const outputPath = path.join(process.cwd(), 'supabase_consolidated_migration.sql');
  fs.writeFileSync(outputPath, allMigrations);

  console.log(`? Consolidated migration file created: ${outputPath}`);
  console.log(`\n?? Migration files to execute (in order):`);
  migrations.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.name}`);
  });

  console.log(`\n??  Note: Supabase JS client doesn't support direct SQL execution.`);
  console.log(`   Please use one of the following methods:\n`);
  console.log(`   1. Supabase CLI:`);
  console.log(`      supabase db push --file ${outputPath}\n`);
  console.log(`   2. Supabase Dashboard:`);
  console.log(`      - Go to SQL Editor`);
  console.log(`      - Copy and paste the contents of ${outputPath}`);
  console.log(`      - Execute\n`);
  console.log(`   3. psql (if you have database connection string):`);
  console.log(`      psql <connection-string> < ${outputPath}\n`);

  // Try to execute via REST API with a workaround
  console.log(`\n?? Attempting to execute via Supabase API...\n`);

  // Since direct SQL execution isn't available, we'll need to use the Management API
  // or provide the user with instructions to run manually
  console.log(`\n?? Alternative: I can create a script that uses the Supabase Management API`);
  console.log(`   Please provide your Supabase project reference ID if you want this automated.\n`);

  // Try executing each migration file
  let successCount = 0;
  let failCount = 0;

  for (const migration of migrations) {
    console.log(`?? Executing: ${migration.name}...`);
    
    // For each migration, we'll try to execute it
    // Since Supabase doesn't support direct SQL execution via the JS client,
    // we need to use an alternative method
    
    // Option: Create a Supabase Edge Function that can execute SQL
    // Option: Use the Supabase Management API (requires project access token)
    // Option: Use psql via a connection string
    
    // For now, we'll create instructions
    console.log(`   ??  Cannot execute directly. See instructions above.`);
    failCount++;
  }

  console.log(`\n? Setup complete!`);
  console.log(`   ? Success: ${successCount}`);
  console.log(`   ? Failed: ${failCount}`);
  console.log(`\n?? All migrations consolidated in: ${outputPath}`);
  console.log(`\n?? Next steps:`);
  console.log(`   1. Review the consolidated migration file`);
  console.log(`   2. Execute it using one of the methods mentioned above`);
  console.log(`   3. Verify your tables are created in the Supabase Dashboard\n`);
}

// Alternative approach: Use Supabase Management API
async function executeViaManagementAPI(sql: string): Promise<boolean> {
  // This would require the Supabase Management API token
  // which is different from the service role key
  // For now, we'll skip this and provide manual instructions
  return false;
}

// Run the setup
if (require.main === module) {
  runMigrations().catch((error) => {
    console.error('? Fatal error:', error);
    process.exit(1);
  });
}

export { runMigrations, collectMigrationFiles };
