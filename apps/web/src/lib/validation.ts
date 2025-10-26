import { z } from 'zod';

// Recipe validation schema
export const RecipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  cookTime: z.string().min(1, 'Cook time is required'),
  calories: z.number().int().positive('Calories must be a positive integer'),
  ingredients: z
    .array(z.string().min(1, 'Ingredient cannot be empty'))
    .min(1, 'At least one ingredient is required'),
  steps: z
    .array(z.string().min(1, 'Step cannot be empty'))
    .min(1, 'At least one step is required'),
});

// API request validation schema
export const GenerateRecipesRequestSchema = z.object({
  ingredients: z
    .array(z.string().min(1, 'Ingredient cannot be empty'))
    .min(1, 'At least one ingredient is required'),
  preferences: z.string().optional().default(''),
});

// Pantry item validation schema
export const PantryItemSchema = z.object({
  ingredient: z.string().min(1, 'Ingredient name is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

// User profile validation schema
export const UserProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  preferences: z.record(z.any()).optional(),
});

// Environment variables validation
export const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'Supabase anon key is required'),
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
});

// Validate environment variables
export function validateEnv() {
  // Skip validation during build time
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    };
  }

  try {
    return EnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new Error(`Environment validation failed: ${missingVars}`);
    }
    throw error;
  }
}

// Type exports
export type Recipe = z.infer<typeof RecipeSchema>;
export type GenerateRecipesRequest = z.infer<
  typeof GenerateRecipesRequestSchema
>;
export type PantryItem = z.infer<typeof PantryItemSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
