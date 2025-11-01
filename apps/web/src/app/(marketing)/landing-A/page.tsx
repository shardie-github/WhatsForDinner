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
import { ChefHat, Clock, Zap } from 'lucide-react';

/**
 * Landing Variant A: Pantry-First, Emotional Hooks
 * Headline: "Never stare at your pantry confused again"
 * Focus: Problem → Solution → Proof
 */
function LandingVariantA() {
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
        variant: 'A',
        experiment_id: 'landing-hero-variant',
        user_authenticated: !!user,
      });

      await trackConversion(
        'landing-hero-variant',
        'page_view',
        user?.id,
        { variant: 'A' }
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
        variant: 'A',
      });

      const result = await generateRecipesMutation.mutateAsync({
        ingredients,
        preferences,
      });
      setRecipes(result.recipes as any); // Type assertion for demo data compatibility

      await analytics.trackEvent('recipe_generation_completed', {
        recipes_count: result.recipes.length,
        variant: 'A',
      });

      // Track conversion
      await trackConversion(
        'landing-hero-variant',
        'recipe_generated',
        user?.id,
        { variant: 'A', recipes_count: result.recipes.length }
      );
    } catch (error) {
      const err = error as Error;
      await analytics.trackEvent('recipe_generation_failed', {
        error: err.message,
        variant: 'A',
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
        variant: 'A',
      });

      await trackConversion(
        'landing-hero-variant',
        'recipe_saved',
        user.id,
        { variant: 'A' }
      );
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  if (!variantLoaded) {
    return null; // Or loading state
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <main className="container mx-auto space-y-8 px-4 py-8">
        {/* Hero Section - Variant A: Problem-Focused */}
        <div className="space-y-6 text-center">
          <div className="space-y-4">
            <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-4xl font-bold text-foreground text-transparent md:text-6xl">
              Never stare at your pantry confused again
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
              Our AI learns your pantry and suggests recipes you'll actually want to make—in under 30 seconds.
            </p>
          </div>

          {/* Proof Points */}
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">30 seconds to dinner</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Recipes that fit YOUR diet</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">No wasted ingredients</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Stats */}
          {tenant && usage && (
            <Card className="mx-auto max-w-2xl">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="space-y-2 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <ChefHat className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <span className="text-lg font-semibold">{tenant.plan.toUpperCase()}</span>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Meals Today</p>
                    <p className="text-lg font-semibold">
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
                      <Button
                        onClick={() => {
                          window.location.href = '/billing';
                          trackConversion('landing-hero-variant', 'upgrade_cta_clicked', user?.id, { variant: 'A' });
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
        {pantryLoading ? (
          <InputPromptSkeleton />
        ) : (
          <InputPrompt
            onGenerate={generateRecipes}
            loading={generateRecipesMutation.isPending}
            pantryItems={pantryItemNames}
          />
        )}

        {/* Loading State */}
        {generateRecipesMutation.isPending && (
          <div className="space-y-6">
            <h2 className="text-center text-2xl font-semibold">
              Finding recipes for your ingredients...
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
                Recipes You Can Make Right Now
              </h2>
              <p className="text-muted-foreground">
                Found {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} for you
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

export default function LandingPageA() {
  return (
    <QueryClientProvider client={queryClient}>
      <LandingVariantA />
    </QueryClientProvider>
  );
}
