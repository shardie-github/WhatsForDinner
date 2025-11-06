#!/usr/bin/env node
/**
 * Verify Secrets Across Platforms
 * 
 * This script connects to Vercel, GitHub, and Supabase APIs to verify
 * that critical secrets are properly configured in each platform.
 * 
 * Usage:
 *   node scripts/verify-secrets-platforms.mjs
 * 
 * Required environment variables:
 *   - VERCEL_TOKEN (for Vercel API access)
 *   - VERCEL_PROJECT_ID (for Vercel project identification)
 *   - GITHUB_TOKEN (for GitHub API access)
 *   - GITHUB_REPO (format: owner/repo, e.g., "your-org/your-repo")
 *   - NEXT_PUBLIC_SUPABASE_URL (for Supabase client)
 *   - SUPABASE_SERVICE_ROLE_KEY (for Supabase API access)
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Critical secrets configuration
const CRITICAL_SECRETS = {
  'NEXT_PUBLIC_SUPABASE_URL': {
    description: 'Supabase project URL',
    requiredIn: { vercel: true, github: true, supabase: false },
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    description: 'Supabase anonymous key',
    requiredIn: { vercel: true, github: true, supabase: false },
  },
  'SUPABASE_SERVICE_ROLE_KEY': {
    description: 'Supabase service role key',
    requiredIn: { vercel: true, github: true, supabase: false },
  },
  'SUPABASE_JWT_SECRET': {
    description: 'JWT secret for token verification',
    requiredIn: { vercel: true, github: false, supabase: false },
  },
  'SUPABASE_DB_URL': {
    description: 'PostgreSQL connection string',
    requiredIn: { vercel: true, github: false, supabase: false },
    optional: true,
  },
  'DATABASE_URL': {
    description: 'PostgreSQL connection string (alias)',
    requiredIn: { vercel: true, github: false, supabase: false },
    optional: true,
  },
  'VERCEL_TOKEN': {
    description: 'Vercel API token',
    requiredIn: { vercel: false, github: true, supabase: false },
  },
  'VERCEL_ORG_ID': {
    description: 'Vercel organization ID',
    requiredIn: { vercel: false, github: true, supabase: false },
  },
  'VERCEL_PROJECT_ID': {
    description: 'Vercel project ID',
    requiredIn: { vercel: false, github: true, supabase: false },
  },
  'SUPABASE_ACCESS_TOKEN': {
    description: 'Supabase access token for CLI',
    requiredIn: { vercel: false, github: true, supabase: false },
  },
  'SUPABASE_PROJECT_REF': {
    description: 'Supabase project reference ID',
    requiredIn: { vercel: false, github: true, supabase: false },
  },
};

/**
 * Fetch Vercel environment variables
 */
async function fetchVercelEnvVars(token, projectId) {
  try {
    const response = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.envs || [];
  } catch (error) {
    log(`❌ Failed to fetch Vercel env vars: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Fetch GitHub secrets
 */
async function fetchGitHubSecrets(token, repo) {
  try {
    const [owner, repoName] = repo.split('/');
    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/actions/secrets`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.secrets || [];
  } catch (error) {
    log(`❌ Failed to fetch GitHub secrets: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Fetch Supabase secrets (from secrets_vault table)
 */
async function fetchSupabaseSecrets(supabaseUrl, serviceRoleKey) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase
      .from('secrets_vault')
      .select('key, environment')
      .eq('environment', 'production');

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    log(`❌ Failed to fetch Supabase secrets: ${error.message}`, 'red');
    log(`   Note: Supabase secrets_vault table may not exist or you may not have access`, 'yellow');
    return null;
  }
}

/**
 * Check if secret exists in platform
 */
function checkSecretExists(secretName, platformSecrets) {
  if (!platformSecrets) return null; // Platform check failed
  return platformSecrets.some(secret => secret.name === secretName || secret.key === secretName);
}

/**
 * Main verification function
 */
async function verifyPlatforms() {
  log('\n🔐 Verifying Secrets Across Platforms', 'cyan');
  log('='.repeat(70), 'cyan');

  // Check required environment variables for API access
  const vercelToken = process.env.VERCEL_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_ID;
  const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const githubRepo = process.env.GITHUB_REPO || process.env.GITHUB_REPOSITORY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Warn about missing credentials
  const missingCreds = [];
  if (!vercelToken) missingCreds.push('VERCEL_TOKEN');
  if (!vercelProjectId) missingCreds.push('VERCEL_PROJECT_ID');
  if (!githubToken) missingCreds.push('GITHUB_TOKEN');
  if (!githubRepo) missingCreds.push('GITHUB_REPO');
  if (!supabaseUrl) missingCreds.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseKey) missingCreds.push('SUPABASE_SERVICE_ROLE_KEY');

  if (missingCreds.length > 0) {
    log('\n⚠️  Missing credentials for API access:', 'yellow');
    log(`   Required: ${missingCreds.join(', ')}`, 'yellow');
    log('\n   The script will check what it can, but full verification requires:', 'yellow');
    log('   • VERCEL_TOKEN + VERCEL_PROJECT_ID (for Vercel)', 'yellow');
    log('   • GITHUB_TOKEN + GITHUB_REPO (for GitHub)', 'yellow');
    log('   • NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (for Supabase)', 'yellow');
    log('\n   Continuing with available platforms...\n', 'yellow');
  }

  // Fetch secrets from each platform
  log('\n📡 Fetching secrets from platforms...', 'cyan');

  let vercelSecrets = null;
  if (vercelToken && vercelProjectId) {
    log('   Fetching from Vercel...', 'blue');
    vercelSecrets = await fetchVercelEnvVars(vercelToken, vercelProjectId);
    if (vercelSecrets) {
      log(`   ✅ Found ${vercelSecrets.length} Vercel environment variables`, 'green');
    }
  } else {
    log('   ⏭ Skipping Vercel (missing credentials)', 'yellow');
  }

  let githubSecrets = null;
  if (githubToken && githubRepo) {
    log('   Fetching from GitHub...', 'blue');
    githubSecrets = await fetchGitHubSecrets(githubToken, githubRepo);
    if (githubSecrets) {
      log(`   ✅ Found ${githubSecrets.length} GitHub secrets`, 'green');
    }
  } else {
    log('   ⏭ Skipping GitHub (missing credentials)', 'yellow');
  }

  let supabaseSecrets = null;
  if (supabaseUrl && supabaseKey) {
    log('   Fetching from Supabase...', 'blue');
    supabaseSecrets = await fetchSupabaseSecrets(supabaseUrl, supabaseKey);
    if (supabaseSecrets) {
      log(`   ✅ Found ${supabaseSecrets.length} Supabase secrets`, 'green');
    }
  } else {
    log('   ⏭ Skipping Supabase (missing credentials)', 'yellow');
  }

  // Verify each critical secret
  log('\n\n🔍 Verification Results', 'cyan');
  log('='.repeat(70), 'cyan');

  const results = {
    allCorrect: [],
    missing: [],
    incorrectlyPlaced: [],
  };

  for (const [secretName, config] of Object.entries(CRITICAL_SECRETS)) {
    const vercelExists = checkSecretExists(secretName, vercelSecrets);
    const githubExists = checkSecretExists(secretName, githubSecrets);
    const supabaseExists = checkSecretExists(secretName, supabaseSecrets);

    const status = {
      name: secretName,
      config,
      vercel: vercelExists,
      github: githubExists,
      supabase: supabaseExists,
    };

    // Check if correctly placed
    const correctVercel = config.requiredIn.vercel ? vercelExists === true : vercelExists !== true;
    const correctGitHub = config.requiredIn.github ? githubExists === true : githubExists !== true;
    const correctSupabase = config.requiredIn.supabase ? supabaseExists === true : supabaseExists !== true;

    if (correctVercel && correctGitHub && correctSupabase && (vercelExists !== null || githubExists !== null || supabaseExists !== null)) {
      results.allCorrect.push(status);
    } else {
      // Check what's wrong
      if (config.requiredIn.vercel && vercelExists !== true) {
        results.missing.push({ ...status, platform: 'Vercel', issue: 'missing' });
      } else if (!config.requiredIn.vercel && vercelExists === true) {
        results.incorrectlyPlaced.push({ ...status, platform: 'Vercel', issue: 'should not be here' });
      }

      if (config.requiredIn.github && githubExists !== true) {
        results.missing.push({ ...status, platform: 'GitHub', issue: 'missing' });
      } else if (!config.requiredIn.github && githubExists === true) {
        results.incorrectlyPlaced.push({ ...status, platform: 'GitHub', issue: 'should not be here' });
      }

      if (config.requiredIn.supabase && supabaseExists !== true) {
        results.missing.push({ ...status, platform: 'Supabase', issue: 'missing' });
      } else if (!config.requiredIn.supabase && supabaseExists === true) {
        results.incorrectlyPlaced.push({ ...status, platform: 'Supabase', issue: 'should not be here' });
      }
    }
  }

  // Print results
  if (results.allCorrect.length > 0) {
    log('\n✅ CORRECTLY CONFIGURED', 'green');
    log('='.repeat(70), 'green');
    for (const status of results.allCorrect) {
      log(`\n✅ ${status.name}`, 'green');
      log(`   ${status.config.description}`);
      log(`   ✓ Vercel: ${status.vercel === true ? 'Configured' : status.vercel === null ? 'Not checked' : 'Not needed'}`, 
        status.vercel === true ? 'green' : 'yellow');
      log(`   ✓ GitHub: ${status.github === true ? 'Configured' : status.github === null ? 'Not checked' : 'Not needed'}`, 
        status.github === true ? 'green' : 'yellow');
      log(`   ✓ Supabase: ${status.supabase === true ? 'Configured' : status.supabase === null ? 'Not checked' : 'Not needed'}`, 
        status.supabase === true ? 'green' : 'yellow');
    }
  }

  if (results.missing.length > 0) {
    log('\n\n❌ MISSING SECRETS', 'red');
    log('='.repeat(70), 'red');
    for (const status of results.missing) {
      log(`\n❌ ${status.name}`, 'red');
      log(`   ${status.config.description}`);
      log(`   Missing from: ${status.platform}`, 'red');
      log(`   Required in:`, 'yellow');
      if (status.config.requiredIn.vercel) log(`     • Vercel Environment Variables`, 'cyan');
      if (status.config.requiredIn.github) log(`     • GitHub Secrets`, 'cyan');
      if (status.config.requiredIn.supabase) log(`     • Supabase Secrets`, 'cyan');
    }
  }

  if (results.incorrectlyPlaced.length > 0) {
    log('\n\n⚠️  INCORRECTLY PLACED SECRETS', 'yellow');
    log('='.repeat(70), 'yellow');
    for (const status of results.incorrectlyPlaced) {
      log(`\n⚠️  ${status.name}`, 'yellow');
      log(`   Found in: ${status.platform} (but should not be there)`, 'yellow');
      log(`   Should be in:`, 'cyan');
      if (status.config.requiredIn.vercel) log(`     • Vercel`, 'cyan');
      if (status.config.requiredIn.github) log(`     • GitHub`, 'cyan');
      if (status.config.requiredIn.supabase) log(`     • Supabase`, 'cyan');
    }
  }

  // Summary
  log('\n\n📊 SUMMARY', 'cyan');
  log('='.repeat(70), 'cyan');
  log(`Total critical secrets: ${Object.keys(CRITICAL_SECRETS).length}`);
  log(`Correctly configured: ${results.allCorrect.length}`, 'green');
  log(`Missing: ${results.missing.length}`, results.missing.length > 0 ? 'red' : 'green');
  log(`Incorrectly placed: ${results.incorrectlyPlaced.length}`, 
    results.incorrectlyPlaced.length > 0 ? 'yellow' : 'green');

  // Platform summary
  if (vercelSecrets) {
    log(`\nVercel: ${vercelSecrets.length} environment variables found`, 'cyan');
  }
  if (githubSecrets) {
    log(`GitHub: ${githubSecrets.length} secrets found`, 'cyan');
  }
  if (supabaseSecrets) {
    log(`Supabase: ${supabaseSecrets.length} secrets found`, 'cyan');
  }

  // Exit code
  if (results.missing.length > 0 || results.incorrectlyPlaced.length > 0) {
    log('\n⚠️  Action required: Fix missing or incorrectly placed secrets', 'yellow');
    process.exit(1);
  } else {
    log('\n✅ All secrets are properly configured!', 'green');
    process.exit(0);
  }
}

// Run verification
verifyPlatforms().catch((error) => {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
