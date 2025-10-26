'use client';

import { useState, useEffect } from 'react';
import { GrowthAnalytics, FunnelConversionRates } from '@/lib/growthAnalytics';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface FunnelStage {
  name: string;
  users: number;
  conversion_rate: number;
  drop_off: number;
}

export default function FunnelOptimizationPage() {
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [conversionRates, setConversionRates] =
    useState<FunnelConversionRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadFunnelData();
  }, [dateRange]);

  const loadFunnelData = async () => {
    try {
      setLoading(true);

      // Get funnel conversion rates
      const rates = await GrowthAnalytics.getFunnelConversionRates(
        'default-tenant', // Replace with actual tenant ID
        dateRange.start,
        dateRange.end
      );

      setConversionRates(rates);

      // Simulate funnel stage data (in real app, this would come from API)
      const stages: FunnelStage[] = [
        {
          name: 'Landing Page',
          users: 1000,
          conversion_rate: 1.0,
          drop_off: 0,
        },
        {
          name: 'Sign Up',
          users: 150,
          conversion_rate: rates.landing_to_signup,
          drop_off: 850,
        },
        {
          name: 'Onboarding',
          users: 120,
          conversion_rate: rates.signup_to_onboarding,
          drop_off: 30,
        },
        {
          name: 'First Recipe',
          users: 90,
          conversion_rate: rates.onboarding_to_first_recipe,
          drop_off: 30,
        },
        {
          name: 'Subscription',
          users: 45,
          conversion_rate: rates.first_recipe_to_subscription,
          drop_off: 45,
        },
        {
          name: 'Activation',
          users: 35,
          conversion_rate: rates.subscription_to_activation,
          drop_off: 10,
        },
      ];

      setFunnelData(stages);
    } catch (error) {
      console.error('Error loading funnel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 0.7) return 'text-green-600';
    if (rate >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDropOffColor = (dropOff: number) => {
    if (dropOff <= 50) return 'text-green-600';
    if (dropOff <= 200) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">
          Funnel Optimization Dashboard
        </h1>
        <p className="text-gray-600">
          Analyze conversion rates and identify optimization opportunities
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={e =>
                setDateRange(prev => ({ ...prev, start: e.target.value }))
              }
              className="rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={e =>
                setDateRange(prev => ({ ...prev, end: e.target.value }))
              }
              className="rounded border px-3 py-2"
            />
          </div>
          <button
            onClick={loadFunnelData}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>
              User journey from landing to activation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((stage, index) => (
                <div key={stage.name} className="relative">
                  {/* Stage Bar */}
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{stage.name}</h3>
                        <p className="text-sm text-gray-600">
                          {stage.users.toLocaleString()} users
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-lg font-semibold ${getConversionColor(stage.conversion_rate)}`}
                      >
                        {(stage.conversion_rate * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Conversion Rate
                      </div>
                    </div>
                  </div>

                  {/* Drop-off Arrow */}
                  {index < funnelData.length - 1 && (
                    <div className="my-2 flex justify-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`text-sm font-medium ${getDropOffColor(stage.drop_off)}`}
                        >
                          {stage.drop_off} users dropped off
                        </div>
                        <div className="h-8 w-0.5 bg-gray-300"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate Summary */}
        {conversionRates && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Landing → Sign Up</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold ${getConversionColor(conversionRates.landing_to_signup)}`}
                >
                  {(conversionRates.landing_to_signup * 100).toFixed(1)}%
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {conversionRates.landing_to_signup < 0.15
                    ? 'Needs improvement'
                    : 'Good'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sign Up → Onboarding</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold ${getConversionColor(conversionRates.signup_to_onboarding)}`}
                >
                  {(conversionRates.signup_to_onboarding * 100).toFixed(1)}%
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {conversionRates.signup_to_onboarding < 0.7
                    ? 'Needs improvement'
                    : 'Good'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Onboarding → First Recipe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold ${getConversionColor(conversionRates.onboarding_to_first_recipe)}`}
                >
                  {(conversionRates.onboarding_to_first_recipe * 100).toFixed(
                    1
                  )}
                  %
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {conversionRates.onboarding_to_first_recipe < 0.6
                    ? 'Needs improvement'
                    : 'Good'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  First Recipe → Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold ${getConversionColor(conversionRates.first_recipe_to_subscription)}`}
                >
                  {(conversionRates.first_recipe_to_subscription * 100).toFixed(
                    1
                  )}
                  %
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {conversionRates.first_recipe_to_subscription < 0.3
                    ? 'Needs improvement'
                    : 'Good'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Subscription → Activation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold ${getConversionColor(conversionRates.subscription_to_activation)}`}
                >
                  {(conversionRates.subscription_to_activation * 100).toFixed(
                    1
                  )}
                  %
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {conversionRates.subscription_to_activation < 0.7
                    ? 'Needs improvement'
                    : 'Good'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Optimization Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Optimization Recommendations</CardTitle>
            <CardDescription>
              AI-powered suggestions to improve conversion rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversionRates && (
                <>
                  {conversionRates.landing_to_signup < 0.15 && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <h4 className="mb-2 font-semibold text-yellow-800">
                        🎯 Improve Landing Page Conversion
                      </h4>
                      <p className="text-sm text-yellow-700">
                        Your landing page conversion rate is low. Consider A/B
                        testing headlines, adding social proof, or simplifying
                        the signup form.
                      </p>
                    </div>
                  )}

                  {conversionRates.signup_to_onboarding < 0.7 && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <h4 className="mb-2 font-semibold text-yellow-800">
                        🚀 Optimize Onboarding Flow
                      </h4>
                      <p className="text-sm text-yellow-700">
                        Many users aren't completing onboarding. Consider adding
                        progress indicators, reducing steps, or providing better
                        guidance.
                      </p>
                    </div>
                  )}

                  {conversionRates.first_recipe_to_subscription < 0.3 && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <h4 className="mb-2 font-semibold text-yellow-800">
                        💰 Improve Recipe-to-Subscription Conversion
                      </h4>
                      <p className="text-sm text-yellow-700">
                        Users are creating recipes but not subscribing. Consider
                        adding value props, limited-time offers, or freemium
                        features to encourage upgrades.
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 font-semibold text-blue-800">
                  📊 Set Up A/B Tests
                </h4>
                <p className="text-sm text-blue-700">
                  Create experiments to test different versions of your funnel
                  stages. Focus on the areas with the lowest conversion rates
                  first.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
