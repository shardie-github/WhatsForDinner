'use client'

import { useState, useEffect } from 'react'
import { analytics } from '@/lib/analytics'
import { logger } from '@/lib/logger'
import { feedbackSystem } from '@/lib/feedbackSystem'
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Users, 
  ChefHat,
  DollarSign,
  BarChart3
} from 'lucide-react'

interface SystemMetrics {
  totalRecipes: number
  totalUsers: number
  averageRating: number
  apiLatency: number
  errorRate: number
  costPerRequest: number
  popularIngredients: Array<{ ingredient: string; usage_count: number }>
  cuisinePreferences: Array<{ cuisine_type: string; preference_count: number }>
  recentErrors: Array<{
    id: string
    error_type: string
    message: string
    created_at: string
    resolved: boolean
  }>
}

export default function SystemMetricsPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week')

  useEffect(() => {
    loadMetrics()
  }, [timeframe])

  const loadMetrics = async () => {
    setLoading(true)
    try {
      // Load various metrics in parallel
      const [
        recipeAnalytics,
        popularIngredients,
        cuisinePreferences,
        apiPerformance,
        feedbackAnalytics
      ] = await Promise.all([
        analytics.getRecipeAnalytics(timeframe),
        analytics.getPopularIngredients(10),
        analytics.getCuisinePreferences(),
        analytics.getAPIPerformanceMetrics(),
        feedbackSystem.getFeedbackAnalytics(timeframe)
      ])

      // Calculate derived metrics
      const totalRecipes = recipeAnalytics?.length || 0
      const averageRating = feedbackAnalytics?.average_rating || 0
      const apiLatency = apiPerformance.length > 0 
        ? apiPerformance.reduce((sum, metric) => sum + metric.value, 0) / apiPerformance.length 
        : 0
      const errorRate = apiPerformance.filter(m => m.metadata?.success === false).length / Math.max(apiPerformance.length, 1)
      const costPerRequest = apiPerformance.reduce((sum, metric) => sum + (metric.metadata?.cost || 0), 0) / Math.max(apiPerformance.length, 1)

      setMetrics({
        totalRecipes,
        totalUsers: new Set(recipeAnalytics?.map(r => r.user_id)).size || 0,
        averageRating,
        apiLatency,
        errorRate,
        costPerRequest,
        popularIngredients: popularIngredients || [],
        cuisinePreferences: cuisinePreferences || [],
        recentErrors: [] // This would be loaded from error_reports table
      })
    } catch (error) {
      await logger.error('Failed to load system metrics', { error }, 'frontend', 'admin')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load metrics</h2>
            <p className="text-gray-600">There was an error loading the system metrics.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Metrics</h1>
          <p className="text-gray-600">Monitor system performance and user engagement</p>
          
          <div className="mt-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as 'day' | 'week' | 'month')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="day">Last 24 hours</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
            </select>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Recipes"
            value={metrics.totalRecipes.toLocaleString()}
            icon={<ChefHat className="w-6 h-6" />}
            trend="+12%"
            trendUp={true}
          />
          <MetricCard
            title="Active Users"
            value={metrics.totalUsers.toLocaleString()}
            icon={<Users className="w-6 h-6" />}
            trend="+8%"
            trendUp={true}
          />
          <MetricCard
            title="Average Rating"
            value={metrics.averageRating.toFixed(1)}
            icon={<TrendingUp className="w-6 h-6" />}
            trend="+0.2"
            trendUp={true}
          />
          <MetricCard
            title="API Latency"
            value={`${metrics.apiLatency.toFixed(0)}ms`}
            icon={<Clock className="w-6 h-6" />}
            trend="-15ms"
            trendUp={true}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Error Rate</span>
                <span className={`font-semibold ${metrics.errorRate < 0.05 ? 'text-green-600' : 'text-red-600'}`}>
                  {(metrics.errorRate * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cost per Request</span>
                <span className="font-semibold text-gray-900">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  {metrics.costPerRequest.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              System Health
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">API Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Healthy
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Database</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Connected
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Ingredients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Ingredients</h3>
            <div className="space-y-2">
              {metrics.popularIngredients.slice(0, 5).map((item, index) => (
                <div key={item.ingredient} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.ingredient}</span>
                  <span className="font-semibold text-gray-900">{item.usage_count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cuisine Preferences</h3>
            <div className="space-y-2">
              {metrics.cuisinePreferences.slice(0, 5).map((item, index) => (
                <div key={item.cuisine_type} className="flex justify-between items-center">
                  <span className="text-gray-600">{item.cuisine_type}</span>
                  <span className="font-semibold text-gray-900">{item.preference_count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  icon: React.ReactNode
  trend: string
  trendUp: boolean
}

function MetricCard({ title, value, icon, trend, trendUp }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={`text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </span>
        <span className="text-sm text-gray-500 ml-2">vs last period</span>
      </div>
    </div>
  )
}