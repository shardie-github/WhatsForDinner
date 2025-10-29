# API Reference

This document provides a comprehensive reference for all API endpoints in the "What's for Dinner" application.

## Base URL

All API endpoints are relative to the base URL of your deployment:
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## Authentication

Most endpoints require authentication via Supabase Auth. Include the authentication token in the request headers:

```typescript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'x-tenant-id': tenantId  // Required for multi-tenant operations
}
```

## API Endpoints

### Health & Monitoring

#### `GET /api/health`
Basic health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-21T10:00:00.000Z",
  "version": "1.0.0",
  "buildSha": "abc123",
  "environment": "production",
  "checks": {
    "database": {
      "status": "healthy",
      "duration": 45
    }
  },
  "uptime": 3600,
  "responseTime": 50
}
```

#### `GET /api/observability/health`
Comprehensive observability health check.

**Response:**
```json
{
  "timestamp": "2025-01-21T10:00:00.000Z",
  "overall": "healthy",
  "system": {
    "status": "healthy",
    "alerts": [],
    "metrics": {}
  },
  "observability": {
    "status": "healthy",
    "components": {}
  },
  "components": {
    "monitoring": "healthy",
    "tracing": "healthy",
    "logging": "healthy",
    "database": "healthy"
  },
  "summary": {
    "activeAlerts": 0,
    "criticalAlerts": 0,
    "errorRate": 0,
    "responseTime": 45,
    "uptime": 3600
  }
}
```

### Recipe Generation

#### `POST /api/dinner`
Generate recipes from pantry ingredients.

**Request Body:**
```json
{
  "ingredients": ["chicken", "tomatoes", "pasta"],
  "preferences": "vegetarian, gluten-free"
}
```

**Response:**
```json
{
  "recipes": [
    {
      "title": "Recipe Name",
      "ingredients": ["ingredient1", "ingredient2"],
      "instructions": ["step1", "step2"],
      "nutrition": {}
    }
  ],
  "metadata": {
    "model": "gpt-4o-mini",
    "tokensUsed": 150,
    "costUsd": 0.002,
    "cached": false
  }
}
```

**Headers Required:**
- `x-tenant-id`: Tenant identifier (required)

### Observability

#### `GET /api/observability/traces`
Get distributed traces.

**Query Parameters:**
- `limit` (optional): Number of traces to return (default: 100)
- `service` (optional): Filter by service name
- `timeRange` (optional): Time range in minutes (default: 60)

#### `GET /api/observability/metrics`
Get system metrics.

**Query Parameters:**
- `metric` (optional): Specific metric name
- `timeRange` (optional): Time range in minutes (default: 60)

#### `GET /api/observability/alerts`
Get active alerts.

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert-123",
      "severity": "critical",
      "message": "High error rate detected",
      "timestamp": "2025-01-21T10:00:00.000Z"
    }
  ]
}
```

#### `GET /api/observability/report`
Get observability report.

#### `GET /api/observability/dashboard`
Get dashboard data for observability.

#### `GET /api/observability/errors`
Get error logs.

**Query Parameters:**
- `limit` (optional): Number of errors to return (default: 50)
- `severity` (optional): Filter by severity level

### Billing

#### `GET /api/billing/portal`
Get Stripe billing portal session URL.

**Response:**
```json
{
  "url": "https://billing.stripe.com/session/..."
}
```

#### `POST /api/billing/checkout`
Create Stripe checkout session.

**Request Body:**
```json
{
  "planId": "pro",
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/..."
}
```

### Pantry Management

#### `POST /api/pantry/seed-sample`
Seed sample pantry items for a user.

**Request Body:**
```json
{
  "userId": "user-id"
}
```

### Preferences

#### `GET /api/preferences`
Get user preferences.

**Response:**
```json
{
  "dietaryRestrictions": ["vegetarian"],
  "allergies": ["nuts"],
  "cuisinePreferences": ["italian"],
  "cookingTime": "30-60"
}
```

#### `POST /api/preferences`
Update user preferences.

**Request Body:**
```json
{
  "dietaryRestrictions": ["vegetarian"],
  "allergies": ["nuts"],
  "cuisinePreferences": ["italian"],
  "cookingTime": "30-60"
}
```

### Feature Flags

#### `GET /api/features/check`
Check feature flag status.

**Query Parameters:**
- `feature`: Feature flag name (required)

**Response:**
```json
{
  "enabled": true,
  "variant": "variant-name"
}
```

### Experiments

#### `POST /api/experiments/assign`
Assign user to experiment variant.

**Request Body:**
```json
{
  "experimentId": "experiment-123",
  "userId": "user-id"
}
```

#### `POST /api/experiments/convert`
Record experiment conversion.

**Request Body:**
```json
{
  "experimentId": "experiment-123",
  "userId": "user-id",
  "event": "purchase"
}
```

### Onboarding

#### `GET /api/onboarding/checklist`
Get onboarding checklist for user.

**Response:**
```json
{
  "steps": [
    {
      "id": "step-1",
      "title": "Add pantry items",
      "completed": true
    }
  ]
}
```

### Developers API

#### `GET /api/developers/keys`
Get API keys for authenticated developer.

**Response:**
```json
{
  "keys": [
    {
      "id": "key-123",
      "name": "Production Key",
      "createdAt": "2025-01-21T10:00:00.000Z",
      "lastUsed": "2025-01-21T10:00:00.000Z"
    }
  ]
}
```

#### `POST /api/developers/keys`
Create new API key.

**Request Body:**
```json
{
  "name": "My API Key"
}
```

**Response:**
```json
{
  "id": "key-123",
  "key": "sk_live_...",
  "name": "My API Key",
  "createdAt": "2025-01-21T10:00:00.000Z"
}
```

#### `DELETE /api/developers/keys/[id]`
Delete API key.

#### `GET /api/developers/usage`
Get API usage statistics.

**Query Parameters:**
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)

### Partners API

#### `GET /api/partners/stats`
Get partner statistics.

**Response:**
```json
{
  "totalRecipes": 1000,
  "totalViews": 50000,
  "totalRevenue": 10000
}
```

#### `GET /api/partners/revenue`
Get partner revenue.

**Query Parameters:**
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)

#### `GET /api/partners/v1/recipes`
Get partner recipes (API v1).

#### `GET /api/partners/v1/nutrition`
Get nutrition data (API v1).

#### `GET /api/partners/v1/meal-plans`
Get meal plans (API v1).

### Performance

#### `GET /api/performance`
Get performance metrics.

#### `POST /api/performance/optimize`
Request performance optimization.

**Request Body:**
```json
{
  "resource": "recipes",
  "action": "cache"
}
```

#### `GET /api/performance/recommendations`
Get performance optimization recommendations.

### Commerce Hub

#### `GET /api/commerce/hub`
Get commerce hub data.

### Federation

#### `GET /api/federation`
Get federation data.

### Traces

#### `GET /api/traces`
Get distributed traces.

**Query Parameters:**
- `limit` (optional): Number of traces (default: 100)
- `service` (optional): Filter by service

#### `GET /api/traces/[traceId]/spans`
Get spans for a specific trace.

### Other Endpoints

#### `GET /api/metrics`
Get system metrics.

#### `POST /api/errors`
Report error.

**Request Body:**
```json
{
  "error": "Error message",
  "stack": "Stack trace",
  "context": {}
}
```

#### `POST /api/alerts`
Create alert.

#### `POST /api/stripe/webhook`
Stripe webhook endpoint (handled by Stripe).

#### `GET /api/selftest`
Self-test endpoint.

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "details": {}  // Optional additional details
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limiting

API endpoints are rate-limited based on your plan:
- **Free**: 100 requests/hour
- **Pro**: 1000 requests/hour
- **Enterprise**: Unlimited

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642680000
```

## SDKs

Official SDKs are available:
- TypeScript/JavaScript: `@whats-for-dinner/sdk`
- React: `@whats-for-dinner/react-sdk`
- React Native: `@whats-for-dinner/react-native-sdk`

## Support

For API support:
- Documentation: See this file and inline code comments
- Issues: GitHub Issues
- Discussions: GitHub Discussions
