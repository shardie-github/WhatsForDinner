/**
 * Recipe-related TypeScript types
 */

export interface RecipeFeedback {
  id: string;
  recipe_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}
