# Security Checklist

**Purpose**: Comprehensive security controls and verification steps for the What's for Dinner application.  
**Audience**: Security team, DevOps, developers  
**Review Frequency**: Before each release, quarterly audits

---

## PRE-DEPLOYMENT CHECKS

### Authentication & Authorization

- [ ] **RLS Policies Enabled**: All user-scoped tables have RLS enabled
  ```bash
  npm run rls:test
  ```
  - Verify: `users`, `households`, `meal_plans`, `recipes`, `grocery_lists`, `health_metrics`

- [ ] **Service Role Key Protection**: Service role key never exposed to client
  ```bash
  npm run secrets:scan
  ```
  - Verify: No `SUPABASE_SERVICE_ROLE_KEY` in client bundles
  - Verify: Key stored in Supabase Vault or Vercel env vars only

- [ ] **Auth Middleware Applied**: All protected routes use `getTenantContext()` or similar
  - Check: `/apps/web/src/app/api/**/*.ts` routes
  - Verify: No direct database access without auth checks

- [ ] **MFA Enforcement**: MFA required for sensitive operations
  - Verify: `privacy_prefs.mfa_required` enforced on account changes
  - Verify: `MfaEnforcedSession` table used for sensitive actions

---

### Secrets Management

- [ ] **No Secrets in Code**: All secrets in environment variables or Supabase Vault
  ```bash
  npm run secrets:scan --check
  ```
  - Verify: No API keys, passwords, or tokens hardcoded
  - Verify: `.env` files in `.gitignore`

- [ ] **Secrets Rotation**: Critical secrets rotated quarterly
  ```bash
  npm run ops:rotate-secrets
  ```
  - Rotate: `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `OPENAI_API_KEY`
  - Document rotation date in secrets vault

- [ ] **Secrets Validation**: Required secrets present in all environments
  ```bash
  npm run secrets:validate
  ```
  - Verify: Production, staging, preview environments

- [ ] **Client-Side Secrets**: Only public keys exposed to client
  - Verify: `NEXT_PUBLIC_*` vars are safe to expose
  - Verify: No `sk_*`, `whsec_*`, or service role keys in client code

---

### Input Validation & Injection Prevention

- [ ] **Zod Schemas**: All API inputs validated with Zod
  - Check: `/apps/web/src/app/api/**/route.ts` files
  - Verify: No `req.json()` without schema validation

- [ ] **SQL Injection Prevention**: No raw SQL with user input
  ```bash
  grep -r "query\|execute\|raw" apps/web/src --include="*.ts" | grep -v "supabase\|prisma"
  ```
  - Verify: All database access via Supabase client or Prisma
  - Verify: RPC functions use parameterized queries

- [ ] **XSS Prevention**: User-generated content sanitized
  - Verify: React auto-escapes by default
  - Verify: `dangerouslySetInnerHTML` only used with sanitization
  - Verify: Content Security Policy headers (`next.config.ts`)

- [ ] **CSRF Protection**: State-changing operations protected
  - Verify: `withCSRFProtection` applied to POST/PUT/DELETE routes
  - Verify: SameSite cookie settings

---

### API Security

- [ ] **Rate Limiting**: All public APIs have rate limits
  - Check: `/apps/web/src/app/api/**/route.ts`
  - Verify: `withRateLimit` applied (especially OpenAI endpoints)
  - Verify: Per-user limits where applicable

- [ ] **CORS Configuration**: CORS headers properly configured
  - Verify: `CORS_ORIGINS` env var set
  - Verify: No wildcard `*` origins in production

- [ ] **API Authentication**: All protected endpoints require auth
  - Verify: No public access to user data endpoints
  - Verify: API keys validated for partner endpoints (`ApiKey` table)

- [ ] **Webhook Security**: Webhook signatures verified
  - Verify: Stripe webhook signature validation (`/api/stripe/webhook`)
  - Verify: Partner webhook HMAC validation (`/api/_sandbox/partner-webhook`)

---

### Data Protection

- [ ] **PII Redaction**: Sensitive data not logged
  - Verify: Pino logger redaction config (`packages/server/src/observability/index.ts`)
  - Verify: Redacts `email`, `password`, `token`, `*.password`, `*.token`

- [ ] **Encryption at Rest**: Database encryption enabled
  - Verify: Supabase encryption at rest (default)
  - Verify: Backup encryption (`BACKUP_ENCRYPTION_KEY` set)

- [ ] **Encryption in Transit**: TLS/HTTPS enforced
  - Verify: All API endpoints use HTTPS
  - Verify: Database connections use SSL (`?sslmode=require`)

- [ ] **Data Retention**: Retention policies enforced
  ```bash
  npm run retention:preview
  ```
  - Verify: `privacy_prefs.data_retention_days` respected
  - Verify: Automated cleanup jobs run (`npm run retention:run`)

---

### Privacy & Compliance

- [ ] **DSAR Compliance**: Data Subject Access Requests handled
  - Verify: `/api/privacy/export` endpoint works
  - Verify: `/api/privacy/erase` endpoint works
  - Verify: DSAR deadline alerts configured (`DsarRequest.window_deadline`)

- [ ] **Consent Management**: User consent tracked and respected
  - Verify: `SignalToggle` table controls telemetry
  - Verify: `AppAllowlist` controls third-party data sharing
  - Verify: Consent UI in privacy settings

- [ ] **Privacy Transparency Log**: All privacy actions logged
  - Verify: `privacy_transparency_log` table populated
  - Verify: Log entries for data access, deletion, consent changes

- [ ] **GDPR Compliance**: Right to be forgotten implemented
  - Verify: Account deletion (`/api/privacy/delete`) removes all user data
  - Verify: Cascade deletes work correctly (test with real data)

---

### Infrastructure Security

- [ ] **Security Headers**: Security headers configured
  - Verify: `next.config.ts` sets security headers
  - Verify: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`
  - Verify: CSP headers (Content Security Policy)

- [ ] **Dependency Vulnerabilities**: Dependencies scanned
  ```bash
  npm run supply-chain:check
  npm audit --audit-level=moderate
  ```
  - Verify: No high/critical vulnerabilities
  - Verify: Dependencies updated regularly

- [ ] **Container Security**: Docker images scanned (if applicable)
  - Verify: Base images from trusted sources
  - Verify: No secrets in Dockerfiles

- [ ] **Network Security**: VPC/firewall rules configured
  - Verify: Database not publicly accessible (Supabase default)
  - Verify: API endpoints behind CDN/WAF (Vercel)

---

### Monitoring & Incident Response

- [ ] **Error Tracking**: Sentry configured and capturing errors
  - Verify: `SENTRY_DSN` set in production
  - Verify: Error alerts configured in Sentry

- [ ] **Security Monitoring**: Unusual activity detected
  - Verify: Failed login attempts logged
  - Verify: Unauthorized access attempts alerted
  - Verify: API abuse patterns detected (rate limit violations)

- [ ] **Incident Response Plan**: Runbook exists
  - Verify: `docs/OPERATIONS_RUNBOOK.md` includes security incidents
  - Verify: Security contact (`PRIVACY_OFFICER_EMAIL`) documented

- [ ] **Audit Logging**: Security events logged
  - Verify: Authentication events logged
  - Verify: Authorization failures logged
  - Verify: Admin actions logged (`privacy_transparency_log`)

---

## QUARTERLY AUDITS

### Penetration Testing

- [ ] **External Pentest**: Third-party security audit
  ```bash
  npm run security:pentest
  ```
  - Schedule: Quarterly
  - Scope: Authentication, authorization, API security, data protection

- [ ] **Internal Security Review**: Code review for security issues
  - Review: All new API endpoints
  - Review: RLS policy changes
  - Review: Authentication/authorization changes

### Compliance Audits

- [ ] **GDPR Compliance**: Data handling practices verified
  ```bash
  npm run compliance:check
  npm run privacy:compliance
  ```
  - Verify: DSAR requests processed within deadline
  - Verify: Data retention policies enforced
  - Verify: Consent management working

- [ ] **Access Control Audit**: User access reviewed
  - Verify: No orphaned user accounts
  - Verify: Admin access limited and logged
  - Verify: Service role key usage monitored

### Dependency Audits

- [ ] **Supply Chain Security**: Dependencies audited
  ```bash
  npm run supply-chain:audit
  ```
  - Verify: No known vulnerabilities
  - Verify: Dependencies from trusted sources
  - Verify: Lock file (`pnpm-lock.yaml`) committed

---

## CONTINUOUS MONITORING

### Automated Checks

- [ ] **Secrets Scanning**: CI/CD pipeline scans for secrets
  ```bash
  npm run secrets:scan
  ```
  - Runs: On every commit
  - Fails: If secrets detected

- [ ] **RLS Testing**: RLS policies tested automatically
  ```bash
  npm run rls:test --check
  ```
  - Runs: On every commit
  - Fails: If RLS policies missing or incorrect

- [ ] **Security Headers**: Security headers verified
  - Runs: In CI/CD (Lighthouse CI)
  - Fails: If security headers missing

- [ ] **Dependency Scanning**: Vulnerabilities scanned
  ```bash
  npm audit --audit-level=moderate
  ```
  - Runs: On every commit
  - Fails: If high/critical vulnerabilities found

---

## SECURITY CONTACTS

- **Security Lead**: [To be assigned]
- **Privacy Officer**: `PRIVACY_OFFICER_EMAIL` env var
- **Incident Response**: See `docs/OPERATIONS_RUNBOOK.md`

---

## SECURITY INCIDENT RESPONSE

If a security incident is discovered:

1. **Immediate**: Contain the incident (disable affected features, rotate secrets)
2. **Within 1 hour**: Notify security lead and privacy officer
3. **Within 24 hours**: Document incident, assess impact, notify affected users if required
4. **Within 1 week**: Post-mortem, implement fixes, update security controls

See `docs/OPERATIONS_RUNBOOK.md` for detailed incident response procedures.

---

## REFERENCES

- [Risk Register](./RISK_REGISTER.md) - Comprehensive risk assessment
- [Operations Runbook](./OPERATIONS_RUNBOOK.md) - Incident response procedures
- [Secrets Migration Guide](./SECRETS_MIGRATION_GUIDE.md) - Secrets management
- [Architecture Guide](../ARCHITECTURE.md) - System architecture

---

**Last Updated**: 2025-01-09  
**Next Review**: 2025-04-09
