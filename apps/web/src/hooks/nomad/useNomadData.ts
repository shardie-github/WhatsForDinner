import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

// User Profile Hook
export function useUserProfile() {
  return useQuery({
    queryKey: ['nomad', 'user', 'profile'],
    queryFn: async () => {
      const response = await fetch('/api/nomad/user');
      if (!response.ok) throw new Error('Failed to fetch user profile');
      return response.json();
    },
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/nomad/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nomad', 'user'] });
    },
  });
}

// Meal Plan Hooks
export function useMealPlans(week?: string, familyId?: string) {
  const params = new URLSearchParams();
  if (week) params.set('week', week);
  if (familyId) params.set('family_id', familyId);

  return useQuery({
    queryKey: ['nomad', 'meal-plans', week, familyId],
    queryFn: async () => {
      const response = await fetch(`/api/nomad/mealplan?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch meal plans');
      return response.json();
    },
  });
}

export function useCreateMealPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/nomad/mealplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create meal plan');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nomad', 'meal-plans'] });
    },
  });
}

export function useDeleteMealPlan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (mealPlanId: string) => {
      const response = await fetch(`/api/nomad/mealplan?id=${mealPlanId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete meal plan');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nomad', 'meal-plans'] });
    },
  });
}

// Recipe Hooks
export function useRecipes(options?: {
  preferences?: string[];
  allergens?: string[];
  limit?: number;
  aiRecommended?: boolean;
}) {
  const params = new URLSearchParams();
  if (options?.preferences) params.set('preferences', options.preferences.join(','));
  if (options?.allergens) params.set('allergens', options.allergens.join(','));
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.aiRecommended) params.set('ai', 'true');

  return useQuery({
    queryKey: ['nomad', 'recipes', options],
    queryFn: async () => {
      const response = await fetch(`/api/nomad/recipes?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch recipes');
      return response.json();
    },
  });
}

export function useAIRecipeRecommendations() {
  return useMutation({
    mutationFn: async (data: {
      pantryItems?: string[];
      preferences?: string[];
      dietaryRestrictions?: string[];
      healthGoals?: string[];
    }) => {
      const response = await fetch('/api/nomad/recipes/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to get AI recommendations');
      return response.json();
    },
  });
}

// Nutrition Hook
export function useNutritionData(query?: string, barcode?: string) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (barcode) params.set('barcode', barcode);

  return useQuery({
    queryKey: ['nomad', 'nutrition', query, barcode],
    queryFn: async () => {
      if (!query && !barcode) return null;
      const response = await fetch(`/api/nomad/nutrition?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch nutrition data');
      return response.json();
    },
    enabled: !!(query || barcode),
  });
}

// Family Hooks
export function useFamily() {
  return useQuery({
    queryKey: ['nomad', 'family'],
    queryFn: async () => {
      const response = await fetch('/api/nomad/family');
      if (!response.ok) throw new Error('Failed to fetch family data');
      return response.json();
    },
  });
}

export function useFamilyChat(familyId?: string) {
  return useQuery({
    queryKey: ['nomad', 'family', 'chat', familyId],
    queryFn: async () => {
      if (!familyId) return null;
      const response = await fetch(`/api/nomad/family/chat?family_id=${familyId}`);
      if (!response.ok) throw new Error('Failed to fetch chat messages');
      return response.json();
    },
    enabled: !!familyId,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
}

export function useSendFamilyMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { familyId: string; message: string; type?: string }) => {
      const response = await fetch('/api/nomad/family/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['nomad', 'family', 'chat', variables.familyId] 
      });
    },
  });
}

// Real-time chat hook using Supabase Realtime
export function useRealtimeFamilyChat(familyId?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const { data: initialMessages } = useFamilyChat(familyId);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages.messages || []);
    }
  }, [initialMessages]);

  // In production, set up Supabase Realtime subscription
  // useEffect(() => {
  //   if (!familyId) return;
  //   
  //   const channel = supabase
  //     .channel(`family-chat:${familyId}`)
  //     .on('postgres_changes', {
  //       event: 'INSERT',
  //       schema: 'public',
  //       table: 'family_chat_messages',
  //       filter: `family_id=eq.${familyId}`,
  //     }, (payload) => {
  //       setMessages((prev) => [...prev, payload.new]);
  //     })
  //     .subscribe();
  //   
  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [familyId]);

  return { messages, setMessages };
}
