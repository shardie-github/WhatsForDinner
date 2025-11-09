/**
 * Subscription Optimization
 * Maximizes subscription revenue through pricing, packaging, and retention
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  features: string[];
  currentSubscribers: number;
  churnRate: number; // Monthly percentage
  acquisitionCost: number;
  lifetimeValue: number;
}

export interface SubscriptionOptimization {
  plan: SubscriptionPlan;
  recommendedAction: 'increase_price' | 'decrease_price' | 'add_feature' | 'remove_feature' | 'bundle' | 'maintain';
  newPrice?: number;
  reasoning: string;
  expectedImpact: {
    revenue: number;
    subscribers: number;
    churn: number;
  };
}

class SubscriptionOptimizer {
  /**
   * Optimize subscription pricing
   */
  optimizePricing(plans: SubscriptionPlan[]): SubscriptionOptimization[] {
    const optimizations: SubscriptionOptimization[] = [];

    plans.forEach(plan => {
      const currentRevenue = plan.price * plan.currentSubscribers;
      const ltvToCACRatio = plan.lifetimeValue / plan.acquisitionCost;

      let recommendedAction: SubscriptionOptimization['recommendedAction'] = 'maintain';
      let reasoning = '';
      let newPrice = plan.price;
      let expectedSubscribers = plan.currentSubscribers;
      let expectedChurn = plan.churnRate;

      // High LTV:CAC ratio + low churn = can increase price
      if (ltvToCACRatio > 3 && plan.churnRate < 5) {
        recommendedAction = 'increase_price';
        newPrice = plan.price * 1.1; // 10% increase
        expectedSubscribers = plan.currentSubscribers * 0.95; // 5% churn from price increase
        expectedChurn = plan.churnRate + 2;
        reasoning = 'High LTV:CAC ratio and low churn - price increase justified';
      }
      // Low LTV:CAC ratio + high churn = decrease price or add value
      else if (ltvToCACRatio < 2 && plan.churnRate > 10) {
        if (plan.features.length < 5) {
          recommendedAction = 'add_feature';
          reasoning = 'Low value perception - add features to justify price';
          expectedSubscribers = plan.currentSubscribers * 1.1; // 10% growth from added value
          expectedChurn = plan.churnRate * 0.8; // 20% churn reduction
        } else {
          recommendedAction = 'decrease_price';
          newPrice = plan.price * 0.9; // 10% decrease
          expectedSubscribers = plan.currentSubscribers * 1.15; // 15% growth from lower price
          expectedChurn = plan.churnRate * 0.9; // 10% churn reduction
          reasoning = 'High churn - reduce price to improve retention';
        }
      }
      // Annual plans should be discounted
      else if (plan.billingCycle === 'monthly' && plan.price > 20) {
        // Suggest annual option
        recommendedAction = 'bundle';
        reasoning = 'Create annual plan with 15-20% discount to improve LTV';
        expectedSubscribers = plan.currentSubscribers * 1.05;
        expectedChurn = plan.churnRate * 0.7; // Annual plans have lower churn
      }

      const expectedRevenue = newPrice * expectedSubscribers * (plan.billingCycle === 'annual' ? 1/12 : 1);

      optimizations.push({
        plan,
        recommendedAction,
        newPrice: recommendedAction.includes('price') ? newPrice : undefined,
        reasoning,
        expectedImpact: {
          revenue: expectedRevenue - currentRevenue,
          subscribers: expectedSubscribers - plan.currentSubscribers,
          churn: expectedChurn - plan.churnRate,
        },
      });
    });

    return optimizations.sort((a, b) => b.expectedImpact.revenue - a.expectedImpact.revenue);
  }

  /**
   * Calculate monthly recurring revenue (MRR)
   */
  calculateMRR(plans: SubscriptionPlan[]): number {
    return plans.reduce((sum, plan) => {
      const monthlyPrice = plan.billingCycle === 'annual' ? plan.price / 12 : plan.price;
      return sum + monthlyPrice * plan.currentSubscribers;
    }, 0);
  }

  /**
   * Calculate customer lifetime value (LTV)
   */
  calculateLTV(price: number, churnRate: number): number {
    if (churnRate === 0) return Infinity;
    const averageLifespan = 1 / (churnRate / 100); // In months
    return price * averageLifespan;
  }

  /**
   * Identify best upgrade paths
   */
  findUpgradePaths(
    currentPlan: SubscriptionPlan,
    availablePlans: SubscriptionPlan[]
  ): Array<{ plan: SubscriptionPlan; incentive: string; expectedConversion: number }> {
    const higherPlans = availablePlans.filter(
      p => p.price > currentPlan.price && p.id !== currentPlan.id
    );

    return higherPlans.map(plan => {
      const priceIncrease = plan.price - currentPlan.price;
      const priceIncreasePercent = (priceIncrease / currentPlan.price) * 100;

      let incentive = '';
      let expectedConversion = 0.05; // Base 5%

      if (priceIncreasePercent < 30) {
        incentive = `Only ${priceIncreasePercent.toFixed(0)}% more for ${plan.features.length - currentPlan.features.length} additional features`;
        expectedConversion = 0.15; // 15% conversion
      } else if (priceIncreasePercent < 50) {
        incentive = `Upgrade to unlock ${plan.features.length - currentPlan.features.length} premium features`;
        expectedConversion = 0.10; // 10% conversion
      } else {
        incentive = `Get ${plan.features.length} premium features`;
        expectedConversion = 0.05; // 5% conversion
      }

      return {
        plan,
        incentive,
        expectedConversion,
      };
    }).sort((a, b) => b.expectedConversion - a.expectedConversion);
  }

  /**
   * Optimize annual vs monthly pricing
   */
  optimizeBillingCycle(
    monthlyPrice: number,
    annualPrice: number,
    monthlySubscribers: number,
    annualSubscribers: number
  ): { optimalAnnualDiscount: number; reasoning: string } {
    const currentAnnualDiscount = ((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12)) * 100;
    const annualMRR = annualPrice / 12 * annualSubscribers;
    const monthlyMRR = monthlyPrice * monthlySubscribers;
    const annualRatio = annualMRR / (annualMRR + monthlyMRR);

    // If annual subscribers < 30%, increase discount
    if (annualRatio < 0.3) {
      return {
        optimalAnnualDiscount: Math.min(25, currentAnnualDiscount + 5),
        reasoning: 'Low annual adoption - increase discount to 20-25%',
      };
    }

    // If annual subscribers > 50%, can reduce discount slightly
    if (annualRatio > 0.5 && currentAnnualDiscount > 20) {
      return {
        optimalAnnualDiscount: Math.max(15, currentAnnualDiscount - 2),
        reasoning: 'High annual adoption - can reduce discount slightly',
      };
    }

    return {
      optimalAnnualDiscount: currentAnnualDiscount,
      reasoning: 'Current discount is optimal',
    };
  }
}

export const subscriptionOptimizer = new SubscriptionOptimizer();
