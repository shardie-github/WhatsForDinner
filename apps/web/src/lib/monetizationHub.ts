/**
 * Monetization Hub
 * Comprehensive monetization strategies: short-term, medium-term, long-term
 */

import { supabase } from './supabaseClient';
import { StripeService } from './stripe';
import { GrowthAnalytics } from './growthAnalytics';
import { analytics } from './analytics';

export interface MonetizationStrategy {
  id: string;
  name: string;
  type: 'short_term' | 'medium_term' | 'long_term';
  description: string;
  implementation_priority: number;
  estimated_revenue_impact: number;
  estimated_time_to_implement: string;
  status: 'planned' | 'in_progress' | 'live' | 'paused';
}

export interface UpsellOpportunity {
  user_id: string;
  current_plan: string;
  recommended_plan: string;
  trigger: 'usage_limit' | 'feature_request' | 'engagement_high' | 'seasonal';
  urgency: 'low' | 'medium' | 'high';
  estimated_value: number;
  personalization_data: Record<string, any>;
}

export interface RevenueForecast {
  period: string;
  forecasted_revenue: number;
  confidence: number;
  breakdown: {
    subscriptions: number;
    usage_based: number;
    marketplace: number;
    partnerships: number;
    advertising: number;
  };
}

export class MonetizationHub {
  /**
   * SHORT-TERM MONETIZATION STRATEGIES (0-3 months)
   */
  
  /**
   * 1. Freemium Upsells - Smart in-app prompts
   */
  static async identifyUpsellOpportunities(
    userId: string,
    tenantId: string
  ): Promise<UpsellOpportunity[]> {
    try {
      const opportunities: UpsellOpportunity[] = [];

      // Get user usage data
      const { data: usage } = await supabase
        .from('tenant_usage')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      const { data: tenant } = await supabase
        .from('tenants')
        .select('plan')
        .eq('id', tenantId)
        .single();

      const currentPlan = tenant?.plan || 'free';

      // Strategy 1: Usage limit reached
      if (currentPlan === 'free' && usage && usage.total_meals_today >= usage.plan_quota) {
        opportunities.push({
          user_id: userId,
          current_plan: currentPlan,
          recommended_plan: 'pro',
          trigger: 'usage_limit',
          urgency: 'high',
          estimated_value: 9.99,
          personalization_data: {
            usage: usage.total_meals_today,
            limit: usage.plan_quota,
            message: `You've used all ${usage.plan_quota} free recipes today. Upgrade to Pro for unlimited recipes!`,
          },
        });
      }

      // Strategy 2: High engagement but still free
      if (currentPlan === 'free' && usage && usage.total_meals_today >= 7) {
        opportunities.push({
          user_id: userId,
          current_plan: currentPlan,
          recommended_plan: 'pro',
          trigger: 'engagement_high',
          urgency: 'medium',
          estimated_value: 9.99,
          personalization_data: {
            usage: usage.total_meals_today,
            message: 'You love our recipes! Upgrade to Pro for advanced features.',
          },
        });
      }

      // Strategy 3: Feature request during usage
      // This would be triggered when user tries to access a premium feature
      
      return opportunities;
    } catch (error) {
      console.error('Error identifying upsell opportunities:', error);
      return [];
    }
  }

  /**
   * 2. Pay-per-use credits for overage
   */
  static async offerUsageCredits(
    userId: string,
    tenantId: string,
    creditsNeeded: number
  ): Promise<{ checkoutUrl: string; priceId: string } | null> {
    try {
      const pricePerCredit = 0.10; // $0.10 per recipe
      const creditsToPurchase = Math.max(creditsNeeded, 10); // Minimum 10 credits
      const totalPrice = creditsToPurchase * pricePerCredit;

      // Create Stripe checkout session
      const checkoutSession = await StripeService.createCheckoutSession({
        customerId: userId,
        price: totalPrice,
        currency: 'usd',
        metadata: {
          type: 'usage_credits',
          credits: creditsToPurchase,
          tenant_id: tenantId,
        },
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/credits?success=true`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/credits?canceled=true`,
      });

      // Track opportunity
      await analytics.trackEvent('usage_credits_offered', {
        user_id: userId,
        credits_needed: creditsNeeded,
        credits_offered: creditsToPurchase,
        price: totalPrice,
      });

      return {
        checkoutUrl: checkoutSession.url || '',
        priceId: checkoutSession.id,
      };
    } catch (error) {
      console.error('Error offering usage credits:', error);
      return null;
    }
  }

  /**
   * 3. Annual subscription discount
   */
  static async offerAnnualSubscription(
    userId: string,
    currentPlan: string
  ): Promise<{ checkoutUrl: string; savings: number } | null> {
    try {
      if (currentPlan === 'premium') {
        const monthlyPrice = 19.99;
        const annualPrice = monthlyPrice * 10; // 2 months free (16.7% discount)
        const savings = monthlyPrice * 12 - annualPrice;

        const checkoutSession = await StripeService.createCheckoutSession({
          customerId: userId,
          price: annualPrice,
          currency: 'usd',
          billingPeriod: 'year',
          metadata: {
            type: 'annual_subscription',
            plan: 'premium_annual',
          },
          successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?annual=true`,
          cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        });

        return {
          checkoutUrl: checkoutSession.url || '',
          savings,
        };
      }

      return null;
    } catch (error) {
      console.error('Error offering annual subscription:', error);
      return null;
    }
  }

  /**
   * MEDIUM-TERM MONETIZATION STRATEGIES (3-6 months)
   */

  /**
   * 4. Usage-based tiered pricing
   */
  static async calculateUsageBasedPricing(
    tenantId: string,
    usageStats: {
      recipes_generated: number;
      api_calls: number;
      storage_gb: number;
    }
  ): Promise<{
    recommended_tier: string;
    current_cost: number;
    tiered_cost: number;
    savings: number;
  }> {
    const tiers = [
      { name: 'starter', price: 0, limit: 100 },
      { name: 'growth', price: 29.99, limit: 1000 },
      { name: 'scale', price: 99.99, limit: 10000 },
      { name: 'enterprise', price: 299.99, limit: Infinity },
    ];

    const totalUsage = usageStats.recipes_generated + usageStats.api_calls;
    
    let recommendedTier = tiers[0];
    for (const tier of tiers) {
      if (totalUsage <= tier.limit) {
        recommendedTier = tier;
        break;
      }
    }

    // Calculate overage pricing
    const overage = Math.max(0, totalUsage - recommendedTier.limit);
    const overageCost = overage * 0.05; // $0.05 per overage unit
    const tieredCost = recommendedTier.price + overageCost;

    // Current cost (assuming pro plan)
    const currentCost = 9.99;

    return {
      recommended_tier: recommendedTier.name,
      current_cost: currentCost,
      tiered_cost: tieredCost,
      savings: currentCost - tieredCost,
    };
  }

  /**
   * 5. Feature marketplace (premium recipe packs, meal plans)
   */
  static async getMarketplaceItems(
    category?: string
  ): Promise<Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    purchase_count: number;
    rating: number;
  }>> {
    try {
      const { data: items, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('status', 'active')
        .order('purchase_count', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching marketplace items:', error);
        return [];
      }

      return (items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        purchase_count: item.purchase_count || 0,
        rating: item.rating || 0,
      }));
    } catch (error) {
      console.error('Error getting marketplace items:', error);
      return [];
    }
  }

  /**
   * 6. Affiliate/partner revenue sharing
   */
  static async trackAffiliateConversion(
    userId: string,
    affiliateId: string,
    conversionValue: number
  ): Promise<void> {
    try {
      // Track conversion
      await supabase.from('affiliate_conversions').insert({
        user_id: userId,
        affiliate_id: affiliateId,
        conversion_value: conversionValue,
        commission_rate: 0.20, // 20% commission
        commission_amount: conversionValue * 0.20,
        timestamp: new Date().toISOString(),
      });

      // Update affiliate stats
      await supabase.rpc('update_affiliate_stats', {
        affiliate_id_param: affiliateId,
        conversion_value_param: conversionValue,
      });

      // Track analytics
      await analytics.trackEvent('affiliate_conversion', {
        user_id: userId,
        affiliate_id: affiliateId,
        conversion_value: conversionValue,
      });
    } catch (error) {
      console.error('Error tracking affiliate conversion:', error);
    }
  }

  /**
   * LONG-TERM MONETIZATION STRATEGIES (6+ months)
   */

  /**
   * 7. Enterprise/B2B offerings
   */
  static async createEnterpriseQuote(
    companyName: string,
    contactEmail: string,
    requirements: {
      users: number;
      recipes_per_month: number;
      custom_features: string[];
      support_level: 'standard' | 'priority' | 'dedicated';
    }
  ): Promise<{ quoteId: string; estimatedAnnualValue: number }> {
    try {
      // Calculate enterprise pricing
      const basePrice = 999; // Monthly base
      const perUserPrice = 10;
      const customFeaturesMultiplier = 1 + (requirements.custom_features.length * 0.1);
      const supportMultiplier = requirements.support_level === 'dedicated' ? 1.5 
        : requirements.support_level === 'priority' ? 1.2 : 1.0;

      const monthlyPrice = (basePrice + (requirements.users * perUserPrice)) 
        * customFeaturesMultiplier 
        * supportMultiplier;
      const annualValue = monthlyPrice * 12;

      // Store quote
      const { data: quote, error } = await supabase
        .from('enterprise_quotes')
        .insert({
          company_name: companyName,
          contact_email: contactEmail,
          requirements,
          estimated_monthly_price: monthlyPrice,
          estimated_annual_value: annualValue,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return {
        quoteId: quote.id,
        estimatedAnnualValue: annualValue,
      };
    } catch (error) {
      console.error('Error creating enterprise quote:', error);
      throw error;
    }
  }

  /**
   * 8. Data/analytics licensing
   */
  static async offerDataLicensing(
    dataType: 'recipe_trends' | 'user_preferences' | 'market_insights',
    licensePeriod: 'monthly' | 'annual'
  ): Promise<{ licenseId: string; price: number }> {
    try {
      const pricing = {
        recipe_trends: { monthly: 499, annual: 4999 },
        user_preferences: { monthly: 799, annual: 7999 },
        market_insights: { monthly: 1299, annual: 12999 },
      };

      const price = pricing[dataType][licensePeriod];

      const { data: license, error } = await supabase
        .from('data_licenses')
        .insert({
          data_type: dataType,
          license_period: licensePeriod,
          price,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return {
        licenseId: license.id,
        price,
      };
    } catch (error) {
      console.error('Error offering data licensing:', error);
      throw error;
    }
  }

  /**
   * Revenue forecasting
   */
  static async forecastRevenue(
    tenantId: string,
    period: '1m' | '3m' | '6m' | '1y'
  ): Promise<RevenueForecast> {
    try {
      // Get historical revenue data
      const { data: historical } = await supabase
        .from('revenue_records')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('period_start', { ascending: false })
        .limit(12);

      // Simple trend analysis
      const avgMonthlyRevenue = historical
        ? historical.reduce((sum, r) => sum + (r.amount || 0), 0) / historical.length
        : 0;

      const growthRate = 0.15; // 15% month-over-month growth (conservative)

      const months = period === '1m' ? 1 : period === '3m' ? 3 : period === '6m' ? 6 : 12;
      const forecastedRevenue = avgMonthlyRevenue * months * (1 + growthRate);

      // Breakdown estimates (based on current mix + trends)
      const breakdown = {
        subscriptions: forecastedRevenue * 0.60,
        usage_based: forecastedRevenue * 0.20,
        marketplace: forecastedRevenue * 0.10,
        partnerships: forecastedRevenue * 0.05,
        advertising: forecastedRevenue * 0.05,
      };

      return {
        period,
        forecasted_revenue: forecastedRevenue,
        confidence: historical && historical.length > 6 ? 0.85 : 0.60,
        breakdown,
      };
    } catch (error) {
      console.error('Error forecasting revenue:', error);
      throw error;
    }
  }

  /**
   * Get all monetization strategies
   */
  static async getMonetizationStrategies(): Promise<MonetizationStrategy[]> {
    return [
      {
        id: '1',
        name: 'Freemium Upsells',
        type: 'short_term',
        description: 'Smart in-app prompts for plan upgrades',
        implementation_priority: 1,
        estimated_revenue_impact: 15000,
        estimated_time_to_implement: '2 weeks',
        status: 'live',
      },
      {
        id: '2',
        name: 'Pay-per-use Credits',
        type: 'short_term',
        description: 'Allow users to purchase recipe credits',
        implementation_priority: 2,
        estimated_revenue_impact: 8000,
        estimated_time_to_implement: '3 weeks',
        status: 'in_progress',
      },
      {
        id: '3',
        name: 'Annual Subscriptions',
        type: 'short_term',
        description: 'Offer annual plans with 2 months free',
        implementation_priority: 3,
        estimated_revenue_impact: 25000,
        estimated_time_to_implement: '1 week',
        status: 'live',
      },
      {
        id: '4',
        name: 'Usage-based Tiered Pricing',
        type: 'medium_term',
        description: 'Tiered pricing based on actual usage',
        implementation_priority: 4,
        estimated_revenue_impact: 40000,
        estimated_time_to_implement: '6 weeks',
        status: 'planned',
      },
      {
        id: '5',
        name: 'Feature Marketplace',
        type: 'medium_term',
        description: 'Premium recipe packs and meal plans',
        implementation_priority: 5,
        estimated_revenue_impact: 30000,
        estimated_time_to_implement: '8 weeks',
        status: 'planned',
      },
      {
        id: '6',
        name: 'Affiliate Program',
        type: 'medium_term',
        description: 'Revenue sharing with partners',
        implementation_priority: 6,
        estimated_revenue_impact: 20000,
        estimated_time_to_implement: '4 weeks',
        status: 'planned',
      },
      {
        id: '7',
        name: 'Enterprise B2B',
        type: 'long_term',
        description: 'Custom enterprise solutions',
        implementation_priority: 7,
        estimated_revenue_impact: 150000,
        estimated_time_to_implement: '12 weeks',
        status: 'planned',
      },
      {
        id: '8',
        name: 'Data Licensing',
        type: 'long_term',
        description: 'Sell aggregated insights and trends',
        implementation_priority: 8,
        estimated_revenue_impact: 50000,
        estimated_time_to_implement: '10 weeks',
        status: 'planned',
      },
    ];
  }
}

export const monetizationHub = MonetizationHub;
