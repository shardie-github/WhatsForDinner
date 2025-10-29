'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Zap, ChefHat, Crown } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { trackConversion } from '@/lib/experiments';
import Navbar from '@/components/Navbar';

interface Plan {
  id: string;
  name: string;
  price: string;
  priceId?: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  cta: string;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying out meal planning',
    features: [
      '10 recipes per day',
      'Basic dietary preferences',
      'Save up to 20 recipes',
      'Mobile & web access',
    ],
    icon: <Zap className="h-6 w-6" />,
    cta: 'Current Plan',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID, // Set in env
    description: 'For serious home cooks',
    features: [
      'Unlimited recipes',
      'Advanced dietary filters',
      'Unlimited recipe saves',
      'Pantry sync across devices',
      'AI personalization',
      'Export recipes (PDF, CSV)',
    ],
    icon: <ChefHat className="h-6 w-6" />,
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$19.99',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID, // Set in env
    description: 'Everything you need for meal planning',
    features: [
      'Everything in Pro',
      'Weekly meal planning',
      'Grocery delivery integration',
      'Priority AI responses',
      'Advanced analytics',
      'Dedicated support',
    ],
    icon: <Crown className="h-6 w-6" />,
    cta: 'Upgrade to Premium',
  },
];

export default function PricingPage() {
  const [user, setUser] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Get user's current plan
        const { data: profile } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('id', user.id)
          .single();

        if (profile?.tenant_id) {
          const { data: tenant } = await supabase
            .from('tenants')
            .select('plan')
            .eq('id', profile.tenant_id)
            .single();

          if (tenant?.plan) {
            setCurrentPlan(tenant.plan);
          }
        }
      }

      // Track page view
      await analytics.trackEvent('pricing_page_viewed', {
        user_authenticated: !!user,
        current_plan: currentPlan,
      });
    };

    getUser();
  }, []);

  const handleUpgrade = async (planId: string, priceId?: string) => {
    if (!user) {
      // Redirect to sign up
      window.location.href = '/auth';
      return;
    }

    if (planId === currentPlan) {
      return; // Already on this plan
    }

    setLoading(true);

    try {
      // Track conversion
      await trackConversion(
        'landing-hero-variant',
        'upgrade_initiated',
        user.id,
        { plan: planId }
      );

      // Create checkout session
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planId,
          successUrl: `${window.location.origin}/pricing?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      const { sessionId, url } = await response.json();

      if (url) {
        // Redirect to Stripe checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error initiating checkout:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <main className="container mx-auto space-y-12 px-4 py-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold md:text-5xl">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade anytime. All plans include our core AI recipe generation.
          </p>
        </div>

        {/* Plans */}
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? 'border-primary shadow-lg scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center space-x-2 mb-2">
                  {plan.icon}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{plan.price}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
                <CardDescription className="pt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleUpgrade(plan.id, plan.priceId)}
                  disabled={loading || plan.id === currentPlan}
                >
                  {plan.id === currentPlan ? plan.cta : plan.id === 'free' ? 'Get Started' : plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ / Additional Info */}
        <div className="max-w-3xl mx-auto space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include a 14-day free trial. Cancel anytime. No credit card required for Free plan.
          </p>
        </div>
      </main>
    </div>
  );
}
