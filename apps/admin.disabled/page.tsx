'use client';

import { useTenant } from '@/hooks/useTenant';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  CreditCard,
  Activity,
  TrendingUp,
  DollarSign,
  Zap,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalRevenue: number;
  totalMealsGenerated: number;
  totalTokensUsed: number;
  totalCost: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  dailyActiveUsers: number;
}

export default function AdminDashboard() {
  const { tenant } = useTenant();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats', tenant?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!tenant) throw new Error('No tenant found');

      // Get total users in tenant
      const { count: totalUsers } = await supabase
        .from('tenant_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id);

      // Get total revenue from subscriptions
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('status', 'active');

      const totalRevenue =
        subscriptions?.reduce((sum, sub) => {
          const planPrices = { free: 0, pro: 9.99, family: 19.99 };
          return sum + (planPrices[sub.plan] || 0);
        }, 0) || 0;

      // Get usage statistics
      const { data: usageData } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('tenant_id', tenant.id);

      const totalMealsGenerated =
        usageData?.filter(u => u.action === 'meal_generation').length || 0;
      const totalTokensUsed =
        usageData?.reduce((sum, u) => sum + (u.tokens_used || 0), 0) || 0;
      const totalCost =
        usageData?.reduce((sum, u) => sum + (u.cost_usd || 0), 0) || 0;

      // Get daily active users (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { count: dailyActiveUsers } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id)
        .gte('timestamp', yesterday.toISOString());

      return {
        totalUsers: totalUsers || 0,
        totalRevenue,
        totalMealsGenerated,
        totalTokensUsed,
        totalCost,
        activeSubscriptions: subscriptions?.length || 0,
        monthlyRevenue: totalRevenue, // Simplified for now
        dailyActiveUsers: dailyActiveUsers || 0,
      };
    },
    enabled: !!tenant,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-1/4 animate-pulse rounded bg-gray-200"></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-32 animate-pulse rounded bg-gray-200"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Unable to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Overview of your tenant's activity and performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active members in your tenant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.monthlyRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Meals Generated
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalMealsGenerated}
            </div>
            <p className="text-xs text-muted-foreground">
              Total AI-generated meals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Cost</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalCost.toFixed(4)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total OpenAI usage cost
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Overview</CardTitle>
            <CardDescription>
              Current subscription status and revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Plan</span>
                <Badge
                  variant={tenant.plan === 'free' ? 'secondary' : 'default'}
                >
                  {tenant.plan.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge
                  variant={
                    tenant.status === 'active' ? 'default' : 'destructive'
                  }
                >
                  {tenant.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Active Subscriptions
                </span>
                <span className="text-sm font-bold">
                  {stats.activeSubscriptions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Revenue</span>
                <span className="text-sm font-bold">
                  ${stats.totalRevenue.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Analytics</CardTitle>
            <CardDescription>AI usage and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Daily Active Users</span>
                <span className="text-sm font-bold">
                  {stats.dailyActiveUsers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Tokens Used</span>
                <span className="text-sm font-bold">
                  {stats.totalTokensUsed.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cost per Token</span>
                <span className="text-sm font-bold">
                  $
                  {stats.totalTokensUsed > 0
                    ? (
                        (stats.totalCost / stats.totalTokensUsed) *
                        1000
                      ).toFixed(4)
                    : '0.0000'}
                  /1K
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Cost per Meal</span>
                <span className="text-sm font-bold">
                  $
                  {stats.totalMealsGenerated > 0
                    ? (stats.totalCost / stats.totalMealsGenerated).toFixed(4)
                    : '0.0000'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest actions and events in your tenant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Activity className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-500">
              Recent activity will appear here as users interact with the system
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
