import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { PantryItem } from '@/lib/validation'

export function usePantryItems(userId?: string) {
  return useQuery({
    queryKey: ['pantry', userId],
    queryFn: async (): Promise<PantryItem[]> => {
      if (!userId) return []
      
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', userId)
        .order('ingredient')

      if (error) throw error
      return data || []
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useAddPantryItem() {
  const queryClient = useQueryClient()

  return useMutation<
    PantryItem,
    Error,
    { ingredient: string; quantity: number; userId: string }
  >({
    mutationFn: async ({ ingredient, quantity, userId }) => {
      const { data, error } = await supabase
        .from('pantry_items')
        .insert({
          user_id: userId,
          ingredient,
          quantity,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pantry', variables.userId] })
    },
  })
}

export function useUpdatePantryItem() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    Error,
    { id: number; quantity: number; userId: string }
  >({
    mutationFn: async ({ id, quantity }) => {
      const { error } = await supabase
        .from('pantry_items')
        .update({ quantity })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pantry', variables.userId] })
    },
  })
}

export function useDeletePantryItem() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    Error,
    { id: number; userId: string }
  >({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .from('pantry_items')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pantry', variables.userId] })
    },
  })
}