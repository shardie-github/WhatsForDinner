/**
 * Phase 1 Guardrail: Environment Variable Validation
 * Validates all environment variables using Zod schema
 */

import { z } from 'zod';

/**
 * Environment variable schema
 * All required and optional env vars are defined here
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_DB_URL: z.string().url().optional(),
  SUPABASE_PROJECT_REF: z.string().optional(),
  
  // Redis configuration
  REDIS_URL: z.string().url().optional(),
  
  // Queue configuration
  QUEUE_CONCURRENCY: z.string().regex(/^\d+$/).transform(Number).default('5'),
  
  // Vercel configuration
  VERCEL_TOKEN: z.string().optional(),
  VERCEL_ORG_ID: z.string().optional(),
  VERCEL_PROJECT_ID: z.string().optional(),
  VERCEL_GIT_COMMIT_SHA: z.string().optional(),
  
  // Slack configuration
  SLACK_WEBHOOK_URL: z.string().url().optional(),
  SLACK_ALERT_WEBHOOK: z.string().url().optional(),
  SLACK_WEBHOOK: z.string().url().optional(),
  
  // PagerDuty configuration
  PAGERDUTY_INTEGRATION_KEY: z.string().optional(),
  PAGERDUTY_API_KEY: z.string().optional(),
  
  // Stripe configuration
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // OpenAI configuration
  OPENAI_API_KEY: z.string().optional(),
  
  // Feature flags
  EXPERIMENTS_KILL_SWITCH: z.string().transform(val => val === 'true').default('false'),
  
  // Observability
  SENTRY_DSN: z.string().url().optional(),
  DATADOG_API_KEY: z.string().optional(),
  
  // Development
  npm_package_version: z.string().optional(),
});

/**
 * Validated environment variables
 * Throws error if validation fails
 */
export function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors
        .filter(e => e.code === 'invalid_type' && e.received === 'undefined')
        .map(e => e.path.join('.'));
      
      const invalid = error.errors
        .filter(e => e.code !== 'invalid_type' || e.received !== 'undefined')
        .map(e => `${e.path.join('.')}: ${e.message}`);
      
      console.error('❌ Environment variable validation failed:');
      if (missing.length > 0) {
        console.error('   Missing required variables:', missing.join(', '));
      }
      if (invalid.length > 0) {
        console.error('   Invalid variables:', invalid.join(', '));
      }
      
      throw new Error(`Environment validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Get validated environment variables
 * Returns typed env object
 */
export const env = validateEnv();

/**
 * Type for environment variables
 */
export type Env = z.infer<typeof envSchema>;
