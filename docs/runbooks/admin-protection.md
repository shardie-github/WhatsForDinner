# Admin Dashboard Protection Guide

## Overview

Admin dashboards at `/admin/*` routes require protection to prevent unauthorized access. This guide documents the protection methods available.

## Protection Methods

### Option 1: Vercel Access Controls (Recommended for Vercel deployments)

Vercel provides built-in access controls that can be configured via the Vercel dashboard.

**Setup Steps:**

1. Navigate to Vercel Dashboard → Your Project → Settings → Access Control
2. Add IP allowlist or team member restrictions
3. Configure for `/admin/*` paths

**Documentation:**
- [Vercel Access Controls](https://vercel.com/docs/security/access-control)

**Note:** This is the recommended approach for Vercel-hosted applications as it provides enterprise-grade protection without code changes.

### Option 2: Basic Authentication Middleware

For non-Vercel deployments or additional protection, Basic Auth middleware can be implemented.

**Implementation:**

The middleware reads credentials from the `ADMIN_BASIC_AUTH` secret (configured in `ops.config.json`).

**Secret Format:**
```
username:password
```

**Base64 Encoded:**
The secret should be base64 encoded: `base64(username:password)`

**Example Middleware** (Next.js App Router):

```typescript
// middleware.ts or app/admin/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.ADMIN_BASIC_AUTH;
    
    if (!expectedAuth) {
      return NextResponse.json(
        { error: 'Admin access not configured' },
        { status: 503 }
      );
    }
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
      });
    }
    
    const encoded = authHeader.split(' ')[1];
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    
    if (decoded !== expectedAuth) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Area"',
        },
      });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
```

**Security Notes:**
- Never commit the `ADMIN_BASIC_AUTH` secret value
- Use strong passwords
- Rotate credentials regularly
- Consider using environment-specific credentials

## Current Implementation Status

**Check:** Review `apps/web/src/app/admin/` directory for existing protection.

**If Protected:** Document the protection method here.

**If Not Protected:** Implement one of the above methods.

## Verification

After implementing protection:

1. **Test Unauthorized Access:**
   ```bash
   curl https://your-domain.com/admin/metrics
   # Should return 401 Unauthorized
   ```

2. **Test Authorized Access:**
   ```bash
   curl -u username:password https://your-domain.com/admin/metrics
   # Should return dashboard data
   ```

3. **Verify Secret Configuration:**
   - Ensure `ADMIN_BASIC_AUTH` is set in environment variables
   - Verify secret is not committed to repository
   - Test in staging before production

## Best Practices

1. **Use Strong Credentials:** Generate random, complex passwords
2. **Rotate Regularly:** Change credentials quarterly or after team changes
3. **Monitor Access:** Log admin access attempts
4. **Limit IPs:** If possible, restrict to known IP addresses
5. **Use HTTPS:** Always use HTTPS for admin routes
6. **Audit Logs:** Keep audit logs of admin access

## Related Documentation

- [Security Best Practices](../SECURITY_PRIVACY.md)
- [Secrets Management Guide](../secrets.md)
- [Configuration Reference](../../ops.config.json)

---

**Last Updated:** {{ timestamp }}  
**Owner:** DevOps Team
