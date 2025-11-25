/**
 * User-related TypeScript types
 */

import type { User as SupabaseUser } from '@supabase/supabase-js';

export type Plan = 'free' | 'premium' | 'partner';

export interface UserPreferences {
  diet?: string[];
  allergens?: string[];
  units?: 'metric' | 'imperial';
  theme?: 'light' | 'dark';
  [key: string]: unknown;
}

export interface AppUser extends SupabaseUser {
  plan?: Plan;
  preferences?: UserPreferences;
}

export interface UserProfile {
  id: string;
  email: string;
  plan: Plan;
  preferences: UserPreferences | null;
}
