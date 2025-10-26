import { supabase } from './supabaseClient';
import { StripeService } from './stripe';
import { aiOptimization } from './aiOptimization';

export interface FinancialSummary {
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  aiCosts: number;
  partnerRevenue: number;
  subscriptionRevenue: number;
  apiRevenue: number;
  costBreakdown: {
    openai: number;
    anthropic: number;
    google: number;
    azure: number;
  };
  revenueBreakdown: {
    subscriptions: number;
    api_usage: number;
    partner_share: number;
    other: number;
  };
  trends: {
    revenueGrowth: number;
    costGrowth: number;
    profitMargin: number;
    aiCostRatio: number;
  };
  recommendations: string[];
}

export interface PricingSuggestion {
  region: string;
  currentPricing: {
    free: number;
    pro: number;
    family: number;
  };
  suggestedPricing: {
    free: number;
    pro: number;
    family: number;
  };
  reasoning: string[];
  expectedImpact: {
    revenueChange: number;
    userRetention: number;
    newSignups: number;
  };
  confidence: number;
}

export interface RevenueAnalysis {
  totalRevenue: number;
  revenueStreams: Array<{
    name: string;
    revenue: number;
    percentage: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  topPartners: Array<{
    name: string;
    revenue: number;
    percentage: number;
    growth: number;
  }>;
  regionalBreakdown: Array<{
    region: string;
    revenue: number;
    percentage: number;
    growth: number;
  }>;
  recommendations: string[];
}

export class AICommerceHub {
  private static instance: AICommerceHub;

  static getInstance(): AICommerceHub {
    if (!AICommerceHub.instance) {
      AICommerceHub.instance = new AICommerceHub();
    }
    return AICommerceHub.instance;
  }

  /**
   * Get comprehensive financial summary
   */
  async getFinancialSummary(
    tenantId: string,
    period: string,
    region: string
  ): Promise<FinancialSummary> {
    try {
      const periodDays = this.parsePeriod(period);
      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      // Get API usage data
      const { data: apiUsage } = await supabase
        .from('api_usage_tracking')
        .select('cost_usd, revenue_usd, tokens_used, metadata')
        .eq('tenant_id', tenantId)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      // Get subscription data
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('plan, status, current_period_start, current_period_end')
        .eq('tenant_id', tenantId)
        .eq('status', 'active');

      // Get partner revenue data
      const { data: partnerRevenue } = await supabase
        .from('api_usage_tracking')
        .select('revenue_usd, partner_id')
        .eq('tenant_id', tenantId)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      // Calculate totals
      const totalApiCosts =
        apiUsage?.reduce((sum, record) => sum + record.cost_usd, 0) || 0;
      const totalApiRevenue =
        apiUsage?.reduce((sum, record) => sum + record.revenue_usd, 0) || 0;
      const totalPartnerRevenue =
        partnerRevenue?.reduce((sum, record) => sum + record.revenue_usd, 0) ||
        0;

      // Calculate subscription revenue
      const subscriptionRevenue = this.calculateSubscriptionRevenue(
        subscriptions || []
      );

      const totalRevenue = totalApiRevenue + subscriptionRevenue;
      const totalCosts = totalApiCosts;
      const netProfit = totalRevenue - totalCosts;

      // Calculate cost breakdown by provider
      const costBreakdown = this.calculateCostBreakdown(apiUsage || []);

      // Calculate trends (simplified)
      const trends = await this.calculateTrends(tenantId, periodDays);

      // Generate AI recommendations
      const recommendations = await this.generateFinancialRecommendations({
        totalRevenue,
        totalCosts,
        netProfit,
        aiCosts: totalApiCosts,
        subscriptionRevenue,
        apiRevenue: totalApiRevenue,
      });

      return {
        totalRevenue,
        totalCosts,
        netProfit,
        aiCosts: totalApiCosts,
        partnerRevenue: totalPartnerRevenue,
        subscriptionRevenue,
        apiRevenue: totalApiRevenue,
        costBreakdown,
        revenueBreakdown: {
          subscriptions: subscriptionRevenue,
          api_usage: totalApiRevenue,
          partner_share: totalPartnerRevenue,
          other: 0,
        },
        trends,
        recommendations,
      };
    } catch (error) {
      console.error('Error getting financial summary:', error);
      throw error;
    }
  }

  /**
   * Reconcile invoices and payments
   */
  async reconcileInvoices(tenantId: string, period: string): Promise<any> {
    try {
      const periodDays = this.parsePeriod(period);
      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      // Get all financial transactions
      const { data: apiUsage } = await supabase
        .from('api_usage_tracking')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      // Get Stripe transactions (this would integrate with actual Stripe API)
      const stripeTransactions = await this.getStripeTransactions(
        tenantId,
        startDate,
        endDate
      );

      // Reconcile data
      const reconciliation = {
        totalApiCosts:
          apiUsage?.reduce((sum, record) => sum + record.cost_usd, 0) || 0,
        totalApiRevenue:
          apiUsage?.reduce((sum, record) => sum + record.revenue_usd, 0) || 0,
        stripeRevenue: stripeTransactions.totalRevenue,
        discrepancy: 0, // This would be calculated
        reconciled: true,
        reconciliationDate: new Date().toISOString(),
      };

      // Store reconciliation record
      await supabase.from('compliance_audit_logs').insert({
        tenant_id: tenantId,
        action_type: 'invoice_reconciliation',
        resource_type: 'financial',
        resource_id: `reconciliation_${Date.now()}`,
        new_values: reconciliation,
      });

      return reconciliation;
    } catch (error) {
      console.error('Error reconciling invoices:', error);
      throw error;
    }
  }

  /**
   * Get AI-powered pricing suggestions
   */
  async getPricingSuggestions(
    tenantId: string,
    region: string
  ): Promise<PricingSuggestion> {
    try {
      // Get current pricing and usage data
      const currentPricing = {
        free: 0,
        pro: 9.99,
        family: 19.99,
      };

      // Get usage patterns for the region
      const { data: usageData } = await supabase
        .from('api_usage_tracking')
        .select('cost_usd, tokens_used, metadata')
        .eq('tenant_id', tenantId)
        .gte(
          'timestamp',
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        );

      // Get subscription data
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('tenant_id', tenantId);

      // Generate AI-powered pricing suggestions
      const prompt = `Analyze pricing for region ${region} based on usage patterns and suggest optimal pricing:
        Current pricing: ${JSON.stringify(currentPricing)}
        Usage data: ${JSON.stringify(usageData?.slice(0, 10) || [])}
        Subscriptions: ${JSON.stringify(subscriptions?.slice(0, 10) || [])}
        
        Consider regional cost of living, competition, and usage patterns.`;

      const aiResult = await aiOptimization.getOptimizedResponse(
        prompt,
        'pricing_analysis',
        tenantId,
        'pro',
        async (model: string) => {
          // This would integrate with actual AI service
          const mockResponse = {
            response: {
              suggestedPricing: {
                free: 0,
                pro: 12.99,
                family: 24.99,
              },
              reasoning: [
                'Regional cost of living is 15% higher than average',
                'Usage patterns show 20% higher token consumption',
                'Competitor analysis suggests 10-15% price increase opportunity',
              ],
              expectedImpact: {
                revenueChange: 0.18,
                userRetention: 0.95,
                newSignups: 1.12,
              },
              confidence: 0.87,
            },
            tokens: 200,
            cost: 0.004,
          };
          return mockResponse;
        }
      );

      return {
        region,
        currentPricing,
        suggestedPricing: aiResult.response.suggestedPricing,
        reasoning: aiResult.response.reasoning,
        expectedImpact: aiResult.response.expectedImpact,
        confidence: aiResult.response.confidence,
      };
    } catch (error) {
      console.error('Error getting pricing suggestions:', error);
      throw error;
    }
  }

  /**
   * Analyze revenue streams
   */
  async analyzeRevenueStreams(
    tenantId: string,
    period: string,
    partnerId?: string
  ): Promise<RevenueAnalysis> {
    try {
      const periodDays = this.parsePeriod(period);
      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
      const endDate = new Date();

      // Get revenue data
      const { data: apiUsage } = await supabase
        .from('api_usage_tracking')
        .select('revenue_usd, partner_id, metadata')
        .eq('tenant_id', tenantId)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      // Get subscription data
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('plan, status, current_period_start')
        .eq('tenant_id', tenantId)
        .eq('status', 'active');

      // Get partner data
      const { data: partners } = await supabase
        .from('partner_registry')
        .select('id, name, type, revenue_share_percent')
        .eq('status', 'active');

      // Calculate revenue streams
      const subscriptionRevenue = this.calculateSubscriptionRevenue(
        subscriptions || []
      );
      const apiRevenue =
        apiUsage?.reduce((sum, record) => sum + record.revenue_usd, 0) || 0;
      const totalRevenue = subscriptionRevenue + apiRevenue;

      // Calculate partner revenue breakdown
      const partnerRevenue =
        partners
          ?.map(partner => {
            const partnerUsage =
              apiUsage?.filter(record => record.partner_id === partner.id) ||
              [];
            const revenue = partnerUsage.reduce(
              (sum, record) => sum + record.revenue_usd,
              0
            );
            return {
              name: partner.name,
              revenue,
              percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
              growth: 0, // This would be calculated from historical data
              type: partner.type,
            };
          })
          .filter(p => p.revenue > 0) || [];

      // Calculate regional breakdown (simplified)
      const regionalBreakdown = [
        {
          region: 'NA',
          revenue: totalRevenue * 0.6,
          percentage: 60,
          growth: 0.15,
        },
        {
          region: 'EU',
          revenue: totalRevenue * 0.25,
          percentage: 25,
          growth: 0.08,
        },
        {
          region: 'APAC',
          revenue: totalRevenue * 0.15,
          percentage: 15,
          growth: 0.25,
        },
      ];

      // Generate recommendations
      const recommendations = await this.generateRevenueRecommendations({
        totalRevenue,
        subscriptionRevenue,
        apiRevenue,
        partnerRevenue,
        regionalBreakdown,
      });

      return {
        totalRevenue,
        revenueStreams: [
          {
            name: 'Subscriptions',
            revenue: subscriptionRevenue,
            percentage: (subscriptionRevenue / totalRevenue) * 100,
            growth: 0.12,
            trend: 'up' as const,
          },
          {
            name: 'API Usage',
            revenue: apiRevenue,
            percentage: (apiRevenue / totalRevenue) * 100,
            growth: 0.18,
            trend: 'up' as const,
          },
          {
            name: 'Partner Revenue',
            revenue: partnerRevenue.reduce((sum, p) => sum + p.revenue, 0),
            percentage:
              (partnerRevenue.reduce((sum, p) => sum + p.revenue, 0) /
                totalRevenue) *
              100,
            growth: 0.22,
            trend: 'up' as const,
          },
        ],
        topPartners: partnerRevenue.slice(0, 5),
        regionalBreakdown,
        recommendations,
      };
    } catch (error) {
      console.error('Error analyzing revenue streams:', error);
      throw error;
    }
  }

  /**
   * Calculate subscription revenue
   */
  private calculateSubscriptionRevenue(subscriptions: any[]): number {
    return subscriptions.reduce((sum, sub) => {
      const planPrices = { pro: 9.99, family: 19.99 };
      return sum + (planPrices[sub.plan as keyof typeof planPrices] || 0);
    }, 0);
  }

  /**
   * Calculate cost breakdown by AI provider
   */
  private calculateCostBreakdown(apiUsage: any[]): {
    openai: number;
    anthropic: number;
    google: number;
    azure: number;
  } {
    const breakdown = { openai: 0, anthropic: 0, google: 0, azure: 0 };

    apiUsage.forEach(record => {
      const provider = record.metadata?.provider || 'openai';
      if (provider in breakdown) {
        breakdown[provider as keyof typeof breakdown] += record.cost_usd;
      }
    });

    return breakdown;
  }

  /**
   * Calculate financial trends
   */
  private async calculateTrends(
    tenantId: string,
    periodDays: number
  ): Promise<any> {
    // This would calculate actual trends from historical data
    return {
      revenueGrowth: 0.15,
      costGrowth: 0.08,
      profitMargin: 0.23,
      aiCostRatio: 0.12,
    };
  }

  /**
   * Generate financial recommendations using AI
   */
  private async generateFinancialRecommendations(data: any): Promise<string[]> {
    const prompt = `Analyze these financial metrics and provide actionable recommendations:
      Total Revenue: $${data.totalRevenue.toFixed(2)}
      Total Costs: $${data.totalCosts.toFixed(2)}
      Net Profit: $${data.netProfit.toFixed(2)}
      AI Costs: $${data.aiCosts.toFixed(2)}
      Subscription Revenue: $${data.subscriptionRevenue.toFixed(2)}
      API Revenue: $${data.apiRevenue.toFixed(2)}
      
      Provide 3-5 specific, actionable recommendations to improve profitability.`;

    try {
      const aiResult = await aiOptimization.getOptimizedResponse(
        prompt,
        'financial_analysis',
        'system',
        'pro',
        async (model: string) => {
          // This would integrate with actual AI service
          const mockResponse = {
            response: {
              recommendations: [
                'Optimize AI model selection to reduce costs by 15-20%',
                'Implement dynamic pricing based on usage patterns',
                'Expand partner ecosystem to increase API revenue',
                'Introduce usage-based billing tiers for better monetization',
                'Implement cost alerts to prevent unexpected overages',
              ],
            },
            tokens: 150,
            cost: 0.003,
          };
          return mockResponse;
        }
      );

      return aiResult.response.recommendations;
    } catch (error) {
      console.error('Error generating financial recommendations:', error);
      return ['Unable to generate recommendations at this time'];
    }
  }

  /**
   * Generate revenue recommendations
   */
  private async generateRevenueRecommendations(data: any): Promise<string[]> {
    return [
      'Focus on high-growth APAC region with localized pricing',
      'Develop more partner integrations to increase API revenue',
      'Implement tiered subscription plans for better conversion',
      'Create enterprise packages for high-volume users',
      'Launch referral program to increase organic growth',
    ];
  }

  /**
   * Get Stripe transactions (mock implementation)
   */
  private async getStripeTransactions(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    // This would integrate with actual Stripe API
    return {
      totalRevenue: 1000,
      transactions: [],
    };
  }

  /**
   * Parse period string to days
   */
  private parsePeriod(period: string): number {
    const periodMap: Record<string, number> = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };
    return periodMap[period] || 30;
  }
}

export const aiCommerceHub = AICommerceHub.getInstance();
