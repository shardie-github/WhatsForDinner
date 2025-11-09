/**
 * Revenue Dashboard Component
 * Complete revenue overview and optimization
 */

'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/lib/ux/loading';

interface RevenueData {
  summary: {
    totalRevenue: number;
    mrr: number;
    arpu: number;
    ltv: number;
    churnRate: number;
  };
  optimizations: {
    pricing: any[];
    subscriptions: any[];
    advertising: any[];
    passiveIncome: any[];
  };
  recommendations: {
    upsells: any[];
    scaling: any[];
    roi: any[];
  };
}

export function RevenueDashboard() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/revenue/dashboard')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!data) return <div>No revenue data</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Revenue Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold">${data.summary.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">MRR</p>
          <p className="text-2xl font-bold">${data.summary.mrr.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">ARPU</p>
          <p className="text-2xl font-bold">${data.summary.arpu.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">LTV</p>
          <p className="text-2xl font-bold">${data.summary.ltv.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Churn Rate</p>
          <p className="text-2xl font-bold">{data.summary.churnRate.toFixed(1)}%</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Optimization Recommendations</h3>
        <div className="space-y-4">
          {data.recommendations.scaling.map((rec, i) => (
            <div key={i} className="border-l-4 border-blue-500 pl-4">
              <p className="font-semibold">{rec.tool}</p>
              <p className="text-sm text-gray-600">{rec.reasoning}</p>
              <p className="text-sm text-green-600">
                Expected Impact: ${rec.expectedImpact.revenue.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
