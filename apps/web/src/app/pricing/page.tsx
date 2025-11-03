'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedCard } from '@/components/ui/animated-card';
import { Check, Zap, ChefHat, Crown, Sparkles, Star, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/10 to-background">
      <Navbar user={user} />

      <main className="container mx-auto space-y-12 px-4 py-12 sm:py-16">
        {/* Header */}
        <AnimatedCard delay={0}>
          <div className="text-center space-y-6 mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
              Choose Your <span className="gradient-text">Plan</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade anytime. All plans include our core AI recipe generation.
            </p>
          </div>
        </AnimatedCard>

        {/* Plans */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {PLANS.map((plan, index) => (
            <AnimatedCard key={plan.id} delay={100 + index * 100}>
              <Card
                className={`relative h-full flex flex-col transition-all duration-300 border-2 ${
                  plan.popular
                    ? 'border-primary shadow-xl scale-[1.02] bg-gradient-to-b from-primary/5 to-background'
                    : 'hover:shadow-lg hover:border-primary/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Most Popular
                    </Badge>
                  </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-3 rounded-xl ${
                    plan.popular ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <div className={plan.popular ? 'text-primary' : 'text-muted-foreground'}>
                      {plan.icon}
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-2xl sm:text-3xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-1">{plan.description}</CardDescription>
                  </div>
                </div>
                <div className="space-y-1 pt-4 border-t">
                  <div className="text-4xl sm:text-5xl font-bold">{plan.price}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 flex-grow flex flex-col">
                <ul className="space-y-3 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1 rounded ${
                        plan.popular ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Check className={`h-4 w-4 ${
                          plan.popular ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full group ${
                    plan.popular
                      ? 'bg-primary hover:bg-primary/90 shadow-lg'
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => handleUpgrade(plan.id, plan.priceId)}
                  disabled={loading || plan.id === currentPlan}
                >
                  {plan.id === currentPlan ? (
                    plan.cta
                  ) : plan.id === 'free' ? (
                    'Get Started'
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </AnimatedCard>
          ))}
        </div>

        {/* FAQ / Additional Info */}
        <AnimatedCard delay={500}>
          <Card className="border-2 bg-muted/50">
            <CardContent className="pt-6">
              <div className="max-w-3xl mx-auto space-y-4 text-center">
                <p className="text-sm sm:text-base text-muted-foreground">
                  All plans include a 14-day free trial. Cancel anytime. No credit card required for Free plan.
                </p>
                <div className="flex items-center justify-center gap-6 flex-wrap text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>14-day free trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Cancel anytime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>No credit card (Free)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </main>
    </div>
  );
}
