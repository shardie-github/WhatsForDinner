# PR Plan — Guardrails & Health Endpoints

**Generated:** 2025-01-27  
**Scope:** Resilience guardrails and health check endpoints

## Branch Strategy

**Branch Name:** `feat/guardrails-and-health-endpoints`

**Base Branch:** `main`  
**Target:** Merge to `main` after review

## File Touch List

### New Files
1. `packages/config/src/env.ts` - Environment validation schema
2. `apps/web/src/app/api/health/ready/route.ts` - Readiness probe
3. `apps/web/src/app/api/health/live/route.ts` - Liveness probe
4. `apps/web/src/app/api/health/queue/route.ts` - Queue health
5. `apps/web/src/app/api/health/db/route.ts` - Database health
6. `packages/utils/src/circuit-breaker.ts` - Circuit breaker pattern
7. `packages/server/src/queue/job-registry.ts` - Type-safe job registry

### Modified Files
1. `packages/server/src/queue/index.ts` - Add retry logic, DLQ
2. `packages/config/src/index.ts` - Export validated env
3. `packages/server/src/db/index.ts` - Add query timeout
4. `.github/workflows/ci-cd.yml` - Remove continue-on-error
5. `apps/web/src/app/api/health/route.ts` - Update basic health
6. `apps/web/src/app/api/healthz/route.ts` - Remove or redirect

## Stub Code Locations

### 1. Environment Validation
**File:** `packages/config/src/env.ts`

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(32),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(32),
  
  // Redis
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  
  // OpenAI
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  
  // Environment
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  
  // ... all other env vars
});

export const env = envSchema.parse(process.env);
```

### 2. Readiness Probe
**File:** `apps/web/src/app/api/health/ready/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';

export async function GET() {
  const checks = {
    database: 'unknown',
    redis: 'unknown',
    env: 'unknown',
  };

  // Database check
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabase.from('profiles').select('id').limit(1);
    checks.database = 'ok';
  } catch (error) {
    checks.database = 'error';
  }

  // Redis check
  try {
    const redis = new Redis(process.env.REDIS_URL!);
    await redis.ping();
    redis.quit();
    checks.redis = 'ok';
  } catch (error) {
    checks.redis = 'error';
  }

  // Env check
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'REDIS_URL',
  ];
  checks.env = requiredVars.every(v => process.env[v]) ? 'ok' : 'error';

  const status = Object.values(checks).every(v => v === 'ok') ? 'ready' : 'not-ready';

  return NextResponse.json({
    status,
    checks,
    timestamp: new Date().toISOString(),
  }, { status: status === 'ready' ? 200 : 503 });
}
```

### 3. Liveness Probe
**File:** `apps/web/src/app/api/health/live/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  const uptime = process.uptime();
  const memory = process.memoryUsage();

  return NextResponse.json({
    status: 'alive',
    uptime,
    memory: {
      used: Math.round(memory.heapUsed / 1024 / 1024),
      total: Math.round(memory.heapTotal / 1024 / 1024),
    },
    timestamp: new Date().toISOString(),
  });
}
```

### 4. Queue Health
**File:** `apps/web/src/app/api/health/queue/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { queueHealth } from '@whats-for-dinner/server/queue';

export async function GET() {
  const health = await queueHealth();

  return NextResponse.json({
    status: health.healthy ? 'healthy' : 'unhealthy',
    queue: {
      pending: health.pending,
      active: health.active,
    },
    timestamp: new Date().toISOString(),
  }, { status: health.healthy ? 200 : 503 });
}
```

### 5. Database Health
**File:** `apps/web/src/app/api/health/db/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const start = Date.now();
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await supabase.from('profiles').select('id').limit(1);
    const latency = Date.now() - start;

    return NextResponse.json({
      status: 'healthy',
      database: {
        connection: 'ok',
        latency_ms: latency,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      database: {
        connection: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
```

### 6. Circuit Breaker
**File:** `packages/utils/src/circuit-breaker.ts`

```typescript
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private threshold = 5;
  private timeout = 60000;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }

  getState() {
    return this.state;
  }
}
```

### 7. Redis Retry Logic
**File:** `packages/server/src/queue/index.ts` (UPDATE)

```typescript
function getRedisConnection(): Redis {
  if (!redisConnection) {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL must be set');
    }
    redisConnection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      retryStrategy: (times) => {
        if (times > 3) {
          return null; // Stop retrying
        }
        return Math.min(times * 100, 3000); // Exponential backoff
      },
      reconnectOnError: (err) => {
        return err.message.includes('READONLY');
      },
    });
  }
  return redisConnection;
}
```

## Test Additions

### 1. Environment Validation Tests
**File:** `packages/config/src/env.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { envSchema } from './env';

describe('Environment Validation', () => {
  it('should validate required env vars', () => {
    expect(() => envSchema.parse(process.env)).not.toThrow();
  });

  it('should fail on invalid URL', () => {
    expect(() => envSchema.parse({
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: 'invalid-url',
    })).toThrow();
  });
});
```

### 2. Health Endpoint Tests
**File:** `apps/web/src/app/api/health/ready/route.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { GET } from './route';

describe('Health Endpoints', () => {
  it('should return ready status', async () => {
    const response = await GET();
    const data = await response.json();
    expect(data.status).toBe('ready');
  });
});
```

### 3. Circuit Breaker Tests
**File:** `packages/utils/src/circuit-breaker.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { CircuitBreaker } from './circuit-breaker';

describe('Circuit Breaker', () => {
  it('should open after threshold failures', async () => {
    const breaker = new CircuitBreaker();
    // ... test logic
  });
});
```

## Rollout Plan

### Phase 1: Feature Flag (Week 1)
1. Add feature flag `ENABLE_HEALTH_ENDPOINTS`
2. Deploy with flag disabled
3. Enable in staging
4. Monitor for 24 hours
5. Enable in production

### Phase 2: Gradual Rollout (Week 2)
1. Enable health endpoints
2. Update monitoring to use new endpoints
3. Remove old health endpoint (if duplicate)
4. Monitor for 1 week

### Phase 3: Full Rollout (Week 3)
1. Remove feature flag
2. Update documentation
3. Add to runbooks

## Rollback Plan

1. **If health endpoints fail:**
   - Disable feature flag
   - Revert to old endpoint
   - Investigate issue

2. **If environment validation fails:**
   - Revert to `process.env` usage
   - Fix validation schema
   - Re-deploy

3. **If circuit breaker causes issues:**
   - Disable circuit breaker
   - Use direct API calls
   - Investigate thresholds

## Success Criteria

- ✅ Health endpoints return < 100ms
- ✅ Environment validation catches 100% of missing vars
- ✅ Redis reconnects within 5 seconds
- ✅ Circuit breaker prevents 90% of cascade failures
- ✅ Zero job handler errors (type-safe registry)

## PR Checklist

- [ ] Code follows project style guide
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Feature flag added (if needed)
- [ ] Rollback plan documented
- [ ] Monitoring added
- [ ] Security review completed
