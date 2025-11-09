/**
 * Revenue Dashboard Component
 * Complete revenue overview and optimization
 */

'use client';

import { useEffect, useState, useMemo, memo } from 'react';
import { LoadingSpinner } from '@/lib/ux/loading';

interface OptimizationItem {
  tool: string;
  reasoning: string;
  expectedImpact?: {
    revenue?: number;
    cost?: number;
    margin?: number;
  };
}

interface RecommendationItem {
  tool: string;
  reasoning: string;
  expectedRevenueChange?: number;
}

interface RevenueData {
  summary: {
    totalRevenue: number;
    mrr: number;
    arpu: number;
    ltv: number;
    churnRate: number;
  };
  optimizations: {
    pricing: OptimizationItem[];
    subscriptions: OptimizationItem[];
    advertising: OptimizationItem[];
    passiveIncome: OptimizationItem[];
  };
  recommendations: {
    upsells: RecommendationItem[];
    scaling: RecommendationItem[];
    roi: RecommendationItem[];
  };
}

function RevenueDashboard() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/revenue/dashboard')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const summaryCards = useMemo(() => {
    if (!data) return null;
    return [
      { label: 'Total Revenue', value: `$${data.summary.totalRevenue.toLocaleString()}` },
      { label: 'MRR', value: `$${data.summary.mrr.toLocaleString()}` },
      { label: 'ARPU', value: `$${data.summary.arpu.toFixed(2)}` },
      { label: 'LTV', value: `$${data.summary.ltv.toLocaleString()}` },
      { label: 'Churn Rate', value: `${data.summary.churnRate.toFixed(1)}%` },
    ];
  }, [data]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!data) return <div>No revenue data</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Revenue Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {summaryCards?.map((card, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Optimization Recommendations</h3>
        <div className="space-y-4">
          {data.recommendations.scaling.map((rec, i) => (
            <div key={i} className="border-l-4 border-blue-500 pl-4">
              <p className="font-semibold">{rec.tool}</p>
              <p className="text-sm text-gray-600">{rec.reasoning}</p>
              {rec.expectedRevenueChange && (
                <p className="text-sm text-green-600">
                  +${rec.expectedRevenueChange.toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(RevenueDashboard);
