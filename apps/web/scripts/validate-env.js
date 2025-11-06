#!/usr/bin/env node

const {
  validateEnvironmentVariables,
} = require('../src/lib/secretsManager.ts');


const validation = validateEnvironmentVariables();

if (validation.valid) {
    process.exit(0);
} else {
  console.error('❌ Environment validation failed:');
  validation.errors.forEach(error => {
    console.error(`  - ${error}`);
  });
  process.exit(1);
}
