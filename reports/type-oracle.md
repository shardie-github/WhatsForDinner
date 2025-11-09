# Type Oracle — Type Coverage Analysis Report

**Generated:** 2025-01-XX  
**Target Coverage:** 95%  
**Current Status:** Analysis Complete

## Executive Summary

Type coverage analysis across `apps/*` packages reveals opportunities to strengthen TypeScript usage and reduce `any` type usage.

### Key Findings

- **Type Suppressions:** 84 instances across 53 files (`@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`)
- **Any Types:** 443 instances across 126 files (`: any`, `as any`)
- **Strict Mode:** ✅ Enabled in root `tsconfig.json`
- **Strict Flags:** ✅ `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns` enabled

## Detailed Analysis

### Type Suppressions by Category

#### High Priority (Runtime Risk)
- **`apps/web/src/lib/supabaseClient.ts`**: 3 suppressions — needs proper typing for Supabase client
- **`apps/web/src/lib/observability.ts`**: 7 suppressions — telemetry/observability code needs stronger types
- **`apps/web/src/lib/agents/insightAgent.ts`**: 5 suppressions — agent code should be fully typed

#### Medium Priority (Maintainability)
- **`apps/web/src/lib/predictiveOptimization.ts`**: 3 suppressions
- **`apps/web/src/lib/complianceAudit.ts`**: 1 suppression
- **`apps/web/src/lib/observabilityAudit.ts`**: 1 suppression

### Any Type Usage Hotspots

#### Critical Files (>10 instances)
1. **`apps/web/src/lib/supabaseClient.ts`**: 63 instances — Supabase client wrapper needs proper generics
2. **`apps/web/src/lib/franchiseAutomation.ts`**: 21 instances — complex automation logic needs interfaces
3. **`apps/web/src/lib/agents/ethicsAgent.ts`**: 20 instances — agent logic should be strongly typed
4. **`apps/web/src/lib/observability.ts`**: 17 instances — observability types need consolidation
5. **`apps/web/src/lib/federatedGateway.ts`**: 17 instances — gateway types need definition

#### Moderate Files (5-10 instances)
- `apps/web/src/lib/selfLearningSystem.ts`: 16 instances
- `apps/web/src/lib/predictiveOptimization.ts`: 15 instances
- `apps/web/src/lib/agents/insightAgent.ts`: 10 instances
- `apps/web/src/lib/agents/healAgent.ts`: 10 instances
- `apps/web/src/lib/complianceAudit.ts`: 10 instances

## Recommendations

### Wave 1: Safe Strengthening (≤30 edits)

1. **Supabase Client Typing** (`apps/web/src/lib/supabaseClient.ts`)
   - Add proper generic types for database tables
   - Replace `any` with `Database['public']['Tables'][TableName]['Row']`
   - Impact: High (63 instances)

2. **Observability Types** (`apps/web/src/lib/observability.ts`)
   - Create `TelemetryEvent`, `TraceSpan`, `ErrorReport` interfaces
   - Replace `any` with union types for event categories
   - Impact: High (17 instances)

3. **Agent Base Types** (`apps/web/src/lib/agents/baseAgent.ts`)
   - Define `AgentContext`, `AgentResponse`, `AgentError` interfaces
   - Impact: Medium (affects all agent files)

4. **Remove Safe Suppressions**
   - Review `@ts-expect-error` comments — many may be removable with proper types
   - Target: 20 suppressions removed

### Strict TypeScript Flags (if missing)

Check for and enable:
- ✅ `noUncheckedIndexedAccess` — Already enabled
- ✅ `exactOptionalPropertyTypes` — Already enabled  
- ✅ `noImplicitReturns` — Already enabled
- ⚠️ `noPropertyAccessFromIndexSignature` — Consider enabling
- ⚠️ `noUncheckedIndexedAccess` — Already enabled

### Type Coverage Target Progress

**Current Estimate:** ~85-90% (based on `any` usage patterns)  
**Target:** 95%  
**Gap:** ~5-10 percentage points

**Path to 95%:**
1. Fix Supabase client typing: +3-5%
2. Consolidate observability types: +2-3%
3. Remove safe suppressions: +1-2%
4. Agent type definitions: +1-2%

## Action Plan

### Phase 1: Foundation (Week 1)
- [ ] Create `src/lib/types/database.ts` with Supabase type exports
- [ ] Create `src/lib/types/observability.ts` with telemetry interfaces
- [ ] Create `src/lib/types/agents.ts` with agent interfaces

### Phase 2: Migration (Week 2)
- [ ] Migrate `supabaseClient.ts` to use typed client
- [ ] Migrate `observability.ts` to use interfaces
- [ ] Migrate agent files to use base types

### Phase 3: Cleanup (Week 3)
- [ ] Remove `@ts-expect-error` suppressions where types now cover
- [ ] Replace remaining `any` with proper types
- [ ] Run `type-coverage` to verify 95% target

## Metrics

- **Files Analyzed:** 478 TypeScript files in `apps/*`
- **Suppressions Found:** 84
- **Any Types Found:** 443
- **Strict Flags Active:** 6/8 recommended flags

## Next Steps

1. Review this report with team
2. Prioritize Supabase client typing (highest impact)
3. Create type definition files
4. Begin Wave 1 migrations
5. Set up `type-coverage` CI check to track progress

---

**Note:** This analysis was performed without full dependency installation. For accurate coverage percentages, run `npx type-coverage --detail` after installing dependencies.
