/**
 * Pantry-related TypeScript types
 */

export interface PantryItem {
  id: string;
  user_id: string;
  ingredient: string;
  quantity: number;
  unit?: string;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}
