#!/usr/bin/env node
/**
 * Validates that .env.example matches the environment validation schema
 * Ensures no drift between documented and validated env vars
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const ENV_EXAMPLE = path.join(WORKSPACE_ROOT, '.env.example');
const ENV_SCHEMA = path.join(WORKSPACE_ROOT, 'packages/config/src/env.ts');

function extractEnvVarsFromExample() {
  if (!fs.existsSync(ENV_EXAMPLE)) {
    console.error('❌ .env.example not found');
    return [];
  }
  
  const content = fs.readFileSync(ENV_EXAMPLE, 'utf8');
  const vars = [];
  
  // Extract VAR_NAME=value lines
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*=/);
    if (match && !match[1].startsWith('#')) {
      vars.push(match[1]);
    }
  }
  
  return vars;
}

function extractEnvVarsFromSchema() {
  if (!fs.existsSync(ENV_SCHEMA)) {
    console.error('❌ Environment schema not found:', ENV_SCHEMA);
    console.error('   Please create packages/config/src/env.ts with Zod schema');
    return [];
  }
  
  const content = fs.readFileSync(ENV_SCHEMA, 'utf8');
  const vars = [];
  
  // Extract z.string(), z.number(), etc. patterns
  // Look for lines like: VAR_NAME: z.string()...
  const lines = content.split('\n');
  for (const line of lines) {
    // Match: VAR_NAME: z.string() or VAR_NAME: z.string().optional()
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*:\s*z\./);
    if (match) {
      vars.push(match[1]);
    }
  }
  
  return vars;
}

function validateEnvCompleteness() {
  console.log('🔍 Validating environment variable completeness...');
  
  // Check schema exists
  if (!fs.existsSync(ENV_SCHEMA)) {
    console.error('❌ Environment validation schema not found!');
    console.error('   Expected: packages/config/src/env.ts');
    console.error('   This is a critical guardrail - all env vars must be validated.');
    process.exit(1);
  }
  
  const exampleVars = extractEnvVarsFromExample();
  const schemaVars = extractEnvVarsFromSchema();
  
  console.log(`📋 Found ${exampleVars.length} vars in .env.example`);
  console.log(`📋 Found ${schemaVars.length} vars in schema`);
  
  // Find vars in example but not in schema
  const missingInSchema = exampleVars.filter(v => !schemaVars.includes(v));
  
  // Find vars in schema but not in example
  const missingInExample = schemaVars.filter(v => !exampleVars.includes(v));
  
  let hasIssues = false;
  
  if (missingInSchema.length > 0) {
    console.warn('⚠️  Variables in .env.example but not in schema:');
    missingInSchema.forEach(v => console.warn(`   - ${v}`));
    console.warn('   These should be added to the validation schema');
    hasIssues = true;
  }
  
  if (missingInExample.length > 0) {
    console.warn('⚠️  Variables in schema but not in .env.example:');
    missingInExample.forEach(v => console.warn(`   - ${v}`));
    console.warn('   These should be documented in .env.example');
    hasIssues = true;
  }
  
  // Critical check: Required vars must be in schema
  if (schemaVars.length === 0) {
    console.error('❌ No environment variables found in schema!');
    console.error('   The schema file appears to be empty or invalid.');
    process.exit(1);
  }
  
  if (hasIssues) {
    console.error('');
    console.error('❌ Environment variable drift detected!');
    console.error('   Please sync .env.example with the validation schema.');
    process.exit(1);
  }
  
  console.log('✅ Environment variable completeness validated');
  return true;
}

// Main
try {
  validateEnvCompleteness();
  console.log('✅ Environment validation passed!');
  process.exit(0);
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}
