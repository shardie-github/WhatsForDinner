'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Recipe } from '@/lib/openaiClient'
import RecipeCard from '@/components/RecipeCard'
import InputPrompt from '@/components/InputPrompt'
import Navbar from '@/components/Navbar'

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [pantryItems, setPantryItems] = useState<string[]>([])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Fetch pantry items
        const { data: pantry } = await supabase
          .from('pantry_items')
          .select('ingredient')
          .eq('user_id', user.id)
        
        if (pantry) {
          setPantryItems(pantry.map(item => item.ingredient))
        }
      }
    }
    
    getUser()
  }, [])

  const generateRecipes = async (ingredients: string[], preferences: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/dinner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients, preferences }),
      })
      
      const data = await response.json()
      setRecipes(data.recipes)
    } catch (error) {
      console.error('Error generating recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveRecipe = async (recipe: Recipe) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert({
          user_id: user.id,
          title: recipe.title,
          details: recipe,
          calories: recipe.calories,
          time: recipe.cookTime,
        })
        .select()
        .single()

      if (error) throw error

      // Add to favorites
      await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          recipe_id: data.id,
        })
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

        <InputPrompt
          onGenerate={generateRecipes}
          loading={loading}
          pantryItems={pantryItems}
        />

        {recipes.length > 0 && (
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
      </main>
    </div>
  )
}