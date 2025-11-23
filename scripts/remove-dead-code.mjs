#!/usr/bin/env node
/**
 * Remove Dead Code
 * Uses knip, ts-prune, and depcheck to identify and remove unused code
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

console.log('🔍 Scanning for dead code...');

// Run knip
console.log('\n1. Running knip...');
try {
  execSync('pnpm scan:usage', { stdio: 'inherit' });
} catch (e) {
  console.log('Knip completed with findings');
}

// Run ts-prune
console.log('\n2. Running ts-prune...');
try {
  execSync('pnpm prune:exports', { stdio: 'inherit' });
} catch (e) {
  console.log('ts-prune completed with findings');
}

// Run depcheck
console.log('\n3. Running depcheck...');
try {
  execSync('pnpm audit:deps', { stdio: 'inherit' });
} catch (e) {
  console.log('depcheck completed with findings');
}

console.log('\n✅ Dead code analysis complete');
console.log('Review reports/knip.json, reports/ts-prune.txt, and reports/depcheck.json');
console.log('Manually remove unused code based on findings');
