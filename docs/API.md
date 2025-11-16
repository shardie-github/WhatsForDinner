# API Documentation

Complete API reference for What's for Dinner application.

## Base URL

- **Production**: `https://whats-for-dinner.vercel.app`
- **Development**: `http://localhost:3000`

## Authentication

Most endpoints require authentication via Bearer token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

Tokens are obtained through the `/api/auth` endpoints.

## Endpoints

### Health & Status

#### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "ok": true,
  "ts": 1234567890,
  "environment": "production"
}
```

#### `GET /api/healthz`
Alternative health check endpoint (Edge-compatible).

---

### Meal Planning

#### `GET /api/meal-plan`
Get user's meal plan.

**Query Parameters:**
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)

**Response:**
```json
{
  "plans": [
    {
      "id": "uuid",
      "day": "2024-01-01",
      "items": []
    }
  ]
}
```

#### `POST /api/meal-plan`
Create or update meal plan.

**Request Body:**
```json
{
  "day": "2024-01-01",
  "items": [
    {
      "recipeId": "uuid",
      "mealType": "dinner"
    }
  ]
}
```

---

### Recipes

#### `GET /api/recipes`
Get recipes.

**Query Parameters:**
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset
- `tags` (optional): Filter by tags (comma-separated)

**Response:**
```json
{
  "recipes": [
    {
      "id": "uuid",
      "title": "Recipe Name",
      "ingredients": [],
      "steps": [],
      "tags": []
    }
  ],
  "total": 100
}
```

#### `POST /api/recipes`
Create a new recipe.

**Request Body:**
```json
{
  "title": "Recipe Name",
  "ingredients": [],
  "steps": [],
  "tags": []
}
```

---

### Grocery Lists

#### `GET /api/grocery-list`
Get grocery lists.

**Response:**
```json
{
  "lists": [
    {
      "id": "uuid",
      "name": "Weekly Shopping",
      "items": []
    }
  ]
}
```

#### `POST /api/grocery-list`
Create a new grocery list.

**Request Body:**
```json
{
  "name": "Weekly Shopping",
  "items": [
    {
      "name": "Milk",
      "quantity": "1 gallon",
      "checked": false
    }
  ]
}
```

---

### Authentication

#### `POST /api/auth/signin`
Sign in with email/password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### `POST /api/auth/signup`
Create a new account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### `POST /api/auth/signout`
Sign out current user.

---

### User Preferences

#### `GET /api/preferences`
Get user preferences.

**Response:**
```json
{
  "dietaryRestrictions": [],
  "allergies": [],
  "cuisinePreferences": [],
  "cookingSkillLevel": "intermediate"
}
```

#### `PUT /api/preferences`
Update user preferences.

**Request Body:**
```json
{
  "dietaryRestrictions": ["vegetarian"],
  "allergies": ["nuts"],
  "cuisinePreferences": ["italian", "mexican"],
  "cookingSkillLevel": "intermediate"
}
```

---

### Privacy & GDPR

#### `GET /api/gdpr/data`
Request user data export (GDPR).

**Response:**
```json
{
  "status": "processing",
  "requestId": "uuid",
  "estimatedCompletion": "2024-01-02T00:00:00Z"
}
```

#### `POST /api/gdpr/delete`
Request account deletion (GDPR).

**Request Body:**
```json
{
  "reason": "No longer using the service",
  "confirm": true
}
```

---

### Error Responses

All endpoints may return the following error responses:

#### `400 Bad Request`
```json
{
  "error": "Invalid request",
  "message": "Detailed error message",
  "code": "INVALID_REQUEST"
}
```

#### `401 Unauthorized`
```json
{
  "error": "Unauthorized",
  "message": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

#### `403 Forbidden`
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions",
  "code": "FORBIDDEN"
}
```

#### `404 Not Found`
```json
{
  "error": "Not Found",
  "message": "Resource not found",
  "code": "NOT_FOUND"
}
```

#### `500 Internal Server Error`
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "code": "INTERNAL_ERROR"
}
```

---

## Rate Limiting

API requests are rate-limited:
- **Authenticated users**: 1000 requests/hour
- **Unauthenticated**: 100 requests/hour

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Webhooks

### Stripe Webhooks

#### `POST /api/stripe/webhook`
Stripe webhook endpoint for payment events.

**Headers:**
- `stripe-signature`: Stripe signature header

**Events:**
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## OpenAPI Specification

For complete API specification, see:
- [OpenAPI JSON](/docs/openapi.json)
- [OpenAPI YAML](/docs/openapi.yaml)

Generate updated documentation:
```bash
pnpm api:docs:generate
```

---

## Support

For API support:
- 📧 Email: api-support@whatsfordinner.app
- 📖 Documentation: https://docs.whatsfordinner.app
- 🐛 Issues: https://github.com/your-org/whats-for-dinner/issues
