# Ops Reality: CI/CD, Observability, SLOs

**Generated:** 2025-01-27  
**Scope:** CI/CD analysis, SLO draft, health endpoints, observability gaps

## CI/CD Pipeline Analysis

### Workflow Inventory

**Total Workflows:** 36 files in `.github/workflows/`

**Key Workflows:**
- `ci-cd.yml` - Main CI/CD pipeline
- `security.yml` - Security scanning
- `deploy.yml` - Deployment
- `chaos.yml` - Chaos engineering
- `watcher-cron.yml` - Scheduled checks
- `release-pipeline.yml` - Release process
- Plus 30+ specialized workflows

### CI Job Graph Sanity

#### Main Pipeline (`ci-cd.yml`)

**Job Structure:**
```
lint-and-typecheck
  ↓
test (depends on: lint-and-typecheck)
  ↓
build (depends on: lint-and-typecheck, test)
  ↓
deploy-staging (depends on: build, if: develop)
deploy-production (depends on: build, if: main)
  ↓
notify (depends on: deploy-*, if: always)
```

**Issues Found:**

1. **Cache Misses**
   - `pnpm install` runs on every job (no cache hit guarantee)
   - Build artifacts not cached between jobs
   - Docker images not cached

2. **Flaky Steps**
   - `security:audit` - `continue-on-error: true` (line 52)
   - `dependency vulnerability scan` - `continue-on-error: true` (line 56)
   - **Impact:** Security issues may be ignored

3. **Skipped Checks**
   - Secrets scan allows failures
   - Security audit allows failures
   - Dependency scan allows failures

4. **No Test Matrix**
   - No Node version matrix
   - No OS matrix (Linux only)
   - No browser matrix (for E2E tests)

### Workflow Optimization Recommendations

1. **Add Cache for Dependencies**
   ```yaml
   - name: Cache pnpm store
     uses: actions/cache@v3
     with:
       path: ~/.pnpm-store
       key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
   ```

2. **Enforce Security Checks**
   ```yaml
   - name: Secrets scan
     run: node scripts/secrets-scan.mjs --check
     # Remove: continue-on-error: true
   ```

3. **Add Test Matrix**
   ```yaml
   strategy:
     matrix:
       node-version: [18, 20]
       os: [ubuntu-latest, macos-latest]
   ```

## Draft SLOs & Error Budgets

### Service Level Objectives (SLOs)

#### 1. API Availability
**Target:** 99.9% uptime (3 nines)
**Measurement:** Successful requests / Total requests
**Error Budget:** 0.1% (43.2 minutes/month)
**Current:** ⚠️ Not measured

**Endpoints:**
- `/api/health` - Health check
- `/api/user/me` - User profile
- `/api/subscriptions/*` - Subscriptions
- `/api/stripe/webhook` - Payment webhooks

#### 2. API Latency
**Target:** p95 < 500ms, p99 < 1000ms
**Measurement:** Response time percentiles
**Error Budget:** 5% of requests > 500ms
**Current:** ⚠️ Not measured

**Endpoints:**
- All `/api/**` routes

#### 3. Queue Processing
**Target:** 99% of jobs processed within 5 minutes
**Measurement:** Job completion time
**Error Budget:** 1% of jobs > 5 minutes
**Current:** ⚠️ Not measured

**Jobs:**
- `mealgen` - Meal generation
- `digest` - Email digests
- `journeys` - User journeys
- `dsar_export` - GDPR exports

#### 4. Database Query Performance
**Target:** p95 < 200ms, p99 < 500ms
**Measurement:** Query execution time
**Error Budget:** 5% of queries > 200ms
**Current:** ⚠️ Not measured

#### 5. Payment Processing
**Target:** 99.95% success rate
**Measurement:** Successful payments / Total attempts
**Error Budget:** 0.05% (21.6 minutes/month)
**Current:** ⚠️ Not measured

### Error Budget Tracking

**Proposed Implementation:**
```typescript
// packages/server/src/observability/slo.ts (NEW)
export const slos = {
  apiAvailability: {
    target: 0.999, // 99.9%
    window: '30d',
    metric: 'http_requests_total',
  },
  apiLatency: {
    target: { p95: 500, p99: 1000 },
    window: '7d',
    metric: 'http_request_duration_seconds',
  },
  queueProcessing: {
    target: 0.99, // 99%
    window: '7d',
    metric: 'queue_job_duration_seconds',
  },
};
```

## Health Check Endpoints

### Current State

**Existing Endpoints:**
- `/api/health` - Basic health check
- `/api/healthz` - Duplicate? (likely same purpose)

**Missing:**
- No queue health endpoint
- No database health endpoint
- No external service health (Stripe, OpenAI, etc.)
- No readiness/liveness probes

### Proposed Health Endpoints

#### 1. Basic Health (`/api/health`)
**File:** `apps/web/src/app/api/health/route.ts` (UPDATE)

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T00:00:00Z",
  "version": "1.0.0"
}
```

#### 2. Readiness Probe (`/api/health/ready`)
**File:** `apps/web/src/app/api/health/ready/route.ts` (NEW)

**Checks:**
- Database connection
- Redis connection
- Required env vars

**Response:**
```json
{
  "status": "ready",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "env": "ok"
  }
}
```

#### 3. Liveness Probe (`/api/health/live`)
**File:** `apps/web/src/app/api/health/live/route.ts` (NEW)

**Checks:**
- Process is running
- No memory leaks
- No deadlocks

**Response:**
```json
{
  "status": "alive",
  "uptime": 3600,
  "memory": {
    "used": 100,
    "total": 512
  }
}
```

#### 4. Queue Health (`/api/health/queue`)
**File:** `apps/web/src/app/api/health/queue/route.ts` (NEW)

**Checks:**
- Redis connection
- Queue size
- Worker status

**Response:**
```json
{
  "status": "healthy",
  "queue": {
    "pending": 10,
    "active": 2,
    "completed": 1000,
    "failed": 5
  },
  "worker": {
    "status": "running",
    "concurrency": 5
  }
}
```

#### 5. Database Health (`/api/health/db`)
**File:** `apps/web/src/app/api/health/db/route.ts` (NEW)

**Checks:**
- Supabase connection
- Query performance
- Connection pool status

**Response:**
```json
{
  "status": "healthy",
  "database": {
    "connection": "ok",
    "pool": {
      "active": 5,
      "idle": 10,
      "max": 20
    },
    "latency_ms": 50
  }
}
```

## Observability Gaps

### Current State

**Metrics:**
- ⚠️ Prometheus configured but not implemented
- ⚠️ No custom metrics
- ⚠️ No SLO tracking

**Logs:**
- ✅ Sentry for error tracking
- ⚠️ No structured logging (JSON)
- ⚠️ No log aggregation (Loki)
- ⚠️ No log redaction

**Traces:**
- ⚠️ OpenTelemetry configured but not implemented
- ⚠️ No distributed tracing
- ⚠️ No trace sampling

### Proposed Observability Implementation

#### 1. Metrics Collection
**Location:** `packages/server/src/observability/metrics.ts` (NEW)

**Metrics:**
- `http_requests_total` - Request count
- `http_request_duration_seconds` - Request latency
- `queue_job_duration_seconds` - Job processing time
- `queue_job_failures_total` - Job failures
- `database_query_duration_seconds` - Query latency
- `database_connections_active` - Connection pool

#### 2. Log Aggregation
**Location:** `packages/server/src/observability/logging.ts` (UPDATE)

**Features:**
- Structured JSON logging
- Log levels (error, warn, info, debug)
- PII redaction
- Loki integration

#### 3. Distributed Tracing
**Location:** `packages/server/src/observability/tracing.ts` (NEW)

**Features:**
- OpenTelemetry integration
- Trace sampling (1% for production)
- Span context propagation
- Trace export to Tempo/Jaeger

### Log/Metric/Trace Origins

| Component | Logs | Metrics | Traces |
|-----------|------|---------|--------|
| **API Routes** | ✅ Error logging | ❌ Missing | ❌ Missing |
| **Queue Jobs** | ✅ Job logging | ❌ Missing | ❌ Missing |
| **Database Queries** | ⚠️ Partial | ❌ Missing | ❌ Missing |
| **External APIs** | ⚠️ Partial | ❌ Missing | ❌ Missing |
| **Auth Flow** | ⚠️ Partial | ❌ Missing | ❌ Missing |

## Oncall Quick-Wins

### 1. Health Check Dashboard
**File:** `apps/web/src/app/admin/health/page.tsx` (NEW)

**Displays:**
- Health status of all services
- SLO error budgets
- Recent incidents
- Queue status

### 2. Alerting Rules
**File:** `alerts.yml` (UPDATE)

**Alerts:**
- API availability < 99.9%
- API latency p95 > 500ms
- Queue backlog > 1000 jobs
- Database connection pool exhausted
- Payment processing failures > 1%

### 3. Runbook Templates
**File:** `docs/RUNBOOKS/` (NEW)

**Templates:**
- `api-outage.md` - API downtime response
- `queue-backlog.md` - Queue processing issues
- `payment-failures.md` - Payment processing issues
- `database-issues.md` - Database performance issues

### 4. Incident Response
**File:** `docs/RUNBOOKS/incident-response.md` (NEW)

**Steps:**
1. Identify issue (health checks, alerts)
2. Triage (severity, impact)
3. Mitigate (rollback, feature flag, etc.)
4. Communicate (status page, Slack)
5. Post-mortem (root cause, prevention)

## Flaky CI Checklist

### Known Flaky Steps

1. **Security Audit** (`ci-cd.yml:48-52`)
   - `continue-on-error: true`
   - May fail intermittently
   - **Fix:** Remove continue-on-error, investigate failures

2. **Dependency Scan** (`ci-cd.yml:54-56`)
   - `continue-on-error: true`
   - May fail on network issues
   - **Fix:** Add retry logic, remove continue-on-error

3. **RLS Smoke Test** (`ci-cd.yml:84-89`)
   - Requires Supabase secrets
   - May fail on network issues
   - **Fix:** Add retry logic, mock for local testing

4. **Database Performance Check** (`ci-cd.yml:91-95`)
   - Requires database connection
   - May fail on network issues
   - **Fix:** Add timeout, retry logic

### Recommendations

1. **Add Retry Logic**
   ```yaml
   - name: Security audit
     run: |
       retry() {
         for i in {1..3}; do
           node scripts/generate-security-audit.js && return 0
           sleep 5
         done
         return 1
       }
       retry
   ```

2. **Remove continue-on-error**
   - Enforce security checks
   - Fail fast on critical issues

3. **Add Flaky Test Detection**
   - Track test flakiness
   - Auto-retry flaky tests
   - Alert on consistently flaky tests

## Summary

### Critical Gaps
1. ❌ **No SLO tracking** (error budgets not measured)
2. ❌ **No health check endpoints** (basic health only)
3. ❌ **No observability implementation** (configured but not used)
4. ⚠️ **Security checks allow failures** (CI not enforcing)
5. ⚠️ **No test matrix** (single Node version, single OS)

### High Priority Fixes
1. Add health check endpoints (ready, live, queue, db)
2. Implement SLO tracking (metrics, error budgets)
3. Enforce security checks in CI (remove continue-on-error)
4. Add observability (metrics, logs, traces)
5. Add runbook templates

### Medium Priority Fixes
1. Add test matrix (Node versions, OS)
2. Add cache for dependencies
3. Add retry logic for flaky steps
4. Add alerting rules
5. Add incident response procedures
