# PR Plan — Config Schema & Validation

**Generated:** 2025-01-27  
**Scope:** Centralized config with validation schema

## Branch Strategy

**Branch Name:** `feat/config-schema-validation`

**Base Branch:** `main`  
**Target:** Merge to `main` after review

## File Touch List

### New Files
1. `packages/config/src/env.ts` - Environment validation schema
2. `packages/config/src/feature-flags.ts` - Feature flag registry
3. `packages/config/src/config.ts` - Centralized config
4. `packages/config/src/env.test.ts` - Validation tests

### Modified Files
1. `packages/config/src/index.ts` - Export validated config
2. `.env.example` - Group by feature, add comments
3. `apps/web/src/**` - Update env imports (if needed)
4. `packages/server/src/**` - Update env imports (if needed)

## Central Config Module

### Structure
```
packages/config/
├── src/
│   ├── index.ts          # Main exports
│   ├── env.ts            # Environment validation
│   ├── feature-flags.ts  # Feature flag registry
│   ├── config.ts         # Centralized config
│   └── env.test.ts       # Tests
└── package.json
```

### Implementation

**File:** `packages/config/src/env.ts`

```typescript
import { z } from 'zod';

// Grouped by feature
const supabaseSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(32),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(32),
  SUPABASE_DB_URL: z.string().url().optional(),
  DATABASE_URL: z.string().url().optional(),
});

const redisSchema = z.object({
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
});

const openaiSchema = z.object({
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  OPENAI_MODEL: z.string().default('gpt-4-turbo-preview'),
  OPENAI_MAX_TOKENS: z.number().int().positive().default(2000),
  OPENAI_TEMPERATURE: z.number().min(0).max(2).default(0.7),
});

const stripeSchema = z.object({
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
});

const envSchema = z.object({
  // Core
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  
  // Supabase
  ...supabaseSchema.shape,
  
  // Redis
  ...redisSchema.shape,
  
  // OpenAI
  ...openaiSchema.shape,
  
  // Stripe
  ...stripeSchema.shape,
  
  // ... other groups
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Invalid environment configuration');
  }
}

export const env = validateEnv();
```

**File:** `packages/config/src/feature-flags.ts`

```typescript
export const featureFlags = {
  aiMealGeneration: {
    key: 'AI_MEAL_GENERATION',
    default: true,
    killSwitch: true,
    description: 'Enable AI-powered meal generation',
  },
  paymentProcessing: {
    key: 'PAYMENT_PROCESSING',
    default: true,
    killSwitch: true,
    description: 'Enable payment processing',
  },
  // ... all feature flags
} as const;

export function isFeatureEnabled(flag: keyof typeof featureFlags): boolean {
  const config = featureFlags[flag];
  const killSwitchKey = `KILL_SWITCH_${config.key}`;
  
  // Check kill switch first
  if (process.env[killSwitchKey] === 'true') {
    return false;
  }
  
  // Check feature flag
  const envKey = `FEATURE_${config.key}`;
  return process.env[envKey] === 'true' || config.default;
}
```

**File:** `packages/config/src/config.ts`

```typescript
import { env } from './env';
import { featureFlags, isFeatureEnabled } from './feature-flags';

export const config = {
  env,
  features: {
    aiMealGeneration: isFeatureEnabled('aiMealGeneration'),
    paymentProcessing: isFeatureEnabled('paymentProcessing'),
  },
  database: {
    url: env.DATABASE_URL || env.SUPABASE_DB_URL,
    pool: {
      min: 2,
      max: 20,
      idleTimeout: 30000,
    },
  },
  redis: {
    url: env.REDIS_URL,
    retry: {
      maxAttempts: 3,
      backoff: 'exponential',
    },
  },
  api: {
    timeout: 30000,
    retry: {
      maxAttempts: 3,
      backoff: 'exponential',
    },
  },
} as const;

export type Config = typeof config;
```

## JSON Schema Alternative

**If using JSON Schema instead of Zod:**

**File:** `packages/config/src/env.schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "NEXT_PUBLIC_SUPABASE_URL": {
      "type": "string",
      "format": "uri"
    },
    "SUPABASE_SERVICE_ROLE_KEY": {
      "type": "string",
      "minLength": 32
    }
  },
  "required": ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
}
```

## Migration Steps

### Step 1: Create Config Package (Day 1)
1. Create `packages/config/src/env.ts` with Zod schema
2. Add validation on import
3. Export validated `env` object

### Step 2: Update Imports (Day 2-3)
1. Find all `process.env` usage
2. Replace with `import { env } from '@whats-for-dinner/config'`
3. Update TypeScript types

### Step 3: Add Feature Flags (Day 4)
1. Create feature flag registry
2. Add kill switch logic
3. Update code to use feature flags

### Step 4: Update Documentation (Day 5)
1. Update `.env.example` with groups
2. Add required vs optional indicators
3. Add validation documentation

## Validation Examples

### Startup Validation
```typescript
// packages/config/src/index.ts
import { validateEnv } from './env';

// Validate on import
try {
  const env = validateEnv();
  console.log('✅ Environment validation passed');
} catch (error) {
  console.error('❌ Environment validation failed');
  process.exit(1);
}
```

### Runtime Validation
```typescript
// In API routes
import { env } from '@whats-for-dinner/config';

export async function GET() {
  // env is already validated
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  // ...
}
```

## Test Additions

**File:** `packages/config/src/env.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { validateEnv } from './env';

describe('Environment Validation', () => {
  beforeEach(() => {
    // Reset env
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  });

  it('should validate required env vars', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'x'.repeat(32);
    expect(() => validateEnv()).not.toThrow();
  });

  it('should fail on invalid URL', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'invalid-url';
    expect(() => validateEnv()).toThrow();
  });

  it('should use default for optional vars', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'x'.repeat(32);
    const env = validateEnv();
    expect(env.REDIS_URL).toBe('redis://localhost:6379');
  });
});
```

## Rollout Plan

### Phase 1: Validation Only (Week 1)
1. Add validation schema
2. Deploy with validation (non-blocking)
3. Monitor for validation errors
4. Fix any issues

### Phase 2: Feature Flags (Week 2)
1. Add feature flag registry
2. Update code to use feature flags
3. Enable in staging
4. Enable in production

### Phase 3: Full Migration (Week 3)
1. Update all `process.env` usage
2. Remove old env var access
3. Update documentation

## Rollback Plan

1. **If validation fails:**
   - Remove validation, revert to `process.env`
   - Fix schema issues
   - Re-deploy

2. **If feature flags cause issues:**
   - Disable feature flags
   - Use direct env var access
   - Investigate issues

## Success Criteria

- ✅ Environment validation catches 100% of missing vars
- ✅ Type safety for all env vars
- ✅ Feature flags work correctly
- ✅ Zero runtime env errors
- ✅ Clear error messages

## PR Checklist

- [ ] Code follows project style guide
- [ ] All tests pass
- [ ] Documentation updated
- [ ] `.env.example` updated
- [ ] Migration guide written
- [ ] Rollback plan documented
