# Edge Functions Documentation

## Overview

This document describes the Supabase Edge Functions in this repository and their RLS (Row Level Security) policies.

## Edge Functions

### 1. `app-health`
**Purpose:** Health check endpoint for monitoring  
**RLS:** Public read access  
**Rate Limiting:** 60 requests/minute per IP

### 2. `search-ai`
**Purpose:** AI-powered search functionality  
**RLS:** Authenticated users only  
**Rate Limiting:** 30 requests/minute per user

### 3. `webhook-ingest`
**Purpose:** Ingest webhook events  
**RLS:** Service role only (internal)  
**Rate Limiting:** 100 requests/minute per source

### 4. `ingest-events`
**Purpose:** Ingest analytics events  
**RLS:** Authenticated users + service role  
**Rate Limiting:** 100 requests/minute per user

### 5. `job-processor`
**Purpose:** Background job processing  
**RLS:** Service role only (internal)  
**Rate Limiting:** N/A (internal only)

### 6. `generate-meal`
**Purpose:** Generate meal suggestions  
**RLS:** Authenticated users only  
**Rate Limiting:** 20 requests/minute per user

### 7. `api`
**Purpose:** General API endpoint  
**RLS:** Varies by route  
**Rate Limiting:** 60 requests/minute per IP

## Input Validation

All edge functions use Zod for input validation. Example:

```typescript
import { z } from 'https://esm.sh/zod@3.22.4';

const schema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(100).default(10),
});

const body = await req.json();
const validated = schema.parse(body);
```

## Rate Limiting

Rate limiting is implemented using Supabase Edge Functions rate limiting middleware. Limits are enforced per user/IP as specified above.

## Security Best Practices

1. **Always validate input** using Zod schemas
2. **Use RLS policies** to restrict data access
3. **Implement rate limiting** to prevent abuse
4. **Sanitize logs** - never log sensitive data
5. **Use service role** only for internal functions
6. **Set timeouts** - default 30s, adjust as needed
7. **Limit body size** - default 1MB, adjust as needed

## Cold Start Optimization

- Keep dependencies minimal
- Use edge-compatible libraries
- Avoid heavy initialization
- Cache frequently used data

## Monitoring

All edge functions log to Supabase logs. Monitor:
- Execution time
- Error rates
- Rate limit hits
- Cold start frequency
