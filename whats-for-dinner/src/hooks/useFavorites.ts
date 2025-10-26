import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type { Recipe } from '@/lib/validation';
import { useTenant } from './useTenant';

interface Favorite {
  id: number;
  recipe: Recipe;
}

export function useFavorites() {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ['favorites', tenant?.id],
    queryFn: async (): Promise<Favorite[]> => {
      if (!tenant) return [];

      const { data, error } = await supabase
        .from('favorites')
        .select(
          `
          id,
          recipes (
            id,
            title,
            details,
            calories,
            time
          )
        `
        )
        .eq('tenant_id', tenant.id);

      if (error) throw error;

      return (data || []).map(fav => ({
        id: fav.id,
        recipe: fav.recipes as Recipe,
      }));
    },
    enabled: !!tenant,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAddToFavorites() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();

  return useMutation<void, Error, { recipeId: number }>({
    mutationFn: async ({ recipeId }) => {
      if (!tenant) throw new Error('No tenant found');

      const { error } = await supabase.from('favorites').insert({
        tenant_id: tenant.id,
        recipe_id: recipeId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();

  return useMutation<void, Error, { favoriteId: number }>({
    mutationFn: async ({ favoriteId }) => {
      if (!tenant) throw new Error('No tenant found');

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)
        .eq('tenant_id', tenant.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
