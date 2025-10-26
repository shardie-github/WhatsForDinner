/**
 * Feature Flags & Experimentation System
 * Provides A/B testing, feature toggles, and gradual rollouts
 */

import { createClient } from './supabaseClient';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  variants: FeatureFlagVariant[];
  targeting: FeatureFlagTargeting;
  experiment?: ExperimentConfig;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlagVariant {
  id: string;
  name: string;
  value: any;
  weight: number; // 0-100, percentage of users who get this variant
  config?: Record<string, any>;
}

export interface FeatureFlagTargeting {
  userIds?: string[];
  userSegments?: string[];
  countries?: string[];
  platforms?: string[];
  subscriptionPlans?: string[];
  customRules?: TargetingRule[];
}

export interface TargetingRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  metrics: string[];
  hypothesis: string;
  successCriteria: ExperimentSuccessCriteria;
}

export interface ExperimentSuccessCriteria {
  primaryMetric: string;
  targetImprovement: number; // percentage
  minimumSampleSize: number;
  confidenceLevel: number; // 0-1
}

export interface UserContext {
  userId?: string;
  sessionId?: string;
  country?: string;
  platform?: string;
  subscriptionPlan?: string;
  userSegments?: string[];
  customAttributes?: Record<string, any>;
}

class FeatureFlagManager {
  private cache: Map<string, FeatureFlag> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get feature flag value for a user
   */
  async getFlag(flagName: string, userContext: UserContext): Promise<any> {
    try {
      const flag = await this.getFlagConfig(flagName);
      if (!flag) {
        return null;
      }

      // Check if flag is enabled
      if (!flag.enabled) {
        return false;
      }

      // Check targeting rules
      if (!this.matchesTargeting(flag.targeting, userContext)) {
        return false;
      }

      // Check rollout percentage
      if (!this.shouldRollout(flag, userContext)) {
        return false;
      }

      // Return variant value
      const variant = this.selectVariant(flag.variants, userContext);
      return variant?.value || true;

    } catch (error) {
      console.error('Error getting feature flag:', error);
      return null;
    }
  }

  /**
   * Get feature flag configuration
   */
  private async getFlagConfig(flagName: string): Promise<FeatureFlag | null> {
    const cacheKey = `flag:${flagName}`;
    const now = Date.now();

    // Check cache first
    if (this.cache.has(cacheKey) && this.cacheExpiry.get(cacheKey)! > now) {
      return this.cache.get(cacheKey)!;
    }

    // Fetch from database
    const supabase = createClient();
    const { data: flag, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('name', flagName)
      .eq('enabled', true)
      .single();

    if (error || !flag) {
      return null;
    }

    // Cache the result
    this.cache.set(cacheKey, flag);
    this.cacheExpiry.set(cacheKey, now + this.CACHE_TTL);

    return flag;
  }

  /**
   * Check if user matches targeting rules
   */
  private matchesTargeting(targeting: FeatureFlagTargeting, userContext: UserContext): boolean {
    // Check user ID targeting
    if (targeting.userIds && userContext.userId) {
      if (!targeting.userIds.includes(userContext.userId)) {
        return false;
      }
    }

    // Check user segments
    if (targeting.userSegments && userContext.userSegments) {
      const hasMatchingSegment = targeting.userSegments.some(segment =>
        userContext.userSegments!.includes(segment)
      );
      if (!hasMatchingSegment) {
        return false;
      }
    }

    // Check country targeting
    if (targeting.countries && userContext.country) {
      if (!targeting.countries.includes(userContext.country)) {
        return false;
      }
    }

    // Check platform targeting
    if (targeting.platforms && userContext.platform) {
      if (!targeting.platforms.includes(userContext.platform)) {
        return false;
      }
    }

    // Check subscription plan targeting
    if (targeting.subscriptionPlans && userContext.subscriptionPlan) {
      if (!targeting.subscriptionPlans.includes(userContext.subscriptionPlan)) {
        return false;
      }
    }

    // Check custom rules
    if (targeting.customRules) {
      for (const rule of targeting.customRules) {
        if (!this.evaluateRule(rule, userContext)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Evaluate a custom targeting rule
   */
  private evaluateRule(rule: TargetingRule, userContext: UserContext): boolean {
    const fieldValue = this.getNestedValue(userContext, rule.field);
    
    switch (rule.operator) {
      case 'equals':
        return fieldValue === rule.value;
      case 'not_equals':
        return fieldValue !== rule.value;
      case 'contains':
        return String(fieldValue).includes(String(rule.value));
      case 'not_contains':
        return !String(fieldValue).includes(String(rule.value));
      case 'greater_than':
        return Number(fieldValue) > Number(rule.value);
      case 'less_than':
        return Number(fieldValue) < Number(rule.value);
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(rule.value) && !rule.value.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Check if user should be included in rollout
   */
  private shouldRollout(flag: FeatureFlag, userContext: UserContext): boolean {
    if (flag.rolloutPercentage >= 100) {
      return true;
    }

    // Use consistent hashing based on user ID and flag name
    const hash = this.hash(`${userContext.userId || 'anonymous'}:${flag.name}`);
    return (hash % 100) < flag.rolloutPercentage;
  }

  /**
   * Select variant based on weights and user context
   */
  private selectVariant(variants: FeatureFlagVariant[], userContext: UserContext): FeatureFlagVariant | null {
    if (variants.length === 0) {
      return null;
    }

    if (variants.length === 1) {
      return variants[0];
    }

    // Use consistent hashing for variant selection
    const hash = this.hash(`${userContext.userId || 'anonymous'}:${variants[0].id}`);
    const random = hash % 100;

    let cumulativeWeight = 0;
    for (const variant of variants) {
      cumulativeWeight += variant.weight;
      if (random < cumulativeWeight) {
        return variant;
      }
    }

    return variants[variants.length - 1];
  }

  /**
   * Simple hash function for consistent user assignment
   */
  private hash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Track experiment event
   */
  async trackEvent(experimentId: string, eventName: string, userContext: UserContext, properties?: Record<string, any>) {
    try {
      const supabase = createClient();
      
      await supabase
        .from('experiment_events')
        .insert([
          {
            experiment_id: experimentId,
            event_name: eventName,
            user_id: userContext.userId,
            session_id: userContext.sessionId,
            properties: properties || {},
            created_at: new Date().toISOString(),
          },
        ]);
    } catch (error) {
      console.error('Error tracking experiment event:', error);
    }
  }

  /**
   * Get experiment results
   */
  async getExperimentResults(experimentId: string): Promise<any> {
    try {
      const supabase = createClient();
      
      const { data: events, error } = await supabase
        .from('experiment_events')
        .select('*')
        .eq('experiment_id', experimentId);

      if (error) {
        throw error;
      }

      // Group events by variant and calculate metrics
      const results = this.calculateExperimentResults(events);
      return results;

    } catch (error) {
      console.error('Error getting experiment results:', error);
      return null;
    }
  }

  /**
   * Calculate experiment results from events
   */
  private calculateExperimentResults(events: any[]): any {
    const variants = new Map<string, any>();
    
    for (const event of events) {
      const variant = event.properties?.variant || 'control';
      if (!variants.has(variant)) {
        variants.set(variant, {
          variant,
          events: [],
          uniqueUsers: new Set(),
          totalEvents: 0,
        });
      }
      
      const variantData = variants.get(variant);
      variantData.events.push(event);
      variantData.uniqueUsers.add(event.user_id);
      variantData.totalEvents++;
    }

    // Calculate metrics for each variant
    const results = Array.from(variants.values()).map(variant => ({
      variant: variant.variant,
      uniqueUsers: variant.uniqueUsers.size,
      totalEvents: variant.totalEvents,
      conversionRate: variant.totalEvents / variant.uniqueUsers.size,
      events: variant.events,
    }));

    return results;
  }

  /**
   * Create a new feature flag
   */
  async createFlag(flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('feature_flags')
        .insert([
          {
            ...flag,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Clear cache
      this.cache.clear();
      this.cacheExpiry.clear();

      return data.id;

    } catch (error) {
      console.error('Error creating feature flag:', error);
      throw error;
    }
  }

  /**
   * Update feature flag
   */
  async updateFlag(flagId: string, updates: Partial<FeatureFlag>): Promise<void> {
    try {
      const supabase = createClient();
      
      await supabase
        .from('feature_flags')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', flagId);

      // Clear cache
      this.cache.clear();
      this.cacheExpiry.clear();

    } catch (error) {
      console.error('Error updating feature flag:', error);
      throw error;
    }
  }

  /**
   * Delete feature flag
   */
  async deleteFlag(flagId: string): Promise<void> {
    try {
      const supabase = createClient();
      
      await supabase
        .from('feature_flags')
        .delete()
        .eq('id', flagId);

      // Clear cache
      this.cache.clear();
      this.cacheExpiry.clear();

    } catch (error) {
      console.error('Error deleting feature flag:', error);
      throw error;
    }
  }

  /**
   * Get all feature flags
   */
  async getAllFlags(): Promise<FeatureFlag[]> {
    try {
      const supabase = createClient();
      
      const { data: flags, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return flags || [];

    } catch (error) {
      console.error('Error getting feature flags:', error);
      return [];
    }
  }
}

// Export singleton instance
export const featureFlags = new FeatureFlagManager();

// React hook for using feature flags
export function useFeatureFlag(flagName: string, userContext: UserContext) {
  const [flagValue, setFlagValue] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    featureFlags.getFlag(flagName, userContext).then(value => {
      setFlagValue(value);
      setLoading(false);
    });
  }, [flagName, userContext.userId, userContext.sessionId]);

  return { flagValue, loading };
}

// Utility function for A/B testing
export async function runABTest(
  testName: string,
  variants: string[],
  userContext: UserContext
): Promise<string> {
  const flag = await featureFlags.getFlag(testName, userContext);
  return flag || variants[0];
}