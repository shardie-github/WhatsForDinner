# Guardrails Usage Guide

This guide explains how to use the guardrail utilities for structured logging, error handling, retries, and feature flags.

---

## Structured Logging

### Basic Usage

```typescript
import { logger } from '@whats-for-dinner/utils/guardrails';

// Info log
logger.info({ userId: '123', action: 'meal_plan_created' }, 'Meal plan created');

// Error log (automatically includes error details)
logger.error({ error, userId: '123' }, 'Failed to generate recipes');

// Warning log
logger.warn({ userId: '123', reason: 'rate_limit' }, 'Rate limit approaching');

// Debug log (only in development)
logger.debug({ query: 'SELECT * FROM recipes' }, 'Executing query');
```

### Child Loggers (Persistent Context)

```typescript
// Create child logger with persistent context
const requestLogger = logger.child({ requestId: 'req-123', userId: 'user-456' });

requestLogger.info({ action: 'start' }, 'Request started');
requestLogger.info({ action: 'complete' }, 'Request completed');
// Both logs include requestId and userId automatically
```

### Structured Events (for Analytics)

```typescript
// Log structured event
logger.event('meal_plan_created', {
  userId: '123',
  mealPlanId: 'mp-456',
  recipeCount: 3,
});
```

### Performance Metrics

```typescript
const startTime = Date.now();
// ... do work ...
const duration = Date.now() - startTime;

logger.metric('recipe_generation_duration', duration, {
  userId: '123',
  model: 'gpt-4',
});
```

---

## Error Handling

### Using Error Classes

```typescript
import {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ExternalApiError,
  handleError,
} from '@whats-for-dinner/utils/guardrails';

// Validation error (400)
if (!ingredients || ingredients.length === 0) {
  throw new ValidationError('Ingredients are required', { field: 'ingredients' });
}

// Authentication error (401)
if (!userId) {
  throw new AuthenticationError('Authentication required');
}

// Not found error (404)
const recipe = await getRecipe(recipeId);
if (!recipe) {
  throw new NotFoundError('Recipe', { recipeId });
}

// External API error (502)
try {
  await openaiApi.generateRecipes(prompt);
} catch (error) {
  throw new ExternalApiError('OpenAI', 'Failed to generate recipes', { error });
}
```

### Error Handler in API Routes

```typescript
import { NextResponse } from 'next/server';
import { handleError } from '@whats-for-dinner/utils/guardrails';

export async function POST(req: NextRequest) {
  try {
    // ... your code ...
  } catch (error) {
    const { statusCode, body } = handleError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
```

### Custom Error Context

```typescript
throw new AppError(
  ErrorCode.DATABASE_ERROR,
  'Failed to save meal plan',
  {
    userId: '123',
    mealPlanId: 'mp-456',
    operation: 'create',
  }
);
```

---

## Circuit Breaker & Retries

### Circuit Breaker for External APIs

```typescript
import { CircuitBreaker } from '@whats-for-dinner/utils/guardrails';

// Create circuit breaker for OpenAI
const openaiBreaker = new CircuitBreaker('openai', {
  failureThreshold: 5,      // Open after 5 failures
  resetTimeout: 60000,      // Try again after 1 minute
  requestTimeout: 30000,    // 30 second timeout per request
});

// Use circuit breaker
try {
  const recipes = await openaiBreaker.execute(async () => {
    return await openaiApi.generateRecipes(prompt);
  });
} catch (error) {
  if (error instanceof CircuitBreakerOpenError) {
    // Circuit is open - use fallback
    return getCachedRecipes();
  }
  throw error;
}
```

### Retry with Exponential Backoff

```typescript
import { retryWithBackoff } from '@whats-for-dinner/utils/guardrails';

// Retry with exponential backoff
const result = await retryWithBackoff(
  async () => {
    return await stripeApi.createPayment(paymentData);
  },
  {
    maxRetries: 3,
    initialDelay: 1000,     // Start with 1 second
    maxDelay: 10000,        // Max 10 seconds
    multiplier: 2,           // Double delay each retry
    shouldRetry: (error) => {
      // Only retry on network errors, not validation errors
      return error instanceof NetworkError;
    },
  }
);
```

### Combined: Circuit Breaker + Retry

```typescript
const breaker = new CircuitBreaker('stripe', {
  failureThreshold: 5,
  resetTimeout: 60000,
});

const result = await retryWithBackoff(
  async () => {
    return await breaker.execute(async () => {
      return await stripeApi.createPayment(paymentData);
    });
  },
  {
    maxRetries: 3,
    initialDelay: 1000,
  }
);
```

---

## Feature Flags

### Initialize Feature Flags

```typescript
// In your app initialization (e.g., _app.tsx or middleware)
import { initializeFeatureFlags } from '@whats-for-dinner/utils/guardrails';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

initializeFeatureFlags({ supabase });
```

### Check Feature Flags

```typescript
import { getFeatureFlag } from '@whats-for-dinner/utils/guardrails';

// Check if feature is enabled for user
const enabled = await getFeatureFlag('new_meal_planner', userId);

if (enabled) {
  // Show new feature
  return <NewMealPlanner />;
} else {
  // Show old feature
  return <OldMealPlanner />;
}
```

### Set Feature Flags (Admin)

```typescript
import { setFeatureFlag } from '@whats-for-dinner/utils/guardrails';

// Enable feature for a user
await setFeatureFlag('new_meal_planner', true, userId);

// Disable feature for a user
await setFeatureFlag('new_meal_planner', false, userId);
```

### Environment Variable Override

```bash
# Enable feature for all users (development/testing)
FEATURE_NEW_MEAL_PLANNER=true

# Disable feature globally
EXPERIMENTS_KILL_SWITCH=true
```

### Feature Flag in API Route

```typescript
import { getFeatureFlag } from '@whats-for-dinner/utils/guardrails';

export async function POST(req: NextRequest) {
  const { userId } = await getTenantContext(req);
  
  const useNewApi = await getFeatureFlag('new_recipe_api', userId);
  
  if (useNewApi) {
    return await newRecipeApi(req);
  } else {
    return await oldRecipeApi(req);
  }
}
```

---

## Complete Example: API Route with All Guardrails

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@whats-for-dinner/utils/guardrails/logger';
import { handleError, ValidationError, ExternalApiError } from '@whats-for-dinner/utils/guardrails/errors';
import { CircuitBreaker, retryWithBackoff } from '@whats-for-dinner/utils/guardrails/circuit-breaker';
import { getFeatureFlag } from '@whats-for-dinner/utils/guardrails/feature-flags';

// Create circuit breaker for OpenAI (singleton)
const openaiBreaker = new CircuitBreaker('openai', {
  failureThreshold: 5,
  resetTimeout: 60000,
});

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const requestLogger = logger.child({ requestId });

  try {
    requestLogger.info({ action: 'start' }, 'Recipe generation request');

    // 1. Authentication
    const { userId } = await getTenantContext(req);
    if (!userId) {
      throw new AuthenticationError();
    }

    // 2. Feature flag check
    const useNewApi = await getFeatureFlag('new_recipe_api', userId);
    requestLogger.debug({ useNewApi }, 'Feature flag checked');

    // 3. Validation
    const body = await req.json();
    if (!body.ingredients || body.ingredients.length === 0) {
      throw new ValidationError('Ingredients are required', { field: 'ingredients' });
    }

    // 4. Execute with circuit breaker and retry
    const startTime = Date.now();
    const recipes = await retryWithBackoff(
      async () => {
        return await openaiBreaker.execute(async () => {
          return await openaiApi.generateRecipes(body.ingredients);
        });
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
      }
    );
    const duration = Date.now() - startTime;

    // 5. Log success
    requestLogger.metric('recipe_generation_duration', duration, { userId });
    requestLogger.event('recipes_generated', { userId, recipeCount: recipes.length });

    return NextResponse.json({ recipes });
  } catch (error) {
    requestLogger.error({ error, requestId }, 'Recipe generation failed');
    const { statusCode, body } = handleError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
```

---

## Best Practices

1. **Always use structured logging**: Include context (userId, requestId) in logs
2. **Use typed errors**: Use error classes instead of generic Error
3. **Circuit breakers for external APIs**: Protect against cascading failures
4. **Retry with exponential backoff**: Don't hammer failing services
5. **Feature flags for gradual rollouts**: Test features with small user groups first
6. **Log performance metrics**: Track slow operations
7. **Handle errors gracefully**: Always return user-friendly error messages

---

## References

- [Risk Register](./RISK_REGISTER.md) - Risk assessment
- [Security Checklist](./SECURITY_CHECKLIST.md) - Security controls
- [Operations Runbook](./OPERATIONS_RUNBOOK.md) - Operational procedures
