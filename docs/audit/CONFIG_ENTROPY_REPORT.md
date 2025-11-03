# Config Entropy & Environment Parity Analysis

**Generated:** 2025-01-27  
**Scope:** Config sprawl, environment parity, validation, feature flags

## Config Sprawl Analysis

### Configuration Files Inventory

| Location | Type | Purpose | Status |
|----------|------|---------|--------|
| `.env.example` | Environment | All env vars (300+ vars) | ⚠️ Single file, needs validation |
| `apps/web/next.config.ts` | Next.js | Build, headers, webpack | ✅ Well-structured |
| `turbo.json` | Turborepo | Build pipeline | ✅ Well-structured |
| `pnpm-workspace.yaml` | pnpm | Workspace config | ✅ Simple |
| `package.json` | npm | Dependencies, scripts | ✅ Standard |
| `apps/web/tailwind.config.js` | Tailwind | Styling | ✅ Standard |
| `packages/server/src/db/drizzle.config.ts` | Drizzle | DB ORM config | ✅ Standard |
| `docker-compose.yml` | Docker | Local services | ✅ Standard |
| `grafana/*.json` | Grafana | Dashboards | ✅ Standard |
| `prometheus.yml` | Prometheus | Metrics | ✅ Standard |
| `alerts.yml` | Alertmanager | Alerts | ✅ Standard |

**Total Config Files:** ~20+ files

### Config Duplication

#### 1. Environment Variables
**Location:** `.env.example` (300+ lines)

**Issues:**
- All vars in single file (hard to navigate)
- No grouping by feature
- No required vs optional distinction
- No validation schema

**Duplication:**
- `SUPABASE_DB_URL` vs `DATABASE_URL` (same value, different names)
- `NEXT_PUBLIC_SUPABASE_URL` vs `SUPABASE_URL` (may be same)
- `SENTRY_DSN` vs `NEXT_PUBLIC_SENTRY_DSN` (different scopes)

#### 2. Database Config
**Location:** Multiple migration directories

**Issues:**
- 4 migration directories (potential drift)
- No single source of truth
- No migration validation

#### 3. Feature Flags
**Location:** `packages/utils/src/feature-flags.ts`, `.env.example`

**Issues:**
- No centralized feature flag config
- No feature flag documentation
- No kill switch documentation

### Environment Parity

#### Development vs Staging vs Production

**Current State:**
- ⚠️ No explicit environment config files
- ⚠️ All env vars in `.env.example` only
- ⚠️ No validation of env parity
- ⚠️ No environment-specific defaults

**Recommendation:**
```typescript
// packages/config/src/env.ts (NEW)
const env = {
  dev: {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    // ... dev defaults
  },
  staging: {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL, // Required
    // ... staging config
  },
  production: {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL, // Required
    // ... production config
  },
};
```

### Divergent Defaults

**Issues Found:**

1. **Redis URL**
   - Dev: `redis://localhost:6379`
   - Staging/Prod: `REDIS_URL` required (no default)
   - **Risk:** App fails if not set

2. **Database URL**
   - Dev: Not set (assumes local)
   - Staging/Prod: Required
   - **Risk:** Unclear defaults

3. **API Keys**
   - Dev: May use test keys
   - Staging/Prod: Required
   - **Risk:** Accidental use of test keys in prod

## Configuration Validation

### Current State

**Status:** ❌ **No validation schema**

**Issues:**
- Runtime errors only (no startup validation)
- Unclear which vars are required
- No type validation
- No format validation (URLs, emails, etc.)

### Proposed Validation Schema

**File:** `packages/config/src/env.ts` (NEW)

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(32),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(32),
  SUPABASE_DB_URL: z.string().url().optional(),
  DATABASE_URL: z.string().url().optional(),
  
  // Redis
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  
  // OpenAI
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  OPENAI_MODEL: z.string().default('gpt-4-turbo-preview'),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  
  // Environment
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  
  // ... all other env vars
});

export const env = envSchema.parse(process.env);
```

### Validation Benefits

1. **Startup Validation**
   - Fail fast on missing/invalid vars
   - Clear error messages
   - Type safety

2. **Documentation**
   - Required vs optional vars
   - Type information
   - Format requirements

3. **Developer Experience**
   - Autocomplete in IDE
   - Type checking
   - Clear errors

## Feature Flags

### Current State

**Location:** `packages/utils/src/feature-flags.ts`

**Status:** ⚠️ **Basic implementation, no documentation**

**Issues:**
- No feature flag registry
- No kill switch documentation
- No feature flag UI
- No feature flag analytics

### Feature Flag Analysis

**Flags Found:**
- `EXPERIMENTS_KILL_SWITCH` (`.env.example:81`)
- Feature flags in code (not documented)

**Recommendation:**
```typescript
// packages/config/src/feature-flags.ts (NEW)
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
```

### Kill Switch Documentation

**Missing:**
- No kill switch procedures
- No kill switch testing
- No kill switch monitoring

**Recommendation:**
```typescript
// packages/config/src/feature-flags.ts (UPDATE)
export function killSwitch(flag: string): boolean {
  const envKey = `KILL_SWITCH_${flag}`;
  return process.env[envKey] === 'true';
}

// Usage
if (killSwitch('AI_MEAL_GENERATION')) {
  // Disable AI features
  return fallbackToCachedRecipes();
}
```

## Single Source of Truth

### Proposed Config Schema

**File:** `packages/config/src/config.ts` (NEW)

```typescript
import { env } from './env';
import { featureFlags } from './feature-flags';

export const config = {
  env: env,
  features: featureFlags,
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
```

### Config Normalization Path

#### Phase 1: Environment Validation (≤1 day)
1. Create `packages/config/src/env.ts` with Zod schema
2. Add startup validation
3. Add type exports
4. Update all imports to use validated config

#### Phase 2: Feature Flags (≤1 week)
1. Create feature flag registry
2. Add kill switch documentation
3. Add feature flag UI (admin panel)
4. Add feature flag analytics

#### Phase 3: Config Consolidation (≤2 weeks)
1. Consolidate migration directories
2. Create single config source
3. Add environment-specific defaults
4. Add config validation tests

## Environment Parity Issues

### Dev vs Staging vs Production

| Config | Dev | Staging | Production | Issue |
|--------|-----|--------|------------|-------|
| **Supabase URL** | Local? | Required | Required | Unclear dev default |
| **Redis URL** | `localhost:6379` | Required | Required | ✅ Clear |
| **Stripe Keys** | Test keys | Test keys | Live keys | ⚠️ Risk of using test keys in prod |
| **OpenAI API** | Required | Required | Required | ✅ Clear |
| **Log Level** | `debug` | `info` | `error` | ⚠️ Not documented |

### Recommended Fixes

1. **Environment-Specific Defaults**
   ```typescript
   const defaults = {
     development: {
       LOG_LEVEL: 'debug',
       SUPABASE_URL: 'http://localhost:54321',
       REDIS_URL: 'redis://localhost:6379',
     },
     staging: {
       LOG_LEVEL: 'info',
       // No defaults, all required
     },
     production: {
       LOG_LEVEL: 'error',
       // No defaults, all required
     },
   };
   ```

2. **Environment Validation**
   ```typescript
   // Validate environment-specific configs
   if (env.NODE_ENV === 'production') {
     // Ensure production-only vars are set
     if (!env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
       throw new Error('Production Stripe key required');
     }
   }
   ```

## Summary

### Critical Issues
1. ❌ **No config validation** (runtime errors only)
2. ⚠️ **Config sprawl** (300+ env vars in single file)
3. ⚠️ **No environment parity validation** (dev vs staging vs prod)
4. ⚠️ **No feature flag documentation** (kill switches unclear)
5. ⚠️ **No single source of truth** (multiple config files)

### High Priority Fixes
1. Add config validation (Zod schema)
2. Group env vars by feature
3. Add environment-specific defaults
4. Document feature flags and kill switches
5. Create single config source

### Medium Priority Fixes
1. Consolidate migration directories
2. Add config validation tests
3. Add feature flag UI
4. Add config documentation
5. Add environment parity tests
