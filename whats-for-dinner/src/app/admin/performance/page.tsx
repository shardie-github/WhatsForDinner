'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Database,
  Globe,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Server,
} from 'lucide-react';

interface PerformanceMetrics {
  overallScore: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  databaseMetrics: {
    queryTime: number;
    connectionPool: number;
    cacheHitRate: number;
  };
  apiMetrics: {
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
  bundleMetrics: {
    size: number;
    loadTime: number;
    chunks: number;
  };
  cdnMetrics: {
    hitRate: number;
    bandwidth: number;
    latency: number;
  };
}

interface PerformanceAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/performance');
      const data = await response.json();
      setMetrics(data.metrics);
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90)
      return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 70)
      return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  const getVitalColor = (
    value: number,
    thresholds: { good: number; needsImprovement: number }
  ) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.needsImprovement) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-gray-600">
            Monitor and optimize application performance
          </p>
        </div>
        <Button
          onClick={fetchPerformanceData}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Overall Performance Score */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Overall Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold">
                <span className={getScoreColor(metrics.overallScore)}>
                  {metrics.overallScore}
                </span>
                <span className="text-2xl text-gray-500">/100</span>
              </div>
              {getScoreBadge(metrics.overallScore)}
            </div>
            <div className="mt-4">
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${metrics.overallScore}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`rounded-lg border-l-4 p-3 ${
                    alert.type === 'error'
                      ? 'border-red-500 bg-red-50'
                      : alert.type === 'warning'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-gray-600">{alert.timestamp}</p>
                    </div>
                    {alert.resolved ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics Tabs */}
      <Tabs defaultValue="core-web-vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="core-web-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="bundle">Bundle Analysis</TabsTrigger>
          <TabsTrigger value="cdn">CDN Metrics</TabsTrigger>
        </TabsList>

        {/* Core Web Vitals */}
        <TabsContent value="core-web-vitals">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metrics?.coreWebVitals && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Largest Contentful Paint
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      <span
                        className={getVitalColor(metrics.coreWebVitals.lcp, {
                          good: 2.5,
                          needsImprovement: 4.0,
                        })}
                      >
                        {metrics.coreWebVitals.lcp.toFixed(2)}s
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Target: &lt; 2.5s</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      First Input Delay
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      <span
                        className={getVitalColor(metrics.coreWebVitals.fid, {
                          good: 100,
                          needsImprovement: 300,
                        })}
                      >
                        {metrics.coreWebVitals.fid.toFixed(0)}ms
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Target: &lt; 100ms</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Cumulative Layout Shift
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      <span
                        className={getVitalColor(metrics.coreWebVitals.cls, {
                          good: 0.1,
                          needsImprovement: 0.25,
                        })}
                      >
                        {metrics.coreWebVitals.cls.toFixed(3)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Target: &lt; 0.1</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      First Contentful Paint
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      <span
                        className={getVitalColor(metrics.coreWebVitals.fcp, {
                          good: 1.8,
                          needsImprovement: 3.0,
                        })}
                      >
                        {metrics.coreWebVitals.fcp.toFixed(2)}s
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Target: &lt; 1.8s</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Time to First Byte
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      <span
                        className={getVitalColor(metrics.coreWebVitals.ttfb, {
                          good: 600,
                          needsImprovement: 1500,
                        })}
                      >
                        {metrics.coreWebVitals.ttfb.toFixed(0)}ms
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Target: &lt; 600ms</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Database Metrics */}
        <TabsContent value="database">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {metrics?.databaseMetrics && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Database className="h-4 w-4" />
                      Average Query Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.databaseMetrics.queryTime.toFixed(2)}ms
                    </div>
                    <p className="text-xs text-gray-600">Target: &lt; 100ms</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Connection Pool
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.databaseMetrics.connectionPool}
                    </div>
                    <p className="text-xs text-gray-600">Active connections</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Cache Hit Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.databaseMetrics.cacheHitRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-600">Target: &gt; 80%</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* API Performance */}
        <TabsContent value="api">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {metrics?.apiMetrics && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Server className="h-4 w-4" />
                      Response Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.apiMetrics.responseTime.toFixed(2)}ms
                    </div>
                    <p className="text-xs text-gray-600">
                      Average response time
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Error Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.apiMetrics.errorRate.toFixed(2)}%
                    </div>
                    <p className="text-xs text-gray-600">Target: &lt; 1%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Throughput
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.apiMetrics.throughput.toFixed(0)}
                    </div>
                    <p className="text-xs text-gray-600">Requests per minute</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Bundle Analysis */}
        <TabsContent value="bundle">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {metrics?.bundleMetrics && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Bundle Size
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(metrics.bundleMetrics.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <p className="text-xs text-gray-600">Target: &lt; 1MB</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Load Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.bundleMetrics.loadTime.toFixed(2)}s
                    </div>
                    <p className="text-xs text-gray-600">Initial load time</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Chunks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.bundleMetrics.chunks}
                    </div>
                    <p className="text-xs text-gray-600">Number of chunks</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* CDN Metrics */}
        <TabsContent value="cdn">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {metrics?.cdnMetrics && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Globe className="h-4 w-4" />
                      Hit Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.cdnMetrics.hitRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-600">Target: &gt; 90%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Bandwidth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(metrics.cdnMetrics.bandwidth / 1024 / 1024).toFixed(2)}{' '}
                      MB
                    </div>
                    <p className="text-xs text-gray-600">Data transferred</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Latency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.cdnMetrics.latency.toFixed(0)}ms
                    </div>
                    <p className="text-xs text-gray-600">Average latency</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
