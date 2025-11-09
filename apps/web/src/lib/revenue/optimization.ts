/**
 * Revenue Optimization Utilities
 * Maximizes revenue through pricing, upselling, and conversion optimization
 */

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  value: number; // Value score (0-100)
  margin: number; // Profit margin percentage
}

export interface UpsellOpportunity {
  productId: string;
  currentTier: string;
  recommendedTier: string;
  expectedRevenue: number;
  probability: number; // 0-1
  reason: string;
}

class RevenueOptimizer {
  /**
   * Calculate optimal pricing based on elasticity and competition
   */
  calculateOptimalPrice(
    basePrice: number,
    elasticity: number, // Price elasticity of demand
    cost: number,
    competitorPrices: number[]
  ): number {
    // Use economic theory: optimal price = cost / (1 - 1/elasticity)
    const theoreticalOptimal = cost / (1 - 1 / Math.abs(elasticity));
    
    // Factor in competition
    const avgCompetitorPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length;
    const competitivePrice = avgCompetitorPrice * 0.95; // 5% below average
    
    // Use the higher of theoretical or competitive (maximize revenue)
    return Math.max(theoreticalOptimal, competitivePrice);
  }

  /**
   * Identify upsell opportunities
   */
  findUpsellOpportunities(
    userTier: string,
    tiers: PricingTier[],
    userUsage: Record<string, number>,
    userValue: number // Lifetime value or engagement score
  ): UpsellOpportunity[] {
    const opportunities: UpsellOpportunity[] = [];
    const currentTier = tiers.find(t => t.id === userTier);
    if (!currentTier) return opportunities;

    // Find higher value tiers
    const higherTiers = tiers.filter(t => t.value > currentTier.value);
    
    higherTiers.forEach(tier => {
      // Check if user is hitting limits
      const isHittingLimits = this.isHittingLimits(userUsage, currentTier);
      
      // Calculate probability based on usage and value
      const probability = this.calculateUpsellProbability(
        userUsage,
        currentTier,
        tier,
        userValue
      );

      if (probability > 0.3) { // Only suggest if >30% probability
        const expectedRevenue = tier.price - currentTier.price;
        
        opportunities.push({
          productId: 'subscription',
          currentTier: currentTier.id,
          recommendedTier: tier.id,
          expectedRevenue: expectedRevenue * probability,
          probability,
          reason: isHittingLimits 
            ? 'You\'re hitting usage limits' 
            : `Unlock ${tier.features.length - currentTier.features.length} more features`,
        });
      }
    });

    return opportunities.sort((a, b) => b.expectedRevenue - a.expectedRevenue);
  }

  private isHittingLimits(usage: Record<string, number>, tier: PricingTier): boolean {
    // Check if user is close to tier limits (80% threshold)
    // This is a simplified check - implement based on your actual limits
    return Object.values(usage).some(value => value > 0.8);
  }

  private calculateUpsellProbability(
    usage: Record<string, number>,
    currentTier: PricingTier,
    targetTier: PricingTier,
    userValue: number
  ): number {
    let probability = 0.5; // Base probability

    // Increase if hitting limits
    if (this.isHittingLimits(usage, currentTier)) {
      probability += 0.3;
    }

    // Increase based on user value (high-value users more likely to upgrade)
    if (userValue > 70) probability += 0.2;
    else if (userValue > 50) probability += 0.1;

    // Increase if price difference is reasonable (<50% increase)
    const priceIncrease = (targetTier.price - currentTier.price) / currentTier.price;
    if (priceIncrease < 0.5) probability += 0.1;

    return Math.min(probability, 0.95); // Cap at 95%
  }

  /**
   * Calculate revenue per user (ARPU)
   */
  calculateARPU(revenue: number, users: number): number {
    return revenue / users;
  }

  /**
   * Calculate customer lifetime value (LTV)
   */
  calculateLTV(
    averageOrderValue: number,
    purchaseFrequency: number,
    customerLifespan: number, // in months
    grossMargin: number // percentage
  ): number {
    return averageOrderValue * purchaseFrequency * customerLifespan * (grossMargin / 100);
  }

  /**
   * Calculate churn risk score
   */
  calculateChurnRisk(
    daysSinceLastActivity: number,
    engagementScore: number,
    paymentIssues: boolean,
    supportTickets: number
  ): number {
    let risk = 0;

    // Days since last activity
    if (daysSinceLastActivity > 30) risk += 30;
    else if (daysSinceLastActivity > 14) risk += 15;

    // Low engagement
    if (engagementScore < 30) risk += 25;
    else if (engagementScore < 50) risk += 10;

    // Payment issues
    if (paymentIssues) risk += 20;

    // Support tickets (negative correlation)
    if (supportTickets === 0 && daysSinceLastActivity > 7) risk += 15;

    return Math.min(risk, 100);
  }
}

export const revenueOptimizer = new RevenueOptimizer();
