# Security & Privacy

## Backend Security Implementation

### Authentication

- **JWT Verification**: All API routes verify Supabase JWT tokens
- **Token Extraction**: From `Authorization: Bearer <token>` header
- **Role Claims**: Extract user role from JWT `user_metadata.role`
- **Plan Enforcement**: Middleware checks subscription plan (premium/partner features)

### Authorization

- **Row Level Security (RLS)**: All tables enforce RLS policies
- **Policy Evaluation**: Uses `auth.uid()` from JWT claims
- **Membership Checks**: Household membership verified in policies
- **Admin Override**: Admins (role claim) can access all data

### Input Validation

- **Zod Schemas**: All request bodies validated with Zod
- **Reject Unknown**: Zod configured to reject unknown keys
- **Sanitization**: String inputs sanitized (trim, escape)
- **Type Safety**: TypeScript + Zod ensures type correctness

### Rate Limiting

- **Token Bucket**: Redis-based rate limiting (token bucket algorithm)
- **Per-User Limits**: Limits enforced per IP + user ID
- **Default**: 100 requests per 60 seconds
- **Headers**: `X-RateLimit-*` headers in responses
- **429 Response**: Too many requests returns 429 with retry-after

### CSRF Protection

- **Double-Submit Cookie**: For web form POSTs
- **Header Validation**: API routes check `X-CSRF-Token` header
- **SameSite Cookies**: Enforced `SameSite=Lax` for cookies
- **Token Generation**: Secure random tokens (32 bytes hex)

### CORS

- **Allowed Origins**: Configurable via `CORS_ORIGINS` env var
- **Credentials**: Supports credentialed requests
- **Preflight Cache**: 24-hour cache for OPTIONS requests
- **Headers**: Allows `Content-Type`, `Authorization`, `X-CSRF-Token`

### Security Headers

All responses include security headers (via `helmet.ts`):

- **Content-Security-Policy**: Restricts resource loading
- **X-Frame-Options**: `DENY` (prevents clickjacking)
- **X-Content-Type-Options**: `nosniff`
- **X-XSS-Protection**: `1; mode=block`
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Permissions-Policy**: Restricts browser features
- **Strict-Transport-Security**: HSTS in production

### Webhook Security

- **HMAC Verification**: All webhooks verified with HMAC-SHA256
- **Signature Header**: `X-Nomad-Signature` contains HMAC
- **Secret Rotation**: Webhook secrets rotatable via env vars
- **Idempotency**: Webhook events tracked to prevent duplicates

### SQL Injection Prevention

- **Parameterized Queries**: All queries use Drizzle ORM (parameterized)
- **No Raw Concatenation**: Never concatenate user input into SQL
- **Type Safety**: Drizzle ensures type-safe queries

### Body Size Limits

- **Max Body Size**: 1MB limit enforced
- **413 Response**: Payload too large returns 413
- **Content-Length Check**: Validated before parsing

## Privacy

### Data Minimization

- **No PHI**: No protected health information stored
- **No Medical Claims**: App does not make medical/health claims
- **Minimal Collection**: Only collect data necessary for features

### Consent Management

- **Consent Gates**: Ads/analytics disabled until user accepts
- **Granular Consent**: Separate consent for ads, analytics, sharing
- **Withdraw Consent**: Users can withdraw consent at any time

### Parental Controls

- **Household Owner Controls**: Parents can manage child accounts
- **DM Restrictions**: Block DMs to non-household members (for minors)
- **Leaderboard Opt-In**: Minors require opt-in for leaderboards
- **Notification Restrictions**: Restrict late-night notifications

### Data Erasure

- **Delete Endpoint**: `DELETE /api/user/me` schedules erasure
- **GDPR Compliance**: Full data export + deletion
- **CPRA Compliance**: California Privacy Rights Act compliant
- **Export Job**: Data export generated before deletion

### Logging & PII

- **PII Redaction**: Pino logger redacts passwords, tokens, emails
- **No PII in Logs**: Never log full email addresses or passwords
- **Trace IDs Only**: OpenTelemetry traces use IDs, not PII

### Encryption

- **TLS Only**: All connections use TLS (Supabase managed)
- **At Rest**: Supabase encrypts data at rest
- **API Keys**: Hashed with bcrypt before storage

## Compliance

### GDPR

- **Right to Access**: Export user data via API
- **Right to Erasure**: Delete user data on request
- **Data Portability**: Export in machine-readable format
- **Consent Management**: Track and honor consent

### CPRA

- **California Residents**: Extended privacy rights
- **Opt-Out**: Right to opt-out of data sharing
- **Do Not Sell**: No sale of personal information

### COPPA

- **Age Verification**: Users under 13 require parental consent
- **Parental Controls**: Household owners can manage child accounts
- **Limited Data Collection**: Minimal data for minors

## Secret Management

### Environment Variables

- **Never Commit**: `.env.local` in `.gitignore`
- **Secret Rotation**: Rotate secrets regularly (quarterly)
- **Separate Environments**: Different secrets for dev/staging/prod

### Webhook Secrets

**Rotation Procedure:**
1. Generate new secret: `openssl rand -hex 32`
2. Update `WEBHOOK_SECRET_PARTNER` in env
3. Update partner configuration with new secret
4. Old secret valid for grace period (24h)
5. Remove old secret after grace period

**If Compromised:**
1. Immediately rotate secret (see above)
2. Review webhook logs for unauthorized access
3. Revoke affected API keys if necessary
4. Audit webhook processing for tampering

### API Key Rotation

1. Generate new keys via partner portal
2. Update `api_keys` table with new hashes
3. Grace period: Both old and new keys work (24h)
4. Deprecate old keys after grace period

## Incident Response

### Security Breach

1. **Contain**: Rotate all secrets immediately
2. **Investigate**: Review access logs and audit trails
3. **Notify**: Inform affected users (if PII exposed)
4. **Remediate**: Fix vulnerability and deploy patch
5. **Post-Mortem**: Document incident and prevent recurrence

### Data Breach

1. **Assess**: Determine scope of exposed data
2. **Notify**: GDPR requires notification within 72 hours
3. **Remediate**: Rotate credentials and patch systems
4. **Monitor**: Enhanced monitoring for suspicious activity

## Testing

### Security Tests

- **RLS Tests**: Verify data isolation between users
- **Auth Tests**: Verify unauthorized access blocked
- **Rate Limit Tests**: Verify rate limiting works
- **CSRF Tests**: Verify CSRF protection works
- **Input Validation**: Test malicious inputs rejected

### Penetration Testing

- **Regular Audits**: Quarterly security audits
- **Bug Bounty**: Consider bug bounty program
- **External Audits**: Annual third-party security audits

## Monitoring

### Security Monitoring

- **Failed Auth**: Alert on spike in 401 responses
- **Rate Limit Hits**: Alert on excessive rate limiting
- **Suspicious Activity**: ML-based anomaly detection
- **Webhook Failures**: Alert on webhook verification failures

### Audit Logging

- **All Actions Logged**: User actions logged with user ID
- **Admin Actions**: Special logging for admin operations
- **Webhook Events**: All webhook events logged
- **Data Access**: Log access to sensitive data

## Best Practices

1. **Principle of Least Privilege**: Users only access their own data
2. **Defense in Depth**: Multiple layers of security
3. **Fail Secure**: Default to deny, not allow
4. **Regular Updates**: Keep dependencies updated
5. **Security Headers**: Always include security headers
6. **Input Validation**: Validate and sanitize all inputs
7. **Error Handling**: Never expose internal errors to clients
8. **Logging**: Log security events, not sensitive data
