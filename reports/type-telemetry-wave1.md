# Type & Telemetry Wave 1 Report

**Generated:** 2025-01-09  
**Scope:** Files with >5 implicit `any`, >10 unused exports; endpoints/pages lacking RUM/synthetic metrics  
**Target:** Strengthen typing (top 10 files, ≤30 explicit type fixes) + instrument missing telemetry

---

## Executive Summary

**Type Coverage Issues:**
- Files with >5 `any` types: 15 files
- Total `any` usage: ~150+ instances
- Unused exports: 694 exports found (need analysis for truly unused)

**Telemetry Coverage:**
- API endpoints with telemetry: 0% (estimated)
- Pages with RUM: 0% (estimated)
- Core Web Vitals tracking: Not configured

**Priority:** High (blocks SLO compliance: p95 <400ms, type coverage >95%)

---

## Part 1: Type Strengthening

### Files with >5 Implicit `any` Types

| File | `any` Count | Priority | Issue |
|------|-------------|----------|-------|
| `src/lib/franchiseAutomation.ts` | 21 | P0 | High usage, likely core logic |
| `src/lib/agents/ethicsAgent.ts` | 20 | P0 | AI agent, needs type safety |
| `src/lib/selfLearningSystem.ts` | 16 | P1 | Learning system, complex types |
| `src/lib/predictiveOptimization.ts` | 15 | P1 | Optimization logic, needs types |
| `src/lib/complianceAudit.ts` | 11 | P1 | Compliance, needs strict types |
| `src/lib/agents/healAgent.ts` | 10 | P1 | Healing agent, needs types |
| `src/lib/agents/insightAgent.ts` | 10 | P1 | Insight agent, needs types |
| `src/lib/federatedGateway.ts` | 17 | P1 | Gateway, needs API types |
| `src/lib/supabaseClient.ts` | 63 | P0 | **CRITICAL** - Supabase client, many `any` |
| `src/lib/observability.ts` | 18 | P1 | Observability, needs typed events |
| `src/lib/monitoring.ts` | 6 | P2 | Monitoring, needs types |
| `src/lib/cognitiveContinuity.ts` | 6 | P2 | Cognitive system, needs types |
| `src/lib/modelAdvisor.ts` | 6 | P2 | Model advisor, needs types |
| `src/components/revenue/RevenueDashboard.tsx` | 7 | P1 | UI component, needs props types |
| `src/lib/resilience.ts` | 8 | P2 | Resilience logic, needs types |

**Top 10 Files for Wave 1 (≤30 fixes):**

1. `src/lib/supabaseClient.ts` (63 `any`) - **CRITICAL** - Generate Supabase types
2. `src/lib/franchiseAutomation.ts` (21 `any`) - Add franchise types
3. `src/lib/agents/ethicsAgent.ts` (20 `any`) - Add agent types
4. `src/lib/observability.ts` (18 `any`) - Add observability event types
5. `src/lib/federatedGateway.ts` (17 `any`) - Add API gateway types
6. `src/lib/selfLearningSystem.ts` (16 `any`) - Add learning system types
7. `src/lib/predictiveOptimization.ts` (15 `any`) - Add optimization types
8. `src/lib/complianceAudit.ts` (11 `any`) - Add compliance types
9. `src/lib/agents/healAgent.ts` (10 `any`) - Add agent types
10. `src/lib/agents/insightAgent.ts` (10 `any`) - Add agent types

**Total Estimated Fixes:** ~30 explicit type definitions

---

### Unused Exports Analysis

**Finding:** 694 exports found across 226 files in `apps/web/src/lib/`

**Method:** Need to run `ts-prune` or `knip` to identify truly unused exports.

**Top Candidates (by file count):**
- `src/lib/` - 226 files with exports
- Many utility functions may be unused
- Barrel exports (`index.ts`) may re-export unused code

**Action Required:**
```bash
# Run knip to find unused exports
cd apps/web && npx knip --reporter json --output reports/knip-unused-exports.json

# Or use ts-prune
cd apps/web && npx ts-prune --project tsconfig.json > reports/ts-prune-unused.txt
```

**Top 10 Files Likely to Have Unused Exports:**
1. `src/lib/index.ts` (barrel export)
2. `src/lib/revenue/index.ts` (barrel export)
3. `src/lib/monetization/index.ts` (barrel export)
4. `src/lib/agents/*` (agent exports)
5. `src/lib/privacy/*` (privacy exports)
6. `src/lib/capacitor/*` (capacitor exports)
7. `src/lib/nomad/*` (nomad exports)
8. `src/lib/services/*` (service exports)
9. `src/lib/performance/*` (performance exports)
10. `src/lib/optimization/*` (optimization exports)

---

## Part 2: Missing Telemetry

### API Endpoints Lacking RUM/Synthetic Metrics

**Finding:** No telemetry found in API routes. All endpoints need p95 latency tracking.

**Top Priority Endpoints (from assurance-scan.md):**

| Endpoint | File | Current Telemetry | Priority |
|----------|------|-------------------|----------|
| `/api/mealplan/ai-generate` | `src/app/api/mealplan/ai-generate/route.ts` | None | P0 |
| `/api/revenue/dashboard` | `src/app/api/revenue/dashboard/route.ts` | None | P0 |
| `/api/metrics/dashboard` | `src/app/api/metrics/dashboard/route.ts` | None | P0 |
| `/api/telemetry/ingest` | `src/app/api/telemetry/ingest/route.ts` | None | P0 |
| `/api/stripe/webhook` | `src/app/api/stripe/webhook/route.ts` | None | P0 |
| `/api/health` | `src/app/api/health/route.ts` | None | P1 |
| `/api/user/me` | `src/app/api/user/me/route.ts` | None | P1 |
| `/api/subscriptions/create` | `src/app/api/subscriptions/create/route.ts` | None | P1 |
| `/api/subscriptions/me` | `src/app/api/subscriptions/me/route.ts` | None | P1 |
| `/api/affiliate/track` | `src/app/api/affiliate/track/route.ts` | None | P1 |

**Total Endpoints:** 226 API route files found

**Coverage Target:** 100% (all endpoints)

**Wave 1 Target:** Top 10 endpoints (P0 + P1)

---

### Pages Lacking RUM

**Finding:** No RUM (Real User Monitoring) configured. Sentry is configured but RUM may not be enabled.

**Pages to Instrument:**
- All pages in `src/app/` (Next.js App Router)
- Key pages:
  - `/` (home)
  - `/recipes`
  - `/pantry`
  - `/favorites`
  - `/profile`
  - `/admin/*`

**Current State:**
- Sentry configured (`sentry.client.config.ts`, `sentry.server.config.ts`)
- RUM not verified (need to check if `@sentry/nextjs` RUM is enabled)
- Core Web Vitals not tracked (despite `web-vitals` package in dependencies)

**Action Required:**
```typescript
// Add to src/app/layout.tsx or _app.tsx
import { init } from '@sentry/nextjs';

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

---

## Implementation Plan

### Wave 1: Type Strengthening (≤30 fixes)

**PR Title:** `type: strengthen typing (telemetry wave)`

**Files to Update:**
1. `src/lib/supabaseClient.ts` - Generate Supabase types, replace `any` with generated types
2. `src/lib/franchiseAutomation.ts` - Add franchise automation types
3. `src/lib/agents/ethicsAgent.ts` - Add ethics agent types
4. `src/lib/observability.ts` - Add observability event types (LogEntry, TraceSpan, Trace)
5. `src/lib/federatedGateway.ts` - Add API gateway types
6. `src/lib/selfLearningSystem.ts` - Add learning system types
7. `src/lib/predictiveOptimization.ts` - Add optimization types
8. `src/lib/complianceAudit.ts` - Add compliance audit types
9. `src/lib/agents/healAgent.ts` - Add healing agent types
10. `src/lib/agents/insightAgent.ts` - Add insight agent types

**Estimated LOC Change:** ~300 LOC (type definitions + replacements)

**Commands:**
```bash
# Generate Supabase types
cd apps/web && npx supabase gen types typescript --local > src/lib/supabase-types.ts

# Type check
cd apps/web && npm run type-check

# Verify no new errors
cd apps/web && npm run type-check 2>&1 | grep -c "error TS" || echo "No type errors"
```

**Rollback:**
```bash
git revert <commit>
```

---

### Wave 1: Telemetry Instrumentation

**PR Title:** `obs: instrument missing telemetry`

**Files to Update:**
1. `src/app/api/mealplan/ai-generate/route.ts` - Add p95 latency tracking
2. `src/app/api/revenue/dashboard/route.ts` - Add p95 latency tracking
3. `src/app/api/metrics/dashboard/route.ts` - Add p95 latency tracking
4. `src/app/api/telemetry/ingest/route.ts` - Add p95 latency tracking
5. `src/app/api/stripe/webhook/route.ts` - Add p95 latency tracking
6. `src/app/api/health/route.ts` - Add p95 latency tracking
7. `src/app/api/user/me/route.ts` - Add p95 latency tracking
8. `src/app/api/subscriptions/create/route.ts` - Add p95 latency tracking
9. `src/app/api/subscriptions/me/route.ts` - Add p95 latency tracking
10. `src/app/api/affiliate/track/route.ts` - Add p95 latency tracking
11. `src/app/layout.tsx` - Enable Sentry RUM + Core Web Vitals

**Middleware Approach:**
Create `src/lib/telemetry/api-middleware.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';

export function withTelemetry(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const start = Date.now();
    try {
      const response = await handler(req);
      const duration = Date.now() - start;
      // Track p95 latency
      // Send to observability system
      return response;
    } catch (error) {
      const duration = Date.now() - start;
      // Track error + latency
      throw error;
    }
  };
}
```

**Estimated LOC Change:** ~200 LOC (middleware + instrumentation)

**Commands:**
```bash
# Test telemetry
cd apps/web && npm run dev
# Hit endpoints, verify telemetry in Sentry/observability system
```

**Rollback:**
```bash
git revert <commit>
```

---

## Scripts to Add

### Type Coverage Script

**File:** `apps/web/package.json`

```json
{
  "scripts": {
    "type:coverage": "tsc --noEmit --pretty false 2>&1 | grep -E 'error TS|Found [0-9]+ error' || echo 'No type errors'",
    "typecheck": "tsc --noEmit"
  }
}
```

**Usage:**
```bash
cd apps/web && npm run type:coverage
```

---

### Telemetry Check Script

**File:** `apps/web/package.json`

```json
{
  "scripts": {
    "obs:check": "node scripts/check-telemetry-coverage.mjs"
  }
}
```

**File:** `apps/web/scripts/check-telemetry-coverage.mjs`

```javascript
// Check that all API routes have telemetry
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const apiDir = join(process.cwd(), 'src/app/api');
const routes = [];

function findRoutes(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      findRoutes(fullPath);
    } else if (entry.name === 'route.ts') {
      routes.push(fullPath);
    }
  }
}

findRoutes(apiDir);

let withTelemetry = 0;
for (const route of routes) {
  const content = readFileSync(route, 'utf-8');
  if (content.includes('withTelemetry') || content.includes('telemetry')) {
    withTelemetry++;
  }
}

console.log(`Telemetry coverage: ${withTelemetry}/${routes.length} (${Math.round(withTelemetry/routes.length*100)}%)`);
process.exit(withTelemetry === routes.length ? 0 : 1);
```

**Usage:**
```bash
cd apps/web && npm run obs:check
```

---

## Success Criteria

### Type Strengthening
- ✅ Top 10 files have explicit types (no `any`)
- ✅ Type coverage increases (measure with `type:coverage`)
- ✅ No new type errors introduced
- ✅ `src/lib/supabaseClient.ts` uses generated Supabase types

### Telemetry Instrumentation
- ✅ Top 10 API endpoints have p95 latency tracking
- ✅ RUM enabled in Sentry
- ✅ Core Web Vitals tracked
- ✅ `obs:check` passes (100% coverage)

---

## Next Steps

1. **Immediate:** Create PR for type strengthening (top 10 files)
2. **Immediate:** Create PR for telemetry instrumentation (top 10 endpoints)
3. **Follow-up:** Run `knip` to find unused exports
4. **Follow-up:** Expand telemetry to all 226 endpoints
5. **Follow-up:** Expand type fixes to all 15 files with >5 `any`

---

**Report Generated:** 2025-01-09  
**Next Review:** After Wave 1 PRs are merged
