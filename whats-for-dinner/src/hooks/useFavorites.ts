import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { Recipe } from '@/lib/validation'

interface Favorite {
  id: number
  recipe: Recipe
}

export function useFavorites(userId?: string) {
  return useQuery({
    queryKey: ['favorites', userId],
    queryFn: async (): Promise<Favorite[]> => {
      if (!userId) return []
      
      const { data, error } = await supabase
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
        .eq('user_id', userId)

      if (error) throw error
      
      return (data || []).map(fav => ({
        id: fav.id,
        recipe: fav.recipes as any as Recipe
      }))
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useSaveRecipe() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    Error,
    { recipe: Recipe; userId: string }
  >({
    mutationFn: async ({ recipe, userId }) => {
      // First save the recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          user_id: userId,
          title: recipe.title,
          details: recipe,
          calories: recipe.calories,
          time: recipe.cookTime,
        })
        .select()
        .single()

      if (recipeError) throw recipeError

      // Then add to favorites
      const { error: favoriteError } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          recipe_id: recipeData.id,
        })

      if (favoriteError) throw favoriteError
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', variables.userId] })
    },
  })
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    Error,
    { favoriteId: number; userId: string }
  >({
    mutationFn: async ({ favoriteId }) => {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', variables.userId] })
    },
  })
}