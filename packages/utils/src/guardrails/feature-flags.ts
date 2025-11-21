/**
 * Feature Flags Utility
 * 
 * Provides centralized feature flag management:
 * - User-level flags (from database)
 * - Global flags (from environment variables)
 * - Kill switch support
 * - Type-safe flag access
 * 
 * Usage:
 *   import { getFeatureFlag } from '@whats-for-dinner/utils/guardrails/feature-flags';
 *   
 *   const enabled = await getFeatureFlag('new_meal_planner', userId);
 *   if (enabled) {
 *     // Show new feature
 *   }
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

export interface FeatureFlagConfig {
  /**
   * Supabase client (optional, will use env vars if not provided)
   */
  supabase?: ReturnType<typeof createClient>;

  /**
   * Global kill switch (disables all flags if true)
   */
  killSwitch?: boolean;
}

class FeatureFlagsManager {
  private supabase: ReturnType<typeof createClient> | null = null;
  private killSwitch = false;

  /**
   * Initialize feature flags manager
   */
  initialize(config: FeatureFlagConfig = {}): void {
    if (config.supabase) {
      this.supabase = config.supabase;
    } else if (
      typeof window === 'undefined' &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      // Server-side: use service role key
      const { createClient } = require('@supabase/supabase-js');
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    } else if (
      typeof window !== 'undefined' &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      // Client-side: use anon key
      const { createClient } = require('@supabase/supabase-js');
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
    }

    this.killSwitch =
      config.killSwitch ??
      process.env.EXPERIMENTS_KILL_SWITCH === 'true';
  }

  /**
   * Get feature flag value for a user
   */
  async getFeatureFlag(
    flagName: string,
    userId?: string
  ): Promise<boolean> {
    // Global kill switch
    if (this.killSwitch) {
      logger.debug({ flagName }, `Feature flag ${flagName} disabled by kill switch`);
      return false;
    }

    // Check environment variable override (for testing/debugging)
    const envFlag = process.env[`FEATURE_${flagName.toUpperCase().replace(/-/g, '_')}`];
    if (envFlag !== undefined) {
      return envFlag === 'true' || envFlag === '1';
    }

    // If no user ID, check global flag only
    if (!userId || !this.supabase) {
      return false;
    }

    try {
      // Get user's feature flags from database
      const { data, error } = await this.supabase
        .from('feature_flags')
        .select('flags')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = not found, which is fine (defaults to false)
        logger.warn({ error, flagName, userId }, 'Failed to fetch feature flags');
        return false;
      }

      if (!data) {
        return false;
      }

      // Check if flag is enabled for this user
      const flags = data.flags as Record<string, boolean> | null;
      return flags?.[flagName] === true;
    } catch (error) {
      logger.error({ error, flagName, userId }, 'Error checking feature flag');
      return false;
    }
  }

  /**
   * Set feature flag for a user
   */
  async setFeatureFlag(
    flagName: string,
    enabled: boolean,
    userId: string
  ): Promise<void> {
    if (!this.supabase) {
      throw new Error('Feature flags not initialized');
    }

    try {
      // Upsert feature flag
      const { error } = await this.supabase
        .from('feature_flags')
        .upsert(
          {
            user_id: userId,
            flags: { [flagName]: enabled },
          },
          {
            onConflict: 'user_id',
          }
        )
        .select()
        .single();

      if (error) {
        throw error;
      }

      logger.info({ flagName, enabled, userId }, `Feature flag ${flagName} set to ${enabled}`);
    } catch (error) {
      logger.error({ error, flagName, enabled, userId }, 'Failed to set feature flag');
      throw error;
    }
  }

  /**
   * Get all feature flags for a user
   */
  async getAllFeatureFlags(userId: string): Promise<Record<string, boolean>> {
    if (!userId || !this.supabase) {
      return {};
    }

    try {
      const { data, error } = await this.supabase
        .from('feature_flags')
        .select('flags')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.warn({ error, userId }, 'Failed to fetch feature flags');
        return {};
      }

      return (data?.flags as Record<string, boolean>) || {};
    } catch (error) {
      logger.error({ error, userId }, 'Error fetching feature flags');
      return {};
    }
  }

  /**
   * Check if kill switch is active
   */
  isKillSwitchActive(): boolean {
    return this.killSwitch;
  }
}

// Singleton instance
export const featureFlagsManager = new FeatureFlagsManager();

/**
 * Get feature flag (convenience function)
 */
export async function getFeatureFlag(
  flagName: string,
  userId?: string
): Promise<boolean> {
  return featureFlagsManager.getFeatureFlag(flagName, userId);
}

/**
 * Set feature flag (convenience function)
 */
export async function setFeatureFlag(
  flagName: string,
  enabled: boolean,
  userId: string
): Promise<void> {
  return featureFlagsManager.setFeatureFlag(flagName, enabled, userId);
}

/**
 * Initialize feature flags (call this in app initialization)
 */
export function initializeFeatureFlags(config: FeatureFlagConfig = {}): void {
  featureFlagsManager.initialize(config);
}
