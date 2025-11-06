#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
import { secretsManager } from './secrets-manager-unified.mjs';
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const CHECKS = [
  {
    name: 'Bundle Size Check',
    command: 'pnpm bundle:check',
    critical: true
  },
  {
    name: 'Secrets Scan',
    command: 'pnpm secrets:scan',
    critical: true
  },
  {
    name: 'RLS Smoke Test',
    command: 'pnpm rls:test',
    critical: true,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: (await secretsManager.getSecret('NEXT_PUBLIC_SUPABASE_URL')) || process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: (await secretsManager.getSecret('NEXT_PUBLIC_SUPABASE_ANON_KEY')) || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: (await secretsManager.getSecret('SUPABASE_SERVICE_ROLE_KEY')) || process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  },
  {
    name: 'Database Performance',
    command: 'pnpm db:perf',
    critical: true,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: (await secretsManager.getSecret('NEXT_PUBLIC_SUPABASE_URL')) || process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: (await secretsManager.getSecret('SUPABASE_SERVICE_ROLE_KEY')) || process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  },
  {
    name: 'Health Check',
    command: 'pnpm health:check',
    critical: true,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: (await secretsManager.getSecret('NEXT_PUBLIC_SUPABASE_URL')) || process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: (await secretsManager.getSecret('SUPABASE_SERVICE_ROLE_KEY')) || process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  },
  {
    name: 'Smoke Tests',
    command: 'pnpm smoke:test',
    critical: false,
    env: {
      BASE_URL: (await secretsManager.getSecret('BASE_URL')) || process.env.BASE_URL || 'http://localhost:3000'
    }
  },
  {
    name: 'Cost Guard',
    command: 'pnpm cost:guard',
    critical: false,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: (await secretsManager.getSecret('NEXT_PUBLIC_SUPABASE_URL')) || process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: (await secretsManager.getSecret('SUPABASE_SERVICE_ROLE_KEY')) || process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  }
];

function runCheck(check) {
  console.log(`\n🔍 Running ${check.name}...`);
  
  try {
    // Set environment variables if provided
    const env = { ...process.env, ...check.env };
    
    // Run the command
    execSync(check.command, {
      stdio: 'inherit',
      env,
      cwd: projectRoot
    });
    
    console.log(`✅ ${check.name} passed`);
    return { success: true, error: null };
  } catch (error) {
    console.log(`❌ ${check.name} failed`);
    console.log(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function printSummary(results) {
  console.log('\n📊 Check Summary');
  console.log('================\n');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const critical = results.filter(r => !r.success && r.critical).length;
  
  results.forEach((result, index) => {
    const check = CHECKS[index];
    const status = result.success ? '✅' : '❌';
    const criticality = check.critical ? ' (CRITICAL)' : '';
    console.log(`${status} ${check.name}${criticality}`);
    
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\n📈 Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   🚨 Critical Failures: ${critical}`);
  console.log(`   📁 Total: ${results.length}`);
  
  if (critical > 0) {
    console.log('\n🚨 Critical checks failed! Deployment should be blocked.');
    return false;
  } else if (failed > 0) {
    console.log('\n⚠️  Some checks failed, but no critical issues.');
    return true;
  } else {
    console.log('\n✅ All checks passed! Ready for deployment.');
    return true;
  }
}

function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...');
  
  const issues = [];
  
  // Check if required environment variables are set
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      issues.push(`Missing environment variable: ${envVar}`);
    }
  });
  
  // Check if node_modules exists
  if (!existsSync(join(projectRoot, 'node_modules'))) {
    issues.push('node_modules not found. Run "pnpm install" first.');
  }
  
  if (issues.length > 0) {
    console.log('❌ Prerequisites not met:');
    issues.forEach(issue => console.log(`   • ${issue}`));
    return false;
  }
  
  console.log('✅ Prerequisites met');
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const skipPrerequisites = args.includes('--skip-prereq');
  
  console.log('🚀 Running All Checks');
  console.log('====================\n');
  
  if (!skipPrerequisites && !checkPrerequisites()) {
    console.log('\n❌ Prerequisites check failed. Exiting.');
    process.exit(1);
  }
  
  const results = [];
  
  for (const check of CHECKS) {
    const result = runCheck(check);
    results.push({ ...result, critical: check.critical });
  }
  
  const allPassed = printSummary(results);
  
  if (!allPassed) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error running checks:', error);
  process.exit(1);
});