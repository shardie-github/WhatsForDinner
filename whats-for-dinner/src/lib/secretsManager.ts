/**
 * Comprehensive Secrets Management System
 * 
 * This module provides secure secrets management including:
 * - Environment variable validation
 * - Secrets rotation
 * - Encryption/decryption utilities
 * - Audit logging for secret access
 */

import crypto from 'crypto';
import { logger } from './logger';

export interface SecretConfig {
  name: string;
  required: boolean;
  encrypted?: boolean;
  rotationInterval?: number; // in days
  lastRotated?: Date;
}

export interface SecretValue {
  value: string;
  encrypted: boolean;
  lastRotated: Date;
  expiresAt?: Date;
}

class SecretsManager {
  private secrets: Map<string, SecretValue> = new Map();
  private configs: Map<string, SecretConfig> = new Map();
  private encryptionKey: string;
  private rotationJobs: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.encryptionKey = this.getOrCreateEncryptionKey();
    this.initializeSecrets();
    this.setupRotationJobs();
  }

  /**
   * Initialize all required secrets from environment variables
   */
  private initializeSecrets(): void {
    const secretConfigs: SecretConfig[] = [
      {
        name: 'OPENAI_API_KEY',
        required: true,
        encrypted: true,
        rotationInterval: 90, // 90 days
      },
      {
        name: 'SUPABASE_SERVICE_ROLE_KEY',
        required: true,
        encrypted: true,
        rotationInterval: 30, // 30 days
      },
      {
        name: 'STRIPE_SECRET_KEY',
        required: true,
        encrypted: true,
        rotationInterval: 60, // 60 days
      },
      {
        name: 'JWT_SECRET',
        required: true,
        encrypted: true,
        rotationInterval: 30, // 30 days
      },
      {
        name: 'ENCRYPTION_KEY',
        required: true,
        encrypted: false,
        rotationInterval: 90, // 90 days
      },
      {
        name: 'SENTRY_DSN',
        required: false,
        encrypted: false,
      },
      {
        name: 'RESEND_API_KEY',
        required: false,
        encrypted: true,
        rotationInterval: 60, // 60 days
      },
    ];

    for (const config of secretConfigs) {
      this.configs.set(config.name, config);
      this.loadSecret(config.name);
    }
  }

  /**
   * Load a secret from environment variables
   */
  private loadSecret(name: string): void {
    const config = this.configs.get(name);
    if (!config) return;

    const envValue = process.env[name];
    
    if (!envValue) {
      if (config.required) {
        throw new Error(`Required secret ${name} not found in environment variables`);
      }
      return;
    }

    const secretValue: SecretValue = {
      value: envValue,
      encrypted: config.encrypted || false,
      lastRotated: new Date(),
    };

    this.secrets.set(name, secretValue);
    
    // Log secret access for audit
    logger.info(`Secret loaded: ${name}`, {
      secret_name: name,
      encrypted: secretValue.encrypted,
      last_rotated: secretValue.lastRotated,
    }, 'security', 'secrets_management');
  }

  /**
   * Get a secret value
   */
  public getSecret(name: string): string | undefined {
    const secret = this.secrets.get(name);
    if (!secret) {
      logger.warn(`Secret not found: ${name}`, {
        secret_name: name,
      }, 'security', 'secrets_management');
      return undefined;
    }

    // Log secret access
    logger.info(`Secret accessed: ${name}`, {
      secret_name: name,
      encrypted: secret.encrypted,
    }, 'security', 'secrets_management');

    return secret.value;
  }

  /**
   * Set a secret value
   */
  public setSecret(name: string, value: string, encrypted: boolean = false): void {
    const secretValue: SecretValue = {
      value,
      encrypted,
      lastRotated: new Date(),
    };

    this.secrets.set(name, secretValue);

    logger.info(`Secret set: ${name}`, {
      secret_name: name,
      encrypted,
      last_rotated: secretValue.lastRotated,
    }, 'security', 'secrets_management');
  }

  /**
   * Rotate a secret
   */
  public async rotateSecret(name: string, newValue: string): Promise<void> {
    const config = this.configs.get(name);
    if (!config) {
      throw new Error(`Secret configuration not found: ${name}`);
    }

    const oldSecret = this.secrets.get(name);
    
    // Set new secret
    this.setSecret(name, newValue, config.encrypted);

    // Log rotation
    logger.info(`Secret rotated: ${name}`, {
      secret_name: name,
      old_last_rotated: oldSecret?.lastRotated,
      new_last_rotated: new Date(),
    }, 'security', 'secrets_management');

    // Update environment variable if possible
    if (process.env[name]) {
      process.env[name] = newValue;
    }
  }

  /**
   * Check if a secret needs rotation
   */
  public needsRotation(name: string): boolean {
    const config = this.configs.get(name);
    const secret = this.secrets.get(name);
    
    if (!config || !secret || !config.rotationInterval) {
      return false;
    }

    const daysSinceRotation = Math.floor(
      (Date.now() - secret.lastRotated.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceRotation >= config.rotationInterval;
  }

  /**
   * Get all secrets that need rotation
   */
  public getSecretsNeedingRotation(): string[] {
    const secretsToRotate: string[] = [];
    
    for (const [name] of this.secrets) {
      if (this.needsRotation(name)) {
        secretsToRotate.push(name);
      }
    }
    
    return secretsToRotate;
  }

  /**
   * Setup automatic rotation jobs
   */
  private setupRotationJobs(): void {
    // Check for secrets needing rotation every hour
    const rotationCheckInterval = setInterval(() => {
      const secretsToRotate = this.getSecretsNeedingRotation();
      
      if (secretsToRotate.length > 0) {
        logger.warn(`Secrets need rotation: ${secretsToRotate.join(', ')}`, {
          secrets_needing_rotation: secretsToRotate,
        }, 'security', 'secrets_management');
        
        // In a real implementation, this would trigger rotation workflows
        this.notifyRotationNeeded(secretsToRotate);
      }
    }, 60 * 60 * 1000); // 1 hour

    this.rotationJobs.set('rotation_check', rotationCheckInterval);
  }

  /**
   * Notify that secrets need rotation
   */
  private notifyRotationNeeded(secrets: string[]): void {
    // In a real implementation, this would send notifications
    // to administrators or trigger automated rotation workflows
    console.warn(`⚠️  Secrets need rotation: ${secrets.join(', ')}`);
  }

  /**
   * Encrypt a value
   */
  public encrypt(value: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt a value
   */
  public decrypt(encryptedValue: string): string {
    const [ivHex, encrypted] = encryptedValue.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Get or create encryption key
   */
  private getOrCreateEncryptionKey(): string {
    let key = process.env.ENCRYPTION_KEY;
    
    if (!key) {
      // Generate a new key (in production, this should be stored securely)
      key = crypto.randomBytes(32).toString('hex');
      logger.warn('No ENCRYPTION_KEY found, generated new key', {
        generated_key: true,
      }, 'security', 'secrets_management');
    }
    
    return key;
  }

  /**
   * Validate all required secrets
   */
  public validateSecrets(): { valid: boolean; missing: string[]; invalid: string[] } {
    const missing: string[] = [];
    const invalid: string[] = [];
    
    for (const [name, config] of this.configs) {
      if (config.required) {
        const secret = this.secrets.get(name);
        if (!secret || !secret.value) {
          missing.push(name);
        } else if (this.isSecretInvalid(name, secret.value)) {
          invalid.push(name);
        }
      }
    }
    
    return {
      valid: missing.length === 0 && invalid.length === 0,
      missing,
      invalid,
    };
  }

  /**
   * Check if a secret value is invalid
   */
  private isSecretInvalid(name: string, value: string): boolean {
    switch (name) {
      case 'OPENAI_API_KEY':
        return !value.startsWith('sk-');
      case 'SUPABASE_SERVICE_ROLE_KEY':
        return !value.startsWith('eyJ');
      case 'STRIPE_SECRET_KEY':
        return !value.startsWith('sk_');
      case 'JWT_SECRET':
        return value.length < 32;
      default:
        return false;
    }
  }

  /**
   * Get secrets summary for monitoring
   */
  public getSecretsSummary(): {
    total: number;
    encrypted: number;
    needsRotation: number;
    lastRotated: Date | null;
  } {
    const secrets = Array.from(this.secrets.values());
    const needsRotation = this.getSecretsNeedingRotation().length;
    const lastRotated = secrets.length > 0 
      ? new Date(Math.max(...secrets.map(s => s.lastRotated.getTime())))
      : null;
    
    return {
      total: secrets.length,
      encrypted: secrets.filter(s => s.encrypted).length,
      needsRotation,
      lastRotated,
    };
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    for (const [name, job] of this.rotationJobs) {
      clearInterval(job);
    }
    this.rotationJobs.clear();
  }
}

// Export singleton instance
export const secretsManager = new SecretsManager();

/**
 * Validate environment variables for deployment readiness
 */
export function validateEnvironmentVariables(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required environment variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_PROJECT_REF',
    'DATABASE_URL',
  ];
  
  // Optional but recommended
  const optionalVars = [
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'SENTRY_DSN',
    'POSTHOG_KEY',
    'RESEND_API_KEY',
    'VERCEL_ORG_ID',
    'VERCEL_PROJECT_ID',
  ];
  
  // Check required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }
  
  // Validate Supabase project reference
  if (process.env.SUPABASE_PROJECT_REF && process.env.SUPABASE_PROJECT_REF !== 'ghqyxhbyyirveptgwoqm') {
    errors.push(`SUPABASE_PROJECT_REF should be 'ghqyxhbyyirveptgwoqm', got: ${process.env.SUPABASE_PROJECT_REF}`);
  }
  
  // Validate Supabase URL format
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL should start with https://');
  }
  
  // Check for service role key in client-side environment
  if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY should not be exposed as NEXT_PUBLIC_ variable');
  }
  
  // Validate DATABASE_URL format
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    errors.push('DATABASE_URL should be a valid PostgreSQL connection string');
  }
  
  // Check Node.js version compatibility
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 18) {
    errors.push(`Node.js version ${nodeVersion} is not supported. Minimum version is 18.x`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Export types and utilities
export { SecretsManager };
export type { SecretConfig, SecretValue };