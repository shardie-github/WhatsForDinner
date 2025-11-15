# API Documentation

Complete API reference for What's for Dinner application.

## Base URL

- **Production**: `https://whats-for-dinner.vercel.app/api`
- **Development**: `http://localhost:3000/api`

## Authentication

Most endpoints require authentication. Use one of the following methods:

### Bearer Token (JWT)

```http
Authorization: Bearer <your-jwt-token>
```

### API Key (for partner integrations)

```http
x-api-key: <your-api-key>
```

## Common Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "uuid"
  }
}
```

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Endpoints

### User Management

#### Get Current User

```http
GET /api/user/me
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "plan": "free",
    "preferences": {},
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Recipes

#### List Recipes

```http
GET /api/recipes?page=1&limit=20&tags=vegetarian,dinner
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `tags` (string[]) - Filter by tags
- `search` (string) - Search query

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "Recipe Name",
        "mediaUrl": "https://...",
        "steps": [...],
        "ingredients": [...],
        "tags": ["vegetarian", "dinner"],
        "source": "curated"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### Get Recipe

```http
GET /api/recipes/{id}
```

#### Create Recipe

```http
POST /api/recipes
```

**Request Body:**

```json
{
  "title": "Recipe Name",
  "steps": [
    {
      "step": 1,
      "instruction": "Do something",
      "duration": 10
    }
  ],
  "ingredients": [
    {
      "name": "Ingredient",
      "amount": 1,
      "unit": "cup"
    }
  ],
  "tags": ["vegetarian"]
}
```

### Meal Plans

#### Get Meal Plan

```http
GET /api/meal-plan?day=2024-01-01
```

**Query Parameters:**
- `day` (date, required) - Date in YYYY-MM-DD format
- `householdId` (uuid, optional) - Household ID

#### Create Meal Plan

```http
POST /api/meal-plan
```

**Request Body:**

```json
{
  "day": "2024-01-01",
  "items": [
    {
      "mealType": "dinner",
      "recipeId": "uuid"
    }
  ]
}
```

#### Get Daily Suggestion

```http
GET /api/meal-plan/daily-suggestion
```

**Query Parameters:**
- `day` (date, optional) - Date in YYYY-MM-DD format
- `preferences` (object, optional) - Dietary preferences

### Grocery Lists

#### List Grocery Lists

```http
GET /api/grocery-lists
```

#### Get Grocery List

```http
GET /api/grocery-lists/{id}
```

#### Create Grocery List

```http
POST /api/grocery-lists
```

**Request Body:**

```json
{
  "name": "Weekly Shopping",
  "items": [
    {
      "name": "Milk",
      "quantity": 1,
      "unit": "gallon"
    }
  ]
}
```

### Health Metrics

#### List Health Metrics

```http
GET /api/health-metrics?kind=weight&startDate=2024-01-01&endDate=2024-01-31
```

**Query Parameters:**
- `kind` (enum) - Metric type: `weight`, `sleep`, `water`, `steps`, `calories`
- `startDate` (date) - Start date
- `endDate` (date) - End date

#### Create Health Metric

```http
POST /api/health-metrics
```

**Request Body:**

```json
{
  "kind": "weight",
  "value": 70,
  "unit": "kg",
  "ts": "2024-01-01T00:00:00.000Z"
}
```

### Referrals

#### Create Referral Code

```http
POST /api/referral/create
```

#### Convert Referral

```http
POST /api/referral/convert
```

**Request Body:**

```json
{
  "code": "REFERRAL_CODE"
}
```

### Privacy

#### Export User Data

```http
GET /api/privacy/export
```

#### Erase User Data

```http
POST /api/privacy/erase
```

**Request Body:**

```json
{
  "confirm": true
}
```

### Observability

#### Get Traces

```http
GET /api/observability/traces
```

#### Get Metrics

```http
GET /api/observability/metrics
```

### Revenue

#### Get Revenue Summary

```http
GET /api/revenue/summary
```

#### Get Revenue Dashboard

```http
GET /api/revenue/dashboard
```

## Rate Limiting

API requests are rate-limited:

- **Free tier**: 100 requests/hour
- **Premium tier**: 1000 requests/hour
- **Partner tier**: 10000 requests/hour

Rate limit headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Partner Webhooks

Partners can register webhooks to receive events:

```http
POST /api/webhooks/register
```

**Request Body:**

```json
{
  "url": "https://partner.com/webhook",
  "events": ["meal_plan.created", "recipe.viewed"],
  "secret": "webhook-secret"
}
```

### Webhook Signature Verification

All webhook payloads include a signature header:

```http
X-Webhook-Signature: sha256=<signature>
```

Verify signatures using HMAC-SHA256 with your webhook secret.

## SDKs and Libraries

### JavaScript/TypeScript

```typescript
import { WhatsForDinnerClient } from '@whats-for-dinner/sdk';

const client = new WhatsForDinnerClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://whats-for-dinner.vercel.app/api'
});

const recipes = await client.recipes.list({ tags: ['vegetarian'] });
```

## Changelog

See [CHANGELOG.md](../CHANGELOG.md) for API version history.

## Support

For API support:
- Email: api-support@whatsfordinner.app
- Documentation: https://docs.whatsfordinner.app/api
- Status: https://status.whatsfordinner.app
