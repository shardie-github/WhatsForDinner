# Security & Privacy Surface Analysis

**Generated:** 2025-01-27  
**Scope:** Environment hygiene, PII flow, threat modeling, log redaction

## Top 5 Plausible Threats

### 1. Secret Leakage via Environment Variables
**Threat:** Hardcoded secrets, exposed env vars in logs, secrets in version control  
**Likelihood:** Medium | **Impact:** High  
**Current State:**
- ✅ `.env.example` has 300+ vars documented
- ⚠️ No validation schema for secrets
- ⚠️ No automated secret scanning in CI (script exists but not enforced)
- ⚠️ No secret rotation policy

**Mitigation:**
- Add Zod schema for env validation
- Enforce secret scanning in CI (fail on secrets)
- Add secret rotation policy
- Use secret management service (Vercel Secrets, AWS Secrets Manager)

**Files:**
- `.env.example` - Well-documented but needs validation
- `scripts/secrets-scan.mjs` - Exists but not enforced in CI
- `.github/workflows/ci-cd.yml` - Has secret scan but `continue-on-error: true`

### 2. SQL Injection via Unvalidated Inputs
**Threat:** User input directly in SQL queries, RLS policy bypass  
**Likelihood:** Low | **Impact:** High  
**Current State:**
- ✅ Using Supabase client (parameterized queries)
- ⚠️ No input validation schemas (Zod)
- ⚠️ No query parameter validation
- ⚠️ RLS policies not fully documented/tested

**Mitigation:**
- Add Zod schemas for all API inputs
- Add input validation middleware
- Test RLS policies
- Add query parameter sanitization

**Files:**
- `apps/web/src/app/api/**` - All API routes need validation
- `packages/server/src/db/**` - Database queries
- `supabase/migrations/**` - RLS policies

### 3. Authentication Bypass via Token Manipulation
**Threat:** JWT token tampering, expired token reuse, session hijacking  
**Likelihood:** Low | **Impact:** High  
**Current State:**
- ✅ Using Supabase Auth (managed JWT)
- ⚠️ No explicit token refresh logic documented
- ⚠️ No session management documentation
- ⚠️ No token validation middleware

**Mitigation:**
- Document token refresh flow
- Add token validation middleware
- Add session management documentation
- Implement token rotation

**Files:**
- `packages/server/src/auth/**` - Authentication logic
- `apps/web/src/app/api/auth/**` - Auth endpoints

### 4. Payment Processing Vulnerabilities
**Threat:** Webhook signature bypass, duplicate charges, refund abuse  
**Likelihood:** Low | **Impact:** High  
**Current State:**
- ✅ Stripe webhook endpoint exists
- ⚠️ No documented webhook signature validation
- ⚠️ No idempotency keys for payments
- ⚠️ No payment error handling documented

**Mitigation:**
- Document webhook signature validation
- Add idempotency keys for all payment operations
- Add payment error handling
- Add payment audit logging

**Files:**
- `apps/web/src/app/api/stripe/webhook/route.ts` - Webhook handler
- `apps/web/src/app/api/billing/**` - Billing endpoints

### 5. Data Leakage via Logs/Errors
**Threat:** PII in logs, sensitive data in error messages, stack traces exposed  
**Likelihood:** Medium | **Impact:** Medium  
**Current State:**
- ✅ Using Sentry for error tracking
- ⚠️ No log redaction policy
- ⚠️ No PII filtering in logs
- ⚠️ No error message sanitization

**Mitigation:**
- Add log redaction middleware
- Filter PII from logs (email, phone, addresses)
- Sanitize error messages
- Add audit logging for sensitive operations

**Files:**
- `packages/server/src/observability/**` - Logging system
- `apps/web/src/app/api/**` - Error handling

## Environment & Secret Hygiene

### Current State

**Environment Variables:** 300+ variables in `.env.example`

**Categories:**
1. **Supabase** (10 vars) - Database, auth, JWT
2. **Redis** (1 var) - Queue/cache
3. **OpenAI** (4 vars) - AI API
4. **Stripe** (4 vars) - Payment processing
5. **Email/CRM** (5 vars) - SendGrid, Klaviyo
6. **Partner Revenue** (7 vars) - Affiliate system
7. **Observability** (10 vars) - Sentry, PostHog, Prometheus
8. **RegTech** (10 vars) - GDPR, DSAR, privacy
9. **Backup/DR** (5 vars) - Backup storage, encryption
10. **Misc** (240+ vars) - Feature flags, config, etc.

### Issues Found

1. **Missing Validation**
   - No Zod schema for env vars
   - No startup validation
   - Runtime errors only

2. **Secret Management**
   - No secret rotation policy
   - No secret management service
   - Manual configuration only

3. **Unused Secrets**
   - No audit of unused secrets
   - May have deprecated secrets

4. **Hardcoded Tokens**
   - No automated scanning (script exists but not enforced)
   - No pre-commit hook

### Recommendations

1. **Add Environment Validation** (HIGH PRIORITY)
   ```typescript
   // packages/config/src/env.ts (NEW)
   import { z } from 'zod';
   
   const envSchema = z.object({
     NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
     SUPABASE_SERVICE_ROLE_KEY: z.string().min(32),
     // ... all env vars
   });
   
   export const env = envSchema.parse(process.env);
   ```

2. **Enforce Secret Scanning** (HIGH PRIORITY)
   - Update CI workflow to fail on secrets
   - Add pre-commit hook
   - Add secret scanning in PRs

3. **Secret Rotation Policy**
   - Document rotation schedule
   - Add rotation scripts
   - Add secret management service

4. **Audit Unused Secrets**
   - Scan codebase for secret usage
   - Remove unused secrets
   - Document required vs optional

## PII Flow Analysis

### PII Data Classification

| Data Type | Location | Storage | Access | Retention |
|-----------|----------|---------|--------|-----------|
| **Email** | `profiles`, `analytics_events` | Supabase | Auth required | GDPR compliant |
| **Name** | `profiles.name` | Supabase | Auth required | GDPR compliant |
| **Payment Info** | Stripe (not stored) | Stripe API | Stripe webhook | Per Stripe policy |
| **Preferences** | `profiles.preferences` (JSONB) | Supabase | Auth required | GDPR compliant |
| **Analytics Data** | `analytics_events` | Supabase | Service role | GDPR compliant |
| **Session Data** | Supabase Auth | Supabase | Auth required | Session expiry |

### PII Flow Map

1. **User Registration**
   - Input: Email, name
   - Storage: `profiles` table (Supabase)
   - Access: User (RLS), Admin (service role)
   - Logging: ⚠️ May log email in registration flow

2. **Payment Processing**
   - Input: Payment method (Stripe)
   - Storage: Stripe (not in app DB)
   - Access: Stripe webhook, user (via Stripe)
   - Logging: ⚠️ May log payment IDs

3. **Analytics Events**
   - Input: User actions, page views
   - Storage: `analytics_events` table
   - Access: Service role (analytics), User (own data via RLS)
   - Logging: ⚠️ May include PII in event properties

4. **GDPR/DSAR Requests**
   - Input: User email, verification
   - Storage: `dsar_requests` table (if exists)
   - Access: Privacy officer, user (verification)
   - Logging: ⚠️ May log DSAR requests

### Log Redaction Needs

**Files Needing Redaction:**
- `packages/server/src/observability/**` - Logging system
- `apps/web/src/app/api/**` - Error logging
- `packages/server/src/jobs/**` - Job logging

**Fields to Redact:**
- Email addresses
- Phone numbers
- Payment card numbers (should not be logged)
- JWT tokens (should not be logged)
- API keys (should not be logged)
- User IDs (may need pseudonymization)

**Recommendation:**
```typescript
// Add log redaction middleware
function redactPII(data: any): any {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
  
  return JSON.stringify(data).replace(emailRegex, '[REDACTED]')
    .replace(phoneRegex, '[REDACTED]');
}
```

## CORS Configuration

**Status:** ⚠️ **CORS configured but needs review**

**Location:** `.env.example:158`
```
CORS_ORIGINS=http://localhost:3000,https://whats-for-dinner.vercel.app
```

**Issues:**
- No CORS middleware configuration found
- No explicit CORS headers in Next.js config
- May be too permissive

**Recommendation:**
- Add CORS middleware
- Configure allowed origins per environment
- Add CORS validation tests

## Security Headers

**Status:** ✅ **Some headers configured**

**Location:** `apps/web/next.config.ts:104-148`

**Headers Configured:**
- `Cache-Control` - Static assets
- `X-DNS-Prefetch-Control` - DNS prefetch
- `X-Frame-Options: SAMEORIGIN` - Clickjacking protection

**Missing Headers:**
- `Content-Security-Policy` (CSP)
- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Permissions-Policy`

**Recommendation:**
```typescript
// Add to next.config.ts
headers: [
  {
    source: '/:path*',
    headers: [
      { key: 'Content-Security-Policy', value: "default-src 'self'" },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ],
  },
]
```

## Minimal Policy/Test Proposals

### 1. Secret Scanning Policy
**File:** `.github/workflows/security.yml` (UPDATE)
```yaml
- name: Secrets scan
  run: node scripts/secrets-scan.mjs --check
  # Remove continue-on-error: true
```

### 2. Environment Validation Test
**File:** `packages/config/src/env.test.ts` (NEW)
```typescript
import { envSchema } from './env';
import { describe, it, expect } from 'vitest';

describe('Environment Validation', () => {
  it('should validate required env vars', () => {
    expect(() => envSchema.parse(process.env)).not.toThrow();
  });
});
```

### 3. RLS Policy Tests
**File:** `packages/testing/rls/rls-policies.spec.ts` (NEW)
```typescript
// Test RLS policies for each table
describe('RLS Policies', () => {
  it('should enforce user-scoped access to profiles', async () => {
    // Test RLS policy
  });
});
```

### 4. Input Validation Tests
**File:** `apps/web/src/app/api/**/*.test.ts` (NEW)
```typescript
// Test input validation for each endpoint
describe('API Input Validation', () => {
  it('should validate request body', async () => {
    // Test Zod schema validation
  });
});
```

### 5. Log Redaction Tests
**File:** `packages/server/src/observability/redaction.test.ts` (NEW)
```typescript
describe('Log Redaction', () => {
  it('should redact email addresses', () => {
    const log = { email: 'user@example.com' };
    expect(redactPII(log)).not.toContain('user@example.com');
  });
});
```

## Summary

### Critical Issues
1. ❌ **No environment validation** (runtime errors only)
2. ⚠️ **Secret scanning not enforced** (CI allows failures)
3. ⚠️ **No log redaction** (PII may be logged)
4. ⚠️ **Missing security headers** (CSP, HSTS, etc.)
5. ⚠️ **No input validation** (SQL injection risk)

### High Priority Fixes
1. Add environment validation (Zod schema)
2. Enforce secret scanning in CI
3. Add log redaction middleware
4. Add security headers (CSP, HSTS)
5. Add input validation (Zod schemas)

### Medium Priority Fixes
1. Add RLS policy tests
2. Add payment idempotency keys
3. Add token validation middleware
4. Add CORS validation
5. Document PII flow map
