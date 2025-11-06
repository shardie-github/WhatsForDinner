#!/usr/bin/env node
/**
 * Verify Critical Secrets Sharing Across Platforms
 * 
 * Checks that critical secrets are properly shared between:
 * - GitHub Secrets (for CI/CD)
 * - Vercel Environment Variables (for runtime)
 * - Supabase Secrets (for database/edge functions)
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

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

// Critical secrets that should be shared across platforms
const CRITICAL_SECRETS = {
  // Supabase Core - Must be in Vercel + GitHub
  'NEXT_PUBLIC_SUPABASE_URL': {
    description: 'Supabase project URL',
    requiredIn: {
      vercel: true,
      github: true,  // For CI/CD tests
      supabase: false, // Not needed in Supabase secrets
    },
    notes: 'Required for runtime and CI/CD tests',
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    description: 'Supabase anonymous key (client-safe)',
    requiredIn: {
      vercel: true,
      github: true,  // For CI/CD tests
      supabase: false,
    },
    notes: 'Required for runtime and CI/CD tests',
  },
  'SUPABASE_SERVICE_ROLE_KEY': {
    description: 'Supabase service role key (server-side only)',
    requiredIn: {
      vercel: true,
      github: true,  // For CI/CD database operations
      supabase: false, // Not stored in Supabase secrets
    },
    notes: 'Critical for server-side operations and CI/CD',
  },
  'SUPABASE_JWT_SECRET': {
    description: 'JWT secret for token verification',
    requiredIn: {
      vercel: true,  // Required for server-side JWT verification
      github: false, // Not needed in CI/CD
      supabase: false, // This IS the secret FROM Supabase, not stored IN Supabase
    },
    notes: 'Server-side only. Get FROM Supabase Dashboard, store IN Vercel.',
  },
  
  // Database
  'SUPABASE_DB_URL': {
    description: 'PostgreSQL connection string',
    requiredIn: {
      vercel: true,
      github: false, // Optional for CI/CD
      supabase: false, // Optional
    },
    notes: 'Optional but recommended for direct database access',
  },
  'DATABASE_URL': {
    description: 'PostgreSQL connection string (alternative to SUPABASE_DB_URL)',
    requiredIn: {
      vercel: true,
      github: false,
      supabase: false,
    },
    notes: 'Alias for SUPABASE_DB_URL',
  },
  
  // Vercel Deployment (GitHub only)
  'VERCEL_TOKEN': {
    description: 'Vercel API token',
    requiredIn: {
      vercel: false,
      github: true,  // Required for CI/CD deployments
      supabase: false,
    },
    notes: 'GitHub Secrets only - for CI/CD',
  },
  'VERCEL_ORG_ID': {
    description: 'Vercel organization ID',
    requiredIn: {
      vercel: false,
      github: true,  // Required for CI/CD deployments
      supabase: false,
    },
    notes: 'GitHub Secrets only - for CI/CD',
  },
  'VERCEL_PROJECT_ID': {
    description: 'Vercel project ID',
    requiredIn: {
      vercel: false,
      github: true,  // Required for CI/CD deployments
      supabase: false,
    },
    notes: 'GitHub Secrets only - for CI/CD',
  },
  
  // Supabase CLI (GitHub only)
  'SUPABASE_ACCESS_TOKEN': {
    description: 'Supabase access token for CLI',
    requiredIn: {
      vercel: false,
      github: true,  // Required for CI/CD Supabase operations
      supabase: false,
    },
    notes: 'GitHub Secrets only - for CI/CD',
  },
  'SUPABASE_PROJECT_REF': {
    description: 'Supabase project reference ID',
    requiredIn: {
      vercel: false,
      github: true,  // Required for CI/CD Supabase operations
      supabase: false,
    },
    notes: 'GitHub Secrets only - for CI/CD',
  },
};

// Check if variable is used in GitHub workflows
function checkGitHubWorkflowUsage(varName) {
  try {
    // Escape special characters for grep
    const escapedName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = `secrets\\.${escapedName}|\\$\\{\\{ secrets\\.${escapedName}\\}\\}`;
    const result = execSync(
      `grep -rE "${pattern}" --include="*.yml" --include="*.yaml" .github/workflows/ 2>/dev/null | head -1`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

// Check if variable is used in code
function checkCodeUsage(varName) {
  try {
    // Escape special characters for grep
    const escapedName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = `process\\.env\\.${escapedName}|env\\.${escapedName}`;
    const result = execSync(
      `grep -rE "${pattern}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.mjs" . 2>/dev/null | grep -v node_modules | head -1`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

// Check if variable is in .env.example (indicates it should be configured)
function checkEnvExample(varName) {
  const envFiles = ['.env.example', '.env.ci.example'];
  for (const file of envFiles) {
    if (existsSync(file)) {
      const content = readFileSync(file, 'utf-8');
      if (content.includes(varName)) {
        return true;
      }
    }
  }
  return false;
}

// Check local environment (for development testing)
function checkLocalEnv(varName) {
  return !!process.env[varName];
}

// Verify sharing configuration
async function verifySharing() {
  log('\n🔐 Verifying Critical Secrets Sharing', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const results = {
    properlyShared: [],
    missingFromPlatform: [],
    incorrectlyPlaced: [],
    optional: [],
  };

  for (const [varName, config] of Object.entries(CRITICAL_SECRETS)) {
    const usedInCode = checkCodeUsage(varName);
    const usedInWorkflows = checkGitHubWorkflowUsage(varName);
    const inEnvExample = checkEnvExample(varName);
    const inLocalEnv = checkLocalEnv(varName);
    
    const status = {
      name: varName,
      config,
      usedInCode,
      usedInWorkflows,
      inEnvExample,
      inLocalEnv,
      platforms: {
        vercel: config.requiredIn.vercel,
        github: config.requiredIn.github,
        supabase: config.requiredIn.supabase,
      },
    };

    // Check if properly shared
    const isProperlyShared = 
      (!config.requiredIn.vercel || inLocalEnv) && // Assume local env represents Vercel
      (!config.requiredIn.github || usedInWorkflows) &&
      (!config.requiredIn.supabase || false); // We can't check Supabase secrets directly

    if (isProperlyShared && (usedInCode || usedInWorkflows)) {
      results.properlyShared.push(status);
    } else if (usedInCode || usedInWorkflows) {
      if (!config.requiredIn.vercel && config.requiredIn.github && !usedInWorkflows) {
        results.missingFromPlatform.push({ ...status, missing: 'github' });
      } else if (!config.requiredIn.github && config.requiredIn.vercel && !inLocalEnv) {
        results.missingFromPlatform.push({ ...status, missing: 'vercel' });
      } else {
        results.missingFromPlatform.push(status);
      }
    } else {
      results.optional.push(status);
    }
  }

  // Print results
  log('\n✅ PROPERLY SHARED SECRETS', 'green');
  log('='.repeat(60), 'green');
  
  if (results.properlyShared.length > 0) {
    for (const status of results.properlyShared) {
      const { name, config, platforms } = status;
      log(`\n✅ ${name}`, 'green');
      log(`   ${config.description}`);
      log(`   Required in:`);
      if (platforms.vercel) log(`     • Vercel Environment Variables`, 'cyan');
      if (platforms.github) log(`     • GitHub Secrets`, 'cyan');
      if (platforms.supabase) log(`     • Supabase Secrets`, 'cyan');
      if (config.notes) log(`   Note: ${config.notes}`, 'blue');
    }
  } else {
    log('\n   No properly shared secrets detected (check individual platforms)', 'yellow');
  }

  // Print missing secrets
  if (results.missingFromPlatform.length > 0) {
    log('\n\n⚠️  SECRETS MISSING FROM PLATFORMS', 'yellow');
    log('='.repeat(60), 'yellow');
    
    for (const status of results.missingFromPlatform) {
      const { name, config, platforms, missing } = status;
      log(`\n⚠️  ${name}`, 'yellow');
      log(`   ${config.description}`);
      
      if (missing === 'github' && platforms.github) {
        log(`   ❌ Missing from: GitHub Secrets`, 'red');
        log(`   ✅ Should be in: GitHub Secrets (for CI/CD)`, 'green');
      } else if (missing === 'vercel' && platforms.vercel) {
        log(`   ❌ Missing from: Vercel Environment Variables`, 'red');
        log(`   ✅ Should be in: Vercel Environment Variables`, 'green');
      }
      
      log(`   Required in:`);
      if (platforms.vercel) log(`     • Vercel Environment Variables`, 'cyan');
      if (platforms.github) log(`     • GitHub Secrets`, 'cyan');
      if (platforms.supabase) log(`     • Supabase Secrets`, 'cyan');
    }
  }

  // Print sharing matrix
  log('\n\n📊 SHARING MATRIX', 'cyan');
  log('='.repeat(60), 'cyan');
  log('\nThis table shows where each critical secret should be configured:\n');
  
  log('Variable'.padEnd(35) + 'Vercel  GitHub  Supabase', 'cyan');
  log('-'.repeat(60), 'cyan');
  
  for (const [varName, config] of Object.entries(CRITICAL_SECRETS)) {
    const displayName = varName.length > 33 ? varName.substring(0, 30) + '...' : varName;
    const vercel = config.requiredIn.vercel ? '✅' : '❌';
    const github = config.requiredIn.github ? '✅' : '❌';
    const supabase = config.requiredIn.supabase ? '✅' : '❌';
    
    log(`${displayName.padEnd(35)}${vercel.padEnd(8)}${github.padEnd(8)}${supabase}`, 
      config.requiredIn.vercel || config.requiredIn.github ? 'reset' : 'yellow');
  }

  // Print action items
  log('\n\n📋 ACTION ITEMS', 'magenta');
  log('='.repeat(60), 'magenta');
  
  const criticalVercel = Object.entries(CRITICAL_SECRETS)
    .filter(([_, config]) => config.requiredIn.vercel)
    .map(([name]) => name);
  
  const criticalGitHub = Object.entries(CRITICAL_SECRETS)
    .filter(([_, config]) => config.requiredIn.github)
    .map(([name]) => name);

  log('\n✅ Verify these are in VERCEL Environment Variables:', 'cyan');
  for (const name of criticalVercel) {
    log(`   • ${name}`, 'green');
  }

  log('\n✅ Verify these are in GITHUB Secrets:', 'cyan');
  for (const name of criticalGitHub) {
    log(`   • ${name}`, 'green');
  }

  // Special note about SUPABASE_JWT_SECRET
  log('\n\n🔑 IMPORTANT: SUPABASE_JWT_SECRET', 'yellow');
  log('='.repeat(60), 'yellow');
  log('\nThis secret is special:');
  log('  • ❌ NOT in Supabase Secrets (it\'s the secret FROM Supabase)', 'red');
  log('  • ✅ IN Vercel Environment Variables (server-side only)', 'green');
  log('  • ❌ NOT in GitHub Secrets (not needed for CI/CD)', 'red');
  log('\nHow to configure:');
  log('  1. Get JWT Secret from: Supabase Dashboard → Project Settings → API → JWT Secret');
  log('  2. Add to Vercel: Dashboard → Project → Settings → Environment Variables');
  log('  3. Name: SUPABASE_JWT_SECRET');
  log('  4. Type: Secret');
  log('  5. Environments: Production, Preview, Development');

  // Summary
  log('\n\n📊 SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`Total critical secrets: ${Object.keys(CRITICAL_SECRETS).length}`);
  log(`Properly shared: ${results.properlyShared.length}`, 'green');
  log(`Missing from platforms: ${results.missingFromPlatform.length}`, 
    results.missingFromPlatform.length > 0 ? 'yellow' : 'green');
  
  if (results.missingFromPlatform.length > 0) {
    log('\n⚠️  Action required: Add missing secrets to the indicated platforms', 'yellow');
  } else {
    log('\n✅ All critical secrets appear to be properly shared!', 'green');
    log('\n💡 Note: This script checks code usage and workflow references.', 'blue');
    log('   To fully verify, check each platform directly:', 'blue');
    log('   • Vercel: Dashboard → Project → Settings → Environment Variables', 'blue');
    log('   • GitHub: Repository → Settings → Secrets and variables → Actions', 'blue');
  }
}

// Main execution
async function main() {
  try {
    await verifySharing();
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();
