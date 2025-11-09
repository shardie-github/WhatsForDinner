/**
 * Advertising Revenue Optimization
 * Maximizes ad revenue through placement, targeting, and optimization
 */

export interface AdPlacement {
  id: string;
  type: 'banner' | 'sidebar' | 'inline' | 'popup' | 'video';
  position: string;
  cpm: number; // Cost per mille (1000 impressions)
  fillRate: number; // 0-1
  clickThroughRate: number; // Percentage
  revenue: number;
  impressions: number;
}

export interface AdOptimization {
  placement: AdPlacement;
  recommendedAction: 'increase' | 'decrease' | 'maintain' | 'remove';
  newCPM?: number;
  reasoning: string;
  expectedRevenueChange: number;
}

class AdRevenueOptimizer {
  /**
   * Calculate revenue per placement
   */
  calculatePlacementRevenue(placement: AdPlacement): number {
    // Revenue = (Impressions / 1000) * CPM * Fill Rate
    return (placement.impressions / 1000) * placement.cpm * placement.fillRate;
  }

  /**
   * Optimize ad placements
   */
  optimizePlacements(placements: AdPlacement[]): AdOptimization[] {
    const optimizations: AdOptimization[] = [];
    const avgCPM = placements.reduce((sum, p) => sum + p.cpm, 0) / placements.length;
    const avgFillRate = placements.reduce((sum, p) => sum + p.fillRate, 0) / placements.length;

    placements.forEach(placement => {
      const currentRevenue = this.calculatePlacementRevenue(placement);
      let recommendedAction: AdOptimization['recommendedAction'] = 'maintain';
      let reasoning = '';
      let newCPM = placement.cpm;
      let expectedRevenueChange = 0;

      // Low fill rate = increase CPM or remove
      if (placement.fillRate < 0.3) {
        if (placement.cpm < avgCPM * 0.8) {
          recommendedAction = 'increase';
          newCPM = avgCPM * 1.2;
          reasoning = 'Low fill rate with below-average CPM - increase CPM';
          expectedRevenueChange = this.calculatePlacementRevenue({
            ...placement,
            cpm: newCPM,
            fillRate: Math.min(placement.fillRate * 1.2, 1),
          }) - currentRevenue;
        } else {
          recommendedAction = 'remove';
          reasoning = 'Low fill rate with high CPM - remove placement';
          expectedRevenueChange = -currentRevenue;
        }
      }
      // High performance = increase impressions or CPM
      else if (placement.fillRate > 0.8 && placement.clickThroughRate > avgCPM) {
        recommendedAction = 'increase';
        newCPM = placement.cpm * 1.15;
        reasoning = 'High performing placement - increase CPM';
        expectedRevenueChange = this.calculatePlacementRevenue({
          ...placement,
          cpm: newCPM,
        }) - currentRevenue;
      }
      // Medium performance = maintain
      else {
        recommendedAction = 'maintain';
        reasoning = 'Stable performance - maintain current settings';
      }

      optimizations.push({
        placement,
        recommendedAction,
        newCPM: recommendedAction === 'increase' ? newCPM : undefined,
        reasoning,
        expectedRevenueChange,
      });
    });

    return optimizations.sort((a, b) => b.expectedRevenueChange - a.expectedRevenueChange);
  }

  /**
   * Calculate effective CPM (eCPM)
   */
  calculateECPM(revenue: number, impressions: number): number {
    return impressions > 0 ? (revenue / impressions) * 1000 : 0;
  }

  /**
   * Optimize ad frequency (prevent ad fatigue)
   */
  optimizeFrequency(
    currentFrequency: number, // Ads per session
    engagementDrop: number, // Percentage drop in engagement
    revenuePerAd: number
  ): { optimalFrequency: number; reasoning: string } {
    // If engagement drops >20%, reduce frequency
    if (engagementDrop > 20) {
      return {
        optimalFrequency: Math.max(1, currentFrequency - 1),
        reasoning: 'High engagement drop - reduce ad frequency',
      };
    }

    // If engagement stable and revenue good, can increase slightly
    if (engagementDrop < 5 && revenuePerAd > 0.1) {
      return {
        optimalFrequency: currentFrequency + 1,
        reasoning: 'Stable engagement - can increase frequency',
      };
    }

    return {
      optimalFrequency: currentFrequency,
      reasoning: 'Optimal frequency maintained',
    };
  }

  /**
   * Calculate total ad revenue
   */
  calculateTotalRevenue(placements: AdPlacement[]): number {
    return placements.reduce((sum, p) => sum + this.calculatePlacementRevenue(p), 0);
  }

  /**
   * Find best performing ad types
   */
  getBestPerformingTypes(placements: AdPlacement[]): Array<{ type: string; revenue: number; eCPM: number }> {
    const byType = new Map<string, { revenue: number; impressions: number }>();

    placements.forEach(p => {
      const existing = byType.get(p.type) || { revenue: 0, impressions: 0 };
      byType.set(p.type, {
        revenue: existing.revenue + this.calculatePlacementRevenue(p),
        impressions: existing.impressions + p.impressions,
      });
    });

    return Array.from(byType.entries())
      .map(([type, data]) => ({
        type,
        revenue: data.revenue,
        eCPM: this.calculateECPM(data.revenue, data.impressions),
      }))
      .sort((a, b) => b.eCPM - a.eCPM);
  }
}

export const adOptimizer = new AdRevenueOptimizer();
