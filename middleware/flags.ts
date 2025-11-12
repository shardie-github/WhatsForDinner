/**
 * Feature Flags Middleware
 * 
 * Simple feature flag handler for A/B testing and gradual rollouts.
 * Reads flags from /featureflags/flags.json
 * 
 * Usage:
 *   import { getFlag, isEnabled } from '@/middleware/flags';
 *   
 *   if (isEnabled('prefill_onboarding', userId)) {
 *     // Show pre-filled onboarding
 *   }
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface FlagConfig {
  enabled: boolean;
  rollout_percentage: number;
  description?: string;
  owner?: string;
  experiment?: string;
}

type FlagsConfig = Record<string, FlagConfig>;

let flagsCache: FlagsConfig | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

function loadFlags(): FlagsConfig {
  const now = Date.now();
  
  // Return cached flags if still valid
  if (flagsCache && now - cacheTimestamp < CACHE_TTL) {
    return flagsCache;
  }

  try {
    const flagsPath = path.join(process.cwd(), 'featureflags', 'flags.json');
    const flagsData = fs.readFileSync(flagsPath, 'utf-8');
    flagsCache = JSON.parse(flagsData);
    cacheTimestamp = now;
    return flagsCache!;
  } catch (error) {
    console.error('Error loading feature flags:', error);
    return {};
  }
}

/**
 * Get feature flag configuration
 */
export function getFlag(flagName: string): FlagConfig | null {
  const flags = loadFlags();
  return flags[flagName] || null;
}

/**
 * Check if feature flag is enabled for a specific user
 * Uses consistent hashing to ensure same user always gets same treatment
 */
export function isEnabled(flagName: string, userId?: string | null): boolean {
  const flag = getFlag(flagName);
  
  if (!flag) {
    return false;
  }

  if (!flag.enabled) {
    return false;
  }

  // If rollout is 100%, everyone gets it
  if (flag.rollout_percentage >= 100) {
    return true;
  }

  // If no userId provided, use random (for anonymous users)
  if (!userId) {
    return Math.random() * 100 < flag.rollout_percentage;
  }

  // Use consistent hashing to ensure same user always gets same treatment
  const hash = crypto
    .createHash('md5')
    .update(`${flagName}:${userId}`)
    .digest('hex');
  
  const hashValue = parseInt(hash.substring(0, 8), 16);
  const bucket = hashValue % 100;
  
  return bucket < flag.rollout_percentage;
}

/**
 * Get experiment assignment for a user
 * Returns experiment name if flag is part of an experiment and user is in treatment
 */
export function getExperimentAssignment(
  flagName: string,
  userId?: string | null
): string | null {
  const flag = getFlag(flagName);
  
  if (!flag || !flag.experiment) {
    return null;
  }

  if (isEnabled(flagName, userId)) {
    return flag.experiment;
  }

  return null;
}

/**
 * Check if user is in control or treatment group for an experiment
 */
export function getExperimentGroup(
  flagName: string,
  userId?: string | null
): 'control' | 'treatment' | null {
  const flag = getFlag(flagName);
  
  if (!flag || !flag.experiment) {
    return null;
  }

  return isEnabled(flagName, userId) ? 'treatment' : 'control';
}

/**
 * Reload flags from disk (useful for testing or manual updates)
 */
export function reloadFlags(): void {
  flagsCache = null;
  cacheTimestamp = 0;
}

// Export default for convenience
export default {
  getFlag,
  isEnabled,
  getExperimentAssignment,
  getExperimentGroup,
  reloadFlags,
};
