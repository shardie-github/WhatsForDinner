#!/usr/bin/env node
/**
 * Apply secrets_vault migration using Supabase SQL API
 * 
 * This script uses the Supabase Management API to execute SQL
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
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function applyMigration() {
  log('\n🔧 Secrets Vault Migration', 'blue');
  log('==========================\n', 'blue');

  // Read migration SQL
  const migrationPath = join(projectRoot, 'supabase/migrations/create_secrets_vault.sql');
  let migrationSQL;
  try {
    migrationSQL = readFileSync(migrationPath, 'utf8');
    log(`✅ Migration file loaded`, 'green');
    log(`   ${migrationPath}\n`, 'cyan');
  } catch (error) {
    log(`❌ Failed to read migration file: ${error.message}`, 'red');
    process.exit(1);
  }

  // Get Supabase credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

  // Extract project ref
  const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  // Try method 1: Use pg library if DATABASE_URL is available
  if (dbUrl) {
    log('📡 Attempting direct database connection...', 'cyan');
    
    try {
      // Dynamic import to avoid error if not installed
      const pg = await import('pg').catch(() => null);
      
      if (pg) {
        const { Client } = pg.default || pg;
        log('✅ pg library found, connecting...', 'green');
        
        const client = new Client({ 
          connectionString: dbUrl,
          ssl: dbUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : false
        });
        
        await client.connect();
        log('✅ Connected to database', 'green');
        log('\n📋 Executing migration SQL...', 'cyan');
        
        try {
          await client.query(migrationSQL);
          log('\n✅ Migration executed successfully!', 'green');
          log('✅ secrets_vault table created', 'green');
          log('✅ secret_rotation_logs table created', 'green');
          log('✅ RLS policies configured', 'green');
          log('✅ Indexes and triggers created', 'green');
          
          await client.end();
          return;
        } catch (error) {
          // Check if tables already exist
          if (error.message.includes('already exists') || error.code === '42P07') {
            log('\n⚠️  Tables already exist (this is OK)', 'yellow');
            log('✅ Migration appears to be already applied', 'green');
            await client.end();
            return;
          }
          throw error;
        }
      } else {
        log('⚠️  pg library not installed', 'yellow');
      }
    } catch (error) {
      log(`⚠️  Database connection failed: ${error.message}`, 'yellow');
      log('   Trying alternative methods...\n', 'yellow');
    }
  }

  // Method 2: Try Supabase Management API
  if (supabaseUrl && supabaseKey && projectRef) {
    log('📡 Attempting Supabase Management API...', 'cyan');
    
    const managementApiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
    
    try {
      // Split SQL into statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\s*$/));

      log(`📋 Executing ${statements.length} SQL statements...`, 'cyan');

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';';
        
        try {
          const response = await fetch(managementApiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
            },
            body: JSON.stringify({
              query: statement,
            }),
          });

          if (response.ok) {
            log(`  ✅ Statement ${i + 1}/${statements.length}`, 'green');
          } else {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            // Ignore "already exists" errors
            if (error.message?.includes('already exists') || response.status === 409) {
              log(`  ⚠️  Statement ${i + 1}/${statements.length} (already exists)`, 'yellow');
            } else {
              throw new Error(`Statement ${i + 1} failed: ${error.message || response.statusText}`);
            }
          }
        } catch (error) {
          // If Management API doesn't work, fall through to instructions
          if (error.message.includes('fetch')) {
            throw new Error('Management API not available');
          }
          throw error;
        }
      }

      log('\n✅ Migration completed successfully!', 'green');
      return;
    } catch (error) {
      if (!error.message.includes('Management API not available')) {
        log(`⚠️  Management API error: ${error.message}`, 'yellow');
      }
    }
  }

  // Method 3: Provide instructions
  log('\n📋 Manual Migration Instructions', 'cyan');
  log('================================\n', 'cyan');
  
  log('Since automatic migration is not available, please use one of these methods:\n', 'yellow');

  log('Method 1: Supabase Dashboard (Recommended)', 'blue');
  log('  1. Go to: https://supabase.com/dashboard/project/' + (projectRef || 'YOUR_PROJECT_REF'), 'cyan');
  log('  2. Navigate to: SQL Editor', 'cyan');
  log('  3. Copy the contents of:', 'cyan');
  log(`     ${migrationPath}`, 'cyan');
  log('  4. Paste and click "Run"\n', 'cyan');

  log('Method 2: Supabase CLI', 'blue');
  log('  1. Install: npm install -g supabase', 'cyan');
  log('  2. Login: supabase login', 'cyan');
  log('  3. Link: supabase link --project-ref ' + (projectRef || 'YOUR_PROJECT_REF'), 'cyan');
  log('  4. Apply: supabase db push', 'cyan');
  log('     or: supabase migration up\n', 'cyan');

  log('Method 3: Direct psql (if you have DATABASE_URL)', 'blue');
  log('  psql $SUPABASE_DB_URL -f supabase/migrations/create_secrets_vault.sql\n', 'cyan');

  log('Method 4: Install pg library and set DATABASE_URL', 'blue');
  log('  1. pnpm install pg', 'cyan');
  log('  2. export SUPABASE_DB_URL="postgresql://..."', 'cyan');
  log('  3. Run this script again\n', 'cyan');

  log('📄 Migration SQL file:', 'cyan');
  log(`   ${migrationPath}\n`, 'cyan');

  // Show a preview of the SQL
  log('Preview (first 20 lines):', 'cyan');
  migrationSQL.split('\n').slice(0, 20).forEach(line => {
    console.log(`   ${line}`);
  });
  log('   ...\n', 'cyan');
}

applyMigration().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
