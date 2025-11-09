# Error Boundaries Usage Guide

**Created:** 2025-01-XX  
**Purpose:** Guide for using error boundaries to prevent errors from breaking user flows

## Overview

Error boundaries wrap functions to catch errors, log them, and optionally provide fallback behavior. Critical for observability, analytics, and non-critical operations.

## Basic Usage

### Wrap Async Functions

```typescript
import { withErrorBoundary } from '@/lib/error-boundaries';

// Wrap function with error boundary
const safeFetch = withErrorBoundary(
  async (url: string) => {
    const response = await fetch(url);
    return response.json();
  },
  (error, url) => {
    // Error handler - called when error occurs
    logger.error('Fetch failed', { error, url });
  },
  null // fallback value (returned on error)
);

// Use safely - errors won't propagate
const data = await safeFetch('https://api.example.com/data');
// data is either the result or null (fallback)
```

### Wrap Synchronous Functions

```typescript
import { withErrorBoundarySync } from '@/lib/error-boundaries';

const safeParse = withErrorBoundarySync(
  (json: string) => JSON.parse(json),
  (error) => console.error('Parse failed:', error),
  {} // fallback: return empty object
);

const data = safeParse(maybeInvalidJson);
```

## Fire-and-Forget (Non-Critical Operations)

Use for operations that should never break user flows:

```typescript
import { fireAndForget } from '@/lib/error-boundaries';

// Analytics tracking - failures shouldn't break user flow
fireAndForget(
  async () => {
    await trackEvent('user_action', { userId, action });
  },
  (error) => {
    // Log but don't throw
    logger.error('Analytics tracking failed', { error });
  }
);
```

## Retry Logic

For operations that might fail due to transient issues:

```typescript
import { withRetry } from '@/lib/error-boundaries';

const fetchWithRetry = withRetry(
  async () => {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },
  {
    maxAttempts: 3,
    baseDelay: 1000, // Start with 1 second delay
    maxDelay: 10000, // Max 10 seconds delay
    shouldRetry: (error) => {
      // Only retry on network errors
      return error instanceof Error && 
        error.message.includes('network');
    },
  }
);

const data = await fetchWithRetry();
```

## Circuit Breaker

For external service calls that might be down:

```typescript
import { CircuitBreaker } from '@/lib/error-boundaries';

const breaker = new CircuitBreaker({
  failureThreshold: 5, // Open after 5 failures
  resetTimeout: 60000, // Reset after 1 minute
});

const callExternalAPI = async () => {
  return await breaker.execute(async () => {
    const response = await fetch('https://external-api.com');
    return response.json();
  });
};

// Use - circuit breaker prevents cascading failures
try {
  const data = await callExternalAPI();
} catch (error) {
  if (error.message === 'Circuit breaker is open') {
    // Service is down, use fallback
    return getCachedData();
  }
  throw error;
}
```

## Migration Guide

### Before (Observability)

```typescript
async function trackEvent(event: string, data: any) {
  try {
    await analytics.track(event, data);
  } catch (error) {
    console.error('Analytics failed:', error);
    // Error might still propagate
  }
}
```

### After (With Error Boundary)

```typescript
import { fireAndForget } from '@/lib/error-boundaries';

// Errors are caught and logged, never propagate
const trackEvent = fireAndForget(
  async (event: string, data: any) => {
    await analytics.track(event, data);
  },
  (error) => logger.error('Analytics failed', { error })
);

// Use - safe to call anywhere
trackEvent('user_action', { userId });
```

## Best Practices

1. **Use fire-and-forget for observability**
   - Analytics tracking
   - Error logging
   - Performance metrics
   - Telemetry

2. **Use error boundaries for critical paths**
   - API route handlers
   - Database operations
   - External service calls

3. **Use retry for transient failures**
   - Network requests
   - Database connections
   - External API calls

4. **Use circuit breaker for external services**
   - Third-party APIs
   - Microservices
   - External dependencies

## Examples

See implementations in:
- `apps/web/src/lib/observability.ts` - Observability wrapped with error boundaries
- `apps/web/src/lib/workflowManager.ts` - Workflow operations wrapped
- `apps/web/src/lib/agents/healAgent.ts` - Agent with retry logic
- `apps/web/src/lib/marketingAutomation.ts` - Email tracking with fire-and-forget

## When to Use Each Pattern

| Pattern | Use Case | Example |
|---------|----------|---------|
| `withErrorBoundary` | Critical operations that need fallback | API handlers, database ops |
| `fireAndForget` | Non-critical operations | Analytics, logging |
| `withRetry` | Transient failures expected | Network requests, external APIs |
| `CircuitBreaker` | External services that might be down | Third-party APIs, microservices |
