/**
 * TypeScript Types for Revenue System
 * Complete type definitions for all revenue modules
 */

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  value: number;
  margin: number;
}

export interface UpsellOpportunity {
  productId: string;
  currentTier: string;
  recommendedTier: string;
  expectedRevenue: number;
  probability: number;
  reason: string;
}

export interface ROIMetric {
  investment: number;
  return: number;
  roi: number;
  paybackPeriod: number;
  netPresentValue: number;
  internalRateOfReturn: number;
}

export interface ScalingRecommendation {
  action: 'scale_up' | 'scale_down' | 'maintain' | 'discontinue';
  tool: string;
  currentROI: number;
  projectedROI: number;
  confidence: number;
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
  utilizationRate: number;
  churnRate: number;
  growthRate: number;
}

export interface EngagementMetrics {
  userId: string;
  loginFrequency: number;
  featureUsage: Record<string, number>;
  sessionDuration: number;
  contentConsumption: number;
  socialInteractions: number;
  purchases: number;
  lastActivity: Date;
  daysActive: number;
}

export interface EngagementScore {
  userId: string;
  score: number;
  level: 'high' | 'medium' | 'low' | 'at_risk';
  factors: {
    activity: number;
    usage: number;
    value: number;
    recency: number;
  };
  recommendations: string[];
  monetizationPotential: number;
}

export interface AdPlacement {
  id: string;
  type: 'banner' | 'sidebar' | 'inline' | 'popup' | 'video';
  position: string;
  cpm: number;
  fillRate: number;
  clickThroughRate: number;
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

export interface PassiveIncomeStream {
  id: string;
  name: string;
  type: 'affiliate' | 'api' | 'data' | 'marketplace' | 'subscription' | 'advertising';
  monthlyRevenue: number;
  effort: 'low' | 'medium' | 'high';
  scalability: 'low' | 'medium' | 'high';
  margin: number;
  growthRate: number;
}

export interface PassiveIncomeRecommendation {
  stream: PassiveIncomeStream;
  priority: 'high' | 'medium' | 'low';
  implementationEffort: number;
  expectedROI: number;
  reasoning: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  features: string[];
  currentSubscribers: number;
  churnRate: number;
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
