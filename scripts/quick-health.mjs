#!/usr/bin/env node
import { execSync } from 'child_process';

console.log('Quick Health Check:');
try {
  execSync('node scripts/comprehensive-health-check.mjs', { stdio: 'inherit' });
} catch (e) {
  console.error('Health check failed');
  process.exit(1);
}
