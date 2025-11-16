/**
 * Doctor command - comprehensive health checks
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { secretsManager } from './secrets-manager-unified.mjs';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  fix?: () => void;
}

export async function runDoctor(options: { fix?: boolean; verbose?: boolean }) {
  
  const checks: CheckResult[] = [];
  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;

  // Check 1: Node version
  try {
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (major >= 18 && major < 21) {
      checks.push({ name: 'Node Version', status: 'pass', message: `Node ${nodeVersion} ✓` });
      passCount++;
    } else {
      checks.push({ name: 'Node Version', status: 'fail', message: `Node ${nodeVersion} (requires 18-20)` });
      failCount++;
    }
  } catch (error) {
    checks.push({ name: 'Node Version', status: 'fail', message: 'Failed to check Node version' });
    failCount++;
  }

  // Check 2: Dependencies installed
  try {
    if (fs.existsSync('node_modules') && fs.existsSync('pnpm-lock.yaml')) {
      checks.push({ name: 'Dependencies', status: 'pass', message: 'Dependencies installed ✓' });
      passCount++;
    } else {
      checks.push({
        name: 'Dependencies',
        status: 'fail',
        message: 'Dependencies not installed',
        fix: () => {
                    execSync('pnpm install', { stdio: 'inherit' });
        },
      });
      failCount++;
    }
  } catch (error) {
    checks.push({ name: 'Dependencies', status: 'warn', message: 'Could not verify dependencies' });
    warnCount++;
  }

  // Check 3: Environment variables
  try {
    const envExample = fs.existsSync('.env.example');
    const envLocal = fs.existsSync('.env.local');
    if (envExample) {
      checks.push({ name: 'Environment Setup', status: envLocal ? 'pass' : 'warn', message: envLocal ? '.env.local exists ✓' : '.env.local missing (copy from .env.example)' });
      if (envLocal) passCount++;
      else warnCount++;
    } else {
      checks.push({ name: 'Environment Setup', status: 'fail', message: '.env.example missing' });
      failCount++;
    }
  } catch (error) {
    checks.push({ name: 'Environment Setup', status: 'warn', message: 'Could not verify environment' });
    warnCount++;
  }

  // Check 4: TypeScript compilation
  try {
    execSync('pnpm type-check', { stdio: 'pipe', encoding: 'utf-8' });
    checks.push({ name: 'TypeScript', status: 'pass', message: 'TypeScript compilation passes ✓' });
    passCount++;
  } catch (error) {
    checks.push({ name: 'TypeScript', status: 'fail', message: 'TypeScript compilation errors' });
    failCount++;
  }

  // Check 5: Linting
  try {
    execSync('pnpm lint', { stdio: 'pipe', encoding: 'utf-8' });
    checks.push({ name: 'Linting', status: 'pass', message: 'Linting passes ✓' });
    passCount++;
  } catch (error) {
    checks.push({
      name: 'Linting',
      status: 'fail',
      message: 'Linting errors found',
      fix: () => {
                execSync('pnpm lintfix', { stdio: 'inherit' });
      },
    });
    failCount++;
  }

  // Check 6: Build
  try {
    execSync('pnpm build:packages', { stdio: 'pipe', encoding: 'utf-8' });
    checks.push({ name: 'Build', status: 'pass', message: 'Packages build successfully ✓' });
    passCount++;
  } catch (error) {
    checks.push({ name: 'Build', status: 'fail', message: 'Build errors found' });
    failCount++;
  }

  // Check 7: Tests
  try {
    execSync('pnpm test --run', { stdio: 'pipe', encoding: 'utf-8' });
    checks.push({ name: 'Tests', status: 'pass', message: 'Tests pass ✓' });
    passCount++;
  } catch (error) {
    checks.push({ name: 'Tests', status: 'fail', message: 'Some tests failing' });
    failCount++;
  }

  // Check 8: Secrets scan
  try {
    execSync('pnpm secrets:scan', { stdio: 'pipe', encoding: 'utf-8' });
    checks.push({ name: 'Secrets Scan', status: 'pass', message: 'No secrets found in code ✓' });
    passCount++;
  } catch (error) {
    checks.push({ name: 'Secrets Scan', status: 'fail', message: 'Potential secrets detected' });
    failCount++;
  }

  // Check 9: Supabase connection
  try {
    if ((await secretsManager.getSecret('NEXT_PUBLIC_SUPABASE_URL')) || process.env.NEXT_PUBLIC_SUPABASE_URL && (await secretsManager.getSecret('SUPABASE_SERVICE_ROLE_KEY')) || process.env.SUPABASE_SERVICE_ROLE_KEY) {
      checks.push({ name: 'Supabase Config', status: 'pass', message: 'Supabase credentials configured ✓' });
      passCount++;
    } else {
      checks.push({ name: 'Supabase Config', status: 'warn', message: 'Supabase credentials missing' });
      warnCount++;
    }
  } catch (error) {
    checks.push({ name: 'Supabase Config', status: 'warn', message: 'Could not verify Supabase config' });
    warnCount++;
  }

  // Check 10: Performance budgets
  try {
    execSync('pnpm bundle:check', { stdio: 'pipe', encoding: 'utf-8' });
    checks.push({ name: 'Bundle Size', status: 'pass', message: 'Bundle size within budget ✓' });
    passCount++;
  } catch (error) {
    checks.push({ name: 'Bundle Size', status: 'warn', message: 'Bundle size exceeds budget' });
    warnCount++;
  }

  // Print results
    checks.forEach((check) => {
      const icon = check.status === 'pass' ? '✓' : check.status === 'fail' ? '✗' : '⚠';
      const color = check.status === 'pass' ? '\x1b[32m' : check.status === 'fail' ? '\x1b[31m' : '\x1b[33m';
      console.log(`${color}${icon}\x1b[0m ${check.message}`);
      if (options.verbose && check.status === 'fail' && check.fix) {
        console.log(`  Fix: ${check.fix}`);
      }
    });

      
  // Auto-fix if requested
  if (options.fix) {
        checks.forEach((check) => {
      if (check.status === 'fail' && check.fix) {
        try {
          check.fix();
        } catch (error) {
          console.error(`   Failed to fix ${check.name}:`, error);
        }
      }
    });
  }

  // Exit with appropriate code
  process.exit(failCount > 0 ? 1 : 0);
}
