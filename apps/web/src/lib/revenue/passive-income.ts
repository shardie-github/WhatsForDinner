/**
 * Passive Income Mechanisms
 * Automated revenue streams that require minimal maintenance
 */

export interface PassiveIncomeStream {
  id: string;
  name: string;
  type: 'affiliate' | 'api' | 'data' | 'marketplace' | 'subscription' | 'advertising';
  monthlyRevenue: number;
  effort: 'low' | 'medium' | 'high';
  scalability: 'low' | 'medium' | 'high';
  margin: number; // Percentage
  growthRate: number; // Percentage
}

export interface PassiveIncomeRecommendation {
  stream: PassiveIncomeStream;
  priority: 'high' | 'medium' | 'low';
  implementationEffort: number; // 1-10
  expectedROI: number;
  reasoning: string;
}

class PassiveIncomeManager {
  /**
   * Identify passive income opportunities
   */
  identifyOpportunities(
    currentStreams: PassiveIncomeStream[],
    userBase: number,
    engagement: number
  ): PassiveIncomeRecommendation[] {
    const opportunities: PassiveIncomeRecommendation[] = [];

    // Affiliate marketing
    if (!currentStreams.find(s => s.type === 'affiliate')) {
      opportunities.push({
        stream: {
          id: 'affiliate',
          name: 'Affiliate Marketing',
          type: 'affiliate',
          monthlyRevenue: userBase * 0.05 * 10, // 5% conversion, $10 avg
          effort: 'low',
          scalability: 'high',
          margin: 80,
          growthRate: 15,
        },
        priority: 'high',
        implementationEffort: 2,
        expectedROI: 400,
        reasoning: 'Low effort, high margin, scales with user base',
      });
    }

    // API monetization
    if (userBase > 1000 && !currentStreams.find(s => s.type === 'api')) {
      opportunities.push({
        stream: {
          id: 'api',
          name: 'API Access',
          type: 'api',
          monthlyRevenue: userBase * 0.02 * 50, // 2% pay for API, $50/month
          effort: 'medium',
          scalability: 'high',
          margin: 90,
          growthRate: 25,
        },
        priority: 'high',
        implementationEffort: 5,
        expectedROI: 300,
        reasoning: 'High margin, recurring revenue, scales automatically',
      });
    }

    // Data insights (anonymized)
    if (userBase > 5000 && !currentStreams.find(s => s.type === 'data')) {
      opportunities.push({
        stream: {
          id: 'data',
          name: 'Anonymized Data Insights',
          type: 'data',
          monthlyRevenue: userBase * 0.001 * 1000, // 0.1% buy insights, $1000
          effort: 'low',
          scalability: 'medium',
          margin: 95,
          growthRate: 10,
        },
        priority: 'medium',
        implementationEffort: 3,
        expectedROI: 250,
        reasoning: 'Very high margin, but requires privacy compliance',
      });
    }

    // Marketplace commission
    if (engagement > 60 && !currentStreams.find(s => s.type === 'marketplace')) {
      opportunities.push({
        stream: {
          id: 'marketplace',
          name: 'Marketplace Commission',
          type: 'marketplace',
          monthlyRevenue: userBase * 0.01 * 20, // 1% transact, $20 avg, 10% commission
          effort: 'high',
          scalability: 'high',
          margin: 100, // Pure commission
          growthRate: 30,
        },
        priority: 'medium',
        implementationEffort: 8,
        expectedROI: 200,
        reasoning: 'High effort but pure commission revenue',
      });
    }

    // Premium subscriptions (automated)
    if (engagement > 50 && !currentStreams.find(s => s.type === 'subscription')) {
      opportunities.push({
        stream: {
          id: 'subscription',
          name: 'Automated Premium Upsells',
          type: 'subscription',
          monthlyRevenue: userBase * 0.05 * 9.99, // 5% convert, $9.99/month
          effort: 'low',
          scalability: 'high',
          margin: 85,
          growthRate: 20,
        },
        priority: 'high',
        implementationEffort: 3,
        expectedROI: 350,
        reasoning: 'Automated upsells based on usage patterns',
      });
    }

    return opportunities.sort((a, b) => {
      // Sort by priority and ROI
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.expectedROI - a.expectedROI;
    });
  }

  /**
   * Calculate total passive income
   */
  calculateTotalPassiveIncome(streams: PassiveIncomeStream[]): number {
    return streams.reduce((sum, s) => sum + s.monthlyRevenue, 0);
  }

  /**
   * Project future passive income
   */
  projectFutureRevenue(
    streams: PassiveIncomeStream[],
    months: number = 12
  ): Array<{ month: number; revenue: number }> {
    const projection: Array<{ month: number; revenue: number }> = [];

    for (let month = 1; month <= months; month++) {
      const revenue = streams.reduce((sum, stream) => {
        const growthFactor = Math.pow(1 + stream.growthRate / 100, month - 1);
        return sum + stream.monthlyRevenue * growthFactor;
      }, 0);

      projection.push({ month, revenue });
    }

    return projection;
  }

  /**
   * Optimize passive income portfolio
   */
  optimizePortfolio(streams: PassiveIncomeStream[]): {
    recommended: PassiveIncomeStream[];
    removed: PassiveIncomeStream[];
    reasoning: string;
  } {
    // Keep high-margin, scalable streams
    const recommended = streams.filter(
      s => s.margin > 70 && s.scalability !== 'low' && s.monthlyRevenue > 100
    );

    // Remove low-performing streams
    const removed = streams.filter(
      s => s.margin < 50 || (s.scalability === 'low' && s.monthlyRevenue < 500)
    );

    return {
      recommended,
      removed,
      reasoning: `Optimized portfolio: ${recommended.length} high-performing streams, removed ${removed.length} underperformers`,
    };
  }
}

export const passiveIncomeManager = new PassiveIncomeManager();
