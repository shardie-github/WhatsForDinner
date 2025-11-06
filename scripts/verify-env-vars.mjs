#!/usr/bin/env node
/**
 * Environment Variables Verification Script
 * 
 * Checks which environment variables are:
 * - Configured in Vercel
 * - Configured in GitHub Secrets
 * - Used in code
 * - Critical and missing
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
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Critical environment variables that MUST be configured
const CRITICAL_VARS = {
  // Supabase (Required for app to work)
  NEXT_PUBLIC_SUPABASE_URL: {
    description: 'Supabase project URL',
    required: true,
    platforms: { vercel: true, github: false, supabase: false },
    where: 'Vercel Environment Variables',
    getFrom: 'Supabase Dashboard → Project Settings → API',
  },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    description: 'Supabase anonymous key (client-safe)',
    required: true,
    platforms: { vercel: true, github: false, supabase: false },
    where: 'Vercel Environment Variables',
    getFrom: 'Supabase Dashboard → Project Settings → API',
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    description: 'Supabase service role key (server-side only)',
    required: true,
    platforms: { vercel: true, github: true, supabase: false },
    where: 'Vercel Environment Variables (and GitHub Secrets for CI/CD)',
    getFrom: 'Supabase Dashboard → Project Settings → API',
    warning: '⚠️  NEVER expose to client-side code',
  },
  SUPABASE_JWT_SECRET: {
    description: 'JWT secret for token verification (must match Supabase JWT secret)',
    required: true,
    platforms: { vercel: true, github: false, supabase: false },
    where: 'Vercel Environment Variables (server-side only)',
    getFrom: 'Supabase Dashboard → Project Settings → API → JWT Secret',
    note: 'This is used for server-side JWT verification. Get the value from Supabase Dashboard.',
  },
  
  // Database
  DATABASE_URL: {
    description: 'PostgreSQL connection string (or use SUPABASE_DB_URL)',
    required: false,
    platforms: { vercel: true, github: false, supabase: false },
    where: 'Vercel Environment Variables',
    getFrom: 'Supabase Dashboard → Project Settings → Database',
    alternative: 'SUPABASE_DB_URL',
  },
  SUPABASE_DB_URL: {
    description: 'PostgreSQL connection string',
    required: false,
    platforms: { vercel: true, github: false, supabase: false },
    where: 'Vercel Environment Variables',
    getFrom: 'Supabase Dashboard → Project Settings → Database',
  },
  
  // GitHub Secrets (for CI/CD)
  VERCEL_TOKEN: {
    description: 'Vercel API token for deployments',
    required: false,
    platforms: { vercel: false, github: true, supabase: false },
    where: 'GitHub Secrets (for CI/CD workflows)',
    getFrom: 'Vercel Dashboard → Settings → Tokens',
  },
  VERCEL_ORG_ID: {
    description: 'Vercel organization ID',
    required: false,
    platforms: { vercel: false, github: true, supabase: false },
    where: 'GitHub Secrets (for CI/CD workflows)',
    getFrom: 'Vercel Dashboard → Team Settings',
  },
  VERCEL_PROJECT_ID: {
    description: 'Vercel project ID',
    required: false,
    platforms: { vercel: false, github: true, supabase: false },
    where: 'GitHub Secrets (for CI/CD workflows)',
    getFrom: 'Vercel Dashboard → Project Settings',
  },
  SUPABASE_ACCESS_TOKEN: {
    description: 'Supabase access token for CLI',
    required: false,
    platforms: { vercel: false, github: true, supabase: false },
    where: 'GitHub Secrets (for CI/CD workflows)',
    getFrom: 'Supabase Dashboard → Account Settings → Access Tokens',
  },
  SUPABASE_PROJECT_REF: {
    description: 'Supabase project reference ID',
    required: false,
    platforms: { vercel: false, github: true, supabase: false },
    where: 'GitHub Secrets (for CI/CD workflows)',
    getFrom: 'Supabase Dashboard → Project Settings → General',
  },
};

// Check if variable is used in code
function checkCodeUsage(varName) {
  try {
    const result = execSync(
      `grep -r "process.env.${varName}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.mjs" . 2>/dev/null | head -1`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

// Check if variable exists in .env.example
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

// Check if variable is used in GitHub workflows
function checkWorkflowUsage(varName) {
  try {
    const result = execSync(
      `grep -r "secrets.${varName}" --include="*.yml" --include="*.yaml" .github/workflows/ 2>/dev/null | head -1`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

// Check current environment
function checkLocalEnv(varName) {
  return !!process.env[varName];
}

async function main() {
  log('\n🔍 Environment Variables Verification', 'cyan');
  log('=====================================\n', 'cyan');

  const results = {
    critical: [],
    missing: [],
    configured: [],
    optional: [],
  };

  // Check each critical variable
  for (const [varName, config] of Object.entries(CRITICAL_VARS)) {
    const usedInCode = checkCodeUsage(varName);
    const usedInWorkflows = checkWorkflowUsage(varName);
    const inEnvExample = checkEnvExample(varName);
    const inLocalEnv = checkLocalEnv(varName);

    const status = {
      name: varName,
      config,
      usedInCode,
      usedInWorkflows,
      inEnvExample,
      inLocalEnv,
      platforms: config.platforms,
    };

    if (config.required) {
      results.critical.push(status);
      if (!inLocalEnv) {
        results.missing.push(status);
      } else {
        results.configured.push(status);
      }
    } else {
      results.optional.push(status);
    }
  }

  // Print Critical Variables Status
  log('\n📋 CRITICAL VARIABLES STATUS', 'cyan');
  log('='.repeat(50), 'cyan');
  
  for (const status of results.critical) {
    const { name, config, inLocalEnv, usedInCode, usedInWorkflows } = status;
    const icon = inLocalEnv ? '✅' : '❌';
    const color = inLocalEnv ? 'green' : 'red';
    
    log(`\n${icon} ${name}`, color);
    log(`   Description: ${config.description}`);
    log(`   Where to configure: ${config.where}`);
    log(`   Get from: ${config.getFrom}`);
    if (config.warning) {
      log(`   ${config.warning}`, 'yellow');
    }
    if (config.note) {
      log(`   Note: ${config.note}`, 'blue');
    }
    if (!inLocalEnv) {
      log(`   ⚠️  MISSING - This is required for the app to work!`, 'red');
    }
    log(`   Used in code: ${usedInCode ? 'Yes' : 'No'}`);
    log(`   Used in workflows: ${usedInWorkflows ? 'Yes' : 'No'}`);
  }

  // Print Missing Critical Variables
  if (results.missing.length > 0) {
    log('\n\n⚠️  MISSING CRITICAL VARIABLES', 'red');
    log('='.repeat(50), 'red');
    
    for (const status of results.missing) {
      const { name, config } = status;
      log(`\n❌ ${name}`, 'red');
      log(`   ${config.description}`);
      log(`   Configure in: ${config.where}`);
      log(`   Get from: ${config.getFrom}`);
    }

    log('\n\n📝 HOW TO ADD MISSING VARIABLES', 'cyan');
    log('='.repeat(50), 'cyan');
    
    log('\nFor Vercel:');
    log('1. Go to Vercel Dashboard → Your Project');
    log('2. Navigate to Settings → Environment Variables');
    log('3. Click "Add New"');
    log('4. Enter variable name and value');
    log('5. Select environments (Production, Preview, Development)');
    log('6. Click "Save"');
    
    log('\nFor GitHub Secrets:');
    log('1. Go to GitHub Repository → Settings');
    log('2. Navigate to Secrets and variables → Actions');
    log('3. Click "New repository secret"');
    log('4. Enter name and value');
    log('5. Click "Add secret"');
  } else {
    log('\n\n✅ All critical variables are configured!', 'green');
  }

  // Print Optional Variables
  if (results.optional.length > 0) {
    log('\n\n📌 OPTIONAL VARIABLES', 'cyan');
    log('='.repeat(50), 'cyan');
    log('These are not required but may be needed for specific features:\n');
    
    for (const status of results.optional) {
      const { name, config, usedInCode, usedInWorkflows } = status;
      if (usedInCode || usedInWorkflows) {
        log(`  • ${name} - ${config.description}`, 'yellow');
      }
    }
  }

  // Special note about SUPABASE_JWT_SECRET
  log('\n\n🔑 ABOUT SUPABASE_JWT_SECRET', 'cyan');
  log('='.repeat(50), 'cyan');
  log('\nThis is a critical variable that MUST be configured in Vercel:');
  log('1. Get the JWT secret from: Supabase Dashboard → Project Settings → API');
  log('2. Copy the "JWT Secret" value');
  log('3. Add it to Vercel as: SUPABASE_JWT_SECRET');
  log('4. This is used server-side for JWT token verification');
  log('5. It should NOT be in Supabase secrets (it\'s the secret FROM Supabase)');
  log('6. It should NOT start with NEXT_PUBLIC_ (server-side only)');
  
  log('\n\n📊 SUMMARY', 'cyan');
  log('='.repeat(50), 'cyan');
  log(`Total critical variables: ${results.critical.length}`);
  log(`Configured: ${results.configured.length}`, 'green');
  log(`Missing: ${results.missing.length}`, results.missing.length > 0 ? 'red' : 'green');
  
  if (results.missing.length > 0) {
    log('\n⚠️  Action required: Add missing variables to proceed', 'red');
    process.exit(1);
  } else {
    log('\n✅ All critical variables are configured!', 'green');
  }
}

main().catch((error) => {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
