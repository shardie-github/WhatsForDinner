'use client'

import { useTenant } from '@/hooks/useTenant'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react'
import { useState } from 'react'

interface SubscriptionData {
  id: string
  plan: 'free' | 'pro' | 'family'
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  stripe_subscription_id: string | null
}

interface BillingEvent {
  id: string
  event_type: string
  processed: boolean
  created_at: string
  data: any
}

export default function AdminBillingPage() {
  const { tenant } = useTenant()
  const [showPortal, setShowPortal] = useState(false)

  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription', tenant?.id],
    queryFn: async (): Promise<SubscriptionData | null> => {
      if (!tenant) return null

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!tenant,
  })

  const { data: billingEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['billing-events', tenant?.id],
    queryFn: async (): Promise<BillingEvent[]> => {
      if (!tenant) return []

      const { data, error } = await supabase
        .from('billing_events')
        .select('*')
        .eq('processed', true)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      return data || []
    },
    enabled: !!tenant,
  })

  const { data: usageStats } = useQuery({
    queryKey: ['billing-usage', tenant?.id],
    queryFn: async () => {
      if (!tenant) return null

      const { data: usage } = await supabase
        .from('usage_logs')
        .select('*')
        .eq('tenant_id', tenant.id)

      const totalCost = usage?.reduce((sum, u) => sum + (u.cost_usd || 0), 0) || 0
      const monthlyCost = usage?.filter(u => {
        const logDate = new Date(u.timestamp)
        const now = new Date()
        return logDate.getMonth() === now.getMonth() && 
               logDate.getFullYear() === now.getFullYear()
      }).reduce((sum, u) => sum + (u.cost_usd || 0), 0) || 0

      return {
        totalCost,
        monthlyCost,
        totalUsage: usage?.length || 0,
      }
    },
    enabled: !!tenant,
  })

  const handleManageBilling = async () => {
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
        window.open(url, '_blank')
      }
    } catch (error) {
      console.error('Error opening billing portal:', error)
    }
  }

  const handleUpgrade = async (plan: 'pro' | 'family') => {
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          successUrl: `${window.location.origin}/admin/billing?success=true`,
          cancelUrl: `${window.location.origin}/admin/billing?canceled=true`,
        }),
      })

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    }
  }

  if (subscriptionLoading || eventsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600">
          Manage your subscription and view billing information
        </p>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Your current plan and billing status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {tenant?.plan?.toUpperCase() || 'FREE'} Plan
                </h3>
                <p className="text-sm text-gray-600">
                  {tenant?.plan === 'free' ? 'No subscription' : 'Active subscription'}
                </p>
              </div>
              <Badge variant={tenant?.status === 'active' ? 'default' : 'destructive'}>
                {tenant?.status || 'Unknown'}
              </Badge>
            </div>

            {subscription && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Period</p>
                  <p className="text-sm">
                    {new Date(subscription.current_period_start).toLocaleDateString()} - {' '}
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-sm">
                    {subscription.cancel_at_period_end ? 'Cancels at period end' : 'Active'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              {tenant?.plan === 'free' ? (
                <>
                  <Button onClick={() => handleUpgrade('pro')}>
                    Upgrade to Pro
                  </Button>
                  <Button onClick={() => handleUpgrade('family')} variant="outline">
                    Upgrade to Family
                  </Button>
                </>
              ) : (
                <Button onClick={handleManageBilling}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Billing
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage & Costs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Usage & Costs
            </CardTitle>
            <CardDescription>
              AI usage costs and consumption
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usageStats ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total AI Cost</span>
                    <span className="text-lg font-bold">${usageStats.totalCost.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">This Month</span>
                    <span className="text-lg font-bold">${usageStats.monthlyCost.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Usage Events</span>
                    <span className="text-lg font-bold">{usageStats.totalUsage}</span>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">No usage data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plan Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Plan Features
            </CardTitle>
            <CardDescription>
              What's included in your current plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tenant?.plan === 'free' && (
                <>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">3 AI meals per day</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">1 pantry list</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Basic recipes</span>
                  </div>
                </>
              )}
              
              {tenant?.plan === 'pro' && (
                <>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Unlimited AI meals</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Unlimited pantry lists</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">AI nutrition summaries</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Advanced recipe filtering</span>
                  </div>
                </>
              )}

              {tenant?.plan === 'family' && (
                <>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Everything in Pro</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Up to 5 family members</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Shared pantry lists</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Family meal planning</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Recent Billing Events
          </CardTitle>
          <CardDescription>
            Latest billing and subscription events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {billingEvents && billingEvents.length > 0 ? (
              billingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{event.event_type}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={event.processed ? 'default' : 'secondary'}>
                    {event.processed ? 'Processed' : 'Pending'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No billing events found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}