import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PantryItem } from '@whats-for-dinner/utils';

// Mock API functions - replace with actual API calls
const getPantryItemsAPI = async (): Promise<PantryItem[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock pantry items
  return [
    {
      id: '1',
      ingredient: 'Chicken breast',
      quantity: 2,
      unit: 'pieces',
      category: 'Protein',
      addedAt: new Date(),
    },
    {
      id: '2',
      ingredient: 'Rice',
      quantity: 1,
      unit: 'cup',
      category: 'Grains',
      addedAt: new Date(),
    },
    {
      id: '3',
      ingredient: 'Tomatoes',
      quantity: 4,
      unit: 'pieces',
      category: 'Vegetables',
      addedAt: new Date(),
    },
  ];
};

const addPantryItemAPI = async (item: Omit<PantryItem, 'id' | 'addedAt'>): Promise<PantryItem> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    ...item,
    id: Date.now().toString(),
    addedAt: new Date(),
  };
};

const removePantryItemAPI = async (id: string): Promise<void> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Pantry item removed:', id);
};

export function usePantryItems() {
  return useQuery({
    queryKey: ['pantry-items'],
    queryFn: getPantryItemsAPI,
  });
}

export function useAddPantryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addPantryItemAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] });
    },
  });
}

export function useRemovePantryItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removePantryItemAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] });
    },
  });
}