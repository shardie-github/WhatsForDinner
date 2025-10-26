# API Documentation

This document provides comprehensive documentation for the What's for Dinner API.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
- [Data Models](#data-models)
- [Examples](#examples)
- [SDKs](#sdks)
- [Webhooks](#webhooks)

## Overview

The What's for Dinner API is a RESTful API that provides access to meal generation, recipe management, and user preferences. The API is built with Node.js, Express, and PostgreSQL, and follows REST principles with JSON responses.

### Features

- **Meal Generation**: AI-powered meal suggestions based on user preferences
- **Recipe Management**: CRUD operations for recipes and ingredients
- **User Preferences**: Personalized dietary and taste preferences
- **Meal Planning**: Weekly meal plan generation and management
- **Search**: Advanced search and filtering capabilities
- **Analytics**: Usage analytics and reporting

### API Versions

- **v2.0** (Current): Latest version with all features
- **v1.0** (Deprecated): Legacy version, will be removed in v3.0

## Authentication

The API uses JWT (JSON Web Token) for authentication. All requests must include a valid JWT token in the Authorization header.

### Getting a Token

```http
POST /api/v2/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

### Using the Token

```http
GET /api/v2/meals
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Refresh

```http
POST /api/v2/auth/refresh
Authorization: Bearer <current-token>
```

## Base URL

- **Production**: `https://api.whats-for-dinner.com`
- **Staging**: `https://api-staging.whats-for-dinner.com`
- **Development**: `http://localhost:3000`

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Authenticated Users**: 1000 requests per hour
- **Unauthenticated Users**: 100 requests per hour
- **Meal Generation**: 50 requests per hour per user

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Error Handling

The API uses standard HTTP status codes and returns errors in a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Error Codes

| Code               | Status | Description              |
| ------------------ | ------ | ------------------------ |
| `VALIDATION_ERROR` | 400    | Invalid input data       |
| `UNAUTHORIZED`     | 401    | Authentication required  |
| `FORBIDDEN`        | 403    | Insufficient permissions |
| `NOT_FOUND`        | 404    | Resource not found       |
| `RATE_LIMITED`     | 429    | Rate limit exceeded      |
| `INTERNAL_ERROR`   | 500    | Server error             |

## Endpoints

### Authentication

#### POST /api/v2/auth/login

Authenticate user and return JWT token.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

#### POST /api/v2/auth/register

Register new user account.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

#### POST /api/v2/auth/logout

Invalidate current token.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Meals

#### GET /api/v2/meals

Get list of meals with optional filtering.

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `category` (string): Meal category filter
- `dietary` (string): Dietary restriction filter
- `difficulty` (string): Difficulty level filter
- `cooking_time` (number): Maximum cooking time in minutes

**Example:**

```http
GET /api/v2/meals?category=dinner&dietary=vegetarian&limit=10
```

**Response:**

```json
{
  "success": true,
  "data": {
    "meals": [
      {
        "id": "uuid",
        "name": "Vegetarian Pasta",
        "description": "Delicious pasta with vegetables",
        "category": "dinner",
        "dietary": ["vegetarian"],
        "difficulty": "easy",
        "cooking_time": 30,
        "servings": 4,
        "ingredients": [...],
        "instructions": [...],
        "nutrition": {...},
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

#### POST /api/v2/meals

Create a new meal.

**Request:**

```json
{
  "name": "Vegetarian Pasta",
  "description": "Delicious pasta with vegetables",
  "category": "dinner",
  "dietary": ["vegetarian"],
  "difficulty": "easy",
  "cooking_time": 30,
  "servings": 4,
  "ingredients": [
    {
      "name": "pasta",
      "amount": "500g",
      "unit": "grams"
    }
  ],
  "instructions": [
    "Boil water in a large pot",
    "Add pasta and cook according to package directions"
  ],
  "nutrition": {
    "calories": 400,
    "protein": 15,
    "carbs": 60,
    "fat": 10
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Vegetarian Pasta",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

#### GET /api/v2/meals/:id

Get specific meal by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Vegetarian Pasta",
    "description": "Delicious pasta with vegetables",
    "category": "dinner",
    "dietary": ["vegetarian"],
    "difficulty": "easy",
    "cooking_time": 30,
    "servings": 4,
    "ingredients": [...],
    "instructions": [...],
    "nutrition": {...},
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

#### PUT /api/v2/meals/:id

Update existing meal.

**Request:**

```json
{
  "name": "Updated Vegetarian Pasta",
  "description": "Even more delicious pasta with vegetables"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Vegetarian Pasta",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

#### DELETE /api/v2/meals/:id

Delete meal.

**Response:**

```json
{
  "success": true,
  "message": "Meal deleted successfully"
}
```

### Meal Generation

#### POST /api/v2/meals/generate

Generate AI-powered meal suggestions.

**Request:**

```json
{
  "preferences": {
    "dietary": ["vegetarian"],
    "allergies": ["nuts"],
    "cuisine": ["italian", "mexican"],
    "difficulty": "easy",
    "cooking_time": 30,
    "servings": 4
  },
  "context": {
    "meal_type": "dinner",
    "occasion": "weeknight",
    "budget": "medium"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "meals": [
      {
        "id": "uuid",
        "name": "Vegetarian Pasta",
        "confidence": 0.95,
        "reasoning": "Matches your vegetarian preference and Italian cuisine preference"
      }
    ],
    "generation_id": "uuid",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### Recipes

#### GET /api/v2/recipes

Get list of recipes.

**Query Parameters:**

- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search query
- `category` (string): Recipe category
- `difficulty` (string): Difficulty level
- `cooking_time` (number): Maximum cooking time

**Response:**

```json
{
  "success": true,
  "data": {
    "recipes": [...],
    "pagination": {...}
  }
}
```

#### POST /api/v2/recipes

Create new recipe.

**Request:**

```json
{
  "name": "Chocolate Chip Cookies",
  "description": "Classic chocolate chip cookies",
  "category": "dessert",
  "difficulty": "easy",
  "cooking_time": 25,
  "servings": 24,
  "ingredients": [...],
  "instructions": [...],
  "nutrition": {...}
}
```

### Ingredients

#### GET /api/v2/ingredients

Get list of ingredients.

**Query Parameters:**

- `search` (string): Search query
- `category` (string): Ingredient category
- `dietary` (string): Dietary restriction filter

**Response:**

```json
{
  "success": true,
  "data": {
    "ingredients": [
      {
        "id": "uuid",
        "name": "tomato",
        "category": "vegetable",
        "dietary": ["vegetarian", "vegan"],
        "allergens": [],
        "nutrition": {...}
      }
    ]
  }
}
```

### User Preferences

#### GET /api/v2/user/preferences

Get user preferences.

**Response:**

```json
{
  "success": true,
  "data": {
    "dietary": ["vegetarian"],
    "allergies": ["nuts"],
    "cuisine": ["italian", "mexican"],
    "difficulty": "easy",
    "cooking_time": 30,
    "servings": 4,
    "budget": "medium"
  }
}
```

#### PUT /api/v2/user/preferences

Update user preferences.

**Request:**

```json
{
  "dietary": ["vegetarian", "vegan"],
  "allergies": ["nuts", "dairy"],
  "cuisine": ["italian", "mexican", "asian"],
  "difficulty": "medium",
  "cooking_time": 45,
  "servings": 6,
  "budget": "high"
}
```

### Meal Plans

#### GET /api/v2/meal-plans

Get user's meal plans.

**Query Parameters:**

- `start_date` (string): Start date (ISO format)
- `end_date` (string): End date (ISO format)

**Response:**

```json
{
  "success": true,
  "data": {
    "meal_plans": [
      {
        "id": "uuid",
        "start_date": "2024-01-15",
        "end_date": "2024-01-21",
        "meals": [...],
        "shopping_list": [...],
        "created_at": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

#### POST /api/v2/meal-plans

Create new meal plan.

**Request:**

```json
{
  "start_date": "2024-01-15",
  "end_date": "2024-01-21",
  "preferences": {
    "dietary": ["vegetarian"],
    "difficulty": "easy"
  }
}
```

### Search

#### GET /api/v2/search

Search across meals, recipes, and ingredients.

**Query Parameters:**

- `q` (string): Search query
- `type` (string): Content type (meals, recipes, ingredients)
- `filters` (object): Additional filters

**Response:**

```json
{
  "success": true,
  "data": {
    "results": {
      "meals": [...],
      "recipes": [...],
      "ingredients": [...]
    },
    "total": 150,
    "query": "pasta"
  }
}
```

## Data Models

### Meal

```typescript
interface Meal {
  id: string;
  name: string;
  description: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dietary: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  cooking_time: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: Nutrition;
  created_at: string;
  updated_at: string;
}
```

### Ingredient

```typescript
interface Ingredient {
  id: string;
  name: string;
  category: string;
  dietary: string[];
  allergens: string[];
  nutrition: Nutrition;
}
```

### Nutrition

```typescript
interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}
```

### User Preferences

```typescript
interface UserPreferences {
  dietary: string[];
  allergies: string[];
  cuisine: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  cooking_time: number;
  servings: number;
  budget: 'low' | 'medium' | 'high';
}
```

## Examples

### Complete Meal Generation Flow

```javascript
// 1. Authenticate
const authResponse = await fetch('/api/v2/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

const {
  data: { token },
} = await authResponse.json();

// 2. Generate meals
const mealResponse = await fetch('/api/v2/meals/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    preferences: {
      dietary: ['vegetarian'],
      allergies: ['nuts'],
      cuisine: ['italian'],
      difficulty: 'easy',
      cooking_time: 30,
      servings: 4,
    },
  }),
});

const {
  data: { meals },
} = await mealResponse.json();

// 3. Get meal details
const mealDetails = await Promise.all(
  meals.map(meal =>
    fetch(`/api/v2/meals/${meal.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.json())
  )
);
```

### Error Handling

```javascript
try {
  const response = await fetch('/api/v2/meals');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error('API Error:', error.message);
}
```

## SDKs

### JavaScript/TypeScript

```bash
npm install @whats-for-dinner/api-client
```

```javascript
import { WhatsForDinnerAPI } from '@whats-for-dinner/api-client';

const api = new WhatsForDinnerAPI({
  baseURL: 'https://api.whats-for-dinner.com',
  token: 'your-jwt-token',
});

// Generate meals
const meals = await api.meals.generate({
  preferences: {
    dietary: ['vegetarian'],
    difficulty: 'easy',
  },
});
```

### Python

```bash
pip install whats-for-dinner-api
```

```python
from whats_for_dinner import WhatsForDinnerAPI

api = WhatsForDinnerAPI(
    base_url='https://api.whats-for-dinner.com',
    token='your-jwt-token'
)

# Generate meals
meals = api.meals.generate({
    'preferences': {
        'dietary': ['vegetarian'],
        'difficulty': 'easy'
    }
})
```

### PHP

```bash
composer require whats-for-dinner/api-client
```

```php
use WhatsForDinner\API\Client;

$api = new Client([
    'base_url' => 'https://api.whats-for-dinner.com',
    'token' => 'your-jwt-token'
]);

// Generate meals
$meals = $api->meals->generate([
    'preferences' => [
        'dietary' => ['vegetarian'],
        'difficulty' => 'easy'
    ]
]);
```

## Webhooks

The API supports webhooks for real-time notifications:

### Available Events

- `meal.generated`: When a new meal is generated
- `meal.updated`: When a meal is updated
- `meal.deleted`: When a meal is deleted
- `user.registered`: When a new user registers
- `meal_plan.created`: When a meal plan is created

### Webhook Configuration

```http
POST /api/v2/webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks",
  "events": ["meal.generated", "meal.updated"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload

```json
{
  "event": "meal.generated",
  "data": {
    "id": "uuid",
    "name": "Vegetarian Pasta",
    "user_id": "uuid"
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Webhook Verification

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}
```

---

For more information, visit our [documentation](https://docs.whats-for-dinner.com) or [GitHub repository](https://github.com/your-org/whats-for-dinner).
