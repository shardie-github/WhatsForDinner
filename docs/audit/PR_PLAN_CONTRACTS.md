# PR Plan — Contract Conformance

**Generated:** 2025-01-27  
**Scope:** API contracts, endpoint validation, schema conformance

## Branch Strategy

**Branch Name:** `feat/api-contracts-and-validation`

**Base Branch:** `main`  
**Target:** Merge to `main` after review

## File Touch List

### New Files
1. `openapi.yaml` - OpenAPI specification
2. `scripts/generate-openapi.mjs` - OpenAPI generator
3. `packages/utils/src/validation-middleware.ts` - Input validation
4. `packages/testing/contracts/api-contracts.spec.ts` - Contract tests
5. `docs/API_CONTRACTS.md` - API documentation

### Modified Files
1. `apps/web/src/app/api/**/*.ts` - Add validation middleware
2. `apps/web/src/app/api/swagger/route.ts` - Serve OpenAPI spec
3. `.github/workflows/ci-cd.yml` - Add contract tests

## Endpoint Schema Tests

### OpenAPI Generation

**File:** `scripts/generate-openapi.mjs`

```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse route handlers and generate OpenAPI spec
async function generateOpenAPI() {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'What\'s for Dinner API',
      version: '1.0.0',
    },
    servers: [
      { url: 'https://whats-for-dinner.vercel.app', description: 'Production' },
      { url: 'http://localhost:3000', description: 'Development' },
    ],
    paths: {},
    components: {
      schemas: {},
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  };

  // Scan API routes
  const apiDir = path.join(__dirname, '../apps/web/src/app/api');
  const routes = await scanRoutes(apiDir);
  
  // Generate paths from routes
  for (const route of routes) {
    spec.paths[route.path] = {
      [route.method.toLowerCase()]: {
        summary: route.summary,
        security: route.auth ? [{ bearerAuth: [] }] : [],
        requestBody: route.requestBody ? {
          content: {
            'application/json': {
              schema: route.requestSchema,
            },
          },
        } : undefined,
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: route.responseSchema,
              },
            },
          },
          // ... other status codes
        },
      },
    };
  }

  // Write OpenAPI spec
  fs.writeFileSync(
    path.join(__dirname, '../openapi.yaml'),
    YAML.stringify(spec)
  );
}

generateOpenAPI();
```

### Response Mappers

**File:** `packages/utils/src/response-mappers.ts`

```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';

export function createResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function createErrorResponse(
  error: Error | z.ZodError,
  status: number = 500
) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      error: error.message || 'Internal server error',
    },
    { status }
  );
}
```

## Endpoint Schema Tests

### Validation Middleware

**File:** `packages/utils/src/validation-middleware.ts`

```typescript
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse } from './response-mappers';

export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (
    req: NextRequest,
    handler: (data: T) => Promise<NextResponse>
  ) => {
    try {
      const body = await req.json();
      const validated = schema.parse(body);
      return await handler(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return createErrorResponse(error, 400);
      }
      return createErrorResponse(error as Error, 500);
    }
  };
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return async (
    req: NextRequest,
    handler: (data: T) => Promise<NextResponse>
  ) => {
    try {
      const query = Object.fromEntries(req.nextUrl.searchParams);
      const validated = schema.parse(query);
      return await handler(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return createErrorResponse(error, 400);
      }
      return createErrorResponse(error as Error, 500);
    }
  };
}
```

### Example Usage

**File:** `apps/web/src/app/api/subscriptions/create/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateRequest, createResponse } from '@whats-for-dinner/utils';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  planId: z.string().uuid(),
  paymentMethodId: z.string(),
});

export const POST = validateRequest(createSubscriptionSchema)(
  async (req: NextRequest, data: z.infer<typeof createSubscriptionSchema>) => {
    // Handler logic
    const subscription = await createSubscription(data);
    return createResponse(subscription, 201);
  }
);
```

## Database Migration Notes

### Migration Consolidation

**Action:** Consolidate all migrations to `supabase/migrations/`

**Steps:**
1. Audit all migration directories
2. Identify duplicates
3. Consolidate to single directory
4. Validate schema consistency
5. Update migration scripts

**Files to Consolidate:**
- `apps/web/supabase/migrations/` → `supabase/migrations/`
- `whats-for-dinner/supabase/migrations/` → `supabase/migrations/` (after audit)
- `packages/server/db/migrations/` → `supabase/migrations/`

### Schema Validation

**File:** `scripts/validate-schema.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function validateSchema() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Read master schema
  const masterSchema = fs.readFileSync(
    path.join(__dirname, '../master_supabase_schema.sql'),
    'utf-8'
  );

  // Query database schema
  const { data: tables } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');

  // Compare schemas
  // ... validation logic
}

validateSchema();
```

## Safe Toggles

### Feature Flags for Contracts

**File:** `packages/config/src/feature-flags.ts` (UPDATE)

```typescript
export const featureFlags = {
  // ... existing flags
  apiContractValidation: {
    key: 'API_CONTRACT_VALIDATION',
    default: false, // Start disabled
    killSwitch: true,
    description: 'Enable API contract validation',
  },
  openApiSpec: {
    key: 'OPENAPI_SPEC',
    default: true,
    killSwitch: true,
    description: 'Enable OpenAPI spec generation',
  },
} as const;
```

### Gradual Rollout

1. **Phase 1:** Generate OpenAPI spec (no validation)
2. **Phase 2:** Add validation to non-critical endpoints
3. **Phase 3:** Add validation to all endpoints
4. **Phase 4:** Enable contract tests in CI

## Contract Tests

### OpenAPI Validation

**File:** `packages/testing/contracts/api-contracts.spec.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { validateApi } from 'openapi-validator';
import fs from 'fs';

describe('API Contract Conformance', () => {
  it('should conform to OpenAPI spec', async () => {
    const spec = fs.readFileSync('openapi.yaml', 'utf-8');
    const validator = await validateApi(spec);
    
    // Test all endpoints
    const endpoints = [
      { method: 'GET', path: '/api/health' },
      { method: 'GET', path: '/api/user/me' },
      // ... all endpoints
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
      });
      
      const validation = validator.validateResponse(
        endpoint.path,
        endpoint.method,
        response.status,
        await response.json()
      );
      
      expect(validation.valid).toBe(true);
    }
  });
});
```

## Rollout Plan

### Phase 1: OpenAPI Generation (Week 1)
1. Generate OpenAPI spec from routes
2. Serve at `/api/swagger`
3. Update documentation
4. No validation yet

### Phase 2: Validation (Week 2)
1. Add validation middleware
2. Apply to non-critical endpoints
3. Monitor for validation errors
4. Fix any issues

### Phase 3: Full Validation (Week 3)
1. Add validation to all endpoints
2. Enable contract tests in CI
3. Update all API documentation

## Rollback Plan

1. **If validation causes issues:**
   - Disable validation feature flag
   - Remove validation middleware
   - Revert to direct request handling

2. **If OpenAPI generation fails:**
   - Remove OpenAPI generation
   - Keep manual documentation
   - Fix generation script

## Success Criteria

- ✅ OpenAPI spec generated automatically
- ✅ All endpoints have request/response schemas
- ✅ Contract tests pass in CI
- ✅ Zero validation errors in production
- ✅ API documentation up to date

## PR Checklist

- [ ] Code follows project style guide
- [ ] All tests pass
- [ ] OpenAPI spec generated
- [ ] Documentation updated
- [ ] Contract tests added
- [ ] Feature flags added
- [ ] Rollback plan documented
