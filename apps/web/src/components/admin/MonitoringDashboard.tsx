/**
 * Monitoring Dashboard Component
 * Real-time KPIs and health metrics
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Users, DollarSign, AlertCircle } from 'lucide-react';

interface DashboardMetrics {
  summary: {
    totalRevenue: number;
    mrr: number;
    arpu: string;
    ltv: string;
    churnRate: string;
    activeUsers: number;
    totalUsers: number;
  };
  revenueBreakdown: {
    subscriptions: number;
    affiliate: number;
    api: number;
    affiliateCommissions: number;
  };
  metrics: {
    engagement: Array<{ metric: string; value: number }>;
    roi: Array<{ metric: string; value: string }>;
  };
}

export function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/revenue/dashboard');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-24 bg-muted" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p>Error loading metrics: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const healthScore = calculateHealthScore(metrics);

  return (
    <div className="space-y-6">
      {/* Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>System Health</span>
            <Badge variant={healthScore >= 80 ? 'default' : healthScore >= 60 ? 'secondary' : 'destructive'}>
              {healthScore}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Active Users: {metrics.summary.activeUsers}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">MRR: ${metrics.summary.mrr.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Total Revenue: ${metrics.summary.totalRevenue.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.summary.mrr.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ARPU</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.summary.arpu}</div>
            <p className="text-xs text-muted-foreground mt-1">Average Revenue Per User</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">LTV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.summary.ltv}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime Value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.summary.churnRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Monthly Churn</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Subscriptions</span>
              <span className="font-medium">${metrics.revenueBreakdown.subscriptions.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Affiliate</span>
              <span className="font-medium">${metrics.revenueBreakdown.affiliate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">API Monetization</span>
              <span className="font-medium">${metrics.revenueBreakdown.api.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-medium">Total Revenue</span>
              <span className="font-bold text-lg">${metrics.summary.totalRevenue.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ROI Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>ROI Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.metrics.roi.map((metric, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm">{metric.metric}</span>
                <span className="font-medium">{metric.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function calculateHealthScore(metrics: DashboardMetrics): number {
  let score = 100;

  // Deduct points for high churn
  const churnRate = parseFloat(metrics.summary.churnRate);
  if (churnRate > 10) score -= 20;
  else if (churnRate > 5) score -= 10;

  // Deduct points for low MRR
  if (metrics.summary.mrr < 100) score -= 15;

  // Deduct points for low active users
  if (metrics.summary.activeUsers < 10) score -= 10;

  // Deduct points for low ARPU
  const arpu = parseFloat(metrics.summary.arpu);
  if (arpu < 5) score -= 15;

  return Math.max(0, Math.min(100, score));
}
