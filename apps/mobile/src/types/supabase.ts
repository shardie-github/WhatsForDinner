/**
 * Supabase Types for Mobile App
 * Generated types for Supabase database schema
 */

export interface Profile {
  id: string;
  name: string | null;
  preferences: Record<string, unknown> | null;
  tenant_id: string | null;
  role: 'owner' | 'editor' | 'viewer';
}

export interface PantryItem {
  id: number;
  user_id: string;
  ingredient: string;
  quantity: number;
  tenant_id?: string | null;
  is_sample?: boolean;
}

export interface Recipe {
  id: number;
  user_id: string;
  title: string;
  details: Record<string, unknown>;
  calories: number;
  time: string;
  tenant_id?: string | null;
}

export interface Favorite {
  id: number;
  user_id: string;
  recipe_id: number;
  tenant_id?: string | null;
}
