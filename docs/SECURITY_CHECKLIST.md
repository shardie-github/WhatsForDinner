# Security Checklist

**Product:** What's for Dinner  
**Last Updated:** 2025-01-09  
**Owner:** Security Lead  
**Review Frequency:** Before each release, quarterly audit

---

## Pre-Deployment Security Checks

### Authentication & Authorization

- [ ] **RLS Policies Audited**
  - [ ] All tables have RLS enabled
  - [ ] Policies tested with automated tests (`npm run rls:test`)
  - [ ] No service role bypasses except where necessary
  - [ ] User can only access their own data
  - [ ] Household members can access shared data only

- [ ] **API Route Authentication**
  - [ ] All `/api/*` routes check authentication
  - [ ] Admin routes require admin role (not just auth)
  - [ ] Service role keys never exposed to client
  - [ ] JWT tokens validated on every request

- [ ] **Session Management**
  - [ ] Sessions expire after inactivity (24h default)
  - [ ] Refresh tokens rotated on use
  - [ ] Logout invalidates all sessions
  - [ ] MFA enforced for admin accounts

### Secrets Management

- [ ] **No Hardcoded Secrets**
  - [ ] `npm run secrets:scan` passes (no secrets in code)
  - [ ] No API keys in client-side code (except public anon keys)
  - [ ] No database passwords in config files
  - [ ] No service role keys in environment files

- [ ] **Secrets Storage**
  - [ ] All secrets in Supabase vault or Vercel env vars
  - [ ] Secrets rotated per schedule (90 days for API keys)
  - [ ] No secrets in git history (use `git-secrets` if needed)
  - [ ] `.env.local` in `.gitignore` (verify)

- [ ] **Secrets Access**
  - [ ] Only service role can access secrets vault
  - [ ] Secrets vault RLS policies reviewed
  - [ ] Audit log for secret access (if available)

### Input Validation & Injection Prevention

- [ ] **SQL Injection Prevention**
  - [ ] No raw SQL queries (use Supabase client)
  - [ ] All user input validated with Zod schemas
  - [ ] Migrations reviewed for injection risks
  - [ ] Edge functions use parameterized queries

- [ ] **XSS Prevention**
  - [ ] User-generated content sanitized (recipes, comments)
  - [ ] React escapes content by default (verify)
  - [ ] CSP headers configured (`apps/web/src/lib/security/headers.ts`)
  - [ ] No `dangerouslySetInnerHTML` without sanitization

- [ ] **CSRF Protection**
  - [ ] SameSite cookies configured (`lax` or `strict`)
  - [ ] State-changing operations use POST/PUT/DELETE
  - [ ] CSRF tokens for sensitive operations (if applicable)

### API Security

- [ ] **Rate Limiting**
  - [ ] API routes have rate limits (per user/IP)
  - [ ] OpenAI API calls rate limited per user
  - [ ] Admin endpoints have stricter limits
  - [ ] Rate limit headers returned (`X-RateLimit-*`)

- [ ] **CORS Configuration**
  - [ ] CORS headers configured correctly
  - [ ] Only allowed origins can access API
  - [ ] Credentials handled securely
  - [ ] Preflight requests handled

- [ ] **Error Handling**
  - [ ] No stack traces in production error responses
  - [ ] Error messages don't leak system information
  - [ ] 401/403 errors don't reveal user existence
  - [ ] Structured error responses (no generic 500s)

### Data Protection

- [ ] **PII Handling**
  - [ ] PII scrubbed from logs (emails, names)
  - [ ] No PII in error messages
  - [ ] User data encrypted at rest (Supabase default)
  - [ ] User data encrypted in transit (TLS 1.2+)

- [ ] **GDPR Compliance**
  - [ ] Data export endpoint implemented (`/api/user/data-export`)
  - [ ] Account deletion endpoint implemented (`/api/user/delete-account`)
  - [ ] Privacy policy and terms of service up to date
  - [ ] Cookie consent implemented (if required)

- [ ] **Data Retention**
  - [ ] Retention policies documented
  - [ ] Old data purged per retention policy
  - [ ] Backup retention matches data retention
  - [ ] User can request data deletion

### Infrastructure Security

- [ ] **Environment Hardening**
  - [ ] Preview environments require auth for admin (`PREVIEW_REQUIRE_AUTH`)
  - [ ] Production environment variables secured
  - [ ] No debug mode in production (`NODE_ENV=production`)
  - [ ] Health check endpoints don't expose sensitive info

- [ ] **Dependency Security**
  - [ ] `npm audit` passes (no critical vulnerabilities)
  - [ ] Dependencies updated regularly
  - [ ] Supply chain audit run (`npm run supply-chain:audit`)
  - [ ] Known vulnerable packages replaced

- [ ] **Network Security**
  - [ ] HTTPS enforced (Vercel default)
  - [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
  - [ ] Database connections use SSL/TLS
  - [ ] No internal services exposed publicly

### Monitoring & Incident Response

- [ ] **Security Monitoring**
  - [ ] Failed login attempts logged and monitored
  - [ ] Unusual access patterns detected
  - [ ] Security events sent to monitoring system
  - [ ] Admin actions logged (if admin panel exists)

- [ ] **Incident Response**
  - [ ] Security incident response plan documented
  - [ ] Contact information for security team available
  - [ ] Escalation path defined
  - [ ] Post-incident review process documented

- [ ] **Vulnerability Management**
  - [ ] Security scanning automated in CI/CD
  - [ ] Penetration testing scheduled (annual)
  - [ ] Security audit findings tracked
  - [ ] Critical vulnerabilities patched within 24h

---

## Quarterly Security Audit

### Access Review

- [ ] Review all user accounts with admin access
- [ ] Review service role key usage
- [ ] Review API key usage and rotate if needed
- [ ] Remove unused accounts and keys

### Policy Review

- [ ] Review and update RLS policies
- [ ] Review and update security headers
- [ ] Review and update rate limiting rules
- [ ] Review and update CORS configuration

### Compliance Review

- [ ] Verify GDPR compliance (data export/deletion)
- [ ] Review privacy policy and terms of service
- [ ] Check for new compliance requirements
- [ ] Update security documentation

### Dependency Review

- [ ] Update all dependencies to latest stable versions
- [ ] Review and replace deprecated packages
- [ ] Audit third-party service security (Supabase, Vercel, OpenAI)
- [ ] Review and update security configurations

---

## Security Testing

### Automated Tests

```bash
# Run all security checks
npm run security:audit          # Dependency audit
npm run security:scan          # Code scanning
npm run security:secrets       # Secret scanning
npm run security:headers       # Security headers check
npm run security:self-check    # Comprehensive self-check
npm run rls:test               # RLS policy tests
```

### Manual Testing

- [ ] Test authentication bypass attempts
- [ ] Test authorization bypass attempts (access other user's data)
- [ ] Test SQL injection on all input fields
- [ ] Test XSS on user-generated content
- [ ] Test CSRF on state-changing operations
- [ ] Test rate limiting (exceed limits)
- [ ] Test error handling (don't leak info)

---

## Security Incident Response

### Detection

1. **Monitor:**
   - Failed login attempts
   - Unusual database access
   - Error rate spikes
   - Security alerts from monitoring

2. **Investigate:**
   - Review logs for suspicious activity
   - Check for unauthorized access
   - Verify data integrity
   - Assess impact

### Response

1. **Contain:**
   - Disable affected accounts/keys
   - Block suspicious IPs
   - Revoke compromised sessions
   - Isolate affected systems

2. **Remediate:**
   - Patch vulnerabilities
   - Rotate compromised secrets
   - Restore from backup if needed
   - Update security controls

3. **Communicate:**
   - Notify affected users (if PII exposed)
   - Report to authorities (if required)
   - Document incident
   - Post-incident review

### Escalation

- **Level 1:** Security team handles
- **Level 2:** CTO/Engineering lead notified
- **Level 3:** Legal/compliance team involved
- **Level 4:** External security firm engaged

---

## Security Resources

- **Security Policy:** `/SECURITY.md`
- **Secrets Guide:** `/docs/SECRETS_MIGRATION_GUIDE.md`
- **Risk Register:** `/docs/RISK_REGISTER.md`
- **Incident Runbook:** `/docs/OPERATIONS_RUNBOOK.md`

---

## Checklist Usage

**Before Each Release:**
1. Run automated security checks (all pass)
2. Complete pre-deployment checklist
3. Review high-risk changes
4. Get security lead approval

**Quarterly:**
1. Complete quarterly audit checklist
2. Review and update security policies
3. Run penetration testing (if scheduled)
4. Update security documentation

**When Adding New Features:**
1. Review authentication/authorization requirements
2. Validate all user input
3. Test for injection vulnerabilities
4. Review data handling (PII, GDPR)
5. Update security checklist if needed

---

**Last Security Audit:** 2025-01-09  
**Next Security Audit:** 2025-04-09  
**Security Lead:** [Assign Owner]
