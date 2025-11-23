# Logging Migration Guide

**Purpose:** Migrate from `console.log` statements to unified logger

---

## Why Migrate?

1. **Structured Logging:** Consistent format for production debugging
2. **Sensitive Data Protection:** Automatic redaction of passwords, tokens, etc.
3. **Sentry Integration:** Automatic error reporting to Sentry
4. **Environment-Aware:** Different log levels for dev vs production
5. **Correlation IDs:** Better request tracing

---

## Quick Start

### Before (❌ Bad)
```typescript
console.log('User logged in', { userId: user.id });
console.error('Failed to fetch data:', error);
console.warn('Rate limit approaching');
```

### After (✅ Good)
```typescript
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('auth');

logger.info('User logged in', { userId: user.id });
logger.error('Failed to fetch data', { error });
logger.warn('Rate limit approaching');
```

---

## Migration Steps

### Step 1: Import Logger

```typescript
import { createComponentLogger } from '@whats-for-dinner/utils';
```

### Step 2: Create Logger Instance

```typescript
// For a specific component
const logger = createComponentLogger('component-name');

// Or use default logger
import { logger } from '@whats-for-dinner/utils';
```

### Step 3: Replace console.log Statements

#### Simple Logging
```typescript
// Before
console.log('Processing request');

// After
logger.info('Processing request');
```

#### Logging with Context
```typescript
// Before
console.log('User action', { userId, action: 'click' });

// After
logger.info('User action', { userId, action: 'click' });
```

#### Error Logging
```typescript
// Before
console.error('API error:', error);

// After
logger.error('API error', { 
  error: error instanceof Error ? error.message : String(error),
  stack: error instanceof Error ? error.stack : undefined,
});
```

#### Warning Logging
```typescript
// Before
console.warn('Deprecated API used');

// After
logger.warn('Deprecated API used');
```

#### Debug Logging
```typescript
// Before
console.log('Debug info:', data);

// After
logger.debug('Debug info', { data });
```

---

## Log Levels

### `logger.debug()`
- **Use for:** Detailed debugging information
- **Visible in:** Development only
- **Example:** Function entry/exit, variable values

### `logger.info()`
- **Use for:** General informational messages
- **Visible in:** Development and production
- **Example:** User actions, successful operations

### `logger.warn()`
- **Use for:** Warning conditions
- **Visible in:** All environments
- **Example:** Deprecated APIs, rate limits approaching

### `logger.error()`
- **Use for:** Error conditions
- **Visible in:** All environments
- **Sentry:** Automatically reported
- **Example:** API failures, exceptions

---

## Sensitive Data Redaction

The logger automatically redacts sensitive fields:

```typescript
// Sensitive data is automatically redacted
logger.info('User login', {
  email: 'user@example.com',
  password: 'secret123', // Will be redacted
  token: 'abc123', // Will be redacted
  apiKey: 'key123', // Will be redacted
});

// Output: [REDACTED] for sensitive fields
```

**Redacted Fields:**
- `password`, `token`, `secret`, `key`
- `authorization`, `cookie`, `apiKey`
- `accessToken`, `refreshToken`
- `creditCard`, `ssn`

---

## Component-Specific Loggers

Use component-specific loggers for better organization:

```typescript
// In auth service
const authLogger = createComponentLogger('auth');

// In API routes
const apiLogger = createComponentLogger('api');

// In database layer
const dbLogger = createComponentLogger('database');
```

---

## Error Handling with Logger

```typescript
import { createComponentLogger } from '@whats-for-dinner/utils';
import { handleApiError } from '@whats-for-dinner/utils';

const logger = createComponentLogger('api-route');

export async function POST(req: Request) {
  try {
    // Your code
  } catch (error) {
    // Logger is automatically used by handleApiError
    return handleApiError(error, {
      component: 'api-route',
      context: { endpoint: '/api/example' },
    });
  }
}
```

---

## Migration Checklist

- [ ] Identify all `console.log` statements in file
- [ ] Import logger: `import { createComponentLogger } from '@whats-for-dinner/utils'`
- [ ] Create logger instance: `const logger = createComponentLogger('component-name')`
- [ ] Replace `console.log` → `logger.info`
- [ ] Replace `console.error` → `logger.error`
- [ ] Replace `console.warn` → `logger.warn`
- [ ] Replace `console.debug` → `logger.debug`
- [ ] Add context objects for structured logging
- [ ] Test logging in development
- [ ] Verify sensitive data redaction

---

## Common Patterns

### API Route Handler
```typescript
import { createComponentLogger } from '@whats-for-dinner/utils';
import { handleApiError } from '@whats-for-dinner/utils';

const logger = createComponentLogger('api-dinner');

export async function POST(req: Request) {
  try {
    logger.info('Processing dinner request');
    
    const data = await req.json();
    logger.debug('Request data', { ingredientCount: data.ingredients?.length });
    
    // Process request
    
    logger.info('Dinner request completed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, {
      component: 'api-dinner',
      context: { endpoint: '/api/dinner' },
    });
  }
}
```

### React Component
```typescript
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('RecipeCard');

export function RecipeCard({ recipe }: Props) {
  useEffect(() => {
    logger.debug('RecipeCard mounted', { recipeId: recipe.id });
  }, [recipe.id]);
  
  const handleClick = () => {
    logger.info('Recipe clicked', { recipeId: recipe.id });
    // Handle click
  };
  
  return <div onClick={handleClick}>...</div>;
}
```

### Service Function
```typescript
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('recipe-service');

export async function fetchRecipe(id: string) {
  logger.debug('Fetching recipe', { recipeId: id });
  
  try {
    const recipe = await api.get(`/recipes/${id}`);
    logger.info('Recipe fetched successfully', { recipeId: id });
    return recipe;
  } catch (error) {
    logger.error('Failed to fetch recipe', {
      recipeId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
```

---

## Testing

After migration, verify logging works:

1. **Development:** Check console output
2. **Production:** Check structured JSON logs
3. **Sentry:** Verify errors are reported
4. **Redaction:** Verify sensitive data is redacted

---

## Need Help?

- See `packages/utils/src/logger.ts` for full API documentation
- Check existing migrations in `apps/web/src/app/api/dinner/route.ts`
- Ask in #engineering Slack channel

---

**Last Updated:** 2025-01-27
