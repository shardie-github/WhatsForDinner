'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Recipe } from '@/lib/validation'
import RecipeCard from '@/components/RecipeCard'
import Navbar from '@/components/Navbar'

export default function FavoritesPage() {
  const [user, setUser] = useState<any>(null)
  const [favorites, setFavorites] = useState<Array<{id: number, recipe: Recipe}>>([])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: favorites } = await supabase
          .from('favorites')
          .select(`
            id,
            recipes (
              id,
              title,
              details,
              calories,
              time
            )
          `)
          .eq('user_id', user.id)

        if (favorites) {
          setFavorites(favorites.map(fav => ({
            id: fav.id,
            recipe: fav.recipes as any as Recipe
          })))
        }
      }
    }
    
    getUser()
  }, [])

  const removeFavorite = async (favoriteId: number) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)

      if (error) throw error
      
      setFavorites(favorites.filter(fav => fav.id !== favoriteId))
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Favorite Recipes
          </h1>
          <p className="text-lg text-gray-600">
            Your saved recipes
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No favorite recipes yet</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => (
              <RecipeCard
                key={favorite.id}
                recipe={favorite.recipe}
                onRemove={() => removeFavorite(favorite.id)}
                isFavorite
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}