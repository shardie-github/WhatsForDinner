import { z } from 'zod';

// Security: Sanitize strings to prevent XSS
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 10000); // Max length
}

// Security: Validate email format
const emailSchema = z.string().email('Invalid email format').transform((val) => sanitizeString(val));

// Security: Validate URLs
const urlSchema = z.string().url('Invalid URL format').refine(
  (url) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  },
  { message: 'URL must use http or https protocol' }
);

// Recipe validation schema with security enhancements
export const RecipeSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .transform(sanitizeString),
  cookTime: z.string()
    .min(1, 'Cook time is required')
    .max(50, 'Cook time too long')
    .transform(sanitizeString),
  calories: z.number()
    .int('Calories must be an integer')
    .positive('Calories must be positive')
    .max(10000, 'Calories value too high'),
  ingredients: z
    .array(
      z.string()
        .min(1, 'Ingredient cannot be empty')
        .max(200, 'Ingredient name too long')
        .transform(sanitizeString)
    )
    .min(1, 'At least one ingredient is required')
    .max(50, 'Too many ingredients'),
  steps: z
    .array(
      z.string()
        .min(1, 'Step cannot be empty')
        .max(2000, 'Step too long')
        .transform(sanitizeString)
    )
    .min(1, 'At least one step is required')
    .max(100, 'Too many steps'),
});

// API request validation schema with security
export const GenerateRecipesRequestSchema = z.object({
  ingredients: z
    .array(
      z.string()
        .min(1, 'Ingredient cannot be empty')
        .max(200, 'Ingredient name too long')
        .transform(sanitizeString)
    )
    .min(1, 'At least one ingredient is required')
    .max(50, 'Too many ingredients'),
  preferences: z.string()
    .max(1000, 'Preferences too long')
    .optional()
    .default('')
    .transform((val) => val ? sanitizeString(val) : ''),
});

// Security: Input validation for user inputs
export const SanitizedStringSchema = z.string()
  .max(10000, 'Input too long')
  .transform(sanitizeString);

// Security: Validate IDs (UUID format)
export const IdSchema = z.string().uuid('Invalid ID format');

// Security: Rate limit configuration validation
export const RateLimitConfigSchema = z.object({
  requests: z.number().int().positive().max(10000),
  window: z.number().int().positive().max(3600000), // Max 1 hour
});

// Pantry item validation schema with security
export const PantryItemSchema = z.object({
  ingredient: z.string()
    .min(1, 'Ingredient name is required')
    .max(200, 'Ingredient name too long')
    .transform(sanitizeString),
  quantity: z.number()
    .int('Quantity must be an integer')
    .positive('Quantity must be positive')
    .max(1000000, 'Quantity too large'),
});

// User profile validation schema with security
export const UserProfileSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .transform(sanitizeString),
  preferences: z.record(z.any())
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        // Validate that preferences don't contain malicious data
        const jsonString = JSON.stringify(val);
        return jsonString.length < 10000 && !jsonString.includes('<script');
      },
      { message: 'Invalid preferences data' }
    ),
});

// Security: SQL injection prevention helper
export function escapeSqlString(input: string): string {
  return input.replace(/'/g, "''"); // Escape single quotes
}

// Security: Validate no SQL injection attempts
export function validateNoSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /(xp_|sp_)/i,
  ];
  
  return !sqlPatterns.some(pattern => pattern.test(input));
}

// Enhanced string schema with SQL injection check
export const SecureStringSchema = z.string()
  .max(10000, 'Input too long')
  .refine(validateNoSqlInjection, {
    message: 'Invalid characters detected',
  })
  .transform(sanitizeString);

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
