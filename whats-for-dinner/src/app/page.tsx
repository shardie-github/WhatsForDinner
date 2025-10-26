'use client'

import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { Recipe } from '@/lib/validation'
import { useGenerateRecipes } from '@/hooks/useRecipes'
import { usePantryItems } from '@/hooks/usePantry'
import { useSaveRecipe } from '@/hooks/useFavorites'
import RecipeCard from '@/components/RecipeCard'
import InputPrompt from '@/components/InputPrompt'
import Navbar from '@/components/Navbar'
import { RecipeCardSkeleton, InputPromptSkeleton } from '@/components/SkeletonLoader'
import { queryClient } from '@/lib/queryClient'
import { analytics } from '@/lib/analytics'
import { logger } from '@/lib/logger'

function HomeContent() {
  const [user, setUser] = useState<any>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  
  const generateRecipesMutation = useGenerateRecipes()
  const saveRecipeMutation = useSaveRecipe()
  const { data: pantryItems = [], isLoading: pantryLoading } = usePantryItems(user?.id)
  const pantryItemNames = (pantryItems as any[]).map(item => item.ingredient)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Set user ID for analytics
      if (user) {
        analytics.setUserId(user.id)
        logger.setUserId(user.id)
      }
      
      // Track page view
      await analytics.trackEvent('page_viewed', {
        page: 'home',
        user_authenticated: !!user
      })
    }
    
    getUser()
  }, [])

  const generateRecipes = async (ingredients: string[], preferences: string) => {
    try {
      // Track recipe generation start
      await analytics.trackEvent('recipe_generation_started', {
        ingredients_count: ingredients.length,
        has_preferences: !!preferences,
        user_authenticated: !!user
      })
      
      const result = await generateRecipesMutation.mutateAsync({ ingredients, preferences })
      setRecipes(result.recipes)
      
      // Track successful generation
      await analytics.trackEvent('recipe_generation_completed', {
        recipes_count: result.recipes.length,
        api_latency: result.metadata?.apiLatencyMs || 0,
        confidence_score: result.metadata?.confidenceScore || 0
      })
      
      await logger.info('Recipes generated successfully', {
        count: result.recipes.length,
        ingredients: ingredients.length,
        user_id: user?.id
      }, 'frontend', 'recipe_generation')
    } catch (error) {
      await logger.error('Recipe generation failed', {
        error: error.message,
        ingredients: ingredients.length,
        user_id: user?.id
      }, 'frontend', 'recipe_generation', error as Error)
      
      await analytics.trackEvent('recipe_generation_failed', {
        error: error.message,
        ingredients_count: ingredients.length
      })
      
      console.error('Error generating recipes:', error)
    }
  }

  const saveRecipe = async (recipe: Recipe) => {
    if (!user) return

    try {
      await saveRecipeMutation.mutateAsync({ recipe, userId: user.id })
      
      // Track recipe save
      await analytics.trackEvent('recipe_saved', {
        recipe_title: recipe.title,
        user_id: user.id
      })
      
      await logger.info('Recipe saved successfully', {
        recipe_title: recipe.title,
        user_id: user.id
      }, 'frontend', 'recipe_save')
    } catch (error) {
      await logger.error('Recipe save failed', {
        error: error.message,
        recipe_title: recipe.title,
        user_id: user.id
      }, 'frontend', 'recipe_save', error as Error)
      
      console.error('Error saving recipe:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            What's for Dinner?
          </h1>
          <p className="text-lg text-gray-600">
            Get AI-powered meal suggestions based on your pantry and preferences
          </p>
        </div>

        {pantryLoading ? (
          <InputPromptSkeleton />
        ) : (
          <InputPrompt
            onGenerate={generateRecipes}
            loading={generateRecipesMutation.isPending}
            pantryItems={pantryItemNames}
          />
        )}

        {generateRecipesMutation.isPending && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Generating Recipes...
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <RecipeCardSkeleton />
              <RecipeCardSkeleton />
              <RecipeCardSkeleton />
            </div>
          </div>
        )}

        {recipes.length > 0 && !generateRecipesMutation.isPending && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Suggested Recipes
            </h2>
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

        {generateRecipesMutation.error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">
              Error generating recipes: {generateRecipesMutation.error.message}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomeContent />
    </QueryClientProvider>
  )
}