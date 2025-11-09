/**
 * Feature Flag Middleware
 * 
 * Handles feature flag evaluation and experiment assignment for growth experiments.
 * Integrates with Supabase experiments table and feature flag service.
 * 
 * Usage:
 *   import { getFeatureFlag, getExperimentVariant } from '@/middleware/flags';
 *   
 *   const variant = await getExperimentVariant('onboarding_conversion_optimization', userId);
 *   if (variant === 'treatment') {
 *     // Show optimized onboarding flow
 *   }
 */

import { createClient } from '@supabase/supabase-js';

interface FeatureFlag {
  key: string;
  name: string;
  enabled: boolean;
  variants: Array<{
    key: string;
    name: string;
    allocation: number;
  }>;
  experiment_slug?: string;
}

interface ExperimentAssignment {
  experiment_slug: string;
  variant: string;
  assigned_at: Date;
}

/**
 * Get feature flag configuration
 */
export async function getFeatureFlag(
  flagKey: string,
  supabaseUrl?: string,
  supabaseKey?: string
): Promise<FeatureFlag | null> {
  // Option 1: Load from local flags.json (for development)
  try {
    const flags = require('../featureflags/flags.json');
    const flag = flags.flags.find((f: FeatureFlag) => f.key === flagKey);
    if (flag) {
      return flag;
    }
  } catch (error) {
    // Fallback to Supabase if local file not found
  }
  
  // Option 2: Load from Supabase experiments table (for production)
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('slug', flagKey)
        .single();
      
      if (error || !data) {
        return null;
      }
      
      // Transform Supabase experiment to feature flag format
      return {
        key: data.slug,
        name: data.name,
        enabled: data.status === 'running',
        variants: [
          { key: 'control', name: data.variant_a_name, allocation: 100 - data.allocation_pct },
          { key: 'treatment', name: data.variant_b_name, allocation: data.allocation_pct },
        ],
        experiment_slug: data.slug,
      };
    } catch (error) {
      console.error('Error fetching feature flag from Supabase:', error);
      return null;
    }
  }
  
  return null;
}

/**
 * Get experiment variant assignment for a user
 * Uses consistent hashing to ensure same user gets same variant
 */
export async function getExperimentVariant(
  flagKey: string,
  userId: string | null,
  supabaseUrl?: string,
  supabaseKey?: string
): Promise<string> {
  const flag = await getFeatureFlag(flagKey, supabaseUrl, supabaseKey);
  
  if (!flag || !flag.enabled) {
    return 'control'; // Default to control if flag disabled or not found
  }
  
  // If no user ID, use random assignment (for anonymous users)
  if (!userId) {
    return Math.random() < flag.variants[1].allocation / 100 ? 'treatment' : 'control';
  }
  
  // Use consistent hashing based on user ID and flag key
  const hash = simpleHash(userId + flagKey);
  const hashValue = hash % 100;
  
  // Assign based on allocation percentages
  const treatmentAllocation = flag.variants.find(v => v.key === 'treatment')?.allocation || 0;
  
  if (hashValue < treatmentAllocation) {
    return 'treatment';
  } else {
    return 'control';
  }
}

/**
 * Simple hash function for consistent assignment
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Check if feature flag is enabled
 */
export async function isFeatureEnabled(
  flagKey: string,
  supabaseUrl?: string,
  supabaseKey?: string
): Promise<boolean> {
  const flag = await getFeatureFlag(flagKey, supabaseUrl, supabaseKey);
  return flag?.enabled || false;
}

/**
 * Log experiment assignment to Supabase (for analytics)
 */
export async function logExperimentAssignment(
  experimentSlug: string,
  userId: string | null,
  variant: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<void> {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Log as event
    await supabase.from('events').insert({
      event_type: 'experiment',
      event_name: 'experiment_assignment',
      user_id: userId,
      properties: {
        experiment_slug: experimentSlug,
        variant: variant,
      },
      source: 'web',
    });
  } catch (error) {
    console.error('Error logging experiment assignment:', error);
    // Don't throw - logging failure shouldn't break user experience
  }
}

/**
 * Example usage in Next.js middleware or API route
 */
export async function exampleUsage(userId: string | null) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Get variant assignment
  const variant = await getExperimentVariant(
    'onboarding_conversion_optimization',
    userId,
    supabaseUrl,
    supabaseKey
  );
  
  // Log assignment
  if (supabaseUrl && supabaseKey) {
    await logExperimentAssignment(
      'onboarding_conversion_optimization',
      userId,
      variant,
      supabaseUrl,
      supabaseKey
    );
  }
  
  return variant;
}

export { FeatureFlag, ExperimentAssignment };
