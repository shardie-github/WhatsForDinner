#!/usr/bin/env node
/**
 * Secrets Health Dashboard
 * 
 * Provides a comprehensive overview of all secrets across platforms
 * Combines multiple verification methods for a complete picture
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createTable(headers, rows) {
  const colWidths = headers.map((_, i) => {
    const maxLen = Math.max(
      headers[i].length,
      ...rows.map(row => String(row[i] || '').length)
    );
    return Math.min(maxLen, 40);
  });

  const separator = '─'.repeat(colWidths.reduce((a, b) => a + b + 3, 1));

  const headerRow = headers.map((h, i) => h.padEnd(colWidths[i])).join(' │ ');
  const header = `│ ${headerRow} │`;

  const dataRows = rows.map(row =>
    `│ ${row.map((cell, i) => String(cell || '').padEnd(colWidths[i])).join(' │ ')} │`
  );

  return [separator, header, separator, ...dataRows, separator].join('\n');
}

async function runScript(scriptPath) {
  try {
    const result = execSync(`node ${scriptPath} 2>&1`, { encoding: 'utf-8' });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, output: error.message };
  }
}

function checkLocalEnv(varName) {
  return !!process.env[varName];
}

function checkCodeUsage(varName) {
  try {
    const result = execSync(
      `grep -r "process.env.${varName}" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.mjs" . 2>/dev/null | grep -v node_modules | wc -l`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    return parseInt(result.trim()) > 0;
  } catch {
    return false;
  }
}

function checkWorkflowUsage(varName) {
  try {
    const result = execSync(
      `grep -r "secrets.${varName}" --include="*.yml" --include="*.yaml" .github/workflows/ 2>/dev/null | wc -l`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    return parseInt(result.trim()) > 0;
  } catch {
    return false;
  }
}

const CRITICAL_SECRETS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET',
  'SUPABASE_DB_URL',
  'DATABASE_URL',
  'VERCEL_TOKEN',
  'VERCEL_ORG_ID',
  'VERCEL_PROJECT_ID',
  'SUPABASE_ACCESS_TOKEN',
  'SUPABASE_PROJECT_REF',
];

async function generateDashboard() {
  log('\n╔════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║          🔐 SECRETS HEALTH DASHBOARD                          ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════╝', 'cyan');

  // Check what verification scripts are available
  const scripts = {
    envVars: existsSync('scripts/verify-env-vars.mjs'),
    sharing: existsSync('scripts/verify-secrets-sharing.mjs'),
    platforms: existsSync('scripts/verify-secrets-platforms.mjs'),
  };

  log('\n📊 SECRETS STATUS OVERVIEW', 'cyan');
  log('='.repeat(65), 'cyan');

  // Check local environment
  log('\n🔍 Local Environment Check', 'blue');
  const localStatus = CRITICAL_SECRETS.map(name => ({
    name,
    configured: checkLocalEnv(name),
    usedInCode: checkCodeUsage(name),
    usedInWorkflows: checkWorkflowUsage(name),
  }));

  const localTable = createTable(
    ['Secret', 'Local Env', 'Used in Code', 'Used in Workflows'],
    localStatus.map(s => [
      s.name.substring(0, 30),
      s.configured ? '✅' : '❌',
      s.usedInCode ? '✅' : '❌',
      s.usedInWorkflows ? '✅' : '❌',
    ])
  );
  log(localTable);

  // Summary
  const configured = localStatus.filter(s => s.configured).length;
  const missing = localStatus.filter(s => !s.configured).length;
  log(`\n✅ Configured: ${configured}/${CRITICAL_SECRETS.length}`, 'green');
  log(`❌ Missing: ${missing}/${CRITICAL_SECRETS.length}`, missing > 0 ? 'red' : 'green');

  // Platform verification status
  log('\n\n🌐 Platform Verification Status', 'cyan');
  log('='.repeat(65), 'cyan');

  const platformChecks = {
    vercel: {
      available: !!process.env.VERCEL_TOKEN && !!process.env.VERCEL_PROJECT_ID,
      status: '⚠️  Need credentials',
    },
    github: {
      available: !!process.env.GITHUB_TOKEN && !!process.env.GITHUB_REPO,
      status: '⚠️  Need credentials',
    },
    supabase: {
      available: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      status: '⚠️  Need credentials',
    },
  };

  if (platformChecks.vercel.available) platformChecks.vercel.status = '✅ Ready';
  if (platformChecks.github.available) platformChecks.github.status = '✅ Ready';
  if (platformChecks.supabase.available) platformChecks.supabase.status = '✅ Ready';

  log(`\nVercel API:    ${platformChecks.vercel.status}`, 
    platformChecks.vercel.available ? 'green' : 'yellow');
  log(`GitHub API:    ${platformChecks.github.status}`, 
    platformChecks.github.available ? 'green' : 'yellow');
  log(`Supabase API:  ${platformChecks.supabase.status}`, 
    platformChecks.supabase.available ? 'green' : 'yellow');

  // Critical secrets breakdown
  log('\n\n🔑 CRITICAL SECRETS BREAKDOWN', 'cyan');
  log('='.repeat(65), 'cyan');

  const criticalGroups = {
    'Supabase Core (Vercel + GitHub)': [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ],
    'Vercel Only': [
      'SUPABASE_JWT_SECRET',
      'SUPABASE_DB_URL',
      'DATABASE_URL',
    ],
    'GitHub Only (CI/CD)': [
      'VERCEL_TOKEN',
      'VERCEL_ORG_ID',
      'VERCEL_PROJECT_ID',
      'SUPABASE_ACCESS_TOKEN',
      'SUPABASE_PROJECT_REF',
    ],
  };

  for (const [group, secrets] of Object.entries(criticalGroups)) {
    log(`\n${group}:`, 'magenta');
    for (const secret of secrets) {
      const status = localStatus.find(s => s.name === secret);
      const icon = status?.configured ? '✅' : '❌';
      const color = status?.configured ? 'green' : 'red';
      log(`  ${icon} ${secret}`, color);
    }
  }

  // Verification scripts status
  log('\n\n🛠️  VERIFICATION SCRIPTS AVAILABLE', 'cyan');
  log('='.repeat(65), 'cyan');

  log('\n📝 Code Analysis Scripts:', 'blue');
  log(`  ${scripts.envVars ? '✅' : '❌'} verify-env-vars.mjs - Check env var requirements`, 
    scripts.envVars ? 'green' : 'red');
  log(`  ${scripts.sharing ? '✅' : '❌'} verify-secrets-sharing.mjs - Check sharing requirements`, 
    scripts.sharing ? 'green' : 'red');

  log('\n🌐 API Verification Scripts:', 'blue');
  log(`  ${scripts.platforms ? '✅' : '❌'} verify-secrets-platforms.mjs - Verify via APIs`, 
    scripts.platforms ? 'green' : 'red');
  
  if (scripts.platforms) {
    const canRun = platformChecks.vercel.available || platformChecks.github.available || platformChecks.supabase.available;
    log(`     Status: ${canRun ? '✅ Ready to run' : '⚠️  Need API credentials'}`, 
      canRun ? 'green' : 'yellow');
  }

  // Recommendations
  log('\n\n💡 RECOMMENDATIONS', 'cyan');
  log('='.repeat(65), 'cyan');

  const recommendations = [];

  if (missing > 0) {
    recommendations.push(`⚠️  Configure ${missing} missing secret(s)`);
  }

  if (!platformChecks.vercel.available) {
    recommendations.push('📝 Set VERCEL_TOKEN and VERCEL_PROJECT_ID for full verification');
  }

  if (!platformChecks.github.available) {
    recommendations.push('📝 Set GITHUB_TOKEN and GITHUB_REPO for full verification');
  }

  if (recommendations.length === 0) {
    log('\n✅ All systems operational! Secrets appear to be properly configured.', 'green');
  } else {
    for (const rec of recommendations) {
      log(`\n  ${rec}`, 'yellow');
    }
  }

  // Quick actions
  log('\n\n⚡ QUICK ACTIONS', 'cyan');
  log('='.repeat(65), 'cyan');
  log('\n  Run: node scripts/verify-env-vars.mjs', 'gray');
  log('    → Check environment variable requirements', 'gray');
  log('\n  Run: node scripts/verify-secrets-sharing.mjs', 'gray');
  log('    → Check secrets sharing across platforms', 'gray');
  log('\n  Run: node scripts/verify-secrets-platforms.mjs', 'gray');
  log('    → Verify secrets via APIs (requires credentials)', 'gray');

  log('\n\n' + '='.repeat(65), 'cyan');
  log('Dashboard generated successfully!', 'green');
  log('='.repeat(65) + '\n', 'cyan');
}

generateDashboard().catch((error) => {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
