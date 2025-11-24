#!/usr/bin/env tsx
/**
 * Deploy Doctor - Diagnostic tool for deployment configuration
 * 
 * Checks for common misconfigurations that prevent reliable deployments:
 * - Missing required GitHub Secrets
 * - Mismatched Node/package manager versions
 * - Missing build scripts
 * - Vercel configuration issues
 * - Environment variable templates
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  fix?: string;
}

const results: CheckResult[] = [];

function addResult(result: CheckResult) {
  results.push(result);
}

function checkFileExists(filePath: string, name: string): boolean {
  const exists = existsSync(filePath);
  if (!exists) {
    addResult({
      name,
      status: 'fail',
      message: `File not found: ${filePath}`,
      fix: `Create ${filePath} or verify path is correct`
    });
  }
  return exists;
}

function checkPackageJson() {
  console.log('📦 Checking package.json...');
  
  const packageJsonPath = join(process.cwd(), 'package.json');
  if (!checkFileExists(packageJsonPath, 'package.json')) {
    return;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    // Check Node version
    const nodeVersion = packageJson.engines?.node;
    if (nodeVersion) {
      const matches = nodeVersion.match(/>=(\d+)/);
      if (matches && parseInt(matches[1]) !== 20) {
        addResult({
          name: 'Node version',
          status: 'warning',
          message: `Node version requirement is ${nodeVersion}, but CI uses Node 20`,
          fix: 'Update engines.node to ">=18.0.0 <21.0.0" or ensure CI matches'
        });
      } else {
        addResult({
          name: 'Node version',
          status: 'pass',
          message: `Node version requirement: ${nodeVersion}`
        });
      }
    } else {
      addResult({
        name: 'Node version',
        status: 'warning',
        message: 'No Node version specified in engines',
        fix: 'Add "engines": { "node": ">=18.0.0 <21.0.0" } to package.json'
      });
    }

    // Check package manager
    const packageManager = packageJson.packageManager;
    if (packageManager) {
      if (packageManager.startsWith('pnpm@')) {
        addResult({
          name: 'Package manager',
          status: 'pass',
          message: `Package manager: ${packageManager}`
        });
      } else {
        addResult({
          name: 'Package manager',
          status: 'warning',
          message: `Package manager is ${packageManager}, but CI uses pnpm@9`,
          fix: 'Update packageManager to "pnpm@9.0.0" or update CI to match'
        });
      }
    } else {
      addResult({
        name: 'Package manager',
        status: 'warning',
        message: 'No packageManager specified',
        fix: 'Add "packageManager": "pnpm@9.0.0" to package.json'
      });
    }

    // Check build scripts
    const scripts = packageJson.scripts || {};
    const requiredScripts = ['build', 'build:web'];
    for (const script of requiredScripts) {
      if (scripts[script]) {
        addResult({
          name: `Script: ${script}`,
          status: 'pass',
          message: `Script "${script}" exists`
        });
      } else {
        addResult({
          name: `Script: ${script}`,
          status: 'fail',
          message: `Script "${script}" is missing`,
          fix: `Add "${script}": "..." to package.json scripts`
        });
      }
    }

    // Check lockfile
    const lockfiles = ['pnpm-lock.yaml', 'package-lock.json', 'yarn.lock'];
    const foundLockfiles = lockfiles.filter(file => existsSync(join(process.cwd(), file)));
    
    if (foundLockfiles.length === 0) {
      addResult({
        name: 'Lockfile',
        status: 'fail',
        message: 'No lockfile found',
        fix: 'Run "pnpm install" to generate pnpm-lock.yaml'
      });
    } else if (foundLockfiles.length > 1) {
      addResult({
        name: 'Lockfile',
        status: 'warning',
        message: `Multiple lockfiles found: ${foundLockfiles.join(', ')}`,
        fix: 'Remove all lockfiles except pnpm-lock.yaml'
      });
    } else {
      addResult({
        name: 'Lockfile',
        status: 'pass',
        message: `Lockfile found: ${foundLockfiles[0]}`
      });
    }

  } catch (error) {
    addResult({
      name: 'package.json parsing',
      status: 'fail',
      message: `Failed to parse package.json: ${error}`,
      fix: 'Fix JSON syntax errors in package.json'
    });
  }
}

function checkWorkflowFiles() {
  console.log('🔧 Checking GitHub Actions workflows...');
  
  const workflowsDir = join(process.cwd(), '.github', 'workflows');
  const frontendDeployPath = join(workflowsDir, 'frontend-deploy.yml');
  
  if (checkFileExists(frontendDeployPath, 'frontend-deploy.yml workflow')) {
    addResult({
      name: 'Frontend deploy workflow',
      status: 'pass',
      message: 'frontend-deploy.yml exists'
    });
  }

  // Check for deprecated workflow
  const deployPath = join(workflowsDir, 'deploy.yml');
  if (existsSync(deployPath)) {
    const content = readFileSync(deployPath, 'utf-8');
    if (content.includes('DEPRECATED')) {
      addResult({
        name: 'Deprecated workflow',
        status: 'warning',
        message: 'deploy.yml is marked as deprecated',
        fix: 'Remove deploy.yml if no longer needed (scheduled for removal 2025-02-28)'
      });
    }
  }
}

function checkVercelConfig() {
  console.log('🚀 Checking Vercel configuration...');
  
  const vercelJsonPath = join(process.cwd(), 'vercel.json');
  if (checkFileExists(vercelJsonPath, 'vercel.json')) {
    addResult({
      name: 'vercel.json',
      status: 'pass',
      message: 'vercel.json exists'
    });
  }

  // Check for .vercel directory (may not exist in repo, that's OK)
  const vercelDir = join(process.cwd(), 'apps', 'web', '.vercel');
  if (existsSync(vercelDir)) {
    addResult({
      name: '.vercel directory',
      status: 'pass',
      message: '.vercel directory exists (project is linked)'
    });
  } else {
    addResult({
      name: '.vercel directory',
      status: 'warning',
      message: '.vercel directory not found (workflow will link automatically)',
      fix: 'Workflow includes automatic project linking, but verify VERCEL_PROJECT_ID is correct'
    });
  }
}

function checkEnvFiles() {
  console.log('🔐 Checking environment variable templates...');
  
  const envExamplePath = join(process.cwd(), '.env.example');
  if (checkFileExists(envExamplePath, '.env.example')) {
    addResult({
      name: '.env.example',
      status: 'pass',
      message: '.env.example exists'
    });
  }

  // Check for required variables in .env.example
  if (existsSync(envExamplePath)) {
    const content = readFileSync(envExamplePath, 'utf-8');
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'VERCEL_TOKEN',
      'VERCEL_ORG_ID',
      'VERCEL_PROJECT_ID'
    ];

    for (const varName of requiredVars) {
      if (content.includes(varName)) {
        addResult({
          name: `Env var: ${varName}`,
          status: 'pass',
          message: `${varName} documented in .env.example`
        });
      } else {
        addResult({
          name: `Env var: ${varName}`,
          status: 'warning',
          message: `${varName} not found in .env.example`,
          fix: `Add ${varName} to .env.example for documentation`
        });
      }
    }
  }
}

function checkGitHubSecrets() {
  console.log('🔑 Checking GitHub Secrets (simulated)...');
  
  // We can't actually check GitHub Secrets from here, but we can document what's needed
  const requiredSecrets = [
    'VERCEL_TOKEN',
    'VERCEL_ORG_ID',
    'VERCEL_PROJECT_ID',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  addResult({
    name: 'GitHub Secrets check',
    status: 'warning',
    message: 'Cannot verify GitHub Secrets from local environment',
    fix: `Verify these secrets are set in GitHub → Settings → Secrets and variables → Actions: ${requiredSecrets.join(', ')}`
  });
}

function checkMonorepoStructure() {
  console.log('📁 Checking monorepo structure...');
  
  const appsWebPath = join(process.cwd(), 'apps', 'web');
  if (existsSync(appsWebPath)) {
    addResult({
      name: 'Monorepo structure',
      status: 'pass',
      message: 'apps/web directory exists'
    });

    // Check apps/web/package.json
    const webPackageJsonPath = join(appsWebPath, 'package.json');
    if (existsSync(webPackageJsonPath)) {
      addResult({
        name: 'apps/web/package.json',
        status: 'pass',
        message: 'apps/web/package.json exists'
      });
    } else {
      addResult({
        name: 'apps/web/package.json',
        status: 'fail',
        message: 'apps/web/package.json not found',
        fix: 'Create package.json in apps/web directory'
      });
    }
  } else {
    addResult({
      name: 'Monorepo structure',
      status: 'fail',
      message: 'apps/web directory not found',
      fix: 'Verify monorepo structure - frontend app should be in apps/web'
    });
  }
}

function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 DEPLOY DOCTOR RESULTS');
  console.log('='.repeat(60) + '\n');

  const passes = results.filter(r => r.status === 'pass').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const failures = results.filter(r => r.status === 'fail').length;

  console.log(`✅ Pass: ${passes}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Failures: ${failures}`);
  console.log('');

  // Group by status
  const failuresList = results.filter(r => r.status === 'fail');
  const warningsList = results.filter(r => r.status === 'warning');
  const passesList = results.filter(r => r.status === 'pass');

  if (failuresList.length > 0) {
    console.log('❌ FAILURES (Must Fix):');
    console.log('-'.repeat(60));
    failuresList.forEach(r => {
      console.log(`\n${r.name}:`);
      console.log(`  ${r.message}`);
      if (r.fix) {
        console.log(`  Fix: ${r.fix}`);
      }
    });
    console.log('');
  }

  if (warningsList.length > 0) {
    console.log('⚠️  WARNINGS (Should Fix):');
    console.log('-'.repeat(60));
    warningsList.forEach(r => {
      console.log(`\n${r.name}:`);
      console.log(`  ${r.message}`);
      if (r.fix) {
        console.log(`  Fix: ${r.fix}`);
      }
    });
    console.log('');
  }

  if (passesList.length > 0 && failuresList.length === 0 && warningsList.length === 0) {
    console.log('✅ All checks passed!');
    console.log('');
  }

  // Summary
  console.log('='.repeat(60));
  if (failuresList.length === 0 && warningsList.length === 0) {
    console.log('✅ All checks passed! Deployment should work correctly.');
  } else if (failuresList.length === 0) {
    console.log('⚠️  Some warnings found, but no critical failures.');
    console.log('   Deployment should work, but review warnings above.');
  } else {
    console.log('❌ Critical failures found! Fix these before deploying.');
    console.log('   See fixes above for each failure.');
  }
  console.log('='.repeat(60));
  console.log('');

  // Exit code
  process.exit(failuresList.length > 0 ? 1 : 0);
}

// Main execution
function main() {
  console.log('🏥 Deploy Doctor - Diagnosing deployment configuration...\n');

  checkPackageJson();
  checkWorkflowFiles();
  checkVercelConfig();
  checkEnvFiles();
  checkGitHubSecrets();
  checkMonorepoStructure();

  printResults();
}

if (require.main === module) {
  main();
}

export { main as deployDoctor };
