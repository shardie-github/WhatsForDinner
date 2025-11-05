// [STAKE+TRUST:BEGIN:feature_flags_util]
/**
 * Trust Feature Flags Utility
 * Reads trust feature flags from config/flags.trust.json
 * Supports environment-based and rollout-based flag evaluation
 */

import trustFlags from '@/config/flags.trust.json';

type Environment = 'development' | 'staging' | 'canary' | 'production';

interface TrustFlags {
  [key: string]: {
    description: string;
    environments: {
      [key in Environment]: boolean;
    };
    rollout: {
      strategy: 'percentage' | 'user-list';
      percentage: number;
      targetUsers: string[];
      startDate: string | null;
      endDate: string | null;
    };
  };
}

const flags = trustFlags.flags as TrustFlags;

/**
 * Get current environment based on NODE_ENV and VERCEL_ENV
 */
function getCurrentEnvironment(): Environment {
  if (typeof process !== 'undefined') {
    const vercelEnv = process.env.VERCEL_ENV;
    if (vercelEnv === 'production') return 'production';
    if (vercelEnv === 'preview') return 'staging';
    if (vercelEnv === 'development') return 'development';
    
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === 'production') return 'production';
    if (nodeEnv === 'development') return 'development';
  }
  
  // Default to development for safety
  return 'development';
}

/**
 * Check if a trust feature flag is enabled
 * @param flagName - Name of the flag to check
 * @param userId - Optional user ID for user-specific flags
 * @returns true if flag is enabled, false otherwise
 */
export function isTrustFlagEnabled(
  flagName: keyof TrustFlags,
  userId?: string
): boolean {
  const flag = flags[flagName];
  
  if (!flag) {
    // Flag doesn't exist, return fallback value
    return trustFlags.config.fallbackValue as boolean;
  }

  const env = getCurrentEnvironment();
  
  // Check environment-level enablement
  if (!flag.environments[env]) {
    return false;
  }

  // Check rollout strategy
  const { rollout } = flag;

  // Check date range
  const now = new Date();
  if (rollout.startDate && new Date(rollout.startDate) > now) {
    return false;
  }
  if (rollout.endDate && new Date(rollout.endDate) < now) {
    return false;
  }

  // Check rollout strategy
  if (rollout.strategy === 'user-list') {
    if (!userId) return false;
    return rollout.targetUsers.includes(userId);
  }

  if (rollout.strategy === 'percentage') {
    // For percentage-based rollout, we'd need a deterministic way to assign users
    // For now, we'll use a simple hash-based approach
    if (!userId) {
      // If no user ID, check if percentage is 100%
      return rollout.percentage === 100;
    }
    
    // Simple hash-based assignment (deterministic)
    const hash = hashString(userId + flagName);
    const assignment = hash % 100;
    return assignment < rollout.percentage;
  }

  return true;
}

/**
 * Simple hash function for deterministic user assignment
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get all enabled trust flags for a user
 */
export function getEnabledTrustFlags(userId?: string): string[] {
  return Object.keys(flags).filter((flagName) =>
    isTrustFlagEnabled(flagName as keyof TrustFlags, userId)
  );
}

/**
 * Server-side flag check (for API routes and server components)
 */
export function getTrustFlag(flagName: keyof TrustFlags): boolean {
  return isTrustFlagEnabled(flagName);
}

/**
 * Client-side flag check (for client components)
 * Note: This should be called with user context if available
 */
export function useTrustFlag(flagName: keyof TrustFlags, userId?: string): boolean {
  if (typeof window === 'undefined') {
    // Server-side, use environment-based check
    return isTrustFlagEnabled(flagName);
  }
  
  // Client-side, try to get user ID from localStorage or session
  const clientUserId = userId || (typeof window !== 'undefined' ? localStorage.getItem('userId') || undefined : undefined);
  return isTrustFlagEnabled(flagName, clientUserId);
}
// [STAKE+TRUST:END:feature_flags_util]
