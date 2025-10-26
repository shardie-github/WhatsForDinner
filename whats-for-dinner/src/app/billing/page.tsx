'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { supabase } from '@/lib/supabaseClient'
import { STRIPE_CONFIG, PlanType } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Users, Zap } from 'lucide-react'

interface TenantData {
  id: string
  name: string
  plan: PlanType
  status: string
  stripe_customer_id: string | null
}

interface UsageData {
  total_meals_today: number
  total_tokens_today: number
  total_cost_today: number
  plan_quota: number
  remaining_quota: number
}

export default function BillingPage() {
  const { user } = useUser()
  const [tenant, setTenant] = useState<TenantData | null>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchTenantData()
    }
  }, [user])

  const fetchTenantData = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user?.id)
        .single()

      if (profile?.tenant_id) {
        // Fetch tenant data
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', profile.tenant_id)
          .single()

        setTenant(tenantData)

        // Fetch usage data
        const { data: usageData } = await supabase
          .rpc('get_tenant_usage_summary', { tenant_id_param: profile.tenant_id })

        if (usageData && usageData.length > 0) {
          setUsage(usageData[0])
        }
      }
    } catch (error) {
      console.error('Error fetching tenant data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (plan: PlanType) => {
    if (!tenant) return

    setProcessing(plan)
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          successUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl: `${window.location.origin}/billing?canceled=true`,
        }),
      })

      const { sessionId, url } = await response.json()

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setProcessing(null)
    }
  }

  const handleManageSubscription = async () => {
    if (!tenant?.stripe_customer_id) return

    setProcessing('portal')
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      })

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating portal session:', error)
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Tenant Found</h1>
          <p>Please contact support if you believe this is an error.</p>
        </div>
      </div>
    )
  }

  const currentPlan = STRIPE_CONFIG.plans[tenant.plan]
  const isCurrentPlan = (plan: PlanType) => plan === tenant.plan

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-gray-600">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan & Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{currentPlan.name}</h3>
                <p className="text-gray-600">
                  ${currentPlan.price}/month
                </p>
              </div>
              <Badge variant={tenant.plan === 'free' ? 'secondary' : 'default'}>
                {tenant.status}
              </Badge>
            </div>
            
            {tenant.stripe_customer_id && (
              <Button
                onClick={handleManageSubscription}
                disabled={processing === 'portal'}
                className="w-full"
              >
                {processing === 'portal' ? 'Loading...' : 'Manage Subscription'}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Usage Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usage ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Meals Generated:</span>
                  <span className="font-semibold">
                    {usage.total_meals_today} / {usage.plan_quota}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tokens Used:</span>
                  <span className="font-semibold">
                    {usage.total_tokens_today.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cost Today:</span>
                  <span className="font-semibold">
                    ${usage.total_cost_today.toFixed(4)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (usage.total_meals_today / usage.plan_quota) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No usage data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(STRIPE_CONFIG.plans).map(([planKey, plan]) => {
            const planType = planKey as PlanType
            const isCurrent = isCurrentPlan(planType)
            const isUpgrade = tenant.plan === 'free' && planType !== 'free'

            return (
              <Card
                key={planKey}
                className={`relative ${
                  isCurrent ? 'ring-2 ring-blue-500' : ''
                } ${isUpgrade ? 'border-green-500' : ''}`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500">Current Plan</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {planType === 'family' && <Users className="h-5 w-5" />}
                    {planType === 'pro' && <Crown className="h-5 w-5" />}
                    {planType === 'free' && <Zap className="h-5 w-5" />}
                    {plan.name}
                  </CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold">${plan.price}</span>
                    {plan.price > 0 && <span className="text-gray-500">/month</span>}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {!isCurrent && (
                    <Button
                      onClick={() => handleUpgrade(planType)}
                      disabled={processing === planType}
                      className={`w-full ${
                        isUpgrade ? 'bg-green-600 hover:bg-green-700' : ''
                      }`}
                    >
                      {processing === planType
                        ? 'Processing...'
                        : isUpgrade
                        ? 'Upgrade Now'
                        : planType === 'free'
                        ? 'Downgrade'
                        : 'Select Plan'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>
            Your subscription and payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Billing history will be available after your first payment
            </p>
            {tenant.stripe_customer_id && (
              <Button
                onClick={handleManageSubscription}
                disabled={processing === 'portal'}
                variant="outline"
              >
                {processing === 'portal' ? 'Loading...' : 'View Billing Portal'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}