#!/usr/bin/env node
/**
 * Run the secrets_vault database migration
 * 
 * This script executes the SQL migration using Supabase client
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runMigration() {
  log('🔧 Running secrets_vault migration...', 'cyan');
  log('=====================================\n', 'cyan');

  // Try to load Supabase client
  let createClient;
  try {
    const supabaseModule = await import('@supabase/supabase-js');
    createClient = supabaseModule.createClient;
  } catch (e) {
    log('❌ @supabase/supabase-js not installed', 'red');
    log('   Run: pnpm install @supabase/supabase-js', 'yellow');
    process.exit(1);
  }

  // Get Supabase credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

  if (!supabaseUrl || !supabaseKey) {
    log('❌ Missing Supabase credentials', 'red');
    log('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY', 'yellow');
    process.exit(1);
  }

  log('✅ Supabase credentials found', 'green');

  // Read migration SQL
  const migrationPath = join(projectRoot, 'supabase/migrations/create_secrets_vault.sql');
  let migrationSQL;
  try {
    migrationSQL = readFileSync(migrationPath, 'utf8');
    log(`✅ Migration file loaded: ${migrationPath}`, 'green');
  } catch (error) {
    log(`❌ Failed to read migration file: ${error.message}`, 'red');
    process.exit(1);
  }

  // Split SQL into individual statements
  // Remove comments and split by semicolons
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
    .filter(s => !s.match(/^\s*$/));

  log(`\n📋 Executing ${statements.length} SQL statements...`, 'cyan');

  // Use Supabase client with RPC to execute SQL
  // Note: Supabase client doesn't directly support raw SQL execution
  // We'll need to use the REST API or psql
  // For now, let's try using the REST API directly

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Try to execute via RPC (if we have a function) or use direct SQL
  // Since Supabase client doesn't support raw SQL, we'll use fetch to the REST API
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (!projectRef) {
    log('❌ Could not extract project ref from Supabase URL', 'red');
    process.exit(1);
  }

  log(`\n🔗 Project ref: ${projectRef}`, 'cyan');

  // Use Supabase Management API or direct SQL execution
  // For now, let's use the client's rpc method or create a helper function
  // Actually, the best approach is to use the Supabase SQL editor API

  // Method 1: Use Supabase REST API to execute SQL
  const sqlApiUrl = `${supabaseUrl}/rest/v1/rpc/exec_sql`;
  
  // Try to execute the migration in chunks
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  // Since Supabase REST API doesn't support arbitrary SQL execution,
  // we need to use a different approach
  // Option: Use psql via exec if available, or provide instructions

  log('\n⚠️  Direct SQL execution via Supabase client is not supported', 'yellow');
  log('   You need to run the migration using one of these methods:\n', 'yellow');
  
  log('Method 1: Using Supabase CLI', 'cyan');
  log('   supabase db push', 'cyan');
  log('   or', 'cyan');
  log('   supabase migration up', 'cyan');
  
  log('\nMethod 2: Using psql directly', 'cyan');
  log('   psql $SUPABASE_DB_URL -f supabase/migrations/create_secrets_vault.sql', 'cyan');
  
  log('\nMethod 3: Using Supabase Dashboard', 'cyan');
  log('   1. Go to Supabase Dashboard > SQL Editor', 'cyan');
  log('   2. Copy the contents of supabase/migrations/create_secrets_vault.sql', 'cyan');
  log('   3. Paste and execute in the SQL Editor', 'cyan');

  log('\n📄 Migration SQL file:', 'cyan');
  log(`   ${migrationPath}\n`, 'cyan');

  // If we have DATABASE_URL, try to use node-postgres or similar
  if (dbUrl) {
    log('💡 Attempting to use DATABASE_URL for direct connection...', 'yellow');
    
    try {
      // Try to use pg library if available
      const pg = await import('pg').catch(() => null);
      
      if (pg) {
        const { Client } = pg.default || pg;
        const client = new Client({ connectionString: dbUrl });
        
        await client.connect();
        log('✅ Connected to database', 'green');
        
        // Execute migration
        try {
          await client.query(migrationSQL);
          log('✅ Migration executed successfully!', 'green');
          successCount = statements.length;
        } catch (error) {
          log(`❌ Migration error: ${error.message}`, 'red');
          errorCount++;
          errors.push(error.message);
        } finally {
          await client.end();
        }
      } else {
        log('⚠️  pg library not installed. Install with: pnpm install pg', 'yellow');
        log('   Or use one of the methods above.', 'yellow');
      }
    } catch (error) {
      log(`⚠️  Could not connect: ${error.message}`, 'yellow');
    }
  }

  // Summary
  log('\n📊 Migration Summary', 'cyan');
  log('==================', 'cyan');
  
  if (successCount > 0) {
    log(`✅ Successfully executed ${successCount} statements`, 'green');
  }
  
  if (errorCount > 0) {
    log(`❌ Errors: ${errorCount}`, 'red');
    errors.forEach(err => log(`   - ${err}`, 'red'));
    process.exit(1);
  }

  if (successCount === 0) {
    log('⚠️  Migration not executed. Please use one of the methods above.', 'yellow');
    log('   The SQL file is ready at:', 'cyan');
    log(`   ${migrationPath}`, 'cyan');
  }
}

runMigration().catch(error => {
  log(`\n❌ Migration failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
