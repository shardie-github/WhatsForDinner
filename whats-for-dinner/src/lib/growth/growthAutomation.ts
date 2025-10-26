/**
 * Product-Led Growth Automation System
 * Implements A/B testing, pricing experiments, referral workflows, and retention optimization
 */

import { createClient } from '../supabaseClient';
import { featureFlags } from '../featureFlags';

export interface GrowthExperiment {
  id: string;
  name: string;
  type: 'pricing' | 'onboarding' | 'feature' | 'referral' | 'retention';
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: ExperimentVariant[];
  metrics: ExperimentMetric[];
  startDate: string;
  endDate?: string;
  targetAudience: TargetAudience;
  successCriteria: SuccessCriteria;
  results?: ExperimentResults;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  weight: number; // 0-100
  config: Record<string, any>;
  isControl: boolean;
}

export interface ExperimentMetric {
  name: string;
  type: 'conversion' | 'revenue' | 'engagement' | 'retention';
  isPrimary: boolean;
  targetValue?: number;
}

export interface TargetAudience {
  userSegments?: string[];
  subscriptionPlans?: string[];
  countries?: string[];
  signupDateRange?: {
    start: string;
    end: string;
  };
  customRules?: Record<string, any>;
}

export interface SuccessCriteria {
  primaryMetric: string;
  minimumImprovement: number; // percentage
  confidenceLevel: number; // 0-1
  minimumSampleSize: number;
}

export interface ExperimentResults {
  totalUsers: number;
  conversionRate: number;
  revenue: number;
  engagement: number;
  retention: number;
  statisticalSignificance: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  variantResults: Array<{
    variantId: string;
    users: number;
    conversionRate: number;
    revenue: number;
    engagement: number;
    retention: number;
  }>;
}

export interface UserJourney {
  userId: string;
  steps: JourneyStep[];
  currentStep: number;
  completedAt?: string;
  conversionValue?: number;
}

export interface JourneyStep {
  id: string;
  name: string;
  type: 'page_view' | 'action' | 'purchase' | 'signup' | 'feature_use';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ReferralProgram {
  id: string;
  name: string;
  isActive: boolean;
  rewardType: 'credit' | 'discount' | 'feature' | 'cash';
  rewardValue: number;
  rewardCurrency?: string;
  maxReferrals?: number;
  expirationDate?: string;
  conditions?: ReferralConditions;
}

export interface ReferralConditions {
  minimumSignupValue?: number;
  requiredActions?: string[];
  excludedPlans?: string[];
  countryRestrictions?: string[];
}

export interface PricingExperiment {
  id: string;
  name: string;
  basePrice: number;
  variants: PricingVariant[];
  targetMetrics: string[];
  isActive: boolean;
}

export interface PricingVariant {
  id: string;
  name: string;
  price: number;
  features: string[];
  weight: number;
  isControl: boolean;
}

class GrowthAutomationSystem {
  private supabase = createClient();
  private activeExperiments: Map<string, GrowthExperiment> = new Map();
  private userJourneys: Map<string, UserJourney> = new Map();

  constructor() {
    this.initializeGrowthExperiments();
  }

  /**
   * Initialize growth experiments
   */
  private initializeGrowthExperiments() {
    // Pricing experiments
    const pricingExperiment: GrowthExperiment = {
      id: 'pricing_optimization_2024',
      name: 'Pricing Optimization 2024',
      type: 'pricing',
      status: 'running',
      variants: [
        {
          id: 'control',
          name: 'Current Pricing',
          weight: 50,
          config: {
            monthlyPrice: 9.99,
            yearlyPrice: 99.99,
            features: ['basic_plan', 'standard_features']
          },
          isControl: true
        },
        {
          id: 'premium_focus',
          name: 'Premium Focus',
          weight: 25,
          config: {
            monthlyPrice: 14.99,
            yearlyPrice: 149.99,
            features: ['premium_plan', 'advanced_features', 'priority_support']
          },
          isControl: false
        },
        {
          id: 'value_focus',
          name: 'Value Focus',
          weight: 25,
          config: {
            monthlyPrice: 7.99,
            yearlyPrice: 79.99,
            features: ['basic_plan', 'standard_features', 'bonus_content']
          },
          isControl: false
        }
      ],
      metrics: [
        { name: 'conversion_rate', type: 'conversion', isPrimary: true, targetValue: 0.15 },
        { name: 'revenue_per_user', type: 'revenue', isPrimary: false, targetValue: 120 },
        { name: 'retention_30d', type: 'retention', isPrimary: false, targetValue: 0.8 }
      ],
      startDate: new Date().toISOString(),
      targetAudience: {
        userSegments: ['new_users'],
        subscriptionPlans: ['free']
      },
      successCriteria: {
        primaryMetric: 'conversion_rate',
        minimumImprovement: 20,
        confidenceLevel: 0.95,
        minimumSampleSize: 1000
      }
    };

    // Onboarding experiments
    const onboardingExperiment: GrowthExperiment = {
      id: 'onboarding_flow_optimization',
      name: 'Onboarding Flow Optimization',
      type: 'onboarding',
      status: 'running',
      variants: [
        {
          id: 'control',
          name: 'Current Flow',
          weight: 50,
          config: {
            steps: ['welcome', 'preferences', 'first_meal', 'tutorial'],
            skipOptions: false
          },
          isControl: true
        },
        {
          id: 'simplified',
          name: 'Simplified Flow',
          weight: 25,
          config: {
            steps: ['welcome', 'first_meal'],
            skipOptions: true
          },
          isControl: false
        },
        {
          id: 'guided',
          name: 'Guided Flow',
          weight: 25,
          config: {
            steps: ['welcome', 'preferences', 'dietary_restrictions', 'first_meal', 'tutorial', 'goal_setting'],
            skipOptions: false,
            tooltips: true
          },
          isControl: false
        }
      ],
      metrics: [
        { name: 'completion_rate', type: 'conversion', isPrimary: true, targetValue: 0.7 },
        { name: 'time_to_first_meal', type: 'engagement', isPrimary: false, targetValue: 300 }
      ],
      startDate: new Date().toISOString(),
      targetAudience: {
        userSegments: ['new_users']
      },
      successCriteria: {
        primaryMetric: 'completion_rate',
        minimumImprovement: 15,
        confidenceLevel: 0.9,
        minimumSampleSize: 500
      }
    };

    this.activeExperiments.set(pricingExperiment.id, pricingExperiment);
    this.activeExperiments.set(onboardingExperiment.id, onboardingExperiment);
  }

  /**
   * Get experiment variant for user
   */
  async getUserExperimentVariant(experimentId: string, userId: string): Promise<string> {
    try {
      const experiment = this.activeExperiments.get(experimentId);
      if (!experiment || experiment.status !== 'running') {
        return 'control';
      }

      // Check if user is already assigned
      const { data: existing } = await this.supabase
        .from('user_experiments')
        .select('variant_id')
        .eq('experiment_id', experimentId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        return existing.variant_id;
      }

      // Assign user to variant based on weight
      const variant = this.selectVariant(experiment.variants, userId);
      
      // Save assignment
      await this.supabase
        .from('user_experiments')
        .insert({
          experiment_id: experimentId,
          user_id: userId,
          variant_id: variant.id,
          assigned_at: new Date().toISOString()
        });

      return variant.id;

    } catch (error) {
      console.error('Error getting experiment variant:', error);
      return 'control';
    }
  }

  /**
   * Select variant based on weights
   */
  private selectVariant(variants: ExperimentVariant[], userId: string): ExperimentVariant {
    const hash = this.hash(`${userId}:${variants[0].id}`);
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
   * Track experiment event
   */
  async trackExperimentEvent(
    experimentId: string,
    userId: string,
    eventName: string,
    value?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.supabase
        .from('experiment_events')
        .insert({
          experiment_id: experimentId,
          user_id: userId,
          event_name: eventName,
          value: value || 0,
          metadata: metadata || {},
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking experiment event:', error);
    }
  }

  /**
   * Get experiment results
   */
  async getExperimentResults(experimentId: string): Promise<ExperimentResults | null> {
    try {
      const experiment = this.activeExperiments.get(experimentId);
      if (!experiment) {
        return null;
      }

      // Get all events for this experiment
      const { data: events } = await this.supabase
        .from('experiment_events')
        .select('*')
        .eq('experiment_id', experimentId);

      if (!events || events.length === 0) {
        return null;
      }

      // Get user assignments
      const { data: assignments } = await this.supabase
        .from('user_experiments')
        .select('*')
        .eq('experiment_id', experimentId);

      // Calculate results
      const results = this.calculateExperimentResults(experiment, events, assignments || []);

      // Update experiment with results
      experiment.results = results;
      this.activeExperiments.set(experimentId, experiment);

      return results;

    } catch (error) {
      console.error('Error getting experiment results:', error);
      return null;
    }
  }

  /**
   * Calculate experiment results
   */
  private calculateExperimentResults(
    experiment: GrowthExperiment,
    events: any[],
    assignments: any[]
  ): ExperimentResults {
    const variantResults = new Map<string, any>();

    // Initialize variant results
    for (const variant of experiment.variants) {
      variantResults.set(variant.id, {
        variantId: variant.id,
        users: 0,
        conversionRate: 0,
        revenue: 0,
        engagement: 0,
        retention: 0
      });
    }

    // Count users per variant
    for (const assignment of assignments) {
      const result = variantResults.get(assignment.variant_id);
      if (result) {
        result.users++;
      }
    }

    // Calculate metrics per variant
    for (const variant of experiment.variants) {
      const variantUsers = assignments.filter(a => a.variant_id === variant.id);
      const variantUserIds = variantUsers.map(u => u.user_id);
      const variantEvents = events.filter(e => variantUserIds.includes(e.user_id));

      const result = variantResults.get(variant.id)!;

      // Calculate conversion rate
      const conversionEvents = variantEvents.filter(e => e.event_name === 'conversion');
      result.conversionRate = result.users > 0 ? conversionEvents.length / result.users : 0;

      // Calculate revenue
      const revenueEvents = variantEvents.filter(e => e.event_name === 'purchase');
      result.revenue = revenueEvents.reduce((sum, e) => sum + (e.value || 0), 0);

      // Calculate engagement (events per user)
      result.engagement = result.users > 0 ? variantEvents.length / result.users : 0;

      // Calculate retention (users who had events in last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentEvents = variantEvents.filter(e => new Date(e.created_at) > sevenDaysAgo);
      const activeUsers = new Set(recentEvents.map(e => e.user_id)).size;
      result.retention = result.users > 0 ? activeUsers / result.users : 0;
    }

    // Calculate overall results
    const totalUsers = assignments.length;
    const totalConversionEvents = events.filter(e => e.event_name === 'conversion').length;
    const totalRevenue = events.filter(e => e.event_name === 'purchase').reduce((sum, e) => sum + (e.value || 0), 0);
    const totalEvents = events.length;

    return {
      totalUsers,
      conversionRate: totalUsers > 0 ? totalConversionEvents / totalUsers : 0,
      revenue: totalRevenue,
      engagement: totalUsers > 0 ? totalEvents / totalUsers : 0,
      retention: 0, // Would need more complex calculation
      statisticalSignificance: this.calculateStatisticalSignificance(experiment, Array.from(variantResults.values())),
      confidenceInterval: {
        lower: 0, // Would need proper calculation
        upper: 0
      },
      variantResults: Array.from(variantResults.values())
    };
  }

  /**
   * Calculate statistical significance
   */
  private calculateStatisticalSignificance(experiment: GrowthExperiment, results: any[]): number {
    // Simplified calculation - in real implementation, use proper statistical tests
    const controlResult = results.find(r => r.variantId === 'control');
    const testResults = results.filter(r => r.variantId !== 'control');

    if (!controlResult || testResults.length === 0) {
      return 0;
    }

    // Calculate p-value using chi-square test (simplified)
    let maxImprovement = 0;
    for (const result of testResults) {
      const improvement = (result.conversionRate - controlResult.conversionRate) / controlResult.conversionRate;
      maxImprovement = Math.max(maxImprovement, improvement);
    }

    // Convert improvement to significance (simplified)
    return Math.min(0.99, Math.max(0.01, maxImprovement * 0.5));
  }

  /**
   * Track user journey step
   */
  async trackJourneyStep(
    userId: string,
    stepName: string,
    stepType: JourneyStep['type'],
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const step: JourneyStep = {
        id: crypto.randomUUID(),
        name: stepName,
        type: stepType,
        timestamp: new Date().toISOString(),
        metadata
      };

      // Get or create user journey
      let journey = this.userJourneys.get(userId);
      if (!journey) {
        journey = {
          userId,
          steps: [],
          currentStep: 0
        };
        this.userJourneys.set(userId, journey);
      }

      journey.steps.push(step);
      journey.currentStep = journey.steps.length;

      // Save to database
      await this.supabase
        .from('user_journeys')
        .upsert({
          user_id: userId,
          steps: journey.steps,
          current_step: journey.currentStep,
          updated_at: new Date().toISOString()
        });

      // Check for journey completion
      await this.checkJourneyCompletion(userId, journey);

    } catch (error) {
      console.error('Error tracking journey step:', error);
    }
  }

  /**
   * Check if journey is completed
   */
  private async checkJourneyCompletion(userId: string, journey: UserJourney): Promise<void> {
    // Define journey completion criteria
    const hasSignup = journey.steps.some(s => s.type === 'signup');
    const hasFirstMeal = journey.steps.some(s => s.name === 'first_meal_created');
    const hasPurchase = journey.steps.some(s => s.type === 'purchase');

    if (hasSignup && hasFirstMeal && !journey.completedAt) {
      journey.completedAt = new Date().toISOString();
      journey.conversionValue = hasPurchase ? 100 : 50; // Mock values

      // Update database
      await this.supabase
        .from('user_journeys')
        .update({
          completed_at: journey.completedAt,
          conversion_value: journey.conversionValue
        })
        .eq('user_id', userId);

      // Track conversion event
      await this.trackExperimentEvent('onboarding_flow_optimization', userId, 'journey_completed', journey.conversionValue);
    }
  }

  /**
   * Create referral program
   */
  async createReferralProgram(program: Omit<ReferralProgram, 'id'>): Promise<string> {
    try {
      const programId = crypto.randomUUID();
      
      await this.supabase
        .from('referral_programs')
        .insert({
          id: programId,
          ...program,
          created_at: new Date().toISOString()
        });

      return programId;
    } catch (error) {
      console.error('Error creating referral program:', error);
      throw error;
    }
  }

  /**
   * Process referral
   */
  async processReferral(
    referrerId: string,
    refereeId: string,
    programId: string
  ): Promise<{ success: boolean; reward?: any }> {
    try {
      const { data: program } = await this.supabase
        .from('referral_programs')
        .select('*')
        .eq('id', programId)
        .eq('is_active', true)
        .single();

      if (!program) {
        return { success: false };
      }

      // Check if referral already exists
      const { data: existing } = await this.supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', referrerId)
        .eq('referee_id', refereeId)
        .single();

      if (existing) {
        return { success: false };
      }

      // Create referral record
      await this.supabase
        .from('referrals')
        .insert({
          referrer_id: referrerId,
          referee_id: refereeId,
          program_id: programId,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      // Grant reward to referrer
      const reward = await this.grantReferralReward(referrerId, program);

      return { success: true, reward };

    } catch (error) {
      console.error('Error processing referral:', error);
      return { success: false };
    }
  }

  /**
   * Grant referral reward
   */
  private async grantReferralReward(userId: string, program: any): Promise<any> {
    const reward = {
      type: program.reward_type,
      value: program.reward_value,
      currency: program.reward_currency,
      granted_at: new Date().toISOString()
    };

    // Save reward to database
    await this.supabase
      .from('user_rewards')
      .insert({
        user_id: userId,
        program_id: program.id,
        reward_type: program.reward_type,
        reward_value: program.reward_value,
        reward_currency: program.reward_currency,
        granted_at: new Date().toISOString()
      });

    return reward;
  }

  /**
   * Get growth analytics
   */
  async getGrowthAnalytics(
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    conversionRate: number;
    revenue: number;
    retention: number;
    experiments: number;
    referrals: number;
  }> {
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const end = endDate || new Date().toISOString();

      // Get user metrics
      const { data: users } = await this.supabase
        .from('users')
        .select('created_at, last_active_at')
        .gte('created_at', start)
        .lte('created_at', end);

      // Get conversion events
      const { data: conversions } = await this.supabase
        .from('experiment_events')
        .select('*')
        .eq('event_name', 'conversion')
        .gte('created_at', start)
        .lte('created_at', end);

      // Get revenue
      const { data: purchases } = await this.supabase
        .from('experiment_events')
        .select('*')
        .eq('event_name', 'purchase')
        .gte('created_at', start)
        .lte('created_at', end);

      // Get active experiments
      const activeExperiments = Array.from(this.activeExperiments.values())
        .filter(e => e.status === 'running').length;

      // Get referrals
      const { data: referrals } = await this.supabase
        .from('referrals')
        .select('*')
        .gte('created_at', start)
        .lte('created_at', end);

      const totalUsers = users?.length || 0;
      const newUsers = users?.filter(u => new Date(u.created_at) >= new Date(start)).length || 0;
      const activeUsers = users?.filter(u => u.last_active_at && new Date(u.last_active_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0;
      const conversionRate = totalUsers > 0 ? (conversions?.length || 0) / totalUsers : 0;
      const revenue = purchases?.reduce((sum, p) => sum + (p.value || 0), 0) || 0;
      const retention = totalUsers > 0 ? activeUsers / totalUsers : 0;

      return {
        totalUsers,
        newUsers,
        activeUsers,
        conversionRate,
        revenue,
        retention,
        experiments: activeExperiments,
        referrals: referrals?.length || 0
      };

    } catch (error) {
      console.error('Error getting growth analytics:', error);
      return {
        totalUsers: 0,
        newUsers: 0,
        activeUsers: 0,
        conversionRate: 0,
        revenue: 0,
        retention: 0,
        experiments: 0,
        referrals: 0
      };
    }
  }

  /**
   * Simple hash function
   */
  private hash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

// Export singleton instance
export const growthAutomation = new GrowthAutomationSystem();