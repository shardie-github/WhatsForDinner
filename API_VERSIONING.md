# API Versioning and Contract Governance

This guide covers API versioning strategies, contract governance, and schema management for What's For Dinner API.

## Overview

API contract governance ensures consistency, compatibility, and evolution of our API contracts through:
- **OpenAPI Schema Generation**: Automated schema generation from code
- **Schema Validation**: Contract validation and compatibility checking
- **Version Management**: Semantic versioning and backward compatibility
- **Change Detection**: Automated detection of breaking changes
- **Documentation**: Auto-generated API documentation

## Quick Start

### 1. Generate OpenAPI Schema

```bash
# Generate OpenAPI schema
pnpm run api:generate

# Generate with specific version
pnpm run api:generate --version 1.2.0

# Generate with validation
pnpm run api:generate --validate
```

### 2. Validate API Contracts

```bash
# Validate current schema
pnpm run api:validate

# Compare with previous version
pnpm run api:diff --from 1.1.0 --to 1.2.0

# Check breaking changes
pnpm run api:breaking --from 1.1.0 --to 1.2.0
```

### 3. Generate Documentation

```bash
# Generate API documentation
pnpm run api:docs

# Serve documentation locally
pnpm run api:docs:serve
```

## API Versioning Strategy

### 1. Semantic Versioning

**Format**: `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes that require client updates
- **MINOR**: New features that are backward compatible
- **PATCH**: Bug fixes that are backward compatible

**Examples**:
- `1.0.0` - Initial API release
- `1.1.0` - Added new optional fields
- `1.1.1` - Fixed validation bug
- `2.0.0` - Removed deprecated fields

### 2. Versioning Approaches

#### URL Path Versioning
```
GET /api/v1/meals
GET /api/v2/meals
```

#### Header Versioning
```
GET /api/meals
Accept: application/vnd.whats-for-dinner.v1+json
```

#### Query Parameter Versioning
```
GET /api/meals?version=1
GET /api/meals?version=2
```

**Chosen Approach**: URL Path Versioning
- Clear and explicit
- Easy to implement
- Good for caching
- Clear deprecation path

### 3. Backward Compatibility

#### Breaking Changes
- Removing fields
- Changing field types
- Removing endpoints
- Changing response structure
- Changing authentication

#### Non-Breaking Changes
- Adding optional fields
- Adding new endpoints
- Adding new response fields
- Adding new query parameters
- Adding new headers

## OpenAPI Schema Management

### 1. Schema Structure

```
api/
├── schemas/
│   ├── v1/
│   │   ├── openapi.yaml
│   │   ├── components/
│   │   │   ├── schemas.yaml
│   │   │   ├── paths.yaml
│   │   │   └── security.yaml
│   │   └── examples/
│   │       ├── meals.yaml
│   │       └── users.yaml
│   ├── v2/
│   │   ├── openapi.yaml
│   │   └── components/
│   └── shared/
│       ├── common.yaml
│       └── errors.yaml
```

### 2. Schema Generation

#### From Code Annotations
```typescript
// API route with OpenAPI annotations
/**
 * @swagger
 * /api/v1/meals:
 *   get:
 *     summary: Get user meals
 *     tags: [Meals]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of meals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Meal'
 */
export async function GET(request: Request) {
  // Implementation
}
```

#### From TypeScript Types
```typescript
// TypeScript interface
interface Meal {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  dietary: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
  };
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Generated OpenAPI schema
const mealSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', maxLength: 500 },
    ingredients: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1
    },
    instructions: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1
    },
    prepTime: { type: 'integer', minimum: 0 },
    cookTime: { type: 'integer', minimum: 0 },
    servings: { type: 'integer', minimum: 1 },
    difficulty: {
      type: 'string',
      enum: ['easy', 'medium', 'hard']
    },
    dietary: {
      type: 'object',
      properties: {
        vegetarian: { type: 'boolean' },
        vegan: { type: 'boolean' },
        glutenFree: { type: 'boolean' }
      },
      required: ['vegetarian', 'vegan', 'glutenFree']
    },
    nutrition: {
      type: 'object',
      properties: {
        calories: { type: 'number', minimum: 0 },
        protein: { type: 'number', minimum: 0 },
        carbs: { type: 'number', minimum: 0 },
        fat: { type: 'number', minimum: 0 }
      },
      required: ['calories', 'protein', 'carbs', 'fat']
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'name', 'description', 'ingredients', 'instructions', 'prepTime', 'cookTime', 'servings', 'difficulty', 'dietary', 'nutrition', 'createdAt', 'updatedAt']
};
```

### 3. Schema Validation

#### Contract Validation
```yaml
# openapi.yaml
openapi: 3.0.3
info:
  title: What's For Dinner API
  version: 1.2.0
  description: Meal planning and recipe API
servers:
  - url: https://api.whats-for-dinner.com/v1
    description: Production server
  - url: https://staging-api.whats-for-dinner.com/v1
    description: Staging server
paths:
  /meals:
    get:
      summary: Get user meals
      operationId: getMeals
      tags: [Meals]
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
            minimum: 1
            maximum: 100
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
            minimum: 0
      responses:
        '200':
          description: List of meals
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Meal'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalServerError'
```

#### Breaking Change Detection
```typescript
// Breaking change detection
interface BreakingChange {
  type: 'removed_field' | 'changed_type' | 'removed_endpoint' | 'changed_response';
  path: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

const breakingChanges = [
  {
    type: 'removed_field',
    path: 'Meal.ingredients',
    description: 'Removed required field ingredients',
    severity: 'high'
  },
  {
    type: 'changed_type',
    path: 'Meal.prepTime',
    description: 'Changed prepTime from string to integer',
    severity: 'high'
  }
];
```

## API Documentation

### 1. Auto-Generated Documentation

#### Swagger UI Integration
```typescript
// swagger-ui setup
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './api/schemas/v1/openapi.yaml';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

#### Redoc Integration
```typescript
// redoc setup
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const redoc = require('redoc-express');

app.get('/api-docs', redoc({
  title: 'What\'s For Dinner API',
  specUrl: '/api/schemas/v1/openapi.yaml',
  options: {
    theme: {
      colors: {
        primary: {
          main: '#007acc'
        }
      }
    }
  }
}));
```

### 2. Interactive Documentation

#### Try It Out
- Interactive API testing
- Request/response examples
- Authentication testing
- Parameter validation

#### Code Generation
- Client SDK generation
- Server stub generation
- TypeScript types generation

## Change Management

### 1. Change Detection

#### Automated Detection
```bash
# Detect changes between versions
pnpm run api:diff --from 1.1.0 --to 1.2.0

# Check for breaking changes
pnpm run api:breaking --from 1.1.0 --to 1.2.0

# Validate schema changes
pnpm run api:validate --schema v1/openapi.yaml
```

#### Change Types
- **Added**: New fields, endpoints, or parameters
- **Removed**: Removed fields, endpoints, or parameters
- **Modified**: Changed field types or constraints
- **Deprecated**: Marked for future removal

### 2. Deprecation Strategy

#### Deprecation Timeline
1. **Announcement**: Mark fields/endpoints as deprecated
2. **Warning Period**: 6 months with warnings
3. **Sunset Notice**: 3 months before removal
4. **Removal**: Remove deprecated items

#### Deprecation Headers
```http
HTTP/1.1 200 OK
Content-Type: application/json
Deprecation: true
Sunset: 2025-06-01T00:00:00Z
Link: <https://api.whats-for-dinner.com/v2/meals>; rel="successor-version"
```

### 3. Migration Guide

#### Version Migration
```markdown
# API Migration Guide: v1.1.0 → v1.2.0

## Breaking Changes
- `Meal.ingredients` field removed
- `Meal.prepTime` type changed from string to integer

## Migration Steps
1. Update client code to use new field structure
2. Handle new response format
3. Update validation logic

## Code Examples
```typescript
// Before (v1.1.0)
const meal = {
  ingredients: ['tomato', 'onion'],
  prepTime: '30 minutes'
};

// After (v1.2.0)
const meal = {
  ingredientsList: ['tomato', 'onion'],
  prepTimeMinutes: 30
};
```
```

## Testing and Validation

### 1. Contract Testing

#### Schema Validation
```typescript
// Validate request/response against schema
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv();
addFormats(ajv);

const validateRequest = ajv.compile(requestSchema);
const validateResponse = ajv.compile(responseSchema);

// Validate request
const isValidRequest = validateRequest(requestData);
if (!isValidRequest) {
  console.error('Request validation failed:', validateRequest.errors);
}

// Validate response
const isValidResponse = validateResponse(responseData);
if (!isValidResponse) {
  console.error('Response validation failed:', validateResponse.errors);
}
```

#### API Testing
```typescript
// API contract testing
describe('API Contract Tests', () => {
  it('should return valid meal response', async () => {
    const response = await request(app)
      .get('/api/v1/meals')
      .expect(200);
    
    expect(response.body).toMatchSchema(mealListSchema);
  });
  
  it('should validate meal creation request', async () => {
    const invalidMeal = {
      name: '', // Invalid: empty name
      prepTime: 'invalid' // Invalid: should be integer
    };
    
    await request(app)
      .post('/api/v1/meals')
      .send(invalidMeal)
      .expect(400);
  });
});
```

### 2. Compatibility Testing

#### Backward Compatibility
```typescript
// Test backward compatibility
describe('Backward Compatibility', () => {
  it('should handle old client requests', async () => {
    const oldFormatRequest = {
      meal: {
        name: 'Pasta',
        ingredients: ['pasta', 'sauce'], // Old format
        prepTime: '30 minutes' // Old format
      }
    };
    
    const response = await request(app)
      .post('/api/v1/meals')
      .send(oldFormatRequest)
      .expect(200);
    
    expect(response.body).toHaveProperty('id');
  });
});
```

## Monitoring and Analytics

### 1. API Usage Metrics

#### Request Metrics
- Request count by endpoint
- Response time by endpoint
- Error rate by endpoint
- Usage by API version

#### Client Metrics
- Client version distribution
- Deprecated endpoint usage
- Migration progress tracking

### 2. Contract Compliance

#### Schema Compliance
- Request validation success rate
- Response validation success rate
- Schema drift detection
- Contract violation alerts

#### Version Adoption
- New version adoption rate
- Deprecated version usage
- Migration completion rate
- Client update tracking

## Tools and Integration

### 1. Schema Management Tools

#### OpenAPI Tools
- **Swagger Codegen**: Client SDK generation
- **OpenAPI Generator**: Multi-language code generation
- **Swagger UI**: Interactive documentation
- **Redoc**: Beautiful documentation

#### Validation Tools
- **Ajv**: JSON Schema validation
- **OpenAPI Validator**: OpenAPI schema validation
- **Spectral**: API style guide validation
- **Dredd**: API contract testing

### 2. CI/CD Integration

#### GitHub Actions
```yaml
- name: Generate API Schema
  run: pnpm run api:generate

- name: Validate API Schema
  run: pnpm run api:validate

- name: Check Breaking Changes
  run: pnpm run api:breaking --from ${{ github.event.before }} --to ${{ github.sha }}

- name: Generate Documentation
  run: pnpm run api:docs
```

#### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "pnpm run api:validate"
    }
  }
}
```

## Best Practices

### 1. Schema Design

- **Consistent Naming**: Use consistent naming conventions
- **Clear Descriptions**: Provide clear field descriptions
- **Proper Types**: Use appropriate data types
- **Validation Rules**: Include proper validation constraints

### 2. Version Management

- **Semantic Versioning**: Follow semantic versioning principles
- **Backward Compatibility**: Maintain backward compatibility
- **Deprecation Strategy**: Plan deprecation timelines
- **Migration Support**: Provide migration guides

### 3. Documentation

- **Auto-Generation**: Use auto-generated documentation
- **Examples**: Include request/response examples
- **Interactive**: Provide interactive testing
- **Up-to-Date**: Keep documentation current

## Success Metrics

### 1. Technical Metrics

- 100% schema coverage
- 0 breaking changes without notice
- < 1s schema validation time
- 100% documentation accuracy

### 2. Developer Experience

- Easy schema generation
- Clear migration guides
- Interactive documentation
- Fast client SDK generation

### 3. Business Metrics

- Reduced API support tickets
- Faster client integration
- Improved developer satisfaction
- Better API adoption

This guide provides a comprehensive foundation for API contract governance and version management.