/**
 * ROI Analysis and Recommendations
 * Automated ROI calculation and scaling recommendations
 */

export interface ROIMetric {
  investment: number;
  return: number;
  roi: number; // Percentage
  paybackPeriod: number; // Months
  netPresentValue: number;
  internalRateOfReturn: number; // Percentage
}

export interface ScalingRecommendation {
  action: 'scale_up' | 'scale_down' | 'maintain' | 'discontinue';
  tool: string;
  currentROI: number;
  projectedROI: number;
  confidence: number; // 0-1
  reasoning: string;
  expectedImpact: {
    revenue: number;
    cost: number;
    margin: number;
  };
}

export interface ToolMetrics {
  name: string;
  monthlyCost: number;
  monthlyRevenue: number;
  userCount: number;
  utilizationRate: number; // 0-1
  churnRate: number; // Percentage
  growthRate: number; // Percentage
}

class ROIAnalyzer {
  /**
   * Calculate comprehensive ROI metrics
   */
  calculateROI(
    initialInvestment: number,
    monthlyReturns: number[],
    discountRate: number = 0.1 // 10% default
  ): ROIMetric {
    const totalReturn = monthlyReturns.reduce((a, b) => a + b, 0);
    const roi = ((totalReturn - initialInvestment) / initialInvestment) * 100;
    
    // Payback period (months to recover investment)
    let cumulativeReturn = 0;
    let paybackPeriod = 0;
    for (let i = 0; i < monthlyReturns.length; i++) {
      cumulativeReturn += monthlyReturns[i];
      if (cumulativeReturn >= initialInvestment) {
        paybackPeriod = i + 1;
        break;
      }
    }

    // Net Present Value (NPV)
    const npv = monthlyReturns.reduce((sum, return_, index) => {
      return sum + return_ / Math.pow(1 + discountRate, index + 1);
    }, 0) - initialInvestment;

    // Internal Rate of Return (IRR) - simplified calculation
    const irr = this.calculateIRR(initialInvestment, monthlyReturns);

    return {
      investment: initialInvestment,
      return: totalReturn,
      roi,
      paybackPeriod,
      netPresentValue: npv,
      internalRateOfReturn: irr,
    };
  }

  private calculateIRR(initialInvestment: number, cashFlows: number[]): number {
    // Simplified IRR calculation using Newton-Raphson method
    let rate = 0.1; // Start with 10%
    const tolerance = 0.0001;
    const maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
      const npv = this.calculateNPV(initialInvestment, cashFlows, rate);
      const npvDerivative = this.calculateNPVDerivative(cashFlows, rate);

      if (Math.abs(npv) < tolerance) break;

      rate = rate - npv / npvDerivative;
      rate = Math.max(0, Math.min(1, rate)); // Clamp between 0% and 100%
    }

    return rate * 100;
  }

  private calculateNPV(investment: number, cashFlows: number[], rate: number): number {
    return cashFlows.reduce((sum, flow, index) => {
      return sum + flow / Math.pow(1 + rate, index + 1);
    }, 0) - investment;
  }

  private calculateNPVDerivative(cashFlows: number[], rate: number): number {
    return cashFlows.reduce((sum, flow, index) => {
      return sum - (index + 1) * flow / Math.pow(1 + rate, index + 2);
    }, 0);
  }

  /**
   * Generate scaling recommendations for tools/subscriptions
   */
  generateScalingRecommendations(
    tools: ToolMetrics[],
    minROI: number = 20, // Minimum acceptable ROI %
    growthThreshold: number = 15 // Growth rate threshold for scaling
  ): ScalingRecommendation[] {
    const recommendations: ScalingRecommendation[] = [];

    tools.forEach(tool => {
      const currentROI = ((tool.monthlyRevenue - tool.monthlyCost) / tool.monthlyCost) * 100;
      const margin = ((tool.monthlyRevenue - tool.monthlyCost) / tool.monthlyRevenue) * 100;

      // Project future ROI based on growth rate
      const projectedRevenue = tool.monthlyRevenue * (1 + tool.growthRate / 100);
      const projectedROI = ((projectedRevenue - tool.monthlyCost) / tool.monthlyCost) * 100;

      let action: ScalingRecommendation['action'] = 'maintain';
      let reasoning = '';
      let confidence = 0.5;

      // High ROI + High Growth = Scale Up
      if (currentROI > minROI && tool.growthRate > growthThreshold && tool.utilizationRate > 0.7) {
        action = 'scale_up';
        reasoning = `High ROI (${currentROI.toFixed(1)}%) with strong growth (${tool.growthRate.toFixed(1)}%) and good utilization`;
        confidence = 0.8;
      }
      // Low ROI + Low Utilization = Scale Down
      else if (currentROI < minROI && tool.utilizationRate < 0.3) {
        action = 'scale_down';
        reasoning = `Low ROI (${currentROI.toFixed(1)}%) and low utilization (${(tool.utilizationRate * 100).toFixed(1)}%)`;
        confidence = 0.7;
      }
      // Negative ROI + High Churn = Discontinue
      else if (currentROI < 0 && tool.churnRate > 20) {
        action = 'discontinue';
        reasoning = `Negative ROI with high churn rate (${tool.churnRate.toFixed(1)}%)`;
        confidence = 0.9;
      }
      // Low ROI but improving = Maintain
      else if (currentROI < minROI && tool.growthRate > 0) {
        action = 'maintain';
        reasoning = `ROI below threshold but showing growth (${tool.growthRate.toFixed(1)}%)`;
        confidence = 0.6;
      }

      recommendations.push({
        action,
        tool: tool.name,
        currentROI,
        projectedROI,
        confidence,
        reasoning,
        expectedImpact: {
          revenue: projectedRevenue - tool.monthlyRevenue,
          cost: action === 'scale_up' ? tool.monthlyCost * 0.5 : action === 'scale_down' ? -tool.monthlyCost * 0.3 : 0,
          margin: margin,
        },
      });
    });

    return recommendations.sort((a, b) => {
      // Sort by expected revenue impact
      return b.expectedImpact.revenue - a.expectedImpact.revenue;
    });
  }

  /**
   * Calculate cost per acquisition (CPA)
   */
  calculateCPA(marketingSpend: number, acquisitions: number): number {
    return acquisitions > 0 ? marketingSpend / acquisitions : 0;
  }

  /**
   * Calculate return on ad spend (ROAS)
   */
  calculateROAS(revenue: number, adSpend: number): number {
    return adSpend > 0 ? revenue / adSpend : 0;
  }

  /**
   * Optimize ad spend allocation
   */
  optimizeAdSpend(
    channels: Array<{ name: string; spend: number; revenue: number }>,
    totalBudget: number
  ): Array<{ name: string; recommendedSpend: number; roas: number }> {
    // Calculate ROAS for each channel
    const channelROAS = channels.map(ch => ({
      name: ch.name,
      roas: this.calculateROAS(ch.revenue, ch.spend),
      currentSpend: ch.spend,
    }));

    // Sort by ROAS (highest first)
    channelROAS.sort((a, b) => b.roas - a.roas);

    // Allocate budget proportionally to ROAS
    const totalROAS = channelROAS.reduce((sum, ch) => sum + ch.roas, 0);
    
    return channelROAS.map(ch => ({
      name: ch.name,
      recommendedSpend: totalBudget * (ch.roas / totalROAS),
      roas: ch.roas,
    }));
  }
}

export const roiAnalyzer = new ROIAnalyzer();
