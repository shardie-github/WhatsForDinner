/**
 * KPI Tracker
 * 
 * Tracks key performance indicators across all business units
 */

interface KPI {
  id: string;
  name: string;
  category: 'revenue' | 'growth' | 'engagement' | 'retention' | 'support' | 'product';
  currentValue: number;
  targetValue: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly';
  status: 'on-track' | 'at-risk' | 'exceeding' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

interface KPIDashboard {
  period: string;
  kpis: KPI[];
  summary: {
    onTrack: number;
    atRisk: number;
    exceeding: number;
    critical: number;
  };
}

/**
 * Business Unit KPIs
 */
export const BUSINESS_UNIT_KPIS = {
  // Revenue KPIs
  revenue: {
    mrr: {
      id: 'mrr',
      name: 'Monthly Recurring Revenue',
      category: 'revenue',
      targetValue: 500, // Month 1 target
      unit: 'USD',
      period: 'monthly',
    },
    arpu: {
      id: 'arpu',
      name: 'Average Revenue Per User',
      category: 'revenue',
      targetValue: 5.00,
      unit: 'USD',
      period: 'monthly',
    },
    ltv: {
      id: 'ltv',
      name: 'Customer Lifetime Value',
      category: 'revenue',
      targetValue: 120,
      unit: 'USD',
      period: 'monthly',
    },
    conversionRate: {
      id: 'conversion_rate',
      name: 'Free to Premium Conversion Rate',
      category: 'revenue',
      targetValue: 5.0,
      unit: '%',
      period: 'monthly',
    },
  },

  // Growth KPIs
  growth: {
    newSignups: {
      id: 'new_signups',
      name: 'New User Signups',
      category: 'growth',
      targetValue: 100, // Week 1 target
      unit: 'users',
      period: 'weekly',
    },
    signupGrowthRate: {
      id: 'signup_growth_rate',
      name: 'Signup Growth Rate',
      category: 'growth',
      targetValue: 20,
      unit: '%',
      period: 'weekly',
    },
    activationRate: {
      id: 'activation_rate',
      name: 'User Activation Rate',
      category: 'growth',
      targetValue: 60,
      unit: '%',
      period: 'weekly',
    },
    referralRate: {
      id: 'referral_rate',
      name: 'Referral Rate',
      category: 'growth',
      targetValue: 10,
      unit: '%',
      period: 'monthly',
    },
  },

  // Engagement KPIs
  engagement: {
    dau: {
      id: 'dau',
      name: 'Daily Active Users',
      category: 'engagement',
      targetValue: 50, // Week 1 target
      unit: 'users',
      period: 'daily',
    },
    mau: {
      id: 'mau',
      name: 'Monthly Active Users',
      category: 'engagement',
      targetValue: 500,
      unit: 'users',
      period: 'monthly',
    },
    sessionsPerUser: {
      id: 'sessions_per_user',
      name: 'Sessions Per User',
      category: 'engagement',
      targetValue: 3,
      unit: 'sessions',
      period: 'weekly',
    },
    featureAdoption: {
      id: 'feature_adoption',
      name: 'Feature Adoption Rate',
      category: 'engagement',
      targetValue: 40,
      unit: '%',
      period: 'monthly',
    },
  },

  // Retention KPIs
  retention: {
    day1Retention: {
      id: 'day1_retention',
      name: 'Day 1 Retention',
      category: 'retention',
      targetValue: 70,
      unit: '%',
      period: 'daily',
    },
    day7Retention: {
      id: 'day7_retention',
      name: 'Day 7 Retention',
      category: 'retention',
      targetValue: 40,
      unit: '%',
      period: 'weekly',
    },
    day30Retention: {
      id: 'day30_retention',
      name: 'Day 30 Retention',
      category: 'retention',
      targetValue: 25,
      unit: '%',
      period: 'monthly',
    },
    churnRate: {
      id: 'churn_rate',
      name: 'Monthly Churn Rate',
      category: 'retention',
      targetValue: 5,
      unit: '%',
      period: 'monthly',
    },
  },

  // Support KPIs
  support: {
    ticketVolume: {
      id: 'ticket_volume',
      name: 'Support Ticket Volume',
      category: 'support',
      targetValue: 10, // Per week
      unit: 'tickets',
      period: 'weekly',
    },
    responseTime: {
      id: 'response_time',
      name: 'Average Response Time',
      category: 'support',
      targetValue: 2, // Hours
      unit: 'hours',
      period: 'daily',
    },
    resolutionTime: {
      id: 'resolution_time',
      name: 'Average Resolution Time',
      category: 'support',
      targetValue: 24, // Hours
      unit: 'hours',
      period: 'daily',
    },
    satisfactionScore: {
      id: 'satisfaction_score',
      name: 'Customer Satisfaction Score',
      category: 'support',
      targetValue: 4.5,
      unit: '/5',
      period: 'weekly',
    },
  },

  // Product KPIs
  product: {
    errorRate: {
      id: 'error_rate',
      name: 'Error Rate',
      category: 'product',
      targetValue: 0.1,
      unit: '%',
      period: 'daily',
    },
    apiLatency: {
      id: 'api_latency',
      name: 'API Response Time',
      category: 'product',
      targetValue: 200, // Milliseconds
      unit: 'ms',
      period: 'daily',
    },
    uptime: {
      id: 'uptime',
      name: 'System Uptime',
      category: 'product',
      targetValue: 99.9,
      unit: '%',
      period: 'daily',
    },
    featureUsage: {
      id: 'feature_usage',
      name: 'Core Feature Usage',
      category: 'product',
      targetValue: 60,
      unit: '%',
      period: 'weekly',
    },
  },
} as const;

/**
 * Calculate KPI status
 */
export function calculateKPIStatus(
  currentValue: number,
  targetValue: number,
  category: string
): 'on-track' | 'at-risk' | 'exceeding' | 'critical' {
  const percentage = (currentValue / targetValue) * 100;

  // Critical: < 50% of target
  if (percentage < 50) {
    return 'critical';
  }

  // At-risk: 50-80% of target
  if (percentage < 80) {
    return 'at-risk';
  }

  // Exceeding: > 120% of target
  if (percentage > 120) {
    return 'exceeding';
  }

  // On-track: 80-120% of target
  return 'on-track';
}

/**
 * Get KPI dashboard data
 */
export async function getKPIDashboard(period: 'daily' | 'weekly' | 'monthly'): Promise<KPIDashboard> {
  // In production, fetch from database and calculate actual values
  // This is a placeholder structure

  const kpis: KPI[] = [];

  // Revenue KPIs
  kpis.push({
    id: 'mrr',
    name: 'Monthly Recurring Revenue',
    category: 'revenue',
    currentValue: 0, // Will be calculated from database
    targetValue: 500,
    unit: 'USD',
    period: 'monthly',
    status: 'critical',
    trend: 'stable',
    lastUpdated: new Date(),
  });

  // Growth KPIs
  kpis.push({
    id: 'new_signups',
    name: 'New User Signups',
    category: 'growth',
    currentValue: 0,
    targetValue: 100,
    unit: 'users',
    period: 'weekly',
    status: 'critical',
    trend: 'stable',
    lastUpdated: new Date(),
  });

  // Engagement KPIs
  kpis.push({
    id: 'dau',
    name: 'Daily Active Users',
    category: 'engagement',
    currentValue: 0,
    targetValue: 50,
    unit: 'users',
    period: 'daily',
    status: 'critical',
    trend: 'stable',
    lastUpdated: new Date(),
  });

  // Retention KPIs
  kpis.push({
    id: 'day1_retention',
    name: 'Day 1 Retention',
    category: 'retention',
    currentValue: 0,
    targetValue: 70,
    unit: '%',
    period: 'daily',
    status: 'critical',
    trend: 'stable',
    lastUpdated: new Date(),
  });

  // Support KPIs
  kpis.push({
    id: 'response_time',
    name: 'Average Response Time',
    category: 'support',
    currentValue: 0,
    targetValue: 2,
    unit: 'hours',
    period: 'daily',
    status: 'critical',
    trend: 'stable',
    lastUpdated: new Date(),
  });

  // Product KPIs
  kpis.push({
    id: 'error_rate',
    name: 'Error Rate',
    category: 'product',
    currentValue: 0,
    targetValue: 0.1,
    unit: '%',
    period: 'daily',
    status: 'critical',
    trend: 'stable',
    lastUpdated: new Date(),
  });

  const summary = {
    onTrack: kpis.filter((k) => k.status === 'on-track').length,
    atRisk: kpis.filter((k) => k.status === 'at-risk').length,
    exceeding: kpis.filter((k) => k.status === 'exceeding').length,
    critical: kpis.filter((k) => k.status === 'critical').length,
  };

  return {
    period,
    kpis,
    summary,
  };
}

/**
 * Get KPIs that need attention
 */
export async function getKPIsNeedingAttention(): Promise<KPI[]> {
  const dashboard = await getKPIDashboard('daily');
  return dashboard.kpis.filter(
    (kpi) => kpi.status === 'critical' || kpi.status === 'at-risk'
  );
}
