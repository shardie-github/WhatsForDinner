'use client'

import { useState, useEffect } from 'react'
import { GrowthAnalytics, FunnelConversionRates } from '@/lib/growthAnalytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface FunnelStage {
  name: string
  users: number
  conversion_rate: number
  drop_off: number
}

export default function FunnelOptimizationPage() {
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([])
  const [conversionRates, setConversionRates] = useState<FunnelConversionRates | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadFunnelData()
  }, [dateRange])

  const loadFunnelData = async () => {
    try {
      setLoading(true)
      
      // Get funnel conversion rates
      const rates = await GrowthAnalytics.getFunnelConversionRates(
        'default-tenant', // Replace with actual tenant ID
        dateRange.start,
        dateRange.end
      )
      
      setConversionRates(rates)
      
      // Simulate funnel stage data (in real app, this would come from API)
      const stages: FunnelStage[] = [
        {
          name: 'Landing Page',
          users: 1000,
          conversion_rate: 1.0,
          drop_off: 0
        },
        {
          name: 'Sign Up',
          users: 150,
          conversion_rate: rates.landing_to_signup,
          drop_off: 850
        },
        {
          name: 'Onboarding',
          users: 120,
          conversion_rate: rates.signup_to_onboarding,
          drop_off: 30
        },
        {
          name: 'First Recipe',
          users: 90,
          conversion_rate: rates.onboarding_to_first_recipe,
          drop_off: 30
        },
        {
          name: 'Subscription',
          users: 45,
          conversion_rate: rates.first_recipe_to_subscription,
          drop_off: 45
        },
        {
          name: 'Activation',
          users: 35,
          conversion_rate: rates.subscription_to_activation,
          drop_off: 10
        }
      ]
      
      setFunnelData(stages)
    } catch (error) {
      console.error('Error loading funnel data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getConversionColor = (rate: number) => {
    if (rate >= 0.7) return 'text-green-600'
    if (rate >= 0.4) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getDropOffColor = (dropOff: number) => {
    if (dropOff <= 50) return 'text-green-600'
    if (dropOff <= 200) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Funnel Optimization Dashboard</h1>
        <p className="text-gray-600">
          Analyze conversion rates and identify optimization opportunities
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6">
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="border rounded px-3 py-2"
            />
          </div>
          <button
            onClick={loadFunnelData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
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
                      <div className={`text-lg font-semibold ${getConversionColor(stage.conversion_rate)}`}>
                        {(stage.conversion_rate * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Conversion Rate
                      </div>
                    </div>
                  </div>

                  {/* Drop-off Arrow */}
                  {index < funnelData.length - 1 && (
                    <div className="flex justify-center my-2">
                      <div className="flex flex-col items-center">
                        <div className={`text-sm font-medium ${getDropOffColor(stage.drop_off)}`}>
                          {stage.drop_off} users dropped off
                        </div>
                        <div className="w-0.5 h-8 bg-gray-300"></div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Landing → Sign Up</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getConversionColor(conversionRates.landing_to_signup)}`}>
                  {(conversionRates.landing_to_signup * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {conversionRates.landing_to_signup < 0.15 ? 'Needs improvement' : 'Good'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sign Up → Onboarding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getConversionColor(conversionRates.signup_to_onboarding)}`}>
                  {(conversionRates.signup_to_onboarding * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {conversionRates.signup_to_onboarding < 0.7 ? 'Needs improvement' : 'Good'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Onboarding → First Recipe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getConversionColor(conversionRates.onboarding_to_first_recipe)}`}>
                  {(conversionRates.onboarding_to_first_recipe * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {conversionRates.onboarding_to_first_recipe < 0.6 ? 'Needs improvement' : 'Good'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">First Recipe → Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getConversionColor(conversionRates.first_recipe_to_subscription)}`}>
                  {(conversionRates.first_recipe_to_subscription * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {conversionRates.first_recipe_to_subscription < 0.3 ? 'Needs improvement' : 'Good'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subscription → Activation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getConversionColor(conversionRates.subscription_to_activation)}`}>
                  {(conversionRates.subscription_to_activation * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {conversionRates.subscription_to_activation < 0.7 ? 'Needs improvement' : 'Good'}
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
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">
                        🎯 Improve Landing Page Conversion
                      </h4>
                      <p className="text-yellow-700 text-sm">
                        Your landing page conversion rate is low. Consider A/B testing headlines, 
                        adding social proof, or simplifying the signup form.
                      </p>
                    </div>
                  )}

                  {conversionRates.signup_to_onboarding < 0.7 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">
                        🚀 Optimize Onboarding Flow
                      </h4>
                      <p className="text-yellow-700 text-sm">
                        Many users aren't completing onboarding. Consider adding progress indicators, 
                        reducing steps, or providing better guidance.
                      </p>
                    </div>
                  )}

                  {conversionRates.first_recipe_to_subscription < 0.3 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-800 mb-2">
                        💰 Improve Recipe-to-Subscription Conversion
                      </h4>
                      <p className="text-yellow-700 text-sm">
                        Users are creating recipes but not subscribing. Consider adding value props, 
                        limited-time offers, or freemium features to encourage upgrades.
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  📊 Set Up A/B Tests
                </h4>
                <p className="text-blue-700 text-sm">
                  Create experiments to test different versions of your funnel stages. 
                  Focus on the areas with the lowest conversion rates first.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
