# Error Prophet — Forecast Hotspots Analysis

**Generated:** 2025-01-XX  
**Scope:** Error patterns across `apps/web/src/lib` and API routes

## Executive Summary

Analysis of error handling patterns reveals existing error taxonomy with opportunities to add guards and narrow input validation in high-risk modules.

### Key Findings

- ✅ **Error Taxonomy:** `apps/web/src/lib/errors.ts` provides comprehensive error classes
- 📊 **Error Patterns:** 2,061 error-related patterns across 100 files
- 🔥 **Hotspots Identified:** 10+ modules with high error density
- ⚠️ **Guards Needed:** Input validation and error boundaries in critical paths

## Error Hotspot Ranking

### Tier 1: Critical Hotspots (>50 error patterns)

1. **`apps/web/src/lib/errors.ts`** — 101 patterns
   - **Status:** ✅ Core error taxonomy exists
   - **Action:** Enhance with additional error types if needed
   - **Risk:** Low (well-structured)

2. **`apps/web/src/lib/workflowManager.ts`** — 99 patterns
   - **Status:** ⚠️ High error density
   - **Action:** Add input validation guards
   - **Risk:** High (workflow orchestration)

3. **`apps/web/src/lib/marketingAutomation.ts`** — 98 patterns
   - **Status:** ⚠️ High error density
   - **Action:** Add validation for marketing data
   - **Risk:** Medium (external integrations)

4. **`apps/web/src/lib/logger.ts`** — 54 patterns
   - **Status:** ✅ Logging infrastructure
   - **Action:** Ensure error logging doesn't throw
   - **Risk:** Low (logging should be resilient)

### Tier 2: High-Risk Modules (20-50 patterns)

5. **`apps/web/src/lib/observability.ts`** — 95 patterns
   - **Status:** ⚠️ Observability code should be resilient
   - **Action:** Add error boundaries, fail gracefully
   - **Risk:** High (if observability fails, debugging is harder)

6. **`apps/web/src/lib/growthAnalytics.ts`** — 80 patterns
   - **Status:** ⚠️ Analytics should not break user flows
   - **Action:** Wrap in try-catch, use fire-and-forget
   - **Risk:** Medium (should not affect core functionality)

7. **`apps/web/src/lib/agents/healAgent.ts`** — 44 patterns
   - **Status:** ⚠️ Self-healing agent needs robust error handling
   - **Action:** Add retry logic, circuit breakers
   - **Risk:** High (autonomous systems)

8. **`apps/web/src/lib/autonomousOrchestrator.ts`** — 36 patterns
   - **Status:** ⚠️ Orchestration needs error recovery
   - **Action:** Add state machine error handling
   - **Risk:** High (system coordination)

9. **`apps/web/src/lib/feedbackSystem.ts`** — 63 patterns
   - **Status:** ⚠️ User feedback should be resilient
   - **Action:** Add validation, queue for retry
   - **Risk:** Medium (user experience)

10. **`apps/web/src/lib/ugcGrowth.ts`** — 48 patterns
    - **Status:** ⚠️ User-generated content needs validation
    - **Action:** Add content validation, sanitization
    - **Risk:** Medium (security and quality)

## Existing Error Taxonomy

### ✅ Well-Defined Error Classes

The `apps/web/src/lib/errors.ts` file provides:
- `ErrorCode` enum with semantic codes
- `AppError` base class with status codes
- Specialized error classes (ValidationError, AuthenticationError, etc.)
- User-friendly error messages
- Error handling utilities

### Recommended Enhancements

#### 1. Add Input Validation Guards

Create `apps/web/src/lib/validation-guards.ts`:

```typescript
import { z } from 'zod';
import { ValidationError } from './errors';

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        `Invalid input${context ? ` in ${context}` : ''}`,
        { errors: error.errors }
      );
    }
    throw error;
  }
}
```

#### 2. Add Error Boundaries for Critical Modules

```typescript
// apps/web/src/lib/error-boundaries.ts
export function withErrorBoundary<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorHandler?: (error: unknown) => void
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (errorHandler) {
        errorHandler(error);
      }
      // Log and rethrow or return safe default
      throw error;
    }
  }) as T;
}
```

#### 3. Narrow Input Validation for Hotspots

Focus on:
- `workflowManager.ts` — Validate workflow definitions
- `marketingAutomation.ts` — Validate campaign data
- `observability.ts` — Validate telemetry data
- `agents/healAgent.ts` — Validate agent actions

## Action Plan

### Wave 1: Add Guards & Error Taxonomy (Week 1)

1. **Enhance Error Taxonomy**
   - [x] Review existing `errors.ts` — ✅ Good foundation
   - [ ] Add domain-specific error codes if needed
   - [ ] Add error recovery strategies

2. **Create Validation Guards**
   - [ ] Create `validation-guards.ts` with Zod integration
   - [ ] Add input validation to `workflowManager.ts`
   - [ ] Add input validation to `marketingAutomation.ts`

3. **Add Error Boundaries**
   - [ ] Create `error-boundaries.ts` utility
   - [ ] Wrap `observability.ts` functions
   - [ ] Wrap `agents/healAgent.ts` functions

4. **Narrow Input Validation**
   - [ ] Add Zod schemas for workflow definitions
   - [ ] Add Zod schemas for marketing campaigns
   - [ ] Add Zod schemas for telemetry events

## Files Requiring Updates

### High Priority
1. `apps/web/src/lib/validation-guards.ts` — **NEW** — Create validation utilities
2. `apps/web/src/lib/workflowManager.ts` — Add input validation
3. `apps/web/src/lib/marketingAutomation.ts` — Add input validation
4. `apps/web/src/lib/observability.ts` — Add error boundaries

### Medium Priority
- `apps/web/src/lib/agents/healAgent.ts` — Add retry logic
- `apps/web/src/lib/autonomousOrchestrator.ts` — Add state machine error handling
- `apps/web/src/lib/growthAnalytics.ts` — Wrap in try-catch

## Error Taxonomy Additions (If Needed)

Consider adding:
- `WORKFLOW_ERROR` — For workflow execution failures
- `AGENT_ERROR` — For autonomous agent failures
- `OBSERVABILITY_ERROR` — For telemetry failures (should be non-fatal)
- `VALIDATION_ERROR` — ✅ Already exists

## Metrics

- **Error Patterns Found:** 2,061 across 100 files
- **Hotspot Files:** 10+ files with >20 patterns
- **Error Taxonomy:** ✅ Comprehensive (exists)
- **Guards Needed:** 4 critical modules
- **Validation Needed:** 3 high-risk modules

## Next Steps

1. ✅ Complete error hotspot analysis
2. Create `validation-guards.ts` utility
3. Add input validation to top 3 hotspots
4. Add error boundaries to observability code
5. Test error handling in critical paths

---

**Note:** Error handling in observability and analytics should be non-fatal — failures should not break user flows.
