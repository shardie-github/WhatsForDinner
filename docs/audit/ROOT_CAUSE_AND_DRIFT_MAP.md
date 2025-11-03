# Root Cause & Drift Map

**Generated:** 2025-01-27  
**Scope:** Architecture integrity, module graph, SPOF detection

## Current Architecture Overview

### Monorepo Structure
```
/workspace/
├── apps/
│   ├── web/              # Next.js 16 PWA (primary)
│   ├── mobile/           # Expo React Native (iOS/Android)
│   ├── admin.disabled/   # ⚠️ DISABLED/ORPHANED
│   ├── billing.disabled/
│   ├── developers.disabled/
│   └── [multiple .disabled apps]
├── packages/
│   ├── server/           # Backend services (jobs, queue, routes)
│   ├── ui/               # Shared UI components
│   ├── utils/            # Shared utilities
│   ├── theme/            # Design tokens
│   ├── adapters/         # External integrations (CRM, purchases)
│   ├── analytics/        # Consent management
│   └── testing/          # Test utilities (chaos, contracts, perf)
└── supabase/             # DB migrations (multiple locations)
```

## Module Dependency Graph

### Critical Paths
1. **Web App → Server Package**
   - `apps/web/src/app/api/**` → `packages/server/src/routes/**`
   - Dependency: Direct imports (tight coupling)

2. **Shared Packages → Apps**
   - `@whats-for-dinner/ui` → `apps/web`, `apps/mobile`
   - `@whats-for-dinner/utils` → All apps
   - Status: ✅ Clean, no circular deps detected

3. **Server Package Dependencies**
   - `packages/server/src/queue/index.ts` → BullMQ → Redis
   - `packages/server/src/db/**` → Supabase client
   - `packages/server/src/jobs/**` → Dynamic imports (deferred)

### Orphaned Components (High Priority)

| Component | Location | Status | Impact |
|-----------|----------|--------|--------|
| `apps/admin.disabled/` | `apps/admin.disabled/**` | Disabled | Unknown if referenced |
| `apps/billing.disabled/` | `apps/billing.disabled/**` | Disabled | Potential dead code |
| `apps/developers.disabled/` | `apps/developers.disabled/**` | Disabled | Unclear ownership |
| `apps/pantry.disabled/` | `apps/pantry.disabled/**` | Disabled | May contain legacy logic |
| `apps/favorites.disabled/` | `apps/favorites.disabled/**` | Disabled | Code bloat |

**Action:** Audit these directories for:
- Active imports/references
- Critical business logic
- Safe deletion candidates

### Circular Dependencies

**Status:** ✅ No circular dependencies detected in dependency graph scan.

**Note:** One comment found in `nomad/packages/adapters/src/ads/adEngine.ts` mentions avoiding circular deps, indicating awareness.

## Architecture Drift Analysis

### Documented vs. Reality

| Document | Path | Documented Intent | Reality | Drift Level |
|----------|------|------------------|---------|-------------|
| `ARCHITECTURE_SUMMARY.md` | Root | Next.js 16 + Expo | Next.js 16 (✅), Expo (✅) | ✅ Aligned |
| `ARCHITECTURE_TARGET.md` | Root | Phases 2-7 roadmap | Partial implementation | ⚠️ Partial |
| `docs/nomad/ARCHITECTURE.md` | `docs/nomad/` | Nomad-specific features | Routes exist: `/nomad/**` | ✅ Mostly aligned |
| `README.md` | Root | Universal app monorepo | ✅ Matches structure | ✅ Aligned |

### Key Drift Findings

1. **Nomad vs. "What's for Dinner"**
   - **Documentation:** Two separate product identities
   - **Codebase:** Mixed references (`nomad.app`, `whats-for-dinner.vercel.app`)
   - **Impact:** Brand confusion, config inconsistency
   - **Files:** `docs/nomad/ARCHITECTURE.md`, `apps/web/src/app/nomad/**`, `.env.example` (mixed refs)

2. **Disabled Apps**
   - **Documentation:** Not mentioned in architecture docs
   - **Reality:** 5+ `.disabled` app directories exist
   - **Impact:** Code bloat, unclear ownership, potential security surface

3. **Database Migration Locations**
   - **Expected:** Single source of truth (`supabase/migrations/`)
   - **Reality:** Multiple locations:
     - `supabase/migrations/` (6 files)
     - `apps/web/supabase/migrations/` (6 files)
     - `whats-for-dinner/supabase/migrations/` (13 files)
     - `packages/server/db/migrations/` (5 files)
   - **Impact:** ⚠️ HIGH - Schema drift risk, unclear migration path

## Single Points of Failure (SPOFs)

### Top 10 SPOFs

| Rank | Component | Location | Failure Mode | Blast Radius | Current Guardrail |
|------|-----------|----------|--------------|--------------|-------------------|
| 1 | Redis Connection | `packages/server/src/queue/index.ts:9-17` | Redis unavailable | Queue stops, jobs fail | ❌ None (throws) |
| 2 | Supabase Client | `packages/server/src/db/**` | Auth/DB outage | All data operations fail | ❌ None (direct dependency) |
| 3 | Queue Worker | `packages/server/src/queue/index.ts:44-95` | Worker crash | Background jobs fail silently | ⚠️ Process signals only |
| 4 | Job Name Switch | `packages/server/src/queue/index.ts:49-82` | Unknown job type | Job fails, no fallback | ❌ None |
| 5 | Environment Config | `.env.example` (300+ vars) | Missing/invalid env | App fails to start | ⚠️ Runtime validation unclear |
| 6 | Next.js Static Export | `apps/web/next.config.ts:5` | Build failure | Deployment blocked | ⚠️ CI checks |
| 7 | Stripe Webhook Secret | `apps/web/src/app/api/stripe/webhook/route.ts` | Invalid secret | Payment processing fails | ⚠️ Manual config |
| 8 | OpenAI API Key | `.env.example:52` | Key expired/revoked | AI features fail | ❌ No fallback |
| 9 | Database Connection | `packages/server/src/db/**` | Connection pool exhaustion | Cascading failures | ❌ No connection pooling config visible |
| 10 | CI/CD Secrets | `.github/workflows/ci-cd.yml` | Missing secrets | All deployments fail | ⚠️ Manual setup |

### Proposed Guardrails

#### 1. Redis Connection Resilience
**File:** `packages/server/src/queue/index.ts`
```typescript
// Add retry with exponential backoff
function getRedisConnection(): Redis {
  // ... existing code ...
  // ADD: Connection retry logic
  // ADD: Health check endpoint
  // ADD: Circuit breaker pattern
}
```

#### 2. Supabase Fallback
**File:** `packages/server/src/db/index.ts`
```typescript
// ADD: Connection pool configuration
// ADD: Read replica fallback
// ADD: Query timeout guards
```

#### 3. Queue Worker Resilience
**File:** `packages/server/src/queue/index.ts`
```typescript
// ADD: Dead letter queue (DLQ)
// ADD: Job retry with backoff
// ADD: Health monitoring
// ADD: Auto-restart on crash
```

#### 4. Environment Validation
**File:** `packages/config/src/env.ts` (NEW)
```typescript
// ADD: Zod schema for all env vars
// ADD: Startup validation
// ADD: Missing var warnings
```

#### 5. Job Type Safety
**File:** `packages/server/src/queue/index.ts`
```typescript
// ADD: Type-safe job registry
// ADD: Unknown job fallback handler
// ADD: Job schema validation
```

## Implicit Contracts & Assumptions

### 1. API Route Contracts
**Location:** `apps/web/src/app/api/**`
- **Assumption:** All routes return JSON
- **Reality:** Unclear (no OpenAPI spec found)
- **Risk:** Frontend/backend contract drift
- **Fix:** Generate OpenAPI from route handlers

### 2. Database Schema Contracts
**Location:** Multiple migration files
- **Assumption:** Single source of truth
- **Reality:** 4 migration directories
- **Risk:** Schema drift, migration conflicts
- **Fix:** Consolidate to single `supabase/migrations/`

### 3. Environment Variable Contracts
**Location:** `.env.example`
- **Assumption:** All vars documented
- **Reality:** 300+ vars, no validation schema
- **Risk:** Runtime failures, config drift
- **Fix:** Add Zod schema + validation

### 4. Queue Job Contracts
**Location:** `packages/server/src/queue/index.ts`
- **Assumption:** Job names match handlers
- **Reality:** String-based switch (fragile)
- **Risk:** Typos, missing handlers
- **Fix:** Type-safe registry pattern

### 5. Cross-Module State Coupling
**Location:** `packages/server/src/**`
- **Assumption:** Stateless services
- **Reality:** Global Redis connection, singleton queue
- **Risk:** Test isolation issues, shared state bugs
- **Fix:** Dependency injection pattern

## Data Flow Hotspots

### Critical Paths
1. **User Auth Flow**
   - `apps/web/src/app/api/auth/**` → `packages/server/src/auth/**` → Supabase
   - **SPOF:** Supabase auth service
   - **Guard:** ✅ Supabase has built-in redundancy

2. **Payment Processing**
   - `apps/web/src/app/api/stripe/webhook/route.ts` → Stripe API
   - **SPOF:** Stripe webhook secret validation
   - **Guard:** ⚠️ Manual configuration only

3. **Queue → Job Processing**
   - `packages/server/src/queue/index.ts` → `packages/server/src/jobs/**`
   - **SPOF:** Single worker process
   - **Guard:** ❌ No worker redundancy

4. **Database Queries**
   - All routes → `packages/server/src/db/**` → Supabase
   - **SPOF:** Single connection pool
   - **Guard:** ⚠️ Supabase manages this, but no app-level config

## Recommendations Priority

### Immediate (≤1 day)
1. ✅ Audit disabled apps for safe deletion
2. ✅ Consolidate migration directories
3. ✅ Add Redis connection retry logic
4. ✅ Add queue health endpoint

### Short-term (≤1 week)
1. ✅ Add environment variable validation schema
2. ✅ Implement type-safe job registry
3. ✅ Generate OpenAPI spec from routes
4. ✅ Add circuit breaker for external APIs

### Medium-term (≤3 weeks)
1. ✅ Implement connection pooling for Supabase
2. ✅ Add worker redundancy/health checks
3. ✅ Create single config source of truth
4. ✅ Add contract tests for API routes
