# Validation Guards Usage Guide

**Created:** 2025-01-XX  
**Purpose:** Guide for using validation guards in the codebase

## Overview

Validation guards provide type-safe input validation using Zod schemas with automatic error conversion to our error taxonomy.

## Basic Usage

### Simple Validation

```typescript
import { validateInput, CommonSchemas } from '@/lib/validation-guards';
import { z } from 'zod';

// Define schema
const UserSchema = z.object({
  email: CommonSchemas.email,
  name: CommonSchemas.nonEmptyString.max(100),
  age: z.number().int().positive().max(120),
});

// Validate and use
try {
  const user = validateInput(UserSchema, req.body, 'user creation');
  // user is typed as { email: string; name: string; age: number }
  await createUser(user);
} catch (error) {
  if (error instanceof ValidationError) {
    return res.status(400).json({ errors: error.details });
  }
  throw error;
}
```

### Safe Validation (Non-Throwing)

```typescript
import { validateInputSafe } from '@/lib/validation-guards';

const result = validateInputSafe(UserSchema, req.body);

if (!result.success) {
  return res.status(400).json({ 
    errors: result.error.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message,
    }))
  });
}

const user = result.data; // Typed correctly
await createUser(user);
```

### Optional Input

```typescript
import { validateOptionalInput } from '@/lib/validation-guards';

// Returns undefined if input is null/undefined, otherwise validates
const user = validateOptionalInput(UserSchema, req.body?.user, 'user data');
if (user) {
  await processUser(user);
}
```

## Common Schemas

Use pre-defined schemas from `CommonSchemas`:

```typescript
import { CommonSchemas } from '@/lib/validation-guards';

const MySchema = z.object({
  id: CommonSchemas.uuid,
  email: CommonSchemas.email,
  name: CommonSchemas.nonEmptyString,
  page: CommonSchemas.pagination, // { page: number, limit: number }
});
```

Available common schemas:
- `uuid` - UUID v4 validation
- `email` - Email format validation
- `nonEmptyString` - String with min length 1
- `positiveInt` - Positive integer
- `nonNegativeInt` - Non-negative integer
- `isoDate` - ISO 8601 date string
- `url` - URL format validation
- `pagination` - Pagination parameters

## Migration Guide

### Before

```typescript
async function createWorkflow(name: string, steps: any[]) {
  if (!name || name.length > 200) {
    throw new Error('Invalid name');
  }
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error('Invalid steps');
  }
  // ... rest of function
}
```

### After

```typescript
import { validateInput } from '@/lib/validation-guards';
import { CreateWorkflowSchema } from '@/lib/workflow-schemas';

async function createWorkflow(name: string, steps: any[]) {
  const validated = validateInput(
    CreateWorkflowSchema,
    { name, steps },
    'workflow creation'
  );
  // Use validated.name, validated.steps (properly typed)
  // ... rest of function
}
```

## Best Practices

1. **Always validate at API boundaries**
   - Route handlers
   - Public function entry points
   - External API integrations

2. **Use descriptive context strings**
   ```typescript
   validateInput(Schema, data, 'user registration') // Good
   validateInput(Schema, data, 'input') // Less helpful
   ```

3. **Create domain-specific schemas**
   - Put schemas in `*-schemas.ts` files
   - Export types for reuse
   - Example: `workflow-schemas.ts`, `marketing-schemas.ts`

4. **Handle validation errors gracefully**
   ```typescript
   try {
     const data = validateInput(Schema, input);
   } catch (error) {
     if (error instanceof ValidationError) {
       // Return user-friendly error
       return { error: error.message, details: error.details };
     }
     throw error; // Re-throw unexpected errors
   }
   ```

## Examples

See implementations in:
- `apps/web/src/lib/workflowManager.ts` - Workflow validation
- `apps/web/src/lib/marketingAutomation.ts` - Marketing campaign validation
- `apps/web/src/lib/workflow-schemas.ts` - Example schema definitions
- `apps/web/src/lib/marketing-schemas.ts` - Example schema definitions
