# Contracts vs Implementation Analysis

**Generated:** 2025-01-27  
**Scope:** API contracts, DB schema, ORM vs migrations, endpoint validation

## API Contract Analysis

### Contract Discovery

**Status:** ❌ **No OpenAPI/GraphQL/Proto contracts found**

- **Searched for:** `openapi*.{yml,yaml,json}`, `graphql/schema.*`, `proto/**`
- **Result:** No contract files found
- **Impact:** High - Frontend/backend contract drift risk

### API Endpoint Inventory

**Location:** `apps/web/src/app/api/**`

**Total Endpoints:** ~50+ routes

#### Endpoint Categories

| Category | Count | Routes | Status |
|----------|-------|--------|--------|
| **Admin** | 4 | `/api/admin/*` | ✅ Implemented |
| **Auth** | 2 | `/api/auth/*` | ✅ Implemented |
| **Billing** | 2 | `/api/billing/*` | ✅ Implemented |
| **Health** | 2 | `/api/health*`, `/api/healthz` | ⚠️ Duplicate? |
| **Nomad** | 7 | `/api/nomad/*` | ✅ Implemented |
| **Privacy/GDPR** | 2 | `/api/privacy/*`, `/api/gdpr/*` | ⚠️ Potential overlap |
| **Stripe** | 1 | `/api/stripe/webhook` | ✅ Implemented |
| **Subscriptions** | 2 | `/api/subscriptions/*` | ✅ Implemented |
| **User** | 1 | `/api/user/me` | ✅ Implemented |
| **Misc** | 20+ | Various routes | ✅ Implemented |

### Endpoint-by-Endpoint Analysis

#### 1. Health Check Endpoints
**Files:**
- `apps/web/src/app/api/health/route.ts`
- `apps/web/src/app/api/healthz/route.ts`

**Issue:** ⚠️ **Duplicate endpoints** - Both likely serve same purpose  
**Recommendation:** Consolidate to single `/api/health` endpoint

#### 2. Privacy Endpoints
**Files:**
- `apps/web/src/app/api/privacy/export/route.ts`
- `apps/web/src/app/api/privacy/erase/route.ts`
- `apps/web/src/app/api/gdpr/` (2 files)

**Issue:** ⚠️ **Potential overlap** - Both handle GDPR/DSAR requests  
**Recommendation:** Consolidate or clearly differentiate use cases

#### 3. Stripe Webhook
**File:** `apps/web/src/app/api/stripe/webhook/route.ts`

**Missing Contract:**
- No documented webhook payload schema
- No documented response codes
- No documented error handling
- No documented idempotency behavior

**Recommendation:** Document webhook contract (Stripe webhook signature validation)

#### 4. User Profile
**File:** `apps/web/src/app/api/user/me/route.ts`

**Missing Contract:**
- No documented request schema (query params, headers)
- No documented response schema
- No documented authentication requirements
- No documented error responses

**Recommendation:** Generate OpenAPI spec with request/response schemas

### Status Code Analysis

**Status:** ⚠️ **No consistent status code patterns documented**

**Recommendation:**
- Standardize status codes (200, 201, 400, 401, 403, 404, 500)
- Document error response format
- Add error response types

### Authentication Requirements

**Status:** ⚠️ **No documented auth requirements per endpoint**

**Recommendation:**
- Document which endpoints require auth
- Document auth methods (Bearer token, API key, etc.)
- Add auth middleware documentation

## Database Schema Analysis

### Migration Locations (Drift Risk)

**Issue:** ⚠️ **HIGH - Multiple migration directories**

| Location | Count | Status |
|----------|-------|--------|
| `supabase/migrations/` | 6 files | ✅ Active? |
| `apps/web/supabase/migrations/` | 6 files | ✅ Active? |
| `whats-for-dinner/supabase/migrations/` | 13 files | ⚠️ Legacy? |
| `packages/server/db/migrations/` | 5 files | ✅ Active? |

**Total:** 30 migration files across 4 directories

**Risk:** Schema drift, migration conflicts, unclear migration path

**Recommendation:** Consolidate to single `supabase/migrations/` directory

### Schema Consistency

**Master Schema:** `master_supabase_schema.sql` (1385+ lines)

**Migration Files:** Multiple partial migrations

**Issue:** ⚠️ **Potential drift between master schema and migrations**

**Recommendation:**
- Validate master schema matches migrations
- Generate migration from master schema
- Add migration validation tests

### ORM vs Migration Analysis

**Status:** ⚠️ **No ORM schema found**

**Searched for:**
- `prisma/schema.prisma` - ❌ Not found
- `drizzle-kit` config - Found: `packages/server/src/db/drizzle.config.ts`
- Drizzle schema - Not found in expected location

**Current State:**
- Using raw SQL migrations
- No ORM schema file
- No type-safe database queries (likely)

**Recommendation:**
- Add Drizzle schema file (if using Drizzle)
- Or add Prisma schema (if migrating)
- Generate types from schema

### Database Schema Issues

#### 1. Unsafe Defaults
**Location:** `master_supabase_schema.sql`

**Issues Found:**
- Many nullable columns without defaults
- No explicit NOT NULL constraints in some tables
- Missing foreign key constraints in some relations

**Recommendation:** Add migration to add NOT NULL constraints where appropriate

#### 2. Nullable Surprises
**Location:** `master_supabase_schema.sql`

**Tables with Many Nullable Columns:**
- `profiles.preferences` (jsonb, nullable)
- `recipes.details` (jsonb, nullable)
- `analytics_events.properties` (jsonb, default '{}')

**Recommendation:** Document nullable vs required fields in API docs

#### 3. N+1 Query Risk
**Location:** Multiple query patterns

**Potential Issues:**
- `recipes` → `favorites` (one-to-many)
- `profiles` → `pantry_items` (one-to-many)
- `recipes` → `recipe_metrics` (one-to-many)

**Recommendation:**
- Add query batching
- Use JOINs where appropriate
- Add query monitoring

### RLS (Row Level Security) Analysis

**Status:** ⚠️ **RLS policies not fully documented**

**Migration Files:**
- `whats-for-dinner/supabase/migrations/014_consolidated_rls_security.sql`
- `supabase/migrations/015_nomad_schema.sql` (may contain RLS)

**Issues:**
- No comprehensive RLS policy documentation
- No RLS policy tests
- No RLS policy validation

**Recommendation:**
- Document RLS policies per table
- Add RLS policy tests
- Add RLS policy validation in CI

### Query Patterns at Risk

| Query Pattern | Location | Risk | Mitigation |
|--------------|----------|------|------------|
| **User-scoped queries** | All routes | RLS policy failures | Add RLS policy tests |
| **Join queries** | Multiple | N+1 queries | Add query batching |
| **JSONB queries** | `profiles.preferences` | Performance issues | Add GIN indexes |
| **Analytics queries** | `analytics_events` | Large dataset scans | Add time-based indexes |

## Endpoint Validation

### Missing Validations

| Endpoint | Missing Validation | Risk |
|----------|-------------------|------|
| **All POST endpoints** | Request body schema | Invalid data accepted |
| **All GET endpoints** | Query parameter validation | SQL injection (if used) |
| **Webhook endpoints** | Signature validation | Security risk |
| **Auth endpoints** | Token validation | Unauthorized access |

**Recommendation:**
- Add Zod schemas for all request/response types
- Add validation middleware
- Add type-safe API route handlers

## Contract Conformance Recommendations

### Immediate (≤1 day)
1. ✅ Generate OpenAPI spec from route handlers
2. ✅ Consolidate duplicate endpoints (`/api/health` vs `/api/healthz`)
3. ✅ Document endpoint authentication requirements
4. ✅ Add request/response type definitions

### Short-term (≤1 week)
1. ✅ Consolidate migration directories
2. ✅ Add Zod schemas for all API routes
3. ✅ Add validation middleware
4. ✅ Document RLS policies
5. ✅ Add endpoint contract tests

### Medium-term (≤3 weeks)
1. ✅ Add ORM schema (Drizzle/Prisma)
2. ✅ Generate types from schema
3. ✅ Add database query monitoring
4. ✅ Add RLS policy tests
5. ✅ Add API contract tests (OpenAPI validation)

## Specific File Findings

### Files Needing Schema Documentation

| File | Missing Schema | Priority |
|------|----------------|----------|
| `apps/web/src/app/api/stripe/webhook/route.ts` | Webhook payload schema | HIGH |
| `apps/web/src/app/api/user/me/route.ts` | Request/response schema | HIGH |
| `apps/web/src/app/api/subscriptions/create/route.ts` | Request body schema | HIGH |
| `apps/web/src/app/api/privacy/export/route.ts` | Request/response schema | MEDIUM |
| `apps/web/src/app/api/nomad/**` | All endpoint schemas | MEDIUM |

### Files Needing Migration Consolidation

| Current Location | Target Location | Action |
|-----------------|-----------------|--------|
| `apps/web/supabase/migrations/` | `supabase/migrations/` | Consolidate |
| `whats-for-dinner/supabase/migrations/` | Review & consolidate | Audit first |
| `packages/server/db/migrations/` | `supabase/migrations/` | Consolidate |

## Summary

### Critical Issues
1. ❌ **No API contract files** (OpenAPI/GraphQL)
2. ⚠️ **Multiple migration directories** (schema drift risk)
3. ⚠️ **No ORM schema** (type safety risk)
4. ⚠️ **No endpoint validation** (security/data integrity risk)

### High Priority Fixes
1. Generate OpenAPI spec
2. Consolidate migration directories
3. Add Zod schemas for all endpoints
4. Document RLS policies
5. Add endpoint contract tests

### Medium Priority Fixes
1. Add ORM schema (Drizzle/Prisma)
2. Generate types from schema
3. Add query monitoring
4. Add RLS policy tests
5. Consolidate duplicate endpoints
