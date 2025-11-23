/**
 * Environment Loader with Validation
 * 
 * Provides safe environment variable loading with helpful error messages
 * and automatic .env.example generation
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { validateEnv, type Env } from './env';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('env-loader-ts');
interface EnvLoadOptions {
  /**
   * Path to .env file (default: .env.local)
   */
  envPath?: string;
  
  /**
   * Whether to throw on validation errors (default: true in production)
   */
  strict?: boolean;
  
  /**
   * Whether to show helpful error messages (default: true)
   */
  showHelp?: boolean;
}

/**
 * Load and validate environment variables
 */
export function loadEnv(options: EnvLoadOptions = {}): Env {
  const {
    envPath = '.env.local',
    strict = process.env.NODE_ENV === 'production',
    showHelp = true,
  } = options;

  try {
    return validateEnv();
  } catch (error: any) {
    if (showHelp) {
      logger.error('\n❌ Environment validation failed!\n');
      logger.error('💡 Tips:');
      logger.error('   1. Copy .env.example to .env.local');
      logger.error('   2. Fill in required values');
      logger.error('   3. See .env.example for all available options\n');
      
      if (existsSync(join(process.cwd(), '.env.example'))) {
        logger.error('📄 Example file: .env.example');
      }
    }

    if (strict) {
      throw error;
    }

    // In non-strict mode, return partial env
    logger.warn('⚠️  Continuing with partial environment configuration');
    return {} as Env;
  }
}

/**
 * Check if required environment variables are set
 */
export function checkRequiredEnv(required: string[]): { missing: string[]; valid: boolean } {
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  return {
    missing,
    valid: missing.length === 0,
  };
}

/**
 * Get environment variable with fallback
 */
export function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];
  
  if (value === undefined || value === '') {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  
  return value;
}

/**
 * Get boolean environment variable
 */
export function getEnvBool(key: string, fallback: boolean = false): boolean {
  const value = process.env[key];
  
  if (value === undefined || value === '') {
    return fallback;
  }
  
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get number environment variable
 */
export function getEnvNumber(key: string, fallback?: number): number {
  const value = process.env[key];
  
  if (value === undefined || value === '') {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  
  const num = Number(value);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} must be a number, got: ${value}`);
  }
  
  return num;
}

/**
 * Validate environment on module load (optional)
 * Call this explicitly if you want early validation
 */
export function validateEnvOnLoad(): void {
  if (process.env.NODE_ENV === 'production') {
    try {
      validateEnv();
    } catch (error) {
      logger.error('❌ Environment validation failed in production!');
      throw error;
    }
  }
}

// Auto-validate in production
if (process.env.NODE_ENV === 'production') {
  validateEnvOnLoad();
}
