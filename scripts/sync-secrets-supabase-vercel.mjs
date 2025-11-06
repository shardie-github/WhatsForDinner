#!/usr/bin/env node
/**
 * Sync Secrets between Supabase and Vercel
 * 
 * This script ensures that secrets stored in Supabase are also available in Vercel
 * and vice versa. It can run as a scheduled job to keep both systems in sync.
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Dynamic import for Supabase
let createClient = null;

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

/**
 * Get Supabase client
 */
async function getSupabaseClient() {
  // Try to load Supabase client dynamically
  if (!createClient) {
    try {
      const supabaseModule = await import('@supabase/supabase-js');
      createClient = supabaseModule.createClient;
    } catch (e) {
      throw new Error(
        '@supabase/supabase-js not installed. Run: pnpm install @supabase/supabase-js'
      );
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Fetch all secrets from Supabase
 */
async function getSupabaseSecrets(supabase, environment = 'production') {
  const { data, error } = await supabase
    .from('secrets_vault')
    .select('key, value, environment')
    .eq('environment', environment);

  if (error) {
    throw new Error(`Failed to fetch from Supabase: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch environment variables from Vercel API
 */
async function getVercelEnvVars(projectId, token) {
  const apiUrl = `https://api.vercel.com/v10/projects/${projectId}/env`;
  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Vercel API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.envs || [];
}

/**
 * Set environment variable in Vercel
 */
async function setVercelEnvVar(projectId, token, key, value, environment = 'production') {
  const vercelEnv = environment === 'production' ? 'production' : 'preview';
  const isSecret = !key.startsWith('NEXT_PUBLIC_');

  const apiUrl = `https://api.vercel.com/v10/projects/${projectId}/env`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key,
      value,
      type: isSecret ? 'secret' : 'plain',
      target: [vercelEnv],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to set in Vercel: ${error.message || response.statusText}`);
  }

  return true;
}

/**
 * Sync Supabase -> Vercel
 */
async function syncSupabaseToVercel(environment = 'production') {
  log(`\n🔄 Syncing Supabase → Vercel (${environment})...`, 'cyan');

  const supabase = await getSupabaseClient();
  const vercelToken = process.env.VERCEL_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID;

  if (!vercelToken || !vercelProjectId) {
    throw new Error('Missing Vercel credentials (VERCEL_TOKEN, VERCEL_PROJECT_ID)');
  }

  const supabaseSecrets = await getSupabaseSecrets(supabase, environment);
  const vercelEnvVars = await getVercelEnvVars(vercelProjectId, vercelToken);

  const vercelKeys = new Set(vercelEnvVars.map(v => v.key));

  const results = {
    created: [],
    updated: [],
    skipped: [],
    errors: [],
  };

  for (const secret of supabaseSecrets) {
    try {
      const existsInVercel = vercelKeys.has(secret.key);
      const vercelVar = vercelEnvVars.find(v => v.key === secret.key);

      // Check if update is needed
      if (existsInVercel && vercelVar && vercelVar.value === secret.value) {
        results.skipped.push(secret.key);
        continue;
      }

      await setVercelEnvVar(
        vercelProjectId,
        vercelToken,
        secret.key,
        secret.value,
        environment
      );

      if (existsInVercel) {
        results.updated.push(secret.key);
        log(`  ✅ Updated ${secret.key}`, 'green');
      } else {
        results.created.push(secret.key);
        log(`  ✅ Created ${secret.key}`, 'green');
      }
    } catch (error) {
      results.errors.push({ key: secret.key, error: error.message });
      log(`  ❌ Error syncing ${secret.key}: ${error.message}`, 'red');
    }
  }

  return results;
}

/**
 * Sync Vercel -> Supabase
 */
async function syncVercelToSupabase(environment = 'production') {
  log(`\n🔄 Syncing Vercel → Supabase (${environment})...`, 'cyan');

  const supabase = await getSupabaseClient();
  const vercelToken = process.env.VERCEL_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID;

  if (!vercelToken || !vercelProjectId) {
    throw new Error('Missing Vercel credentials');
  }

  const vercelEnvVars = await getVercelEnvVars(vercelProjectId, vercelToken);
  const supabaseSecrets = await getSupabaseSecrets(supabase, environment);

  const supabaseKeys = new Set(supabaseSecrets.map(s => s.key));

  const results = {
    created: [],
    updated: [],
    skipped: [],
    errors: [],
  };

  for (const envVar of vercelEnvVars) {
    try {
      // Only sync secrets (not plain env vars that start with NEXT_PUBLIC_)
      const isSecret = !envVar.key.startsWith('NEXT_PUBLIC_');
      if (!isSecret) {
        results.skipped.push(envVar.key);
        continue;
      }

      const existsInSupabase = supabaseKeys.has(envVar.key);
      const supabaseSecret = supabaseSecrets.find(s => s.key === envVar.key);

      // Check if update is needed
      if (existsInSupabase && supabaseSecret && supabaseSecret.value === envVar.value) {
        results.skipped.push(envVar.key);
        continue;
      }

      const nextRotation = new Date();
      nextRotation.setDate(nextRotation.getDate() + 30);

      const { error } = await supabase
        .from('secrets_vault')
        .upsert({
          key: envVar.key,
          value: envVar.value,
          environment,
          encrypted: true,
          last_rotated: new Date().toISOString(),
          next_rotation: nextRotation.toISOString(),
        }, {
          onConflict: 'key,environment',
        });

      if (error) {
        throw error;
      }

      if (existsInSupabase) {
        results.updated.push(envVar.key);
        log(`  ✅ Updated ${envVar.key}`, 'green');
      } else {
        results.created.push(envVar.key);
        log(`  ✅ Created ${envVar.key}`, 'green');
      }
    } catch (error) {
      results.errors.push({ key: envVar.key, error: error.message });
      log(`  ❌ Error syncing ${envVar.key}: ${error.message}`, 'red');
    }
  }

  return results;
}

/**
 * Bidirectional sync
 */
async function syncBidirectional(environment = 'production') {
  log('\n🔄 Bidirectional Sync...', 'cyan');

  const supabaseResults = await syncSupabaseToVercel(environment);
  const vercelResults = await syncVercelToSupabase(environment);

  return {
    supabaseToVercel: supabaseResults,
    vercelToSupabase: vercelResults,
  };
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const direction = args[0] || 'bidirectional'; // 'supabase-to-vercel', 'vercel-to-supabase', 'bidirectional'
  const environment = args[1] || 'production';

  log('🔄 Secrets Sync: Supabase ↔ Vercel', 'cyan');
  log('===================================\n', 'cyan');

  try {
    let results;

    switch (direction) {
      case 'supabase-to-vercel':
        results = await syncSupabaseToVercel(environment);
        break;
      case 'vercel-to-supabase':
        results = await syncVercelToSupabase(environment);
        break;
      case 'bidirectional':
      default:
        results = await syncBidirectional(environment);
        break;
    }

    // Print summary
    log('\n📊 Sync Summary', 'cyan');
    log('===============', 'cyan');

    if (direction === 'bidirectional') {
      log(`Supabase → Vercel:`, 'cyan');
      log(`  Created: ${results.supabaseToVercel.created.length}`, 'green');
      log(`  Updated: ${results.supabaseToVercel.updated.length}`, 'green');
      log(`  Skipped: ${results.supabaseToVercel.skipped.length}`, 'yellow');
      log(`  Errors: ${results.supabaseToVercel.errors.length}`, 
        results.supabaseToVercel.errors.length > 0 ? 'red' : 'green');

      log(`\nVercel → Supabase:`, 'cyan');
      log(`  Created: ${results.vercelToSupabase.created.length}`, 'green');
      log(`  Updated: ${results.vercelToSupabase.updated.length}`, 'green');
      log(`  Skipped: ${results.vercelToSupabase.skipped.length}`, 'yellow');
      log(`  Errors: ${results.vercelToSupabase.errors.length}`,
        results.vercelToSupabase.errors.length > 0 ? 'red' : 'green');
    } else {
      log(`  Created: ${results.created.length}`, 'green');
      log(`  Updated: ${results.updated.length}`, 'green');
      log(`  Skipped: ${results.skipped.length}`, 'yellow');
      log(`  Errors: ${results.errors.length}`,
        results.errors.length > 0 ? 'red' : 'green');
    }

    const hasErrors = direction === 'bidirectional'
      ? results.supabaseToVercel.errors.length > 0 || results.vercelToSupabase.errors.length > 0
      : results.errors.length > 0;

    if (hasErrors) {
      log('\n⚠️  Some sync operations failed', 'yellow');
      process.exit(1);
    } else {
      log('\n✅ Sync completed successfully!', 'green');
    }
  } catch (error) {
    log(`\n❌ Sync failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();
