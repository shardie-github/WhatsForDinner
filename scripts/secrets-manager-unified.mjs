#!/usr/bin/env node
/**
 * Unified Secrets Manager
 * 
 * Fetches secrets from Supabase secrets_vault and falls back to environment variables
 * Provides a unified interface for accessing secrets across all scripts
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

class UnifiedSecretsManager {
  constructor() {
    this.supabase = null;
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes

    this.initSupabase();
  }

  initSupabase() {
    const supabaseUrl = 
      process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.SUPABASE_URL ||
      process.env.VERCEL_ENV === 'production' 
        ? process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL.replace('https://', '').split('.')[0]}.supabase.co`
          : null
        : null;

    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Get environment from current context
   */
  getEnvironment() {
    if (process.env.VERCEL_ENV) {
      return process.env.VERCEL_ENV; // production, preview, development
    }
    return process.env.NODE_ENV === 'production' ? 'production' : 'development';
  }

  /**
   * Get secret from Supabase, Vercel, or environment
   */
  async getSecret(key, options = {}) {
    const {
      environment = this.getEnvironment(),
      useCache = true,
      fallbackToEnv = true,
    } = options;

    // Check cache first
    if (useCache && this.cache.has(key)) {
      const expiry = this.cacheExpiry.get(key);
      if (expiry && Date.now() < expiry) {
        return this.cache.get(key);
      }
      // Cache expired, clear it
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    }

    let value = null;

    // Try Supabase first
    if (this.supabase) {
      try {
        const { data, error } = await this.supabase
          .from('secrets_vault')
          .select('value, encrypted')
          .eq('key', key)
          .eq('environment', environment)
          .single();

        if (!error && data) {
          value = data.value;
          // In production, decrypt if encrypted
          if (data.encrypted && value.includes(':')) {
            // Simple decryption (in production, use proper decryption)
            // For now, assume value is stored plain if it's not in encrypted format
            value = data.value;
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch ${key} from Supabase:`, error.message);
      }
    }

    // Fallback to Vercel environment variables
    if (!value && process.env.VERCEL) {
      try {
        // Vercel env vars are automatically available in process.env
        // But we can also fetch via API if needed
        value = process.env[key];
      } catch (error) {
        console.warn(`Failed to fetch ${key} from Vercel:`, error.message);
      }
    }

    // Fallback to environment variables
    if (!value && fallbackToEnv) {
      value = process.env[key];
    }

    // Cache the value
    if (value && useCache) {
      this.cache.set(key, value);
      this.cacheExpiry.set(key, Date.now() + this.cacheTTL);
    }

    return value;
  }

  /**
   * Get multiple secrets at once
   */
  async getSecrets(keys, options = {}) {
    const results = {};
    await Promise.all(
      keys.map(async (key) => {
        results[key] = await this.getSecret(key, options);
      })
    );
    return results;
  }

  /**
   * Set secret in Supabase (for migration/updates)
   */
  async setSecret(key, value, options = {}) {
    const {
      environment = this.getEnvironment(),
      encrypted = true,
    } = options;

    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    const nextRotation = new Date();
    nextRotation.setDate(nextRotation.getDate() + 30);

    const { error } = await this.supabase
      .from('secrets_vault')
      .upsert({
        key,
        value, // In production, encrypt this
        environment,
        encrypted,
        last_rotated: new Date().toISOString(),
        next_rotation: nextRotation.toISOString(),
      }, {
        onConflict: 'key,environment',
      });

    if (error) {
      throw new Error(`Failed to set secret ${key}: ${error.message}`);
    }

    // Clear cache
    this.cache.delete(key);
    this.cacheExpiry.delete(key);

    return true;
  }

  /**
   * Sync secret to Vercel
   */
  async syncToVercel(key, value, environment = 'production') {
    const vercelToken = process.env.VERCEL_TOKEN;
    if (!vercelToken) {
      throw new Error('VERCEL_TOKEN not set');
    }

    const vercelProjectId = process.env.VERCEL_PROJECT_ID;
    if (!vercelProjectId) {
      throw new Error('VERCEL_PROJECT_ID not set');
    }

    const vercelEnv = environment === 'production' ? 'production' : 'preview';
    const isSecret = !key.startsWith('NEXT_PUBLIC_');

    try {
      const apiUrl = `https://api.vercel.com/v10/projects/${vercelProjectId}/env`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          value,
          type: isSecret ? 'secret' : 'plain',
          target: [vercelEnv],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Vercel API error: ${error.message || response.statusText}`);
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to sync to Vercel: ${error.message}`);
    }
  }

  /**
   * Sync all secrets between Supabase and Vercel
   */
  async syncAll(environment = 'production') {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data: secrets, error } = await this.supabase
      .from('secrets_vault')
      .select('key, value')
      .eq('environment', environment);

    if (error) {
      throw new Error(`Failed to fetch secrets from Supabase: ${error.message}`);
    }

    const results = {
      success: [],
      errors: [],
    };

    for (const secret of secrets) {
      try {
        await this.syncToVercel(secret.key, secret.value, environment);
        results.success.push(secret.key);
      } catch (error) {
        results.errors.push({ key: secret.key, error: error.message });
      }
    }

    return results;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Validate required secrets
   */
  async validateRequired(requiredKeys, environment = this.getEnvironment()) {
    const missing = [];
    const invalid = [];

    for (const key of requiredKeys) {
      const value = await this.getSecret(key, { environment });
      if (!value) {
        missing.push(key);
      } else if (this.isInvalid(key, value)) {
        invalid.push(key);
      }
    }

    return {
      valid: missing.length === 0 && invalid.length === 0,
      missing,
      invalid,
    };
  }

  /**
   * Check if secret value is invalid
   */
  isInvalid(key, value) {
    if (!value || value.length < 3) return true;

    // Basic validation patterns
    const validations = {
      OPENAI_API_KEY: (v) => v.startsWith('sk-'),
      STRIPE_SECRET_KEY: (v) => v.startsWith('sk_'),
      STRIPE_PUBLISHABLE_KEY: (v) => v.startsWith('pk_'),
      SUPABASE_SERVICE_ROLE_KEY: (v) => v.startsWith('eyJ'),
      NEXT_PUBLIC_SUPABASE_URL: (v) => v.startsWith('https://'),
      DATABASE_URL: (v) => v.startsWith('postgresql://'),
    };

    const validator = validations[key];
    return validator ? !validator(value) : false;
  }
}

// Export singleton instance
export const secretsManager = new UnifiedSecretsManager();

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const key = process.argv[3];

  async function main() {
    switch (command) {
      case 'get':
        if (!key) {
          console.error('Usage: secrets-manager-unified.mjs get <KEY>');
          process.exit(1);
        }
        const value = await secretsManager.getSecret(key);
        if (value) {
          console.log(value);
        } else {
          console.error(`Secret ${key} not found`);
          process.exit(1);
        }
        break;

      case 'set':
        const val = process.argv[4];
        if (!key || !val) {
          console.error('Usage: secrets-manager-unified.mjs set <KEY> <VALUE>');
          process.exit(1);
        }
        await secretsManager.setSecret(key, val);
        console.log(`Secret ${key} set successfully`);
        break;

      case 'sync':
        const env = process.argv[3] || 'production';
        const results = await secretsManager.syncAll(env);
        console.log(`Synced ${results.success.length} secrets to Vercel`);
        if (results.errors.length > 0) {
          console.error('Errors:', results.errors);
          process.exit(1);
        }
        break;

      case 'validate':
        const required = process.argv.slice(3);
        if (required.length === 0) {
          console.error('Usage: secrets-manager-unified.mjs validate <KEY1> [KEY2] ...');
          process.exit(1);
        }
        const validation = await secretsManager.validateRequired(required);
        if (validation.valid) {
          console.log('✅ All secrets are valid');
        } else {
          console.error('❌ Validation failed:');
          if (validation.missing.length > 0) {
            console.error('Missing:', validation.missing.join(', '));
          }
          if (validation.invalid.length > 0) {
            console.error('Invalid:', validation.invalid.join(', '));
          }
          process.exit(1);
        }
        break;

      default:
        console.log(`
Usage: secrets-manager-unified.mjs <command> [args]

Commands:
  get <KEY>              Get a secret value
  set <KEY> <VALUE>      Set a secret value
  sync [ENV]             Sync all secrets to Vercel
  validate <KEY>...      Validate required secrets
        `);
        process.exit(1);
    }
  }

  main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}
