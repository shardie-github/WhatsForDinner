/**
 * Feature Flags Middleware
 * 
 * Reads feature flags from /featureflags/flags.json and provides helper functions.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface FeatureFlag {
  enabled: boolean;
  rollout_percentage: number;
  description: string;
  owner: string;
  experiment: string | null;
}

interface FlagsConfig {
  [key: string]: FeatureFlag;
}

let flagsCache: FlagsConfig | null = null;

function loadFlags(): FlagsConfig {
  if (flagsCache) return flagsCache;

  try {
    const flagsPath = process.env.FEATURE_FLAGS_PATH || join(process.cwd(), 'featureflags', 'flags.json');
    const flagsJson = readFileSync(flagsPath, 'utf-8');
    flagsCache = JSON.parse(flagsJson);
    return flagsCache!;
  } catch (error) {
    console.warn('Failed to load feature flags:', error);
    return {};
  }
}

/**
 * Check if a feature flag is enabled for a user
 */
export function isFlagEnabled(flagName: string, userId?: string): boolean {
  const flags = loadFlags();
  const flag = flags[flagName];

  if (!flag) return false;
  if (!flag.enabled) return false;

  // If rollout_percentage is 100, enable for all
  if (flag.rollout_percentage >= 100) return true;

  // If no userId, use random (for anonymous users)
  if (!userId) {
    return Math.random() * 100 < flag.rollout_percentage;
  }

  // Use userId hash for consistent rollout
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (hash % 100) < flag.rollout_percentage;
}

/**
 * Get all enabled flags for a user
 */
export function getEnabledFlags(userId?: string): string[] {
  const flags = loadFlags();
  return Object.keys(flags).filter((flagName) => isFlagEnabled(flagName, userId));
}

/**
 * Get flag metadata
 */
export function getFlagMetadata(flagName: string): FeatureFlag | null {
  const flags = loadFlags();
  return flags[flagName] || null;
}

/**
 * Reload flags (useful for testing or hot-reload)
 */
export function reloadFlags(): void {
  flagsCache = null;
}
