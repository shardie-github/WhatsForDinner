#!/usr/bin/env node
/**
 * Environment Variable Validation
 * Validates that all required environment variables are set
 */

import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
];

const optionalButRecommended = [
  'OPENAI_API_KEY',
  'STRIPE_SECRET_KEY',
  'RESEND_API_KEY',
  'REDIS_URL',
];

const missing = [];
const missingRecommended = [];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    missing.push(varName);
  }
}

for (const varName of optionalButRecommended) {
  if (!process.env[varName]) {
    missingRecommended.push(varName);
  }
}

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  for (const varName of missing) {
    console.error(`   - ${varName}`);
  }
  process.exit(1);
}

if (missingRecommended.length > 0) {
  console.warn('⚠️  Missing recommended environment variables:');
  for (const varName of missingRecommended) {
    console.warn(`   - ${varName}`);
  }
}

console.log('✅ All required environment variables are set');
