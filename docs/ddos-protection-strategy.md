# DDoS Protection Strategy

## Overview
This document outlines the DDoS (Distributed Denial of Service) protection strategy for What's for Dinner application.

## Current Status
- [x] Rate limiting implemented
- [x] Vercel Edge Network protection
- [ ] Cloudflare integration (optional)
- [ ] DDoS monitoring configured

## Protection Layers

### 1. Infrastructure-Level (Vercel)

Vercel provides built-in DDoS protection:
- **Automatic DDoS mitigation** via edge network
- **Rate limiting** at CDN level
- **Geographic filtering** (if configured)
- **SSL/TLS termination** with DDoS protection

### 2. Application-Level

#### Rate Limiting
We have implemented rate limiting in `apps/web/src/lib/rate-limiting.ts`:

```typescript
// Apply rate limiting to API routes
import { rateLimiters } from '@/lib/rate-limiting';

// In API route handler
const rateLimitResult = await rateLimiters.standard(req);
if (rateLimitResult) {
  return rateLimitResult; // Returns 429 if limit exceeded
}
```

#### Request Validation
- Validate all input
- Reject malformed requests early
- Limit request size
- Timeout long-running requests

### 3. Network-Level (Optional)

#### Cloudflare Integration
If using Cloudflare:
1. Point DNS to Cloudflare
2. Enable DDoS protection
3. Configure WAF rules
4. Set up rate limiting rules

## Implementation

### API Route Protection

```typescript
// apps/web/src/app/api/dinner/route.ts
import { rateLimiters } from '@/lib/rate-limiting';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimiters.recipeGeneration(req);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  // Validate request
  const body = await req.json();
  if (!isValidRequest(body)) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }

  // Process request
  // ...
}
```

### Middleware Protection

```typescript
// apps/web/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimiters } from '@/lib/rate-limiting';

export async function middleware(request: NextRequest) {
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitResult = await rateLimiters.standard(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

## Monitoring

### Metrics to Monitor
- Request rate (requests per second)
- Error rate (429 responses)
- Response times
- Bandwidth usage
- Geographic distribution of requests

### Alert Thresholds
```typescript
// Alert if:
// - Request rate > 1000 req/s for > 5 minutes
// - Error rate > 50% for > 2 minutes
// - Response time p95 > 5 seconds for > 5 minutes
```

### Vercel Analytics
Monitor via Vercel dashboard:
1. Go to Analytics ? Traffic
2. Monitor request volume
3. Check for unusual spikes
4. Review geographic distribution

## Response Procedures

### Detection
1. Monitor metrics dashboard
2. Receive alert notification
3. Verify attack (vs. legitimate traffic spike)
4. Assess impact

### Mitigation
1. **Automatic**: Vercel handles most attacks automatically
2. **Manual**: If needed:
   - Temporarily increase rate limits for legitimate users
   - Block specific IP ranges (if using Cloudflare)
   - Enable challenge/response (CAPTCHA) for suspicious traffic

### Recovery
1. Monitor traffic returning to normal
2. Verify application functionality
3. Document incident
4. Review and improve defenses

## Testing

### Load Testing
```bash
# Test application under load
ab -n 10000 -c 100 https://whats-for-dinner.vercel.app/api/health

# Monitor:
# - Response times
# - Error rates
# - Rate limiting behavior
```

### Stress Testing
```bash
# Simulate DDoS attack
# Use tools like:
# - Apache Bench (ab)
# - wrk
# - k6

# Example with k6:
k6 run --vus 1000 --duration 5m stress-test.js
```

## Best Practices

### 1. Defense in Depth
- Multiple layers of protection
- Don't rely on single defense
- Monitor all layers

### 2. Fail Gracefully
```typescript
// Handle rate limit errors gracefully
try {
  const result = await rateLimiters.standard(req);
  if (result) return result;
} catch (error) {
  // Log error but don't crash
  console.error('Rate limiting error:', error);
  // Return 503 Service Unavailable
  return NextResponse.json(
    { error: 'Service temporarily unavailable' },
    { status: 503 }
  );
}
```

### 3. User Communication
If legitimate users are affected:
- Show clear error messages
- Suggest retry after delay
- Provide support contact

### 4. Regular Review
- Review rate limit thresholds monthly
- Adjust based on traffic patterns
- Update protection rules as needed

## Cloudflare Setup (Optional)

### If Using Cloudflare
1. **Sign up**: Create Cloudflare account
2. **Add domain**: Add whats-for-dinner.com
3. **Change nameservers**: Update DNS
4. **Configure protection**:
   - Enable "Under Attack" mode if needed
   - Configure WAF rules
   - Set up rate limiting
   - Enable DDoS protection

### WAF Rules Example
```
(http.request.uri.path contains "/api/") and 
(http.request.method eq "POST") and 
(rate limit exceeded)
? Block request
```

## Cost Considerations

### Vercel
- **Included**: Basic DDoS protection included
- **Additional**: Enterprise features (custom)

### Cloudflare
- **Free tier**: Basic DDoS protection
- **Pro**: $20/month (enhanced protection)
- **Business**: $200/month (advanced features)

### Recommendation
- Start with Vercel's built-in protection
- Monitor for attacks
- Upgrade to Cloudflare if needed

## Incident Response Plan

### Phase 1: Detection (0-5 minutes)
- Automated monitoring detects anomaly
- Alert sent to team
- Verify attack vs. legitimate traffic

### Phase 2: Assessment (5-10 minutes)
- Assess attack severity
- Identify attack type
- Determine affected services

### Phase 3: Mitigation (10-30 minutes)
- Activate protection measures
- Monitor effectiveness
- Adjust if needed

### Phase 4: Recovery (30+ minutes)
- Traffic returns to normal
- Verify services restored
- Document incident
- Review and improve

## Next Steps
1. Configure rate limiting on all API routes
2. Set up DDoS monitoring alerts
3. Document incident response procedures
4. Test load handling capacity
5. Consider Cloudflare if needed
