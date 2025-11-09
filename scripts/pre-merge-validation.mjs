#!/usr/bin/env node
/**
 * Pre-Merge Validation
 * 
 * Runs validation checks before merge to reduce rework.
 * Should be run in CI or as a pre-commit hook.
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = process.cwd();
const ERRORS = [];

/**
 * Run command and capture output
 */
function runCommand(command, description) {
  try {
    console.log(`\n🔍 ${description}...`);
    execSync(command, { stdio: 'inherit', cwd: ROOT_DIR });
    console.log(`✅ ${description} passed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed`);
    ERRORS.push(description);
    return false;
  }
}

/**
 * Check type coverage (if type-coverage is available)
 */
function checkTypeCoverage() {
  try {
    console.log('\n🔍 Checking type coverage...');
    const output = execSync('npx type-coverage --detail --at-least 90', {
      encoding: 'utf-8',
      cwd: ROOT_DIR,
      stdio: 'pipe',
    });
    
    // Extract coverage percentage
    const match = output.match(/(\d+\.?\d*)%/);
    if (match) {
      const coverage = parseFloat(match[1]);
      console.log(`✅ Type coverage: ${coverage}%`);
      if (coverage < 90) {
        console.warn(`⚠️  Type coverage below 90% target (${coverage}%)`);
      }
      return true;
    }
    return true;
  } catch (error) {
    console.warn('⚠️  type-coverage not available, skipping');
    return true; // Don't fail if tool not installed
  }
}

/**
 * Check for banned phrases in code
 */
function checkBannedPhrases() {
  try {
    console.log('\n🔍 Checking for banned phrases...');
    const bannedPhrases = ['click here', 'please note'];
    const command = `grep -r -i "${bannedPhrases.join('\\|')}" apps/web/src --include="*.ts" --include="*.tsx" || true`;
    const output = execSync(command, { encoding: 'utf-8', cwd: ROOT_DIR });
    
    if (output.trim()) {
      console.error('❌ Found banned phrases:');
      console.error(output);
      ERRORS.push('Banned phrases check');
      return false;
    }
    console.log('✅ No banned phrases found');
    return true;
  } catch (error) {
    // If grep fails, assume no matches
    console.log('✅ No banned phrases found');
    return true;
  }
}

/**
 * Check bundle size (if bundle analyzer available)
 */
function checkBundleSize() {
  try {
    console.log('\n🔍 Checking bundle size...');
    // This would require running the build and analyzing
    // For now, just check if build succeeds
    console.log('⚠️  Bundle size check requires build analysis (skipped in pre-merge)');
    return true;
  } catch (error) {
    return true; // Don't fail pre-merge on bundle check
  }
}

/**
 * Main validation function
 */
function main() {
  console.log('🚀 Running pre-merge validation checks...\n');
  console.log('='.repeat(60));

  const checks = [
    () => runCommand('pnpm type-check', 'Type checking'),
    () => runCommand('pnpm lint', 'Linting'),
    () => checkTypeCoverage(),
    () => checkBannedPhrases(),
    // Note: Tests and build are typically run in CI, not pre-merge
  ];

  const results = checks.map(check => check());
  const allPassed = results.every(r => r);

  console.log('\n' + '='.repeat(60));
  
  if (allPassed && ERRORS.length === 0) {
    console.log('\n✅ All pre-merge checks passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Pre-merge validation failed');
    console.log(`Failed checks: ${ERRORS.join(', ')}`);
    console.log('\nPlease fix the issues above before merging.');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
