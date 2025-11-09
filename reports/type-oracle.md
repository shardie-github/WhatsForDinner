# Type Oracle — Type Coverage Report

**Generated:** 2025-01-09  
**Target Coverage:** 95%  
**Current Coverage:** 93.85% (252,029 / 268,526)  
**Gap:** 1.15% (3,497 untyped locations)

## Executive Summary

The codebase has strong type coverage at 93.85%, but falls short of the 95% target. Most gaps are in:
- Dynamic property access patterns (`any` assertions)
- Legacy code paths with `@ts-ignore`/`@ts-expect-error`
- Third-party integrations requiring type assertions

## Findings

### Type Safety Violations

**Apps (`apps/*`):**
- 141 instances of `any`, `@ts-ignore`, `@ts-expect-error`, or `as any`
- Top offenders:
  - `apps/web/src/lib/observability.ts`: 9 instances
  - `apps/web/src/components/GDPRConsent.tsx`: 3 instances
  - `apps/web/src/lib/agents/insightAgent.ts`: 6 instances
  - `apps/web/src/app/terms-of-service/page.tsx`: 7 instances

**Packages (`packages/*`):**
- 70 instances of type safety violations
- Top offenders:
  - `packages/utils/src/guardian/inspector.ts`: 6 instances
  - `packages/utils/src/guardian/core.ts`: 5 instances
  - `packages/server/src/db/schema.ts`: 10 instances
  - `packages/server/src/pricing/engine.ts`: 5 instances

### TypeScript Configuration

✅ **Strengths:**
- `strict: true` enabled
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `exactOptionalPropertyTypes: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedIndexedAccess: true`

⚠️ **Missing Flags (consider adding):**
- `noImplicitOverride: true` (if using class inheritance)
- `noPropertyAccessFromIndexSignature: true` (complements `noUncheckedIndexedAccess`)

## Recommendations

### Wave 1: Safe Typing Improvements (≤30 edits)

1. **Replace `any` with proper types** in:
   - `apps/web/src/lib/observability.ts` - Add proper event type definitions
   - `apps/web/src/components/GDPRConsent.tsx` - Type consent payloads
   - `packages/server/src/db/schema.ts` - Strengthen database schema types

2. **Remove `@ts-ignore`/`@ts-expect-error`** where possible:
   - Audit each instance to determine if proper typing is feasible
   - Replace with type guards or proper type definitions

3. **Add type definitions for dynamic access:**
   - Create utility types for common patterns (e.g., `Record<string, unknown>`)
   - Use branded types for IDs and keys

### Priority Files (Top 10)

1. `packages/server/src/db/schema.ts` (10 violations)
2. `apps/web/src/lib/observability.ts` (9 violations)
3. `apps/web/src/app/terms-of-service/page.tsx` (7 violations)
4. `apps/web/src/lib/agents/insightAgent.ts` (6 violations)
5. `packages/utils/src/guardian/inspector.ts` (6 violations)
6. `apps/web/src/lib/management/logger.ts` (4 violations)
7. `apps/web/src/lib/engagement/analytics.ts` (4 violations)
8. `packages/utils/src/guardian/core.ts` (5 violations)
9. `packages/server/src/pricing/engine.ts` (5 violations)
10. `apps/web/src/app/api/onboarding/checklist/__tests__/route.test.ts` (9 violations)

## Action Plan

### Phase 1: Foundation (Week 1)
- [ ] Add missing strict flags to root `tsconfig.json`
- [ ] Create shared type utilities for common patterns
- [ ] Fix top 5 files with most violations

### Phase 2: Systematic Cleanup (Week 2-3)
- [ ] Replace `any` in `apps/web/src/lib/observability.ts`
- [ ] Strengthen `packages/server/src/db/schema.ts` types
- [ ] Fix remaining high-impact files

### Phase 3: Validation (Week 4)
- [ ] Re-run type-coverage
- [ ] Verify coverage ≥ 95%
- [ ] Add CI check to prevent regression

## Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Type Coverage | 93.85% | 95% | ⚠️ Gap: 1.15% |
| `any` Usage | 211 instances | <50 | ❌ High |
| `@ts-ignore` | ~30 instances | 0 | ⚠️ Medium |
| Strict Flags | 7/9 enabled | 9/9 | ⚠️ Good |

## Next Steps

1. Review and approve Wave 1 changes
2. Run `pnpm typecheck` after changes
3. Monitor type-coverage trend over next 2 weeks
4. Consider adding `type-coverage` to CI pipeline
