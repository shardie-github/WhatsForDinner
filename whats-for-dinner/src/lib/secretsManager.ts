import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

interface SecretConfig {
  key: string;
  value: string;
  environment: 'development' | 'staging' | 'production';
  lastRotated: string;
  nextRotation: string;
  hash: string;
  encrypted: boolean;
}

interface SecretRotationPolicy {
  key: string;
  rotationIntervalDays: number;
  autoRotate: boolean;
  criticality: 'low' | 'medium' | 'high' | 'critical';
}

class SecretsManager {
  private supabase: any;
  private encryptionKey: string;
  private rotationPolicies: SecretRotationPolicy[] = [];

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.encryptionKey =
      process.env.ENCRYPTION_KEY || this.generateEncryptionKey();
    this.initializeRotationPolicies();
  }

  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private initializeRotationPolicies(): void {
    this.rotationPolicies = [
      {
        key: 'OPENAI_API_KEY',
        rotationIntervalDays: 30,
        autoRotate: true,
        criticality: 'critical',
      },
      {
        key: 'STRIPE_SECRET_KEY',
        rotationIntervalDays: 30,
        autoRotate: true,
        criticality: 'critical',
      },
      {
        key: 'SUPABASE_SERVICE_ROLE_KEY',
        rotationIntervalDays: 30,
        autoRotate: true,
        criticality: 'critical',
      },
      {
        key: 'JWT_SECRET',
        rotationIntervalDays: 90,
        autoRotate: true,
        criticality: 'high',
      },
      {
        key: 'ENCRYPTION_KEY',
        rotationIntervalDays: 90,
        autoRotate: true,
        criticality: 'high',
      },
      {
        key: 'VERCEL_TOKEN',
        rotationIntervalDays: 60,
        autoRotate: false,
        criticality: 'medium',
      },
    ];
  }

  private encrypt(value: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedValue: string): string {
    const parts = encryptedValue.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipher('aes-256-gcm', this.encryptionKey);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private generateHash(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  async storeSecret(
    key: string,
    value: string,
    environment: string = 'production'
  ): Promise<void> {
    try {
      const hash = this.generateHash(value);
      const encryptedValue = this.encrypt(value);

      const secretConfig: SecretConfig = {
        key,
        value: encryptedValue,
        environment: environment as any,
        lastRotated: new Date().toISOString(),
        nextRotation: this.calculateNextRotation(key),
        hash,
        encrypted: true,
      };

      const { error } = await this.supabase
        .from('secrets_vault')
        .upsert(secretConfig, { onConflict: 'key,environment' });

      if (error) {
        throw new Error(`Failed to store secret: ${error.message}`);
      }

      // Log secret storage (without the actual value)
      console.log(
        `Secret ${key} stored successfully for environment ${environment}`
      );
    } catch (error) {
      console.error(`Error storing secret ${key}:`, error);
      throw error;
    }
  }

  async getSecret(
    key: string,
    environment: string = 'production'
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('secrets_vault')
        .select('*')
        .eq('key', key)
        .eq('environment', environment)
        .single();

      if (error || !data) {
        console.warn(`Secret ${key} not found for environment ${environment}`);
        return null;
      }

      // Check if secret needs rotation
      if (new Date(data.nextRotation) <= new Date()) {
        console.warn(`Secret ${key} is due for rotation`);
        await this.rotateSecret(key, environment);
      }

      return this.decrypt(data.value);
    } catch (error) {
      console.error(`Error retrieving secret ${key}:`, error);
      return null;
    }
  }

  async rotateSecret(
    key: string,
    environment: string = 'production'
  ): Promise<void> {
    try {
      const policy = this.rotationPolicies.find(p => p.key === key);
      if (!policy) {
        throw new Error(`No rotation policy found for secret ${key}`);
      }

      // Generate new secret value (this would typically call an external API)
      const newValue = await this.generateNewSecretValue(key);
      const hash = this.generateHash(newValue);
      const encryptedValue = this.encrypt(newValue);

      const { error } = await this.supabase
        .from('secrets_vault')
        .update({
          value: encryptedValue,
          hash,
          lastRotated: new Date().toISOString(),
          nextRotation: this.calculateNextRotation(key),
        })
        .eq('key', key)
        .eq('environment', environment);

      if (error) {
        throw new Error(`Failed to rotate secret: ${error.message}`);
      }

      // Log rotation
      console.log(
        `Secret ${key} rotated successfully for environment ${environment}`
      );

      // Store rotation event
      await this.logRotationEvent(key, environment, hash);
    } catch (error) {
      console.error(`Error rotating secret ${key}:`, error);
      throw error;
    }
  }

  private async generateNewSecretValue(key: string): Promise<string> {
    // This is a placeholder - in production, you would:
    // 1. Call the respective API to generate new keys
    // 2. Use a secure random generator for other secrets
    // 3. Implement proper key derivation

    switch (key) {
      case 'JWT_SECRET':
      case 'ENCRYPTION_KEY':
        return crypto.randomBytes(32).toString('hex');
      case 'RATE_LIMIT_SECRET':
        return crypto.randomBytes(16).toString('hex');
      default:
        // For API keys, you would call the respective service
        return crypto.randomBytes(32).toString('hex');
    }
  }

  private calculateNextRotation(key: string): string {
    const policy = this.rotationPolicies.find(p => p.key === key);
    if (!policy)
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const nextRotation = new Date();
    nextRotation.setDate(nextRotation.getDate() + policy.rotationIntervalDays);
    return nextRotation.toISOString();
  }

  private async logRotationEvent(
    key: string,
    environment: string,
    newHash: string
  ): Promise<void> {
    try {
      await this.supabase.from('secret_rotation_logs').insert({
        key,
        environment,
        new_hash: newHash,
        rotated_at: new Date().toISOString(),
        rotated_by: 'system',
      });
    } catch (error) {
      console.error('Failed to log rotation event:', error);
    }
  }

  async validateSecrets(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const requiredSecrets = [
      'OPENAI_API_KEY',
      'STRIPE_SECRET_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'JWT_SECRET',
      'ENCRYPTION_KEY',
    ];

    for (const secret of requiredSecrets) {
      const value = await this.getSecret(secret);
      if (!value) {
        errors.push(`Missing required secret: ${secret}`);
      } else if (value.length < 16) {
        errors.push(`Secret ${secret} appears to be invalid (too short)`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async getSecretChecksums(): Promise<Record<string, string>> {
    try {
      const { data, error } = await this.supabase
        .from('secrets_vault')
        .select('key, hash, environment');

      if (error) {
        throw new Error(
          `Failed to retrieve secret checksums: ${error.message}`
        );
      }

      const checksums: Record<string, string> = {};
      data.forEach((secret: any) => {
        checksums[`${secret.key}_${secret.environment}`] = secret.hash;
      });

      return checksums;
    } catch (error) {
      console.error('Error getting secret checksums:', error);
      return {};
    }
  }

  async scheduleRotationCheck(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('secrets_vault')
        .select('key, nextRotation, environment')
        .lte('nextRotation', new Date().toISOString());

      if (error) {
        throw new Error(`Failed to check rotation schedule: ${error.message}`);
      }

      for (const secret of data) {
        const policy = this.rotationPolicies.find(p => p.key === secret.key);
        if (policy && policy.autoRotate) {
          console.log(
            `Auto-rotating secret ${secret.key} for environment ${secret.environment}`
          );
          await this.rotateSecret(secret.key, secret.environment);
        } else {
          console.warn(
            `Secret ${secret.key} is due for rotation but auto-rotation is disabled`
          );
        }
      }
    } catch (error) {
      console.error('Error in rotation check:', error);
    }
  }
}

export const secretsManager = new SecretsManager();

// Utility functions for environment validation
export function validateEnvironmentVariables(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY',
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Validate URL formats
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')
  ) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL must use HTTPS');
  }

  // Validate API key formats
  if (
    process.env.OPENAI_API_KEY &&
    !process.env.OPENAI_API_KEY.startsWith('sk-')
  ) {
    errors.push('OPENAI_API_KEY appears to be invalid (should start with sk-)');
  }

  if (
    process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.startsWith('sk_')
  ) {
    errors.push(
      'STRIPE_SECRET_KEY appears to be invalid (should start with sk_)'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Redact sensitive information from logs
export function redactSensitiveData(data: any): any {
  const sensitiveKeys = [
    'password',
    'secret',
    'key',
    'token',
    'api_key',
    'auth',
    'openai',
    'stripe',
    'supabase',
    'jwt',
    'encryption',
  ];

  if (typeof data === 'string') {
    return sensitiveKeys.some(key => data.toLowerCase().includes(key))
      ? '[REDACTED]'
      : data;
  }

  if (typeof data === 'object' && data !== null) {
    const redacted = { ...data };
    for (const key in redacted) {
      if (
        sensitiveKeys.some(sensitiveKey =>
          key.toLowerCase().includes(sensitiveKey)
        )
      ) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object') {
        redacted[key] = redactSensitiveData(redacted[key]);
      }
    }
    return redacted;
  }

  return data;
}
