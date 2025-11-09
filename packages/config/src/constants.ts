/**
 * Centralized constants and configuration values
 * Consolidates cross-cutting constants to prevent duplication
 */

// API Endpoints
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  METRICS: '/api/metrics',
  TELEMETRY: '/api/telemetry',
  SUBSCRIPTIONS: '/api/subscriptions',
  STRIPE_WEBHOOK: '/api/stripe/webhook',
} as const;

// Environment Variable Keys
export const ENV_KEYS = {
  SUPABASE_URL: 'NEXT_PUBLIC_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  SUPABASE_SERVICE_ROLE_KEY: 'SUPABASE_SERVICE_ROLE_KEY',
  DATABASE_URL: 'DATABASE_URL',
  STRIPE_SECRET_KEY: 'STRIPE_SECRET_KEY',
  STRIPE_PUBLISHABLE_KEY: 'STRIPE_PUBLISHABLE_KEY',
  STRIPE_WEBHOOK_SECRET: 'STRIPE_WEBHOOK_SECRET',
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  NODE_ENV: 'NODE_ENV',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_TELEMETRY: 'ENABLE_TELEMETRY',
  ENABLE_ANALYTICS: 'ENABLE_ANALYTICS',
  ENABLE_EXPERIMENTS: 'ENABLE_EXPERIMENTS',
} as const;

// Performance Budgets
export const PERFORMANCE_BUDGETS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  CLS: 0.1, // Cumulative Layout Shift
  TBT: 300, // Total Blocking Time (ms)
  JS_SIZE: 170000, // JavaScript bundle size (bytes)
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Time Constants (milliseconds)
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 10000,
  BACKOFF_MULTIPLIER: 2,
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;
