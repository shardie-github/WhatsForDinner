# API Documentation

## Overview

This application uses Supabase as the backend, providing REST APIs and Edge Functions.

## Base URL

- **Supabase REST API**: `https://<project-ref>.supabase.co/rest/v1/`
- **Edge Functions**: `https://<project-ref>.supabase.co/functions/v1/`

## Authentication

All API requests require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Core Endpoints

### Health Check

```http
GET /functions/v1/healthcheck
```

Returns service health status.

**Response:**
```json
{
  "ok": true,
  "service": "healthcheck",
  "ts": "2024-01-01T00:00:00.000Z",
  "version": "dev"
}
```

### Profile Sync (Edge Function)

```http
POST /functions/v1/profile-sync
```

Synchronizes user profile after authentication.

**Request Body:**
```json
{
  "record": {
    "id": "user-uuid",
    "email": "user@example.com",
    "user_metadata": {
      "full_name": "John Doe",
      "avatar_url": "https://..."
    }
  }
}
```

## Database Tables

### Profiles

- **Table**: `public.profiles`
- **RLS**: Enabled (users can only access their own profile)

**Columns:**
- `user_id` (uuid, primary key)
- `email` (text)
- `full_name` (text)
- `avatar_url` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Push Tokens

- **Table**: `public.push_tokens`
- **RLS**: Enabled (users can only manage their own tokens)

**Columns:**
- `id` (bigserial, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `token` (text, unique)
- `platform` (text: 'ios'|'android'|'web')
- `created_at` (timestamptz)

### App Settings

- **Table**: `public.app_settings`
- **RLS**: Enabled

**Columns:**
- `id` (boolean, primary key, default true)
- `maintenance_mode` (boolean, default false)
- `version` (text, default '0.1.0')
- `updated_at` (timestamptz)

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": "Additional details if available"
}
```

**Status Codes:**
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (RLS violation)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are rate-limited. Check response headers:
- `x-ratelimit-limit`: Maximum requests per window
- `x-ratelimit-remaining`: Remaining requests
- `x-ratelimit-reset`: Reset time (Unix timestamp)

## SDK Usage

### React Native (Expo)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

// Fetch profile
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .single();
```

## Webhooks

### Profile Sync Webhook

Configure in Supabase Dashboard:
- **Event**: `auth.users` - `INSERT`
- **URL**: `https://<project-ref>.supabase.co/functions/v1/profile-sync`
