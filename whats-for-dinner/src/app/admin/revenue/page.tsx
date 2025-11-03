/**
 * Revenue Dashboard
 * Admin page with charts for MRR, LTV, CAC, ARPU
 * Includes export to CSV/PDF and ARIMA forecast
 */

'use client';

import { useRevenueSummary } from '@whats-for-dinner/data/src/pricing';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useState } from 'react';
import { Download, TrendingUp, DollarSign, Users, Activity } from 'lucide-react';

export default function AdminRevenuePage() {
  const [period, setPeriod] = useState<'month' | 'quarter'>('month');
  const { data: revenueData, isLoading } = useRevenueSummary(period);

  // Simple ARIMA forecast (moving average + trend)
  const forecast = revenueData
    ? generateForecast(revenueData.snapshots)
    : [];

  const handleExportCSV = () => {
    if (!revenueData) return;

    const headers = [
      'Period',
      'MRR (cents)',
      'ARR (cents)',
      'ARPU (cents)',
      'LTV (cents)',
      'CAC (cents)',
      'Churn Rate',
      'Conversion Rate',
    ];

    const rows = revenueData.snapshots.map((snapshot, idx) => {
      const date = new Date(revenueData.start_date);
      date.setDate(date.getDate() + idx * (period === 'month' ? 1 : 7));
      return [
        date.toISOString().split('T')[0],
        snapshot.mrr_cents,
        snapshot.arr_cents,
        snapshot.arpu_cents,
        snapshot.ltv_cents,
        snapshot.cac_cents,
        snapshot.churn_rate,
        snapshot.conversion_rate,
      ];
    });

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue_${period}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // Simple PDF export (would use a library like jsPDF in production)
    window.print();
  };

  // Format chart data
  const chartData = revenueData
    ? revenueData.snapshots.map((snapshot, idx) => {
        const date = new Date(revenueData.start_date);
        date.setDate(date.getDate() + idx * (period === 'month' ? 1 : 7));
        return {
          date: date.toISOString().split('T')[0],
          mrr: snapshot.mrr_cents / 100,
          arr: snapshot.arr_cents / 100,
          arpu: snapshot.arpu_cents / 100,
          ltv: snapshot.ltv_cents / 100,
          cac: snapshot.cac_cents / 100,
          churn: snapshot.churn_rate * 100,
          conversion: snapshot.conversion_rate * 100,
        };
      })
    : [];

  const latestSnapshot = revenueData?.snapshots[0];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-1/4 animate-pulse rounded bg-gray-200"></div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded bg-gray-200"></div>
          <div className="h-96 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Dashboard</h1>
          <p className="text-gray-600">Intelligent pricing & revenue optimization analytics</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            onClick={() => setPeriod('month')}
          >
            Month
          </Button>
          <Button
            variant={period === 'quarter' ? 'default' : 'outline'}
            onClick={() => setPeriod('quarter')}
          >
            Quarter
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {latestSnapshot && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MRR</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(latestSnapshot.mrr_cents / 100).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                ARR: ${(latestSnapshot.arr_cents / 100).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ARPU</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(latestSnapshot.arpu_cents / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Average revenue per user</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">LTV/CAC</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestSnapshot.cac_cents > 0
                  ? (latestSnapshot.ltv_cents / latestSnapshot.cac_cents).toFixed(2)
                  : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Payback: {(latestSnapshot.ltv_cents / latestSnapshot.cac_cents / 12).toFixed(1)} months
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(latestSnapshot.churn_rate * 100).toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Conversion: {(latestSnapshot.conversion_rate * 100).toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>MRR Trend</CardTitle>
            <CardDescription>Monthly Recurring Revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="mrr" stroke="#8884d8" name="MRR ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LTV vs CAC</CardTitle>
            <CardDescription>Lifetime Value vs Customer Acquisition Cost</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ltv" fill="#8884d8" name="LTV ($)" />
                <Bar dataKey="cac" fill="#82ca9d" name="CAC ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Churn & Conversion Rates</CardTitle>
            <CardDescription>Churn and conversion metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="churn" stroke="#ff7300" name="Churn (%)" />
                <Line type="monotone" dataKey="conversion" stroke="#00ff00" name="Conversion (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ARPU Trend</CardTitle>
            <CardDescription>Average Revenue Per User</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="arpu" stroke="#0088fe" name="ARPU ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Forecast */}
      {forecast.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Forecast (Next Quarter)</CardTitle>
            <CardDescription>Simple ARIMA projection based on historical trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="forecast" stroke="#ff0000" strokeDasharray="5 5" name="Forecast ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Simple ARIMA forecast (moving average + trend)
 */
function generateForecast(
  snapshots: Array<{
    mrr_cents: number;
    arr_cents: number;
    arpu_cents: number;
    ltv_cents: number;
    cac_cents: number;
    churn_rate: number;
    conversion_rate: number;
  }>,
): Array<{ date: string; forecast: number }> {
  if (snapshots.length < 2) return [];

  // Simple moving average of last 3 periods
  const recent = snapshots.slice(0, 3);
  const avgMRR = recent.reduce((sum, s) => sum + s.mrr_cents, 0) / recent.length;

  // Simple trend calculation
  const trend = snapshots.length > 1
    ? (snapshots[0].mrr_cents - snapshots[1].mrr_cents) / snapshots[1].mrr_cents
    : 0;

  // Generate 3-month forecast
  const forecast = [];
  const baseDate = new Date();
  baseDate.setMonth(baseDate.getMonth() + 1);

  for (let i = 0; i < 3; i++) {
    const forecastDate = new Date(baseDate);
    forecastDate.setMonth(forecastDate.getMonth() + i);
    const projectedMRR = avgMRR * Math.pow(1 + trend, i + 1);
    forecast.push({
      date: forecastDate.toISOString().split('T')[0],
      forecast: projectedMRR / 100,
    });
  }

  return forecast;
}
