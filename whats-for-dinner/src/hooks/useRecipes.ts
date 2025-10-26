import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Recipe, GenerateRecipesRequest } from '@/lib/validation'

interface GenerateRecipesResponse {
  recipes: Recipe[]
  metadata: {
    model: string
    timestamp: string
    retryCount: number
  }
}

export function useGenerateRecipes() {
  const queryClient = useQueryClient()

  return useMutation<GenerateRecipesResponse, Error, GenerateRecipesRequest>({
    mutationFn: async ({ ingredients, preferences }) => {
      const response = await fetch('/api/dinner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients, preferences }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate recipes')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Cache the generated recipes
      queryClient.setQueryData(['recipes', data.metadata.timestamp], data.recipes)
    },
  })
}

export function useRecipes(timestamp?: string) {
  const queryClient = useQueryClient()
  return queryClient.getQueryData<Recipe[]>(['recipes', timestamp])
}