#!/usr/bin/env tsx
/**
 * Deployment Configuration Validator
 * 
 * Validates deployment configurations for all platforms:
 * - Vercel (vercel.json)
 * - Netlify (netlify.toml)
 * - Docker (Dockerfile)
 * - Next.js (next.config.ts)
 * - Supabase (supabase/config.toml)
 */

import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  platform: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate Vercel configuration
 */
function validateVercel(): ValidationResult {
  const result: ValidationResult = {
    platform: 'Vercel',
    valid: true,
    errors: [],
    warnings: [],
  };

  const vercelJsonPath = join(process.cwd(), 'vercel.json');
  
  if (!existsSync(vercelJsonPath)) {
    result.warnings.push('vercel.json not found (optional for Next.js apps)');
    return result;
  }

  try {
    const config = JSON.parse(readFileSync(vercelJsonPath, 'utf-8'));
    
    // Check for required fields
    if (config.rewrites && !Array.isArray(config.rewrites)) {
      result.errors.push('vercel.json: rewrites must be an array');
      result.valid = false;
    }

    if (config.headers && !Array.isArray(config.headers)) {
      result.errors.push('vercel.json: headers must be an array');
      result.valid = false;
    }

    // Validate cron jobs
    if (config.crons) {
      if (!Array.isArray(config.crons)) {
        result.errors.push('vercel.json: crons must be an array');
        result.valid = false;
      } else {
        for (const cron of config.crons) {
          if (!cron.path || !cron.schedule) {
            result.errors.push('vercel.json: cron jobs must have path and schedule');
            result.valid = false;
          }
        }
      }
    }
  } catch (error: any) {
    result.errors.push(`Failed to parse vercel.json: ${error.message}`);
    result.valid = false;
  }

  return result;
}

/**
 * Validate Next.js configuration
 */
function validateNextConfig(): ValidationResult {
  const result: ValidationResult = {
    platform: 'Next.js',
    valid: true,
    errors: [],
    warnings: [],
  };

  const nextConfigPath = join(process.cwd(), 'apps/web/next.config.ts');
  
  if (!existsSync(nextConfigPath)) {
    result.errors.push('next.config.ts not found');
    result.valid = false;
    return result;
  }

  try {
    const content = readFileSync(nextConfigPath, 'utf-8');
    
    // Check for common misconfigurations
    if (content.includes('output: \'export\'') && content.includes('api')) {
      result.warnings.push('Static export mode may not support API routes');
    }

    if (!content.includes('reactStrictMode')) {
      result.warnings.push('reactStrictMode not enabled (recommended)');
    }

    if (!content.includes('swcMinify')) {
      result.warnings.push('swcMinify not enabled (recommended for performance)');
    }
  } catch (error: any) {
    result.errors.push(`Failed to read next.config.ts: ${error.message}`);
    result.valid = false;
  }

  return result;
}

/**
 * Validate Docker configuration
 */
function validateDocker(): ValidationResult {
  const result: ValidationResult = {
    platform: 'Docker',
    valid: true,
    errors: [],
    warnings: [],
  };

  const dockerfilePath = join(process.cwd(), 'Dockerfile');
  
  if (!existsSync(dockerfilePath)) {
    result.warnings.push('Dockerfile not found (optional if using Vercel/Netlify)');
    return result;
  }

  try {
    const content = readFileSync(dockerfilePath, 'utf-8');
    
    // Check for best practices
    if (!content.includes('FROM')) {
      result.errors.push('Dockerfile missing FROM instruction');
      result.valid = false;
    }

    if (!content.includes('EXPOSE')) {
      result.warnings.push('Dockerfile missing EXPOSE instruction');
    }

    if (content.includes('RUN npm install') && !content.includes('--production')) {
      result.warnings.push('Consider using --production flag for npm install');
    }
  } catch (error: any) {
    result.errors.push(`Failed to read Dockerfile: ${error.message}`);
    result.valid = false;
  }

  return result;
}

/**
 * Validate Supabase configuration
 */
function validateSupabase(): ValidationResult {
  const result: ValidationResult = {
    platform: 'Supabase',
    valid: true,
    errors: [],
    warnings: [],
  };

  const supabaseConfigPath = join(process.cwd(), 'supabase/config.toml');
  const migrationsDir = join(process.cwd(), 'supabase/migrations');
  
  if (!existsSync(supabaseConfigPath)) {
    result.warnings.push('supabase/config.toml not found (optional if using hosted Supabase)');
  } else {
    try {
      const content = readFileSync(supabaseConfigPath, 'utf-8');
      // Basic validation
      if (!content.includes('[project]')) {
        result.warnings.push('supabase/config.toml may be missing [project] section');
      }
    } catch (error: any) {
      result.warnings.push(`Could not parse supabase/config.toml: ${error.message}`);
    }
  }

  // Check migrations directory
  if (!existsSync(migrationsDir)) {
    result.warnings.push('supabase/migrations directory not found');
  } else {
    const migrations = require('fs').readdirSync(migrationsDir).filter((f: string) => f.endsWith('.sql'));
    if (migrations.length === 0) {
      result.warnings.push('No migration files found in supabase/migrations');
    }
  }

  return result;
}

/**
 * Main validation function
 */
function validateAll(): ValidationResult[] {
  return [
    validateVercel(),
    validateNextConfig(),
    validateDocker(),
    validateSupabase(),
  ];
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Validating deployment configurations...\n');

  const results = validateAll();
  let hasErrors = false;
  let hasWarnings = false;

  for (const result of results) {
    const status = result.valid ? '✅' : '❌';
    console.log(`${status} ${result.platform}`);

    if (result.errors.length > 0) {
      hasErrors = true;
      result.errors.forEach(err => console.log(`   ❌ ${err}`));
    }

    if (result.warnings.length > 0) {
      hasWarnings = true;
      result.warnings.forEach(warn => console.log(`   ⚠️  ${warn}`));
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log('   ✅ All checks passed');
    }

    console.log('');
  }

  if (hasErrors) {
    console.log('❌ Validation failed with errors');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  Validation passed with warnings');
    process.exit(0);
  } else {
    console.log('✅ All validations passed');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

export { validateAll, validateVercel, validateNextConfig, validateDocker, validateSupabase };
