# Logging Guide

## Overview

This project uses a unified logging service (`@whats-for-dinner/utils/logger`) for consistent, structured logging across the entire monorepo.

## Quick Start

### Basic Usage

```typescript
import { logger } from '@whats-for-dinner/utils';

// Simple logging
logger.info('User logged in');
logger.warn('Rate limit approaching');
logger.error('Failed to process payment');

// With context
logger.error('API request failed', {
  endpoint: '/api/recipes',
  statusCode: 500,
  userId: 'user-123',
});
```

### Component-Specific Logger

For better organization, create a logger for your component:

```typescript
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('recipe-api');

logger.info('Recipe generated', {
  recipeId: 'recipe-123',
  ingredients: ['chicken', 'rice'],
});
```

## Log Levels

The logger supports four log levels:

- **`debug`** - Detailed information for debugging (only in development)
- **`info`** - General informational messages
- **`warn`** - Warning messages (reported to Sentry in production)
- **`error`** - Error messages (always reported to Sentry)

### Environment-Aware Logging

Log levels are controlled by the `LOG_LEVEL` environment variable:

```bash
# Development (default: debug)
LOG_LEVEL=debug

# Production (default: info)
LOG_LEVEL=info
```

In development, logs are formatted for readability. In production, logs are structured JSON for log aggregation systems.

## Best Practices

### ✅ DO

```typescript
// Use structured context
logger.error('Payment processing failed', {
  orderId: 'order-123',
  amount: 29.99,
  paymentMethod: 'stripe',
  error: error.message,
});

// Use appropriate log levels
logger.debug('Cache hit', { key: 'recipe-123' });
logger.info('User signed up', { userId: 'user-123' });
logger.warn('API rate limit approaching', { remaining: 10 });
logger.error('Database connection failed', { error });
```

### ❌ DON'T

```typescript
// Don't use console.log
console.log('User logged in'); // ❌

// Don't log sensitive data (it will be redacted, but better to avoid)
logger.info('User data', {
  password: 'secret123', // ❌ Will be redacted, but don't include it
  email: 'user@example.com', // ⚠️ Will be redacted
});

// Don't log without context
logger.error('Error occurred'); // ❌ Add context!
logger.error('Error occurred', { error, userId, endpoint }); // ✅
```

## Sensitive Data Redaction

The logger automatically redacts sensitive fields:

- `password`, `token`, `secret`, `key`
- `authorization`, `cookie`
- `apiKey`, `api_key`
- `accessToken`, `refreshToken`
- `creditCard`, `ssn`
- `email` (optional)

Fields matching these patterns are replaced with `[REDACTED]` in logs.

## Sentry Integration

Errors and warnings are automatically reported to Sentry:

- **Errors** (`logger.error`) - Always reported
- **Warnings** (`logger.warn`) - Reported in production only
- **Info/Debug** - Not reported

The logger includes context and tags for better error tracking:

```typescript
logger.error('API request failed', {
  endpoint: '/api/recipes',
  userId: 'user-123',
});
// Sentry will receive: error message + context + tags (source, component)
```

## Migration from console.log

### Before

```typescript
console.log('User logged in');
console.error('Failed to fetch recipes:', error);
console.warn('Rate limit approaching');
```

### After

```typescript
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('my-component');

logger.info('User logged in');
logger.error('Failed to fetch recipes', { error });
logger.warn('Rate limit approaching');
```

### Automated Migration

Use the provided script to identify console.log usage:

```bash
# Check for console.log usage
node scripts/fix-console-logs.mjs --check

# See suggested fixes (dry-run)
node scripts/fix-console-logs.mjs --fix
```

## API Reference

### `logger`

Default logger instance.

```typescript
logger.debug(message: string, context?: LogContext, source?: string, component?: string): void;
logger.info(message: string, context?: LogContext, source?: string, component?: string): void;
logger.warn(message: string, context?: LogContext, source?: string, component?: string): void;
logger.error(message: string, context?: LogContext, source?: string, component?: string): void;
```

### `createLogger(source?: string)`

Create a new logger instance with a source identifier.

```typescript
const apiLogger = createLogger('api');
apiLogger.info('Request received');
```

### `createComponentLogger(component: string, source?: string)`

Create a logger for a specific component.

```typescript
const logger = createComponentLogger('recipe-service', 'api');
logger.info('Recipe generated');
```

## Examples

### API Route

```typescript
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('recipes-api');

export async function GET(request: Request) {
  try {
    logger.info('Fetching recipes', { userId: request.userId });
    
    const recipes = await fetchRecipes();
    
    logger.info('Recipes fetched', { count: recipes.length });
    return Response.json({ recipes });
  } catch (error) {
    logger.error('Failed to fetch recipes', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return Response.json({ error: 'Failed to fetch recipes' }, { status: 500 });
  }
}
```

### React Component

```typescript
'use client';

import { createComponentLogger } from '@whats-for-dinner/utils';
import { useEffect } from 'react';

const logger = createComponentLogger('RecipeCard');

export function RecipeCard({ recipeId }: { recipeId: string }) {
  useEffect(() => {
    logger.debug('RecipeCard mounted', { recipeId });
    
    return () => {
      logger.debug('RecipeCard unmounted', { recipeId });
    };
  }, [recipeId]);
  
  // ...
}
```

### Error Boundary

```typescript
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('error-boundary');

export class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }
}
```

## Troubleshooting

### Logs not appearing

1. Check `LOG_LEVEL` environment variable
2. Verify logger is imported correctly
3. Check browser console (for client-side logs)

### Sensitive data in logs

The logger automatically redacts sensitive fields. If you see sensitive data:

1. Check field names match redaction patterns
2. Manually exclude sensitive data from context
3. Report issue if redaction isn't working

### Sentry not receiving errors

1. Verify Sentry is configured (`@sentry/nextjs`)
2. Check Sentry DSN is set in environment
3. Verify logger can import Sentry (check for errors)

## Related Documentation

- [Error Handling Guide](./ERROR_HANDLING.md)
- [Environment Variables](../.env.example)
- [Sentry Configuration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
