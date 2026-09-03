# Nomad Backend API Reference

## Base URL

- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

## Authentication

All endpoints (except `/api/healthz` and `/api/swagger`) require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are issued by Supabase Auth after user login (Google/Apple OAuth or email/password).

## Endpoints

### Health Check

#### `GET /api/healthz`

Returns service health status and connectivity checks.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:00:00Z",
  "checks": {
    "database": { "healthy": true, "latency": 5 },
    "redis": { "healthy": true, "latency": 2 },
    "queue": { "healthy": true, "pending": 0, "active": 2 }
  }
}
```

### User Profile

#### `GET /api/user/me`

Get current user profile and feature flags.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "plan": "premium",
    "preferences": {
      "diet": ["vegetarian"],
      "allergens": ["peanuts"],
      "units": "metric",
      "theme": "dark"
    }
  },
  "flags": {
    "new_feature": true
  }
}
```

#### `PATCH /api/user/me`

Update user preferences.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "diet": ["vegetarian", "vegan"],
  "allergens": ["peanuts", "dairy"],
  "units": "imperial",
  "theme": "light"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "plan": "premium",
    "preferences": { /* updated */ }
  }
}
```

### Meal Plans

#### `GET /api/mealplan?day=YYYY-MM-DD`

Get meal plan for a specific day.

**Headers:**
- `Authorization: Bearer <token>`
- `If-None-Match: <etag>` (optional, for caching)

**Query Parameters:**
- `day` (optional): Date in YYYY-MM-DD format. Defaults to today.

**Response:**
```json
{
  "mealPlan": {
    "id": "uuid",
    "user_id": "uuid",
    "day": "2024-01-15",
    "items": [
      {
        "slot": "breakfast",
        "recipe_id": "uuid",
        "macros": {
          "calories": 500,
          "protein": 20,
          "carbs": 60,
          "fat": 15
        }
      }
    ]
  }
}
```

**Status Codes:**
- `200`: Success
- `304`: Not Modified (if `If-None-Match` matches ETag)

#### `POST /api/mealplan`

Create or update meal plan for a day.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "day": "2024-01-15",
  "household_id": "uuid (optional)",
  "items": [
    {
      "slot": "breakfast",
      "recipe_id": "uuid",
      "macros": {
        "calories": 500,
        "protein": 20,
        "carbs": 60,
        "fat": 15
      }
    }
  ]
}
```

**Response:**
```json
{
  "mealPlan": { /* created/updated plan */ }
}
```

**Status Codes:**
- `201`: Created
- `400`: Invalid input

#### `POST /api/mealplan/ai-generate`

Generate a meal plan using AI.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "day": "2024-01-15",
  "household_id": "uuid (optional)",
  "preferences": {
    "calorie_target": 2000,
    "macros": {
      "protein": 150,
      "carbs": 250,
      "fat": 65
    },
    "allergens": ["peanuts"]
  },
  "pantry": [
    {
      "name": "chicken breast",
      "quantity": 500,
      "unit": "g"
    }
  ]
}
```

**Response:**
```json
{
  "jobId": "uuid",
  "status": "queued"
}
```

**Status Codes:**
- `202`: Accepted (job queued)

### Recipes

#### `GET /api/recipes/search?q=<query>&tags=<tags>&macro=<macro>`

Search recipes.

**Query Parameters:**
- `q` (optional): Search query
- `tags` (optional): Comma-separated tags
- `macro` (optional): Filter by macro (e.g., "high-protein")

**Response:**
```json
{
  "recipes": [
    {
      "id": "uuid",
      "title": "Grilled Chicken Salad",
      "media_url": "https://...",
      "steps": [],
      "ingredients": [],
      "macros": {},
      "tags": ["healthy", "high-protein"],
      "source": "curated"
    }
  ]
}
```

### Grocery Lists

#### `POST /api/grocery`

Create or update grocery list.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "household_id": "uuid",
  "name": "Weekly Shopping",
  "items": [
    {
      "title": "Chicken Breast",
      "qty": 500,
      "unit": "g",
      "checked": false
    }
  ]
}
```

### Health Metrics

#### `GET /api/health?kind=<kind>&from=<date>&to=<date>`

Get health metrics timeseries.

**Query Parameters:**
- `kind` (optional): Filter by kind (weight, sleep, water, steps, calories)
- `from` (optional): Start date (ISO 8601)
- `to` (optional): End date (ISO 8601)

**Response:**
```json
{
  "metrics": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "kind": "weight",
      "value": "70.5",
      "unit": "kg",
      "ts": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### `POST /api/health`

Record a health metric.

**Body:**
```json
{
  "kind": "weight",
  "value": 70.5,
  "unit": "kg"
}
```

### Family Communication

#### `GET /api/family/rooms`

List family rooms and DMs.

**Response:**
```json
{
  "rooms": [
    {
      "id": "uuid",
      "household_id": "uuid",
      "kind": "family",
      "participants": ["uuid1", "uuid2"]
    }
  ]
}
```

#### `POST /api/family/message`

Send a message to a room.

**Body:**
```json
{
  "room_id": "uuid",
  "body": "Dinner's ready!",
  "attachments": []
}
```

### Analytics & Events

#### `POST /api/events`

Ingest analytics event.

**Body:**
```json
{
  "name": "recipe_viewed",
  "props": {
    "recipe_id": "uuid",
    "source": "search"
  }
}
```

### Webhooks

#### `POST /api/partner/webhook`

Partner webhook endpoint (HMAC verified).

**Headers:**
- `X-Nomad-Signature: <hmac-signature>`

**Body:** Partner-specific payload

**Response:**
```json
{
  "received": true,
  "id": "uuid"
}
```

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message",
  "details": [] // Optional, for validation errors
}
```

**Status Codes:**
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (plan upgrade required)
- `404`: Not Found
- `413`: Payload Too Large (>1MB)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error
- `503`: Service Unavailable (degraded health)

## Rate Limiting

Rate limits are enforced per IP + user:
- Default: 100 requests per 60 seconds
- Response headers:
  - `X-RateLimit-Limit`: Maximum requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time (ISO 8601)

## ETag Support

GET endpoints support ETag caching:
1. Response includes `ETag` header
2. Client sends `If-None-Match: <etag>` on subsequent requests
3. Server returns `304 Not Modified` if unchanged

## OpenAPI Documentation

Interactive API documentation available at:
- `/api/swagger` - Swagger JSON
- `/api/docs` - Swagger UI (if configured)

## Examples

### cURL

```bash
# Get user profile
curl -H "Authorization: Bearer $TOKEN" \
  https://api.nomad.app/api/user/me

# Get meal plan
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.nomad.app/api/mealplan?day=2024-01-15"

# Create meal plan
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"day":"2024-01-15","items":[]}' \
  https://api.nomad.app/api/mealplan
```

### TypeScript (fetch)

```typescript
const response = await fetch('https://api.nomad.app/api/mealplan?day=2024-01-15', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'If-None-Match': etag, // for caching
  },
});

if (response.status === 304) {
  // Use cached data
} else {
  const data = await response.json();
  const newEtag = response.headers.get('ETag');
}
```
