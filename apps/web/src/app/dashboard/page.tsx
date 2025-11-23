/**
 * Dashboard Page
 * Main user dashboard with daily hooks, suggestions, and quick actions
 */

'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { DailyRetentionHooks } from '@/components/DailyRetentionHooks';
import { TrustSignals } from '@/components/TrustSignals';
import { CTAOptimizer } from '@/components/CTAOptimizer';
import { AIPersonality } from '@/components/AIPersonality';
import { SocialProofWidget } from '@/components/SocialProofWidget';
import SmartUpsell from '@/components/monetization/SmartUpsell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Play, ShoppingCart, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user as { id: string });
        // Get tenant_id from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('tenant_id')
          .eq('id', user.id)
          .single();
        if (profile?.tenant_id) {
          setTenantId(profile.tenant_id);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/home');
    return null;
  }

  return (
    <div className="min-h-screen p-4 pb-24 md:pb-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-muted-foreground">
              Let's find something delicious for dinner
            </p>
          </div>

          {/* AI Personality Greeting */}
          <AIPersonality context="greeting" />

          {/* Daily Retention Hooks */}
          <DailyRetentionHooks userId={user.id} />

          {/* Smart Upsell Opportunities */}
          {user && tenantId && (
            <SmartUpsell userId={user.id} tenantId={tenantId} />
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:border-primary transition-colors" asChild>
              <Link href="/surprise-me">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-semibold">Surprise Me</div>
                  <div className="text-xs text-muted-foreground mt-1">Get instant recipe</div>
                </CardContent>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" asChild>
              <Link href="/play">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-semibold">Play Games</div>
                  <div className="text-xs text-muted-foreground mt-1">Decision games</div>
                </CardContent>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" asChild>
              <Link href="/grocery">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-semibold">Shop</div>
                  <div className="text-xs text-muted-foreground mt-1">Grocery lists</div>
                </CardContent>
              </Link>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" asChild>
              <Link href="/meal-planner">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <UtensilsCrossed className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-semibold">Meal Plan</div>
                  <div className="text-xs text-muted-foreground mt-1">Weekly planning</div>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <CTAOptimizer 
            variant="primary" 
            context="dashboard" 
            userState={user ? 'returning' : 'new'}
            size="lg"
          />
          <CTAOptimizer 
            variant="secondary" 
            context="dashboard" 
            userState={user ? 'returning' : 'new'}
            size="lg"
          />
        </div>

        {/* Social Proof */}
        <div className="grid md:grid-cols-2 gap-4">
          <TrustSignals variant="compact" />
          <SocialProofWidget />
        </div>

        {/* Recent Activity / Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>Your Recent Recipes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recipes yet. Get started by generating your first recipe!</p>
              <Button asChild className="mt-4">
                <Link href="/surprise-me">
                  Generate Recipe
                  <Sparkles className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
