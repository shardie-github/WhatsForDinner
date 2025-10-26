#!/usr/bin/env node

const {
  validateEnvironmentVariables,
} = require('../src/lib/secretsManager.ts');

console.log('🔍 Validating environment variables...');

const validation = validateEnvironmentVariables();

if (validation.valid) {
  console.log('✅ All environment variables are valid');
  process.exit(0);
} else {
  console.error('❌ Environment validation failed:');
  validation.errors.forEach(error => {
    console.error(`  - ${error}`);
  });
  process.exit(1);
}
