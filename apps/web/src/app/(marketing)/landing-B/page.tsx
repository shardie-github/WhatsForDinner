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
import { RecipeCardSkeleton, InputPromptSkeleton } from '@/components/SkeletonLoader';
import { queryClient } from '@/lib/queryClient';
import { analytics } from '@/lib/analytics';
import { logger } from '@/lib/logger';
import { getVariant, trackConversion } from '@/lib/experiments';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Users, ArrowRight } from 'lucide-react';

/**
 * Landing Variant B: Outcome-Focused, Proof Points
 * Headline: "From pantry to plate in 30 seconds"
 * Focus: Outcome → Proof → Action
 */
function LandingVariantB() {
  const [user, setUser] = useState<any>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [variantLoaded, setVariantLoaded] = useState(false);

  const generateRecipesMutation = useGenerateRecipes();
  const saveRecipeMutation = useSaveRecipe();
  const { data: pantryItems = [], isLoading: pantryLoading } = usePantryItems();
  const { tenant, usage } = useTenant();
  const pantryItemNames = (pantryItems as any[]).map(item => item.ingredient);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        analytics.setUserId(user.id);
        logger.setUserId(user.id);
      }

      // Assign and track variant
      getVariant('landing-hero-variant', user?.id);
      setVariantLoaded(true);

      await analytics.trackEvent('page_viewed', {
        page: 'landing',
        variant: 'B',
        experiment_id: 'landing-hero-variant',
        user_authenticated: !!user,
      });

      await trackConversion(
        'landing-hero-variant',
        'page_view',
        user?.id,
        { variant: 'B' }
      );
    };

    getUser();
  }, []);

  const generateRecipes = async (
    ingredients: string[],
    preferences: string
  ) => {
    try {
      await analytics.trackEvent('recipe_generation_started', {
        ingredients_count: ingredients.length,
        has_preferences: !!preferences,
        variant: 'B',
      });

      const result = await generateRecipesMutation.mutateAsync({
        ingredients,
        preferences,
      });
      setRecipes(result.recipes as any);

      await analytics.trackEvent('recipe_generation_completed', {
        recipes_count: result.recipes.length,
        variant: 'B',
      });

      // Track conversion
      await trackConversion(
        'landing-hero-variant',
        'recipe_generated',
        user?.id,
        { variant: 'B', recipes_count: result.recipes.length }
      );
    } catch (error) {
      const err = error as Error;
      await analytics.trackEvent('recipe_generation_failed', {
        error: err.message,
        variant: 'B',
      });
      console.error('Error generating recipes:', error);
    }
  };

  const saveRecipe = async (recipe: Recipe) => {
    if (!user) return;

    try {
      await saveRecipeMutation.mutateAsync(recipe as any);
      await analytics.trackEvent('recipe_saved', {
        recipe_title: recipe.title,
        variant: 'B',
      });

      await trackConversion(
        'landing-hero-variant',
        'recipe_saved',
        user.id,
        { variant: 'B' }
      );
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  if (!variantLoaded) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <main className="container mx-auto space-y-8 px-4 py-8">
        {/* Hero Section - Variant B: Outcome-Focused */}
        <div className="space-y-6 text-center">
          <div className="space-y-4">
            <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-4xl font-bold text-foreground text-transparent md:text-6xl">
              From pantry to plate in 30 seconds
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
              Stop wondering what's for dinner. Get AI-powered recipes that fit your kitchen, your diet, and your schedule.
            </p>
          </div>

          {/* Social Proof / Stats */}
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-2">
                  <Sparkles className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold">10K+</span>
                  <span className="text-sm text-muted-foreground">Recipes generated</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-2">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold">15 min</span>
                  <span className="text-sm text-muted-foreground">Saved per meal</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-2">
                  <Users className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold">70%</span>
                  <span className="text-sm text-muted-foreground">Return within 7 days</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="mx-auto flex max-w-2xl justify-center">
            <Button
              size="lg"
              onClick={() => {
                document.getElementById('recipe-input')?.scrollIntoView({ behavior: 'smooth' });
                trackConversion('landing-hero-variant', 'cta_clicked', user?.id, { variant: 'B' });
              }}
              className="space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Usage Stats */}
          {tenant && usage && (
            <Card className="mx-auto max-w-2xl">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="space-y-2 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <span className="text-lg font-semibold">{tenant.plan.toUpperCase()}</span>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Meals Today</p>
                    <p className="text-lg font-semibold">
                      {usage.total_meals_today} / {usage.plan_quota}
                    </p>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                      <ArrowRight className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-lg font-semibold text-green-600">
                      {usage.remaining_quota}
                    </p>
                  </div>
                  {tenant.plan === 'free' && (
                    <div className="space-y-2 text-center">
                      <Button
                        onClick={() => {
                          window.location.href = '/billing';
                          trackConversion('landing-hero-variant', 'upgrade_cta_clicked', user?.id, { variant: 'B' });
                        }}
                        className="w-full"
                      >
                        Upgrade
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Input Section */}
        <div id="recipe-input">
          {pantryLoading ? (
            <InputPromptSkeleton />
          ) : (
            <InputPrompt
              onGenerate={generateRecipes}
              loading={generateRecipesMutation.isPending}
              pantryItems={pantryItemNames}
            />
          )}
        </div>

        {/* Loading State */}
        {generateRecipesMutation.isPending && (
          <div className="space-y-6">
            <h2 className="text-center text-2xl font-semibold">
              Creating personalized recipes...
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
              <h2 className="mb-2 text-2xl font-semibold">
                Your Personalized Recipes
              </h2>
              <p className="text-muted-foreground">
                {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} ready to cook
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe, index) => (
                <RecipeCard
                  key={index}
                  recipe={recipe as any}
                  onSave={() => saveRecipe(recipe)}
                  canSave={!!user}
                  userId={user?.id}
                  recipeId={index + 1}
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
                <span className="text-xs font-bold">!</span>
                <p className="font-medium">
                  Error generating recipes: {generateRecipesMutation.error.message}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function LandingPageB() {
  return (
    <QueryClientProvider client={queryClient}>
      <LandingVariantB />
    </QueryClientProvider>
  );
}
