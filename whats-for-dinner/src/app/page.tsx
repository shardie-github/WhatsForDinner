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
    }
    
    getUser()
  }, [])

  const generateRecipes = async (ingredients: string[], preferences: string) => {
    try {
      const result = await generateRecipesMutation.mutateAsync({ ingredients, preferences })
      setRecipes(result.recipes)
    } catch (error) {
      console.error('Error generating recipes:', error)
    }
  }

  const saveRecipe = async (recipe: Recipe) => {
    if (!user) return

    try {
      await saveRecipeMutation.mutateAsync({ recipe, userId: user.id })
    } catch (error) {
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