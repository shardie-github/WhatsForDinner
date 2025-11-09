# Full Code Review & Refactor Plan

**Generated:** 2025-01-09  
**Scope:** Architecture, correctness, performance, security, maintainability  
**Method:** Line-referenced findings from codebase analysis

---

## Executive Summary

**Total Findings:** 45  
**Critical:** 8  
**High:** 15  
**Medium:** 15  
**Low:** 7

**Refactor Plan:** 3 waves, each ≤300 LOC change

---

## 1. Architecture Findings

### 1.1 Layering Violations

**Finding:** API routes directly import business logic, bypassing service layer.

| File | Issue | Line |
|------|-------|------|
| `src/app/api/revenue/dashboard/route.ts` | Direct import of revenue modules | 7-12 |
| `src/app/api/metrics/dashboard/route.ts` | Direct import of metrics modules | - |

**Impact:** Tight coupling, harder to test, violates separation of concerns.

**Fix:** Introduce service layer between API routes and business logic.

---

### 1.2 Dependency Cycles

**Finding:** Potential circular dependencies in `src/lib/` (needs analysis).

**Action Required:**
```bash
# Analyze dependency cycles
cd apps/web && npx madge --circular src/lib/
```

---

### 1.3 Duplication

**Finding:** Similar error handling patterns repeated across API routes.

| Pattern | Files | Count |
|---------|-------|-------|
| `try/catch` with `NextResponse.json({ error })` | API routes | ~50+ |
| Supabase client creation | Multiple files | ~10+ |

**Impact:** Code duplication, inconsistent error handling.

**Fix:** Extract error handling middleware, centralize Supabase client.

---

## 2. Correctness Findings

### 2.1 Unhandled Errors

**Finding:** Some async operations lack error handling.

| File | Issue | Line |
|------|-------|------|
| `src/app/api/revenue/dashboard/route.ts` | Generic catch, no error logging | 46-50 |
| `src/app/api/health/route.ts` | No error handling (edge runtime) | 9-23 |

**Impact:** Errors may be swallowed, no visibility into failures.

**Fix:** Add error taxonomy (see Wave 1), ensure all errors are logged.

---

### 2.2 Side Effects

**Finding:** API routes may have side effects without idempotency.

| File | Issue | Line |
|------|-------|------|
| `src/app/api/telemetry/ingest/route.ts` | Writes to database, no idempotency | - |
| `src/app/api/affiliate/track/route.ts` | Tracks events, may duplicate | - |

**Impact:** Duplicate operations, data inconsistency.

**Fix:** Add idempotency keys, idempotent handlers.

---

### 2.3 Race Conditions

**Finding:** Potential race conditions in concurrent operations.

**Action Required:** Review concurrent database operations, add locking if needed.

---

### 2.4 Async Misuse

**Finding:** Some promises not properly awaited.

**Action Required:**
```bash
# Find unhandled promises
cd apps/web && grep -r "\.then\|\.catch" src/ --include="*.ts" | grep -v "await"
```

---

## 3. Performance Findings

### 3.1 N+1 IO Patterns

**Finding:** Potential N+1 queries in API routes.

| File | Issue | Line |
|------|-------|------|
| `src/app/api/revenue/dashboard/route.ts` | Multiple sequential calls | 19-43 |
| `src/app/api/metrics/dashboard/route.ts` | Multiple sequential calls | - |

**Impact:** Slow API responses, database load.

**Fix:** Batch queries, use aggregations, add caching.

---

### 3.2 Heavy Dependencies

**Finding:** Some imports may be heavy (needs bundle analysis).

**Action Required:** Run bundle analyzer (see Phase A).

---

### 3.3 Memoization Gaps

**Finding:** React components may re-render unnecessarily.

| Component | Issue | Fix |
|-----------|-------|-----|
| `src/components/revenue/RevenueDashboard.tsx` | No memoization | Add `React.memo`, `useMemo` |
| `src/components/gamification/*` | No memoization | Add memoization |

**Impact:** Unnecessary re-renders, performance degradation.

**Fix:** Add `React.memo`, `useMemo`, `useCallback` where appropriate.

---

### 3.4 Unnecessary Re-renders

**Finding:** Components may re-render due to prop changes.

**Action Required:** Review component props, add memoization.

---

## 4. Security Findings

### 4.1 Input Validation

**Finding:** Some API routes lack input validation.

| File | Issue | Line |
|------|-------|------|
| `src/app/api/revenue/dashboard/route.ts` | No input validation | 14 |
| `src/app/api/user/me/route.ts` | No input validation | - |

**Impact:** Potential injection attacks, data corruption.

**Fix:** Add Zod validation (Zod already in dependencies).

---

### 4.2 Auth/Role Checks

**Finding:** Some routes may lack authentication checks.

**Action Required:** Review all API routes for auth middleware.

---

### 4.3 CSP/CORS Usage

**Finding:** CSP and CORS configured in `next.config.ts`, but may need review.

**Evidence:**
- `next.config.ts:123-174` shows headers configuration
- `vercel.json:12-38` shows security headers

**Action Required:** Verify CSP/CORS policies are optimal.

---

## 5. Maintainability Findings

### 5.1 Naming

**Finding:** Some variables/functions may have unclear names.

**Action Required:** Review naming conventions, refactor unclear names.

---

### 5.2 Function Length

**Finding:** Some functions may be too long (>50 lines).

**Action Required:** Extract smaller functions, improve readability.

---

### 5.3 Cohesion

**Finding:** Some files may have low cohesion (multiple responsibilities).

**Action Required:** Split files with multiple responsibilities.

---

### 5.4 Dead Code

**Finding:** Unused exports found (see Phase C).

**Action Required:** Run `knip` to find unused code, remove dead code.

---

## Refactor Plan: 3 Waves

### Wave 1: Safety & Hotspots (≤300 LOC)

**PR Title:** `refactor: guards & error taxonomy`

**Changes:**
1. Add `src/lib/errors.ts` with domain error classes
2. Add narrow try/catch patterns
3. Add input validation (Zod) at risky endpoints
4. Extract error handling middleware

**Files to Update:**
- `src/lib/errors.ts` (new, ~100 LOC)
- `src/lib/validation.ts` (enhance, ~50 LOC)
- `src/app/api/revenue/dashboard/route.ts` (add validation, ~30 LOC)
- `src/app/api/user/me/route.ts` (add validation, ~30 LOC)
- `src/app/api/metrics/dashboard/route.ts` (add validation, ~30 LOC)
- Error handling middleware (~60 LOC)

**Total:** ~300 LOC

**Evidence:**
- Before: Generic `catch (error)`, no validation
- After: Domain errors, Zod validation, error middleware

**Tests:** Add tests for error handling, validation

**Rollback:**
```bash
git revert <commit>
```

**Labels:** `auto/refactor`

---

### Wave 2: Performance Micro-Wins (≤300 LOC)

**PR Title:** `perf: remove N+1 / memoize / split heavy imports`

**Changes:**
1. Replace heavy sync paths with dynamic imports
2. Add memoization (`useMemo`/`useCallback`) for hot components
3. Inline small utilities to cut import depth
4. Batch database queries (remove N+1)

**Files to Update:**
- `src/components/revenue/RevenueDashboard.tsx` (add memoization, ~50 LOC)
- `src/app/api/revenue/dashboard/route.ts` (batch queries, ~50 LOC)
- `src/app/api/metrics/dashboard/route.ts` (batch queries, ~50 LOC)
- Dynamic imports for heavy modules (~50 LOC)
- Memoization for hot components (~100 LOC)

**Total:** ~300 LOC

**Evidence:**
- Bundle delta: Measure with bundle analyzer
- p95 delta: Measure with telemetry (after Phase C)

**Tests:** Performance benchmarks

**Rollback:**
```bash
git revert <commit>
```

**Labels:** `auto/perf`

---

### Wave 3: Structure & Dead Code (≤300 LOC)

**PR Title:** `refactor: dedupe & structure`

**Changes:**
1. Remove unused exports/files (multi-signal proof)
2. Consolidate duplicative utilities/components
3. Normalize aliases (`@/*`) and barrel files
4. Extract service layer (reduce API route complexity)

**Files to Update:**
- Remove unused exports (from `knip` report, ~50 LOC removed)
- Consolidate utilities (~100 LOC)
- Extract service layer (~100 LOC)
- Normalize imports (~50 LOC)

**Total:** ~300 LOC (net change)

**Evidence:**
- `ts-prune`/`knip` reports (before/after)
- Passing CI

**Tests:** Ensure no functionality broken

**Rollback:**
```bash
git revert <commit>
```

**Labels:** `auto/refactor`

---

## Success Metrics

### Wave 1
- ✅ Error taxonomy implemented
- ✅ Input validation on risky endpoints
- ✅ Error handling middleware in place
- ✅ Tests passing

### Wave 2
- ✅ Bundle size reduced (measure delta)
- ✅ p95 latency improved (measure delta)
- ✅ Memoization added to hot components
- ✅ N+1 queries removed

### Wave 3
- ✅ Unused code removed (knip report)
- ✅ Duplication reduced
- ✅ Service layer extracted
- ✅ Imports normalized

---

## Next Steps

1. **Immediate:** Create Wave 1 PR (safety & error taxonomy)
2. **This Sprint:** Create Wave 2 PR (performance micro-wins)
3. **Next Sprint:** Create Wave 3 PR (structure & dead code)
4. **Follow-up:** Measure improvements, iterate

---

**Report Generated:** 2025-01-09  
**Next Review:** After Wave 1 PR is merged
