# Three-Step Refactor Plan

**Generated:** 2025-01-27  
**Scope:** Incremental refactoring with minimal risk, prioritized by impact

## Overview

This plan outlines a three-phase refactoring approach to improve system resilience, reduce technical debt, and minimize architectural drift. Each phase builds on the previous one and can be completed independently.

**Principle:** Low-risk wins first, then boundary hardening, finally system decoupling.

---

## Phase 1: Low-Risk Wins (≤1 day)

**Goal:** Quick improvements with minimal code changes, high impact, low risk.

### 1.1 Environment Variable Validation
**Effort:** 2 hours  
**Risk:** Low  
**Impact:** High (prevents runtime failures)

**Files:**
- `packages/config/src/env.ts` (NEW)
- `packages/config/src/index.ts` (UPDATE)

**Changes:**
```typescript
// packages/config/src/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(32),
  // ... all env vars
});

export const env = envSchema.parse(process.env);
```

**Benefits:**
- Startup validation (fail fast)
- Type safety
- Clear error messages
- Documentation (via Zod schema)

**Rollback:** Remove validation, revert to `process.env`

---

### 1.2 Health Check Endpoints
**Effort:** 3 hours  
**Risk:** Low  
**Impact:** High (observability, monitoring)

**Files:**
- `apps/web/src/app/api/health/ready/route.ts` (NEW)
- `apps/web/src/app/api/health/live/route.ts` (NEW)
- `apps/web/src/app/api/health/queue/route.ts` (NEW)
- `apps/web/src/app/api/health/db/route.ts` (NEW)

**Changes:**
- Add readiness probe (checks DB, Redis, env)
- Add liveness probe (process health)
- Add queue health endpoint
- Add database health endpoint

**Benefits:**
- Kubernetes readiness/liveness probes
- Monitoring integration
- Quick incident detection

**Rollback:** Remove endpoints, keep basic `/api/health`

---

### 1.3 Redis Connection Retry
**Effort:** 2 hours  
**Risk:** Low  
**Impact:** Medium (resilience)

**File:** `packages/server/src/queue/index.ts` (UPDATE)

**Changes:**
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
        // Reconnect on specific errors
        return err.message.includes('READONLY');
      },
    });
  }
  return redisConnection;
}
```

**Benefits:**
- Automatic reconnection
- Exponential backoff
- Graceful degradation

**Rollback:** Remove retry logic, revert to original

---

### 1.4 Consolidate Duplicate Endpoints
**Effort:** 1 hour  
**Risk:** Low  
**Impact:** Low (code cleanup)

**Files:**
- `apps/web/src/app/api/health/route.ts` (KEEP)
- `apps/web/src/app/api/healthz/route.ts` (REMOVE or redirect)

**Changes:**
- Remove duplicate `/api/healthz` endpoint
- Or redirect to `/api/health`
- Update all references

**Benefits:**
- Code cleanup
- Single source of truth
- Reduced confusion

**Rollback:** Restore duplicate endpoint

---

### 1.5 Enforce Secret Scanning in CI
**Effort:** 1 hour  
**Risk:** Low  
**Impact:** High (security)

**File:** `.github/workflows/ci-cd.yml` (UPDATE)

**Changes:**
```yaml
- name: Secrets scan
  run: node scripts/secrets-scan.mjs --check
  # Remove: continue-on-error: true
```

**Benefits:**
- Security enforcement
- Prevents secret leaks
- Fails fast on issues

**Rollback:** Add `continue-on-error: true` back

---

### Phase 1 Summary

**Total Effort:** ~9 hours (1 day)  
**Risk:** Low  
**Impact:** High  
**Dependencies:** None

**Deliverables:**
- ✅ Environment validation
- ✅ Health check endpoints
- ✅ Redis connection retry
- ✅ Duplicate endpoint cleanup
- ✅ CI security enforcement

---

## Phase 2: Boundary Hardening (≤1 week)

**Goal:** Strengthen system boundaries, add guardrails, improve resilience.

### 2.1 Type-Safe Job Registry
**Effort:** 4 hours  
**Risk:** Medium  
**Impact:** High (maintainability)

**File:** `packages/server/src/queue/index.ts` (REFACTOR)

**Changes:**
```typescript
// packages/server/src/queue/job-registry.ts (NEW)
type JobName = 'mealgen' | 'digest' | 'journeys' | 'dsar_export' | ...;

interface JobHandler {
  name: JobName;
  handler: (data: any) => Promise<any>;
}

const jobRegistry = new Map<JobName, JobHandler>();

export function registerJob(name: JobName, handler: JobHandler['handler']) {
  jobRegistry.set(name, { name, handler });
}

export function getJobHandler(name: string): JobHandler | null {
  return jobRegistry.get(name as JobName) || null;
}

// Update queue worker
worker = new Worker('nomad-jobs', async (job) => {
  const handler = getJobHandler(job.name);
  if (!handler) {
    throw new Error(`Unknown job type: ${job.name}`);
  }
  return await handler.handler(job.data);
});
```

**Benefits:**
- Type safety
- No string-based switches
- Easy to add new jobs
- Clear job registry

**Rollback:** Revert to string-based switch

---

### 2.2 Circuit Breaker Pattern
**Effort:** 6 hours  
**Risk:** Medium  
**Impact:** High (resilience)

**File:** `packages/utils/src/circuit-breaker.ts` (NEW)

**Changes:**
```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > 60000) {
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
    if (this.failures >= 5) {
      this.state = 'open';
    }
  }
}
```

**Usage:**
```typescript
const stripeBreaker = new CircuitBreaker();
const result = await stripeBreaker.execute(() => stripe.charges.create(...));
```

**Benefits:**
- Prevents cascade failures
- Automatic recovery
- Configurable thresholds

**Rollback:** Remove circuit breaker, use direct calls

---

### 2.3 Input Validation Middleware
**Effort:** 4 hours  
**Risk:** Medium  
**Impact:** High (security, data integrity)

**File:** `packages/utils/src/validation-middleware.ts` (NEW)

**Changes:**
```typescript
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (req: NextRequest, handler: (data: T) => Promise<NextResponse>) => {
    try {
      const body = await req.json();
      const validated = schema.parse(body);
      return await handler(validated);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
  };
}

// Usage
const createSubscriptionSchema = z.object({
  planId: z.string(),
  paymentMethodId: z.string(),
});

export async function POST(req: NextRequest) {
  return validateRequest(createSubscriptionSchema)(req, async (data) => {
    // Handler logic
  });
}
```

**Benefits:**
- Type-safe API routes
- Automatic validation
- Clear error messages
- Security (SQL injection prevention)

**Rollback:** Remove validation, use direct req.json()

---

### 2.4 Dead Letter Queue (DLQ)
**Effort:** 3 hours  
**Risk:** Medium  
**Impact:** Medium (observability)

**File:** `packages/server/src/queue/index.ts` (UPDATE)

**Changes:**
```typescript
export const dlq = new Queue('nomad-jobs-dlq', { connection });

worker.on('failed', async (job, err) => {
  logger.error({ jobId: job?.id, error: err.message }, 'Job failed');
  
  // Move to DLQ after max retries
  if (job.attemptsMade >= job.opts.attempts) {
    await dlq.add(`failed-${job.name}`, {
      originalJob: job.data,
      error: err.message,
      failedAt: new Date(),
    });
  }
});
```

**Benefits:**
- Failed job tracking
- Manual retry capability
- Debugging aid
- Observability

**Rollback:** Remove DLQ, keep original error handling

---

### 2.5 Query Timeout Guards
**Effort:** 3 hours  
**Risk:** Medium  
**Impact:** Medium (performance)

**File:** `packages/server/src/db/index.ts` (UPDATE)

**Changes:**
```typescript
export async function queryWithTimeout<T>(
  query: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  return Promise.race([
    query,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
    ),
  ]);
}
```

**Benefits:**
- Prevents hanging queries
- Configurable timeouts
- Better error handling

**Rollback:** Remove timeout, use direct queries

---

### Phase 2 Summary

**Total Effort:** ~20 hours (1 week)  
**Risk:** Medium  
**Impact:** High  
**Dependencies:** Phase 1 (optional)

**Deliverables:**
- ✅ Type-safe job registry
- ✅ Circuit breaker pattern
- ✅ Input validation middleware
- ✅ Dead letter queue
- ✅ Query timeout guards

---

## Phase 3: System Decoupling (≤3 weeks)

**Goal:** Reduce coupling, improve testability, enable independent scaling.

### 3.1 Dependency Injection
**Effort:** 8 hours  
**Risk:** High  
**Impact:** High (testability, maintainability)

**Files:**
- `packages/server/src/di/container.ts` (NEW)
- `packages/server/src/**` (REFACTOR)

**Changes:**
```typescript
// Dependency injection container
class Container {
  private services = new Map<string, any>();

  register<T>(key: string, factory: () => T) {
    this.services.set(key, factory);
  }

  resolve<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service not found: ${key}`);
    }
    return factory();
  }
}

// Usage
container.register('redis', () => getRedisConnection());
container.register('queue', () => new Queue('nomad-jobs', { connection: container.resolve('redis') }));
```

**Benefits:**
- Testable (mock dependencies)
- Flexible (swap implementations)
- Clear dependencies

**Rollback:** Revert to global singletons

---

### 3.2 API Contract Generation
**Effort:** 6 hours  
**Risk:** Medium  
**Impact:** Medium (documentation, testing)

**File:** `scripts/generate-openapi.mjs` (NEW)

**Changes:**
- Parse route handlers
- Extract request/response types
- Generate OpenAPI spec
- Output to `openapi.yaml`

**Benefits:**
- API documentation
- Contract testing
- Frontend/backend sync

**Rollback:** Remove OpenAPI generation

---

### 3.3 Migration Consolidation
**Effort:** 4 hours  
**Risk:** Medium  
**Impact:** High (maintainability)

**Files:**
- Consolidate all migrations to `supabase/migrations/`
- Remove duplicates
- Validate schema consistency

**Changes:**
1. Audit all migration directories
2. Identify duplicates
3. Consolidate to single directory
4. Validate against master schema
5. Update migration scripts

**Benefits:**
- Single source of truth
- No schema drift
- Clear migration path

**Rollback:** Restore multiple directories (not recommended)

---

### 3.4 Read Replica Fallback
**Effort:** 12 hours  
**Risk:** High  
**Impact:** High (availability)

**Files:**
- `packages/server/src/db/index.ts` (UPDATE)
- `packages/server/src/db/replica.ts` (NEW)

**Changes:**
```typescript
const primaryDb = createClient(process.env.SUPABASE_URL);
const replicaDb = createClient(process.env.SUPABASE_REPLICA_URL);

export async function query<T>(queryFn: (db: SupabaseClient) => Promise<T>): Promise<T> {
  try {
    return await queryFn(primaryDb);
  } catch (error) {
    if (isReadQuery(queryFn)) {
      return await queryFn(replicaDb); // Fallback to replica
    }
    throw error;
  }
}
```

**Benefits:**
- High availability
- Read performance
- Automatic failover

**Rollback:** Remove replica, use primary only

---

### 3.5 Worker Redundancy
**Effort:** 8 hours  
**Risk:** Medium  
**Impact:** Medium (availability)

**Files:**
- `packages/server/src/queue/index.ts` (UPDATE)
- `packages/server/src/queue/worker-manager.ts` (NEW)

**Changes:**
- Multiple worker instances
- Health checks
- Auto-restart on failure
- Load balancing

**Benefits:**
- High availability
- Horizontal scaling
- Fault tolerance

**Rollback:** Revert to single worker

---

### Phase 3 Summary

**Total Effort:** ~38 hours (3 weeks)  
**Risk:** High  
**Impact:** High  
**Dependencies:** Phase 1, Phase 2 (optional)

**Deliverables:**
- ✅ Dependency injection
- ✅ API contract generation
- ✅ Migration consolidation
- ✅ Read replica fallback
- ✅ Worker redundancy

---

## Risk Mitigation

### Feature Flags
- Use feature flags for all refactoring
- Enable/disable new code paths
- Gradual rollout

### Rollback Plans
- Each phase has rollback steps
- Keep old code paths during transition
- Remove old code after validation

### Testing
- Add tests for each refactoring
- Integration tests for boundaries
- E2E tests for critical paths

### Monitoring
- Add metrics for new code paths
- Monitor error rates
- Alert on regressions

---

## Success Metrics

### Phase 1
- ✅ Environment validation catches 100% of missing vars
- ✅ Health endpoints return < 100ms
- ✅ Redis reconnects within 5 seconds

### Phase 2
- ✅ Zero job handler errors (type-safe)
- ✅ Circuit breaker prevents 90% of cascade failures
- ✅ Input validation catches 100% of invalid requests

### Phase 3
- ✅ 100% test coverage for new code
- ✅ API contract tests pass
- ✅ Zero schema drift (single migration dir)
- ✅ Read replica handles 50% of read traffic

---

## Summary

**Total Effort:** ~67 hours (3-4 weeks)  
**Risk:** Incremental (Low → Medium → High)  
**Impact:** High across all phases  
**Dependencies:** Minimal (can do phases independently)

**Recommended Approach:**
1. Complete Phase 1 first (quick wins)
2. Evaluate Phase 2 (assess impact)
3. Plan Phase 3 (requires more planning)
