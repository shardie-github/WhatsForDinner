/**
 * Affiliate Dashboard Component
 * Pre-built UI for affiliate management
 */

'use client';

import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/lib/ux/loading';
import { toast } from '@/lib/ux/toast';

interface AffiliateData {
  affiliate: {
    code: string;
    link: string;
    commissionRate: number;
    status: string;
  };
  stats: {
    clicks: number;
    conversions: number;
    conversionRate: string;
    totalRevenue: number;
    totalCommissions: number;
    pendingCommissions: number;
  };
}

export function AffiliateDashboard() {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/affiliate/dashboard')
      .then(res => res.json())
      .then(setData)
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!data) return <div>No affiliate data found</div>;

  const copyLink = () => {
    navigator.clipboard.writeText(data.affiliate.link);
    toast.success('Link copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Affiliate Dashboard</h2>
        <p className="text-gray-600">Your referral link and earnings</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Your Referral Link</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={data.affiliate.link}
            readOnly
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            onClick={copyLink}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Copy
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Commission Rate: {data.affiliate.commissionRate}%
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Clicks</p>
          <p className="text-2xl font-bold">{data.stats.clicks}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Conversions</p>
          <p className="text-2xl font-bold">{data.stats.conversions}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Conversion Rate</p>
          <p className="text-2xl font-bold">{data.stats.conversionRate}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold">${data.stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Earned</p>
          <p className="text-2xl font-bold">${data.stats.totalCommissions.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold">${data.stats.pendingCommissions.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
