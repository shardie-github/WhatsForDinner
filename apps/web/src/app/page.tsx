'use client';

import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Recipe } from '@whats-for-dinner/utils';
import { useGenerateRecipes, useSaveRecipe } from '@/hooks/useRecipes';
import { usePantryItems } from '@/hooks/usePantry';
import { useTenant } from '@/hooks/useTenant';
import RecipeCard from '@/components/RecipeCard';
import InputPrompt from '@/components/InputPrompt';
import Navbar from '@/components/Navbar';
import {
  RecipeCardSkeleton,
  InputPromptSkeleton,
} from '@/components/SkeletonLoader';
import { queryClient } from '@/lib/queryClient';
import { analytics } from '@/lib/analytics';
import { logger } from '@/lib/logger';
import { getVariant, shouldShowExperiment, trackConversion } from '@/lib/experiments';
import OnboardingChecklist from '@/components/OnboardingChecklist';
import EmptyStateGuide from '@/components/EmptyStateGuide';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChefHat, Clock, Users, Zap } from 'lucide-react';

function HomeContent() {
  const [user, setUser] = useState<any>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [variant, setVariant] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const generateRecipesMutation = useGenerateRecipes();
  const saveRecipeMutation = useSaveRecipe();
  const { data: pantryItems = [], isLoading: pantryLoading } = usePantryItems();
  const { tenant, usage } = useTenant();
  const pantryItemNames = (pantryItems as any[]).map(item => item.ingredient);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Set user ID for analytics
      if (user) {
        analytics.setUserId(user.id);
        logger.setUserId(user.id);
      }

      // Assign variant for landing hero experiment
      if (shouldShowExperiment('landing-hero-variant', user?.id)) {
        const assignedVariant = getVariant('landing-hero-variant', user?.id);
        setVariant(assignedVariant);
        
        // Redirect to variant pages if A or B (C uses default)
        if (assignedVariant === 'A') {
          window.location.href = '/landing-A';
          return;
        } else if (assignedVariant === 'B') {
          window.location.href = '/landing-B';
          return;
        }
        // Variant C or control: use default homepage
      }

      // Track page view
      await analytics.trackEvent('page_viewed', {
        page: 'home',
        variant: variant || 'default',
        user_authenticated: !!user,
      });

      // Show onboarding checklist if new user
      if (user) {
        const { data: onboarding } = await supabase
          .from('onboarding_state')
          .select('checklist_completed')
          .eq('user_id', user.id)
          .single();
        
        if (!onboarding?.checklist_completed) {
          setShowOnboarding(true);
        }
      }
    };

    getUser();
  }, [variant]);

  const generateRecipes = async (
    ingredients: string[],
    preferences: string
  ) => {
    try {
      // Track recipe generation start
      await analytics.trackEvent('recipe_generation_started', {
        ingredients_count: ingredients.length,
        has_preferences: !!preferences,
        user_authenticated: !!user,
      });

      const result = await generateRecipesMutation.mutateAsync({
        ingredients,
        preferences,
      });
      setRecipes(result.recipes);

      // Track successful generation
      await analytics.trackEvent('recipe_generation_completed', {
        recipes_count: result.recipes.length,
        api_latency: result.metadata?.apiLatencyMs || 0,
        confidence_score: result.metadata?.confidenceScore || 0,
      });

      await logger.info(
        'Recipes generated successfully',
        {
          count: result.recipes.length,
          ingredients: ingredients.length,
          user_id: user?.id,
        },
        'frontend',
        'recipe_generation'
      );
    } catch (error) {
      await logger.error(
        'Recipe generation failed',
        {
          error: error.message,
          ingredients: ingredients.length,
          user_id: user?.id,
        },
        'frontend',
        'recipe_generation',
        error as Error
      );

      await analytics.trackEvent('recipe_generation_failed', {
        error: error.message,
        ingredients_count: ingredients.length,
      });

      console.error('Error generating recipes:', error);
    }
  };

  const saveRecipe = async (recipe: Recipe) => {
    if (!user) return;

    try {
      await saveRecipeMutation.mutateAsync(recipe);

      // Track recipe save
      await analytics.trackEvent('recipe_saved', {
        recipe_title: recipe.title,
        user_id: user.id,
      });

      await logger.info(
        'Recipe saved successfully',
        {
          recipe_title: recipe.title,
          user_id: user.id,
        },
        'frontend',
        'recipe_save'
      );
    } catch (error) {
      await logger.error(
        'Recipe save failed',
        {
          error: error.message,
          recipe_title: recipe.title,
          user_id: user.id,
        },
        'frontend',
        'recipe_save',
        error as Error
      );

      console.error('Error saving recipe:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <main className="container mx-auto space-y-8 px-4 py-8">
        {/* Hero Section - Variant C (Proof-Focused) or Default */}
        <div className="space-y-6 text-center">
          <div className="space-y-4">
            <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-4xl font-bold text-foreground text-transparent md:text-6xl">
              {variant === 'C' 
                ? '10,000+ recipes generated this month' 
                : variant === 'A'
                ? "Never stare at your pantry confused again"
                : variant === 'B'
                ? "From pantry to plate in 30 seconds"
                : "What's for Dinner?"
              }
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
              {variant === 'C' 
                ? 'Join thousands using AI to plan meals from ingredients they already have. Save 15 minutes per meal.'
                : variant === 'A'
                ? "Our AI learns your pantry and suggests recipes you'll actually want to make—in under 30 seconds."
                : variant === 'B'
                ? "Stop wondering what's for dinner. Get AI-powered recipes that fit your kitchen, your diet, and your schedule."
                : 'Get AI-powered meal suggestions based on your pantry and preferences'
              }
            </p>
          </div>

          {/* Usage Stats */}
          {tenant && usage && (
            <Card className="mx-auto max-w-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-center text-lg">Your Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="space-y-2 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <ChefHat className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <Badge variant="outline" className="font-semibold">
                      {tenant.plan.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Meals Today</p>
                    <p className="text-lg font-semibold text-foreground">
                      {usage.total_meals_today} / {usage.plan_quota}
                    </p>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                      <Zap className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-lg font-semibold text-green-600">
                      {usage.remaining_quota}
                    </p>
                  </div>
                  {tenant.plan === 'free' && (
                    <div className="space-y-2 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                        <Users className="h-6 w-6 text-orange-600" />
                      </div>
                      <p className="text-sm text-muted-foreground">Upgrade</p>
                      <a
                        href="/pricing"
                        onClick={async () => {
                          await analytics.trackEvent('upgrade_cta_clicked', {
                            location: 'homepage_usage_card',
                            current_plan: tenant.plan,
                            remaining_quota: usage.remaining_quota,
                            user_id: user?.id,
                          });
                          await trackConversion('landing-hero-variant', 'upgrade_cta_clicked', user?.id, {
                            location: 'homepage',
                          });
                        }}
                        className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        Upgrade Plan
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Empty State or Input Section */}
        {pantryLoading ? (
          <InputPromptSkeleton />
        ) : pantryItemNames.length === 0 && recipes.length === 0 ? (
          <EmptyStateGuide
            onAddIngredients={() => {
              // Navigate to pantry manager or show add modal
              window.location.href = '/pantry';
            }}
            onTrySample={async () => {
              try {
                const response = await fetch('/api/pantry/seed-sample', {
                  method: 'POST',
                });
                if (response.ok) {
                  window.location.reload();
                }
              } catch (error) {
                console.error('Error seeding sample data:', error);
              }
            }}
          />
        ) : (
          <InputPrompt
            onGenerate={generateRecipes}
            loading={generateRecipesMutation.isPending}
            pantryItems={pantryItemNames}
          />
        )}

        {/* Onboarding Checklist */}
        {showOnboarding && user && (
          <OnboardingChecklist
            userId={user.id}
            onComplete={() => setShowOnboarding(false)}
            onDismiss={() => setShowOnboarding(false)}
          />
        )}

        {/* Loading State */}
        {generateRecipesMutation.isPending && (
          <div className="space-y-6">
            <h2 className="text-center text-2xl font-semibold text-foreground">
              Generating Recipes...
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <RecipeCardSkeleton />
              <RecipeCardSkeleton />
              <RecipeCardSkeleton />
            </div>
          </div>
        )}

        {/* Results Section */}
        {recipes.length > 0 && !generateRecipesMutation.isPending && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-semibold text-foreground">
                Suggested Recipes
              </h2>
              <p className="text-muted-foreground">
                Found {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}{' '}
                for you
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe, index) => (
                <RecipeCard
                  key={index}
                  recipe={recipe}
                  onSave={() => saveRecipe(recipe)}
                  canSave={!!user}
                  userId={user?.id}
                  recipeId={index + 1} // This would be the actual recipe ID in a real implementation
                />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {generateRecipesMutation.error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-destructive">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/20">
                  <span className="text-xs font-bold">!</span>
                </div>
                <p className="font-medium">
                  Error generating recipes:{' '}
                  {generateRecipesMutation.error.message}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomeContent />
    </QueryClientProvider>
  );
}
