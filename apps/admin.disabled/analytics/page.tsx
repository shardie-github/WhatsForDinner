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
import {
  Activity,
  DollarSign,
  Users,
  Zap,
} from 'lucide-react';

interface UsageData {
  date: string;
  meals_generated: number;
  tokens_used: number;
  cost_usd: number;
  users_active: number;
}

interface PopularIngredient {
  ingredient: string;
  usage_count: number;
}

interface CuisinePreference {
  cuisine_type: string;
  preference_count: number;
}

export default function AdminAnalyticsPage() {
  const { tenant } = useTenant();

  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ['usage-analytics', tenant?.id],
    queryFn: async (): Promise<UsageData[]> => {
      if (!tenant) return [];

      // Get usage data for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('timestamp', thirtyDaysAgo.toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw error;

      // Group by date
      const grouped =
        data?.reduce(
          (acc, log) => {
            const date = new Date(log.timestamp).toISOString().split('T')[0];
            if (!acc[date]) {
              acc[date] = {
                date,
                meals_generated: 0,
                tokens_used: 0,
                cost_usd: 0,
                users_active: new Set(),
              };
            }

            if (log.action === 'meal_generation') {
              acc[date].meals_generated++;
            }
            acc[date].tokens_used += log.tokens_used || 0;
            acc[date].cost_usd += log.cost_usd || 0;
            if (log.user_id) {
              acc[date].users_active.add(log.user_id);
            }

            return acc;
          },
          {} as Record<string, any>
        ) || {};

      return Object.values(grouped).map(item => ({
        ...item,
        users_active: item.users_active.size,
      }));
    },
    enabled: !!tenant,
  });

  const { data: popularIngredients } = useQuery({
    queryKey: ['popular-ingredients', tenant?.id],
    queryFn: async (): Promise<PopularIngredient[]> => {
      if (!tenant) return [];

      const { data, error } = await supabase.rpc('get_popular_ingredients', {
        limit_count: 10,
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant,
  });

  const { data: cuisinePreferences } = useQuery({
    queryKey: ['cuisine-preferences', tenant?.id],
    queryFn: async (): Promise<CuisinePreference[]> => {
      if (!tenant) return [];

      const { data, error } = await supabase.rpc('get_cuisine_preferences');

      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant,
  });

  const { data: totalStats } = useQuery({
    queryKey: ['total-stats', tenant?.id],
    queryFn: async () => {
      if (!tenant) return null;

      const { data: usage } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('tenant_id', tenant.id);

      const { count: totalUsers } = await supabase
        .from('tenant_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenant.id);

      const totalMeals =
        usage?.filter(u => u.action === 'meal_generation').length || 0;
      const totalTokens =
        usage?.reduce((sum, u) => sum + (u.tokens_used || 0), 0) || 0;
      const totalCost =
        usage?.reduce((sum, u) => sum + (u.cost_usd || 0), 0) || 0;

      return {
        totalUsers: totalUsers || 0,
        totalMeals,
        totalTokens,
        totalCost,
        avgCostPerMeal: totalMeals > 0 ? totalCost / totalMeals : 0,
        avgTokensPerMeal: totalMeals > 0 ? totalTokens / totalMeals : 0,
      };
    },
    enabled: !!tenant,
  });

  if (usageLoading) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">
          Detailed insights into your tenant's usage and performance
        </p>
      </div>

      {/* Summary Stats */}
      {totalStats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Active team members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalMeals}</div>
              <p className="text-xs text-muted-foreground">
                AI-generated recipes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tokens
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalStats.totalTokens.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                OpenAI tokens consumed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalStats.totalCost.toFixed(4)}
              </div>
              <p className="text-xs text-muted-foreground">AI usage cost</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Popular Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Ingredients</CardTitle>
            <CardDescription>
              Most frequently used ingredients in recipe generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularIngredients?.slice(0, 10).map((ingredient, index) => (
                <div
                  key={ingredient.ingredient}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium">
                    {ingredient.ingredient}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-20 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{
                          width: `${(ingredient.usage_count / (popularIngredients[0]?.usage_count || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="w-8 text-right text-sm text-gray-500">
                      {ingredient.usage_count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cuisine Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Cuisine Preferences</CardTitle>
            <CardDescription>
              Most popular cuisine types among your users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cuisinePreferences?.slice(0, 10).map((cuisine, index) => (
                <div
                  key={cuisine.cuisine_type}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium capitalize">
                    {cuisine.cuisine_type}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-20 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-green-600"
                        style={{
                          width: `${(cuisine.preference_count / (cuisinePreferences[0]?.preference_count || 1)) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="w-8 text-right text-sm text-gray-500">
                      {cuisine.preference_count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trends (Last 30 Days)</CardTitle>
          <CardDescription>Daily activity and cost trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usageData?.slice(-7).map(day => (
              <div
                key={day.date}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {new Date(day.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {day.users_active} active users
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-bold">{day.meals_generated}</p>
                    <p className="text-xs text-gray-500">Meals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold">
                      {day.tokens_used.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Tokens</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold">
                      ${day.cost_usd.toFixed(4)}
                    </p>
                    <p className="text-xs text-gray-500">Cost</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {totalStats && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Efficiency and cost analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  ${totalStats.avgCostPerMeal.toFixed(4)}
                </p>
                <p className="text-sm text-gray-500">Avg Cost per Meal</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {totalStats.avgTokensPerMeal.toFixed(0)}
                </p>
                <p className="text-sm text-gray-500">Avg Tokens per Meal</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  $
                  {totalStats.totalTokens > 0
                    ? (
                        (totalStats.totalCost / totalStats.totalTokens) *
                        1000
                      ).toFixed(4)
                    : '0.0000'}
                </p>
                <p className="text-sm text-gray-500">Cost per 1K Tokens</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
