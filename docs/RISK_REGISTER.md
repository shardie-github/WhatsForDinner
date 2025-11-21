# Technical Risk Register

**Product:** What's for Dinner  
**Last Updated:** 2025-01-09  
**Risk Owner:** Engineering & SRE Team  
**Review Frequency:** Monthly

---

## Risk Assessment Framework

**Impact Levels:**
- **High:** Service outage, data breach, compliance violation, significant revenue loss
- **Medium:** Degraded performance, partial feature failure, user impact
- **Low:** Minor inconvenience, non-critical bugs, cosmetic issues

**Likelihood Levels:**
- **High:** Likely to occur within 6 months
- **Medium:** Possible within 12 months
- **Low:** Unlikely but possible

**Risk Score:** Impact × Likelihood (High=3, Med=2, Low=1)

---

## DATA RISKS

### RISK-DATA-001: Data Loss from Backup Failures
**Impact:** High | **Likelihood:** Low | **Score:** 3  
**Status:** ⚠️ Needs Verification

**Description:**
Database backups may fail silently or not be tested regularly. Supabase provides automated backups, but restoration procedures are untested. Loss of user meal plans, pantry data, or recipes would be catastrophic.

**Evidence:**
- Backup scripts exist (`scripts/backup-run.ts`) but no automated verification
- No documented RTO/RPO targets
- No evidence of restore testing

**Mitigation:**
1. **Immediate:** Schedule monthly backup restore tests
2. **Short-term:** Add automated backup verification (checksum, size validation)
3. **Long-term:** Document RTO (4 hours) and RPO (1 hour) targets
4. **Monitoring:** Alert on backup failures, verify backup age daily

**Owner:** DevOps Lead  
**Next Review:** 2025-02-09

---

### RISK-DATA-002: PII Exposure in Logs
**Impact:** High | **Likelihood:** Medium | **Score:** 6  
**Status:** ⚠️ Needs Audit

**Description:**
Logger writes to database (`logs` table) and may include PII (emails, user preferences) in context fields. GDPR violation risk if logs are accessed improperly or exported.

**Evidence:**
- Logger accepts arbitrary `context` objects (`apps/web/src/lib/logger.ts`)
- No PII scrubbing visible in logger implementation
- Logs table may contain user_id, session_id, and context data

**Mitigation:**
1. **Immediate:** Audit logs table for PII, implement PII scrubbing function
2. **Short-term:** Add `sanitizeContext()` utility to strip emails, names, addresses
3. **Long-term:** Use structured logging with explicit PII fields, encrypt sensitive logs
4. **Monitoring:** Alert on log entries containing email patterns

**Owner:** Security Lead  
**Next Review:** 2025-01-16

---

### RISK-DATA-003: Data Corruption from Concurrent Writes
**Impact:** Medium | **Likelihood:** Medium | **Score:** 4  
**Status:** ⚠️ Needs Review

**Description:**
Household members may concurrently modify meal plans or grocery lists, causing data corruption or lost updates. No optimistic locking or conflict resolution visible.

**Evidence:**
- `meal_plans` and `grocery_lists` tables lack `updated_at` versioning
- No transaction isolation checks in API routes
- Supabase Realtime subscriptions may cause race conditions

**Mitigation:**
1. **Immediate:** Add `updated_at` timestamps and version checks
2. **Short-term:** Implement optimistic locking in update operations
3. **Long-term:** Use Supabase Realtime with conflict resolution
4. **Monitoring:** Track concurrent update failures

**Owner:** Backend Lead  
**Next Review:** 2025-01-23

---

### RISK-DATA-004: GDPR Non-Compliance (Data Export/Deletion)
**Impact:** High | **Likelihood:** Low | **Score:** 3  
**Status:** ✅ Partially Mitigated

**Description:**
Users must be able to export and delete their data per GDPR. Current implementation unclear - `dsarRequests` table exists but no visible API endpoints.

**Evidence:**
- `DsarRequest` model exists in Prisma schema
- No API route found for `/api/user/data-export` or `/api/user/delete-account`
- No documented GDPR compliance workflow

**Mitigation:**
1. **Immediate:** Implement `/api/user/data-export` endpoint (JSON export)
2. **Short-term:** Implement `/api/user/delete-account` with cascade deletion
3. **Long-term:** Add UI for data export/deletion in user settings
4. **Monitoring:** Track DSAR request completion time (target: <30 days)

**Owner:** Backend Lead  
**Next Review:** 2025-01-16

---

## SECURITY RISKS

### RISK-SEC-001: Silent Authentication Failures
**Impact:** Medium | **Likelihood:** Medium | **Score:** 4  
**Status:** ⚠️ Needs Fix

**Description:**
Middleware and API routes catch authentication errors but return generic "Internal server error" messages. Users can't distinguish auth failures from system errors, leading to confusion and support tickets.

**Evidence:**
- `apps/web/src/app/api/user/me/route.ts` catches all errors and returns 500
- Middleware affiliate tracking fails silently (`catch(() => {})`)
- No structured error responses for auth failures

**Mitigation:**
1. **Immediate:** Return proper 401/403 status codes for auth failures
2. **Short-term:** Use `AppError` class consistently across API routes
3. **Long-term:** Add structured error responses with error codes
4. **Monitoring:** Track 401/403 rates separately from 500s

**Owner:** Backend Lead  
**Next Review:** 2025-01-16

---

### RISK-SEC-002: API Key Exposure in Client-Side Code
**Impact:** High | **Likelihood:** Low | **Score:** 3  
**Status:** ✅ Mitigated (Supabase RLS)

**Description:**
`NEXT_PUBLIC_SUPABASE_ANON_KEY` is exposed in client-side code. While Supabase RLS should protect data, misconfigured RLS policies could expose user data.

**Evidence:**
- Anon key is public (required for Supabase client)
- RLS policies exist but need regular audit
- No automated RLS policy testing

**Mitigation:**
1. **Immediate:** Audit all RLS policies for correctness
2. **Short-term:** Add automated RLS policy tests (`scripts/rls-smoke.ts` exists)
3. **Long-term:** Implement RLS policy linting/validation
4. **Monitoring:** Alert on RLS policy changes, test policies in CI

**Owner:** Security Lead  
**Next Review:** 2025-01-23

---

### RISK-SEC-003: SQL Injection via Dynamic Queries
**Impact:** High | **Likelihood:** Low | **Score:** 3  
**Status:** ✅ Mitigated (Supabase Client)

**Description:**
Using Supabase client library should prevent SQL injection, but raw SQL queries in migrations or edge functions could be vulnerable.

**Evidence:**
- Supabase client uses parameterized queries (safe)
- Migrations contain raw SQL (reviewed but not audited)
- Edge functions may use raw SQL

**Mitigation:**
1. **Immediate:** Audit all raw SQL queries in migrations
2. **Short-term:** Use Supabase client or parameterized queries everywhere
3. **Long-term:** Add SQL injection scanning to CI/CD
4. **Monitoring:** Scan codebase for raw SQL patterns

**Owner:** Security Lead  
**Next Review:** 2025-01-23

---

### RISK-SEC-004: Secrets in Environment Variables (Not Rotated)
**Impact:** High | **Likelihood:** Low | **Score:** 3  
**Status:** ⚠️ Needs Process

**Description:**
Secrets stored in Supabase vault and Vercel env vars, but no documented rotation schedule. Long-lived secrets increase breach impact.

**Evidence:**
- Secrets migration guide exists (`docs/SECRETS_MIGRATION_GUIDE.md`)
- No rotation schedule documented
- `secret_rotation_logs` table exists but unused

**Mitigation:**
1. **Immediate:** Document secret rotation schedule (90 days for API keys)
2. **Short-term:** Implement automated rotation reminders
3. **Long-term:** Automate secret rotation where possible (Supabase service role)
4. **Monitoring:** Alert on secrets older than 90 days

**Owner:** DevOps Lead  
**Next Review:** 2025-01-16

---

### RISK-SEC-005: Admin Panel Exposure in Preview Environments
**Impact:** Medium | **Likelihood:** Medium | **Score:** 4  
**Status:** ⚠️ Partially Mitigated

**Description:**
Middleware protects `/admin` paths in preview with basic auth, but basic auth is weak and credentials may be exposed in env vars.

**Evidence:**
- `apps/web/src/middleware.ts` implements basic auth for preview
- `ADMIN_BASIC_AUTH` env var stores credentials (may be exposed)
- No rate limiting on admin endpoints

**Mitigation:**
1. **Immediate:** Use Supabase auth for admin routes instead of basic auth
2. **Short-term:** Add rate limiting to admin endpoints
3. **Long-term:** Implement role-based access control (RBAC) for admin
4. **Monitoring:** Alert on failed admin login attempts

**Owner:** Security Lead  
**Next Review:** 2025-01-16

---

## RELIABILITY RISKS

### RISK-REL-001: No Retry Logic for External APIs
**Impact:** Medium | **Likelihood:** High | **Score:** 6  
**Status:** ⚠️ Critical Gap

**Description:**
OpenAI API calls, Supabase operations, and grocery API integrations have no retry logic. Transient failures cause user-facing errors and poor UX.

**Evidence:**
- No retry utilities found in codebase
- OpenAI API calls likely fail on network issues
- Supabase client doesn't retry automatically

**Mitigation:**
1. **Immediate:** Implement exponential backoff retry utility
2. **Short-term:** Add retries to OpenAI API calls (3 retries, exponential backoff)
3. **Long-term:** Implement circuit breaker pattern for external APIs
4. **Monitoring:** Track external API failure rates and retry success

**Owner:** Backend Lead  
**Next Review:** 2025-01-16

---

### RISK-REL-002: No Timeout Configuration for API Calls
**Impact:** Medium | **Likelihood:** Medium | **Score:** 4  
**Status:** ⚠️ Needs Configuration

**Description:**
API routes and external service calls have no explicit timeouts. Long-running requests can hang, consuming resources and degrading UX.

**Evidence:**
- No timeout configuration in Supabase client
- OpenAI API calls have no timeout
- Next.js API routes use default timeout (10s on Vercel)

**Mitigation:**
1. **Immediate:** Set timeouts on all external API calls (30s default)
2. **Short-term:** Configure Next.js API route timeouts explicitly
3. **Long-term:** Implement request timeout middleware
4. **Monitoring:** Track timeout rates and slow requests (>5s)

**Owner:** Backend Lead  
**Next Review:** 2025-01-16

---

### RISK-REL-003: Database Connection Pool Exhaustion
**Impact:** High | **Likelihood:** Medium | **Score:** 6  
**Status:** ⚠️ Needs Monitoring

**Description:**
Supabase connection pooling may be misconfigured or exhausted under load, causing request failures and degraded performance.

**Evidence:**
- Connection pooling guide exists (`docs/connection-pooling-guide.md`)
- No visible connection pool configuration
- No monitoring for connection pool metrics

**Mitigation:**
1. **Immediate:** Verify Supabase connection pooler is enabled
2. **Short-term:** Add connection pool monitoring (active connections, wait time)
3. **Long-term:** Implement connection pool health checks
4. **Monitoring:** Alert on connection pool exhaustion (>80% capacity)

**Owner:** DevOps Lead  
**Next Review:** 2025-01-23

---

### RISK-REL-004: Supabase Service Dependency (Single Point of Failure)
**Impact:** High | **Likelihood:** Low | **Score:** 3  
**Status:** ⚠️ Vendor Lock-In

**Description:**
Entire backend depends on Supabase (auth, database, storage, realtime). Supabase outage = complete service outage. No fallback or multi-region strategy.

**Evidence:**
- All data stored in Supabase PostgreSQL
- Auth handled by Supabase Auth
- Storage uses Supabase Storage
- No backup database or auth provider

**Mitigation:**
1. **Immediate:** Monitor Supabase status page, set up status alerts
2. **Short-term:** Document Supabase SLAs and escalation process
3. **Long-term:** Evaluate multi-region deployment or backup auth provider
4. **Monitoring:** Track Supabase API error rates and latency

**Owner:** DevOps Lead  
**Next Review:** 2025-02-09

---

### RISK-REL-005: OpenAI API Rate Limits and Costs
**Impact:** Medium | **Likelihood:** High | **Score:** 6  
**Status:** ⚠️ Needs Guardrails

**Description:**
OpenAI API has rate limits and per-request costs. No rate limiting or cost controls visible. High usage could cause failures or unexpected costs.

**Evidence:**
- No rate limiting on meal suggestion API calls
- No cost tracking or budgets
- No fallback if OpenAI API fails

**Mitigation:**
1. **Immediate:** Implement rate limiting per user (e.g., 10 requests/hour free tier)
2. **Short-term:** Add cost tracking and alerts ($100/day budget)
3. **Long-term:** Implement caching for common meal suggestions, fallback to cached recipes
4. **Monitoring:** Track OpenAI API usage, costs, and error rates

**Owner:** Backend Lead  
**Next Review:** 2025-01-16

---

## PRODUCT/UX RISKS

### RISK-UX-001: Silent Failures in Affiliate Tracking
**Impact:** Low | **Likelihood:** High | **Score:** 2  
**Status:** ⚠️ Needs Fix

**Description:**
Middleware affiliate tracking fails silently (`catch(() => {})`). Affiliate conversions may be lost without visibility.

**Evidence:**
- `apps/web/src/middleware.ts` line 113: `}).catch(() => {});`
- No error logging for affiliate tracking failures
- No monitoring for affiliate conversion rates

**Mitigation:**
1. **Immediate:** Log affiliate tracking errors (don't fail silently)
2. **Short-term:** Add monitoring for affiliate conversion rates
3. **Long-term:** Implement retry queue for failed affiliate tracking
4. **Monitoring:** Track affiliate tracking success rate

**Owner:** Backend Lead  
**Next Review:** 2025-01-16

---

### RISK-UX-002: Confusing Error Messages
**Impact:** Medium | **Likelihood:** Medium | **Score:** 4  
**Status:** ⚠️ Needs Improvement

**Description:**
API routes return generic "Internal server error" messages. Users can't understand what went wrong or how to fix it.

**Evidence:**
- `apps/web/src/app/api/user/me/route.ts` returns generic errors
- Error taxonomy exists (`apps/web/src/lib/errors.ts`) but not used consistently
- No user-friendly error messages in API responses

**Mitigation:**
1. **Immediate:** Use `AppError` class and `getUserFriendlyMessage()` consistently
2. **Short-term:** Return structured error responses with error codes
3. **Long-term:** Add client-side error handling with helpful messages
4. **Monitoring:** Track error types and user-reported confusion

**Owner:** Frontend Lead  
**Next Review:** 2025-01-16

---

### RISK-UX-003: No Offline Support for Critical Features
**Impact:** Medium | **Likelihood:** Medium | **Score:** 4  
**Status:** ⚠️ Partial (PWA)

**Description:**
App claims offline support, but meal suggestions require OpenAI API. Users can't get suggestions offline, reducing value proposition.

**Evidence:**
- README mentions "Offline Ready"
- Service worker exists (`public/sw.js`)
- Meal suggestions require API calls

**Mitigation:**
1. **Immediate:** Clarify offline capabilities in documentation
2. **Short-term:** Cache recent meal suggestions for offline access
3. **Long-term:** Implement offline recipe browsing from cached recipes
4. **Monitoring:** Track offline usage and feature availability

**Owner:** Product Lead  
**Next Review:** 2025-01-23

---

## BUSINESS RISKS

### RISK-BIZ-001: Vendor Lock-In (Supabase, Vercel)
**Impact:** Medium | **Likelihood:** Low | **Score:** 2  
**Status:** ⚠️ Acceptable Risk

**Description:**
Heavy dependency on Supabase and Vercel makes migration difficult and expensive. Vendor price increases or service changes could impact business.

**Evidence:**
- All backend on Supabase (auth, DB, storage)
- Deployment on Vercel
- No abstraction layer for vendor services

**Mitigation:**
1. **Immediate:** Document vendor dependencies and SLAs
2. **Short-term:** Evaluate migration costs and complexity annually
3. **Long-term:** Consider abstraction layers for critical services
4. **Monitoring:** Track vendor costs and service quality

**Owner:** CTO  
**Next Review:** 2025-04-09

---

### RISK-BIZ-002: Compliance Requirements (SOC 2, HIPAA)
**Impact:** Medium | **Likelihood:** Low | **Score:** 2  
**Status:** ⚠️ Future Consideration

**Description:**
Enterprise customers may require SOC 2 or HIPAA compliance. Current infrastructure may not meet requirements.

**Evidence:**
- No SOC 2 compliance documentation
- Supabase may not be HIPAA-compliant
- No compliance audit trail

**Mitigation:**
1. **Immediate:** Document current compliance posture
2. **Short-term:** Evaluate Supabase compliance certifications
3. **Long-term:** Plan for SOC 2 if enterprise demand exists
4. **Monitoring:** Track enterprise customer requirements

**Owner:** CTO  
**Next Review:** 2025-06-09

---

## RISK SUMMARY

| Category | High Risk | Medium Risk | Low Risk | Total |
|----------|-----------|-------------|----------|-------|
| Data | 2 | 2 | 0 | 4 |
| Security | 2 | 3 | 0 | 5 |
| Reliability | 2 | 3 | 0 | 5 |
| Product/UX | 0 | 3 | 1 | 4 |
| Business | 0 | 2 | 0 | 2 |
| **Total** | **6** | **13** | **1** | **20** |

**Top 5 Risks by Score:**
1. RISK-REL-001: No Retry Logic (Score: 6)
2. RISK-REL-005: OpenAI API Rate Limits (Score: 6)
3. RISK-REL-003: Connection Pool Exhaustion (Score: 6)
4. RISK-DATA-002: PII in Logs (Score: 6)
5. RISK-SEC-001: Silent Auth Failures (Score: 4)

---

## REVIEW PROCESS

1. **Monthly Review:** First Monday of each month
2. **Owner Updates:** Risk owners update status and mitigation progress
3. **New Risks:** Team submits new risks via PR to this file
4. **Escalation:** High-score risks (>6) require immediate action plan

**Last Review:** 2025-01-09  
**Next Review:** 2025-02-03
