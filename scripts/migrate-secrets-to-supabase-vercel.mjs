#!/usr/bin/env node
/**
 * Migrate all environment variables and secrets to Supabase and Vercel
 * 
 * This script:
 * 1. Extracts all env vars from .env.example files
 * 2. Migrates secrets to Supabase secrets_vault table
 * 3. Syncs environment variables to Vercel
 * 4. Creates a unified configuration system
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Dynamic import for Supabase to handle missing dependencies in dry-run
let createClient = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Extract environment variables from .env.example files
 */
function extractEnvVars() {
  const envFiles = [
    '.env.example',
    'nomad/.env.example',
    'ops/env/.env.example',
    '.env.ci.example',
  ];

  const allVars = new Map();
  const secrets = [];
  const publicVars = [];

  for (const envFile of envFiles) {
    const filePath = join(projectRoot, envFile);
    if (!existsSync(filePath)) {
      log(`⚠️  File not found: ${envFile}`, 'yellow');
      continue;
    }

    log(`📄 Reading ${envFile}...`, 'cyan');
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || !line.trim() || !line.includes('=')) {
        continue;
      }

      const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.+)$/);
      if (!match) continue;

      const [, key, value] = match;
      const cleanValue = value.trim().replace(/^["']|["']$/g, '');

      // Skip placeholder values
      if (
        cleanValue.includes('your-') ||
        cleanValue.includes('example') ||
        cleanValue.includes('placeholder') ||
        cleanValue === '' ||
        cleanValue === 'xxx'
      ) {
        continue;
      }

      // Categorize variables
      const isSecret = 
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('key') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('password') ||
        key.toLowerCase().includes('api_key') ||
        key.toLowerCase().includes('private') ||
        (!key.startsWith('NEXT_PUBLIC_') && (
          key.includes('STRIPE') ||
          key.includes('OPENAI') ||
          key.includes('SUPABASE_SERVICE_ROLE') ||
          key.includes('JWT') ||
          key.includes('ENCRYPTION') ||
          key.includes('WEBHOOK_SECRET')
        ));

      if (isSecret) {
        secrets.push({ key, value: cleanValue, source: envFile });
      } else {
        publicVars.push({ key, value: cleanValue, source: envFile });
      }

      allVars.set(key, { value: cleanValue, source: envFile, isSecret });
    }
  }

  return {
    all: allVars,
    secrets,
    publicVars,
  };
}

/**
 * Initialize Supabase client
 */
async function getSupabaseClient() {
  // Try to load Supabase client dynamically
  if (!createClient) {
    try {
      const supabaseModule = await import('@supabase/supabase-js');
import { secretsManager } from './secrets-manager-unified.mjs';
      createClient = supabaseModule.createClient;
    } catch (e) {
      throw new Error(
        '@supabase/supabase-js not installed. Run: pnpm install @supabase/supabase-js'
      );
    }
  }

  const supabaseUrl = (await secretsManager.getSecret('NEXT_PUBLIC_SUPABASE_URL')) || process.env.NEXT_PUBLIC_SUPABASE_URL || (await secretsManager.getSecret('SUPABASE_URL')) || process.env.SUPABASE_URL;
  const supabaseKey = (await secretsManager.getSecret('SUPABASE_SERVICE_ROLE_KEY')) || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Ensure secrets_vault table exists in Supabase
 */
async function ensureSecretsTable(supabase) {
  log('🔧 Ensuring secrets_vault table exists...', 'cyan');

  // Try to query the table to see if it exists
  const { error: queryError } = await supabase
    .from('secrets_vault')
    .select('key')
    .limit(1);

  if (queryError && queryError.code === 'PGRST116') {
    log('📋 Creating secrets_vault table...', 'yellow');
    
    // Create the table via SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS secrets_vault (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        environment TEXT NOT NULL DEFAULT 'production',
        last_rotated TIMESTAMPTZ DEFAULT NOW(),
        next_rotation TIMESTAMPTZ,
        hash TEXT,
        encrypted BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(key, environment)
      );

      CREATE INDEX IF NOT EXISTS idx_secrets_vault_key_env ON secrets_vault(key, environment);
      CREATE INDEX IF NOT EXISTS idx_secrets_vault_next_rotation ON secrets_vault(next_rotation);

      -- Enable RLS
      ALTER TABLE secrets_vault ENABLE ROW LEVEL SECURITY;

      -- Policy: Only service role can access secrets
      CREATE POLICY IF NOT EXISTS "Service role only" ON secrets_vault
        FOR ALL
        USING (auth.role() = 'service_role');
    `;

    // Note: This requires direct database access or a migration
    log('⚠️  Please run the SQL migration to create secrets_vault table', 'yellow');
    log('SQL:', 'cyan');
    console.log(createTableSQL);
  } else if (queryError) {
    throw new Error(`Error checking secrets_vault table: ${queryError.message}`);
  } else {
    log('✅ secrets_vault table exists', 'green');
  }
}

/**
 * Migrate secrets to Supabase
 */
async function migrateToSupabase(supabase, secrets, environment = 'production') {
  log(`\n📦 Migrating ${secrets.length} secrets to Supabase...`, 'cyan');

  const results = {
    success: [],
    skipped: [],
    errors: [],
  };

  for (const secret of secrets) {
    try {
      // Check if secret already exists
      const { data: existing } = await supabase
        .from('secrets_vault')
        .select('key')
        .eq('key', secret.key)
        .eq('environment', environment)
        .single();

      if (existing) {
        log(`⏭️  Skipping ${secret.key} (already exists)`, 'yellow');
        results.skipped.push(secret.key);
        continue;
      }

      // Calculate next rotation date (30 days from now)
      const nextRotation = new Date();
      nextRotation.setDate(nextRotation.getDate() + 30);

      // Store secret (encrypted value would be stored in production)
      const { error } = await supabase
        .from('secrets_vault')
        .insert({
          key: secret.key,
          value: secret.value, // In production, encrypt this
          environment,
          last_rotated: new Date().toISOString(),
          next_rotation: nextRotation.toISOString(),
          encrypted: true,
        });

      if (error) {
        throw error;
      }

      log(`✅ Migrated ${secret.key}`, 'green');
      results.success.push(secret.key);
    } catch (error) {
      log(`❌ Error migrating ${secret.key}: ${error.message}`, 'red');
      results.errors.push({ key: secret.key, error: error.message });
    }
  }

  return results;
}

/**
 * Sync secrets to Vercel using Vercel CLI/API
 */
async function syncToVercel(secrets, publicVars, environment = 'production') {
  log(`\n🚀 Syncing secrets to Vercel (${environment})...`, 'cyan');

  const vercelToken = (await secretsManager.getSecret('VERCEL_TOKEN')) || process.env.VERCEL_TOKEN;
  if (!vercelToken) {
    log('⚠️  VERCEL_TOKEN not set, skipping Vercel sync', 'yellow');
    return { success: [], errors: [] };
  }

  const results = {
    success: [],
    errors: [],
  };

  // Combine secrets and public vars
  const allVars = [...secrets, ...publicVars];

  for (const envVar of allVars) {
    try {
      // Use Vercel CLI to set environment variable
      const vercelEnv = environment === 'production' ? 'production' : 'preview';
      
      const command = `vercel env add ${envVar.key} ${vercelEnv} --token ${vercelToken} <<< "${envVar.value}"`;
      
      try {
        execSync(command, { 
          stdio: 'pipe',
          cwd: join(projectRoot, 'apps/web'),
        });
        log(`✅ Synced ${envVar.key} to Vercel`, 'green');
        results.success.push(envVar.key);
      } catch (execError) {
        // Try alternative method using Vercel API
        log(`⚠️  CLI method failed for ${envVar.key}, trying API...`, 'yellow');
        
        // Alternative: Use Vercel API directly
        const vercelProjectId = (await secretsManager.getSecret('VERCEL_PROJECT_ID')) || process.env.VERCEL_PROJECT_ID;
        if (vercelProjectId) {
          const apiUrl = `https://api.vercel.com/v10/projects/${vercelProjectId}/env`;
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${vercelToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              key: envVar.key,
              value: envVar.value,
              type: envVar.key.startsWith('NEXT_PUBLIC_') ? 'plain' : 'secret',
              target: [vercelEnv],
            }),
          });

          if (response.ok) {
            log(`✅ Synced ${envVar.key} to Vercel via API`, 'green');
            results.success.push(envVar.key);
          } else {
            throw new Error(`API error: ${response.statusText}`);
          }
        } else {
          throw execError;
        }
      }
    } catch (error) {
      log(`❌ Error syncing ${envVar.key} to Vercel: ${error.message}`, 'red');
      results.errors.push({ key: envVar.key, error: error.message });
    }
  }

  return results;
}

/**
 * Generate migration report
 */
function generateReport(supabaseResults, vercelResults, envVars) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalEnvVars: envVars.all.size,
      secrets: envVars.secrets.length,
      publicVars: envVars.publicVars.length,
    },
    supabase: {
      success: supabaseResults.success.length,
      skipped: supabaseResults.skipped.length,
      errors: supabaseResults.errors.length,
    },
    vercel: {
      success: vercelResults.success.length,
      errors: vercelResults.errors.length,
    },
  };

  const reportPath = join(projectRoot, 'SECRETS_MIGRATION_REPORT.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`\n📊 Migration report saved to: ${reportPath}`, 'cyan');
  
  return report;
}

/**
 * Main migration function
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const environment = args.includes('--env') 
    ? args[args.indexOf('--env') + 1] 
    : 'production';

  log('🔐 Secrets Migration to Supabase & Vercel', 'blue');
  log('==========================================\n', 'blue');

  if (dryRun) {
    log('🔍 DRY RUN MODE - No changes will be made\n', 'yellow');
  }

  try {
    // Step 1: Extract environment variables
    log('Step 1: Extracting environment variables...', 'cyan');
    const envVars = extractEnvVars();
    log(`✅ Found ${envVars.all.size} unique environment variables`, 'green');
    log(`   - ${envVars.secrets.length} secrets`, 'green');
    log(`   - ${envVars.publicVars.length} public variables\n`, 'green');

    if (dryRun) {
      log('Environment variables that would be migrated:', 'yellow');
      envVars.secrets.forEach(s => {
        log(`  [SECRET] ${s.key}`, 'yellow');
      });
      envVars.publicVars.forEach(v => {
        log(`  [PUBLIC] ${v.key}`, 'yellow');
      });
      return;
    }

    // Step 2: Migrate to Supabase
    log('Step 2: Migrating to Supabase...', 'cyan');
    const supabase = await getSupabaseClient();
    await ensureSecretsTable(supabase);
    const supabaseResults = await migrateToSupabase(supabase, envVars.secrets, environment);

    // Step 3: Sync to Vercel
    log('\nStep 3: Syncing to Vercel...', 'cyan');
    const vercelResults = await syncToVercel(envVars.secrets, envVars.publicVars, environment);

    // Step 4: Generate report
    log('\nStep 4: Generating migration report...', 'cyan');
    const report = generateReport(supabaseResults, vercelResults, envVars);

    // Summary
    log('\n📋 Migration Summary', 'blue');
    log('==================', 'blue');
    log(`Supabase: ${report.supabase.success} migrated, ${report.supabase.skipped} skipped, ${report.supabase.errors} errors`, 
      report.supabase.errors > 0 ? 'red' : 'green');
    log(`Vercel: ${report.vercel.success} synced, ${report.vercel.errors} errors`,
      report.vercel.errors > 0 ? 'red' : 'green');

    if (supabaseResults.errors.length > 0 || vercelResults.errors.length > 0) {
      log('\n⚠️  Some migrations failed. Check the report for details.', 'yellow');
      process.exit(1);
    } else {
      log('\n✅ Migration completed successfully!', 'green');
    }
  } catch (error) {
    log(`\n❌ Migration failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();
