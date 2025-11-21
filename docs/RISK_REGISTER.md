# Risk Register

**Last Updated**: 2025-01-09  
**Owner**: Engineering Team  
**Review Frequency**: Monthly

This document catalogs identified risks across data, security, reliability, product/UX, and business dimensions. Each risk includes impact, likelihood, mitigation strategy, and ownership.

---

## Risk Assessment Legend

- **Impact**: High (severe business impact), Med (moderate impact), Low (minimal impact)
- **Likelihood**: High (frequent), Med (occasional), Low (rare)
- **Status**: Open, Mitigated, Accepted, Transferred

---

## 1. DATA RISKS

### D1: Data Loss - Database Corruption or Accidental Deletion
**Impact**: High | **Likelihood**: Low | **Status**: Open

**Description**:  
PostgreSQL database corruption, accidental `DROP TABLE`, or cascade deletion bugs could result in permanent data loss. Supabase provides backups, but recovery windows and RPO/RTO may not meet business needs.

**Mitigation**:
- ✅ Enable Supabase Point-in-Time Recovery (PITR) with 7-day retention minimum
- ✅ Implement automated daily backups to separate S3 bucket (`BACKUP_BUCKET_URL`)
- ✅ Add database integrity checks (`npm run watcher:db`) running nightly
- ✅ Enforce soft-deletes on critical tables (add `deleted_at` column, never hard-delete)
- ✅ Add `ON DELETE RESTRICT` foreign keys where cascade deletion is dangerous
- ✅ Test restore procedures quarterly (`npm run backup:restore`)

**Owner**: DevOps Lead  
**Detection**: Nightly integrity watcher, backup verification alerts

---

### D2: PII Exposure - Unauthorized Access to User Data
**Impact**: High | **Likelihood**: Med | **Status**: Open

**Description**:  
User emails, health metrics, meal preferences, and household data could be exposed through:
- RLS policy misconfiguration
- API endpoint returning full user objects
- Logging PII in error messages
- Client-side data leakage

**Mitigation**:
- ✅ Audit all RLS policies (`npm run rls:test`) - ensure `auth.uid()` checks on all user-scoped tables
- ✅ Implement field-level redaction in API responses (use `@/lib/data-redaction`)
- ✅ Configure Pino logger redaction (`packages/server/src/observability/index.ts`) - already redacts `email`, `password`, `token`
- ✅ Add Zod schemas to strip PII from API responses before serialization
- ✅ Enable Supabase audit logging for `SELECT` queries on sensitive tables
- ✅ Regular penetration testing (`npm run security:pentest`)

**Owner**: Security Lead  
**Detection**: RLS smoke tests, log scanning for PII patterns, quarterly pentests

---

### D3: Data Corruption - Race Conditions in Multi-User Operations
**Impact**: Med | **Likelihood**: Med | **Status**: Open

**Description**:  
Household members updating meal plans simultaneously, or concurrent grocery list edits, could cause lost updates or inconsistent state.

**Mitigation**:
- ✅ Use PostgreSQL `SELECT FOR UPDATE` for critical updates (meal plans, grocery lists)
- ✅ Implement optimistic locking with `updated_at` timestamps (reject stale updates)
- ✅ Add database-level constraints (unique constraints, check constraints)
- ✅ Use Supabase Realtime subscriptions to show live updates to users
- ✅ Add integration tests for concurrent operations (`packages/testing/e2e/`)

**Owner**: Backend Lead  
**Detection**: Integration tests, monitoring for constraint violations

---

### D4: Privacy Compliance - GDPR/CCPA Violations
**Impact**: High | **Likelihood**: Low | **Status**: Mitigated

**Description**:  
Failure to honor DSAR requests, data retention violations, or improper consent handling could result in regulatory fines.

**Mitigation**:
- ✅ DSAR system implemented (`DsarRequest` table, `/api/privacy/export`, `/api/privacy/erase`)
- ✅ Data retention policies (`privacy_prefs.data_retention_days`, `npm run retention:run`)
- ✅ Privacy transparency log (`privacy_transparency_log` table)
- ⚠️ **Gap**: Automated DSAR deadline monitoring - add alert if `window_deadline` < 3 days
- ⚠️ **Gap**: Consent audit trail - ensure all telemetry respects `SignalToggle` settings

**Owner**: Privacy Officer (`PRIVACY_OFFICER_EMAIL`)  
**Detection**: DSAR deadline alerts, quarterly compliance audits

---

## 2. SECURITY RISKS

### S1: Authentication Bypass - RLS Policy Gaps
**Impact**: High | **Likelihood**: Low | **Status**: Open

**Description**:  
Missing or incorrect RLS policies could allow users to access other users' data. Service role key exposure could bypass all RLS.

**Mitigation**:
- ✅ RLS enabled on all app tables (`supabase/migrations/052_rls_app_tables.sql`)
- ✅ Service role key stored in Supabase Vault (never in code)
- ⚠️ **Gap**: Automated RLS policy testing - add `npm run rls:test` to CI
- ⚠️ **Gap**: Service role key rotation - implement quarterly rotation (`npm run ops:rotate-secrets`)
- ✅ Use `auth.uid()` consistently in policies (audit via migration checks)

**Owner**: Security Lead  
**Detection**: RLS smoke tests (`npm run rls:test`), service role key usage monitoring

---

### S2: Secrets Exposure - API Keys in Logs or Client Code
**Impact**: High | **Likelihood**: Low | **Status**: Mitigated

**Description**:  
OpenAI API keys, Stripe keys, or Supabase service role keys could leak via:
- Client-side bundling
- Error messages
- Git commits
- Environment variable exposure

**Mitigation**:
- ✅ Secrets migration to Supabase Vault (`docs/SECRETS_MIGRATION_GUIDE.md`)
- ✅ Pino logger redaction configured
- ✅ Secrets scanning in CI (`npm run secrets:scan`)
- ⚠️ **Gap**: Pre-commit hook to prevent secrets in commits
- ⚠️ **Gap**: Client-side bundle analysis to detect secret leakage

**Owner**: Security Lead  
**Detection**: `npm run secrets:scan`, GitGuardian integration (recommended)

---

### S3: SQL Injection - Unsanitized Database Queries
**Impact**: High | **Likelihood**: Low | **Status**: Mitigated

**Description**:  
Raw SQL queries or RPC functions with user input could allow SQL injection attacks.

**Mitigation**:
- ✅ Use Supabase client (parameterized queries) - no raw SQL in application code
- ✅ RPC functions use `SECURITY DEFINER` with input validation
- ⚠️ **Gap**: Audit all `supabase.rpc()` calls for input sanitization
- ✅ Prisma schema prevents raw SQL in most cases

**Owner**: Backend Lead  
**Detection**: Code review, static analysis tools

---

### S4: API Rate Limiting Bypass - DoS Attacks
**Impact**: Med | **Likelihood**: Med | **Status**: Open

**Description**:  
Missing or weak rate limiting could allow DoS attacks, API abuse, or excessive OpenAI costs.

**Mitigation**:
- ✅ Rate limiting middleware exists (`@/lib/rate-limiting`, `withRateLimit`)
- ⚠️ **Gap**: Rate limits not consistently applied - audit all API routes
- ⚠️ **Gap**: Per-user rate limits (currently global) - implement user-based limits
- ⚠️ **Gap**: Cost-based rate limiting for OpenAI endpoints (limit tokens per user/day)
- ✅ Vercel Edge rate limiting (configure in `vercel.json`)

**Owner**: Backend Lead  
**Detection**: API monitoring, cost alerts (`npm run cost:guard`)

---

### S5: CSRF Attacks - Missing Token Validation
**Impact**: Med | **Likelihood**: Low | **Status**: Mitigated

**Description**:  
State-changing operations without CSRF protection could allow cross-site request forgery.

**Mitigation**:
- ✅ CSRF middleware exists (`@/lib/csrf-middleware`, `withCSRFProtection`)
- ⚠️ **Gap**: CSRF not applied to all POST/PUT/DELETE routes - audit coverage
- ✅ Next.js CSRF protection via SameSite cookies

**Owner**: Security Lead  
**Detection**: Security audit, penetration testing

---

## 3. RELIABILITY RISKS

### R1: Third-Party API Failures - OpenAI/Stripe Downtime
**Impact**: High | **Likelihood**: Med | **Status**: Open

**Description**:  
OpenAI API outages, rate limits, or Stripe payment processing failures could break core features (meal generation, subscriptions).

**Mitigation**:
- ✅ Fallback logic exists (`generateRecipesWithFallback` with retries)
- ⚠️ **Gap**: No circuit breaker pattern - implement exponential backoff + circuit breaker
- ⚠️ **Gap**: No graceful degradation - show cached recipes when OpenAI fails
- ⚠️ **Gap**: No health checks for third-party APIs - add `/api/health/dependencies`
- ✅ Retry logic with `maxRetries: 3, retryDelay: 1000` (needs exponential backoff)

**Owner**: Backend Lead  
**Detection**: API health monitoring, error rate alerts

---

### R2: Database Connection Exhaustion - Pool Saturation
**Impact**: High | **Likelihood**: Low | **Status**: Open

**Description**:  
Connection pool exhaustion under load could cause request timeouts and cascading failures.

**Mitigation**:
- ✅ Supabase connection pooling (recommended: use transaction pooler)
- ⚠️ **Gap**: No connection pool monitoring - add metrics for pool usage
- ⚠️ **Gap**: No connection timeout configuration - set `DATABASE_POOL_IDLE_TIMEOUT`
- ⚠️ **Gap**: No query timeout enforcement - add `MAX_QUERY_DURATION_MS` enforcement
- ✅ Connection pooling guide exists (`docs/connection-pooling-guide.md`)

**Owner**: DevOps Lead  
**Detection**: Database metrics, connection pool alerts

---

### R3: Timeout Cascades - Long-Running Queries
**Impact**: Med | **Likelihood**: Med | **Status**: Open

**Description**:  
Slow queries (meal plan generation, analytics) could cause request timeouts, retries, and cascading failures.

**Mitigation**:
- ⚠️ **Gap**: No query timeout enforcement - implement `MAX_QUERY_DURATION_MS` (30s default)
- ⚠️ **Gap**: No query cancellation on client disconnect - add cancellation tokens
- ✅ Database indexes exist (`supabase/migrations/007_performance_indexes.sql`)
- ⚠️ **Gap**: No slow query logging - enable PostgreSQL `log_min_duration_statement`
- ✅ Performance monitoring (`npm run db:perf`)

**Owner**: Backend Lead  
**Detection**: Slow query logs, timeout error monitoring

---

### R4: Error Handling Gaps - Silent Failures
**Impact**: Med | **Likelihood**: Med | **Status**: Open

**Description**:  
Unhandled promise rejections, swallowed errors, or generic error messages could hide bugs and frustrate users.

**Mitigation**:
- ✅ Error handling in API routes (try/catch blocks)
- ⚠️ **Gap**: Inconsistent error logging - standardize error format
- ⚠️ **Gap**: No error tracking integration - ensure Sentry captures all errors
- ⚠️ **Gap**: Generic error messages - add error codes for debugging
- ✅ Sentry integration exists (`next.config.ts`)

**Owner**: Backend Lead  
**Detection**: Error rate monitoring, Sentry alerts

---

### R5: Job Queue Failures - Background Job Loss
**Impact**: Med | **Likelihood**: Low | **Status**: Open

**Description**:  
Failed background jobs (meal generation, email notifications) could be lost if not properly retried or persisted.

**Mitigation**:
- ✅ Job queue schema exists (`supabase/migrations/006_job_queue_schema.sql`)
- ⚠️ **Gap**: No job retry policy - implement exponential backoff retries
- ⚠️ **Gap**: No dead letter queue - move failed jobs after max retries
- ⚠️ **Gap**: No job monitoring dashboard - add job status metrics

**Owner**: Backend Lead  
**Detection**: Job failure alerts, job queue monitoring

---

## 4. PRODUCT/UX RISKS

### P1: Silent Failures - User Actions Not Saved
**Impact**: Med | **Likelihood**: Med | **Status**: Open

**Description**:  
Network errors, validation failures, or race conditions could cause user actions (meal plan updates, grocery list edits) to fail silently without user feedback.

**Mitigation**:
- ⚠️ **Gap**: No optimistic UI updates - implement optimistic updates with rollback
- ⚠️ **Gap**: No offline queue - use service worker to queue actions when offline
- ⚠️ **Gap**: Generic error messages - show specific, actionable error messages
- ✅ Error boundaries exist (React error boundaries)

**Owner**: Frontend Lead  
**Detection**: User error reports, analytics on failed actions

---

### P2: Confusing States - Loading/Error/Empty States
**Impact**: Low | **Likelihood**: Med | **Status**: Open

**Description**:  
Missing loading indicators, unclear error messages, or empty states without guidance could confuse users.

**Mitigation**:
- ⚠️ **Gap**: Design system for loading/error/empty states - add to `packages/ui`
- ⚠️ **Gap**: Skeleton loaders for slow API calls
- ⚠️ **Gap**: Error recovery actions (retry buttons, contact support)

**Owner**: Frontend Lead  
**Detection**: User testing, analytics on error states

---

### P3: Performance Degradation - Slow Page Loads
**Impact**: Med | **Likelihood**: Med | **Status**: Mitigated

**Description**:  
Large bundle sizes, unoptimized images, or slow API responses could degrade user experience.

**Mitigation**:
- ✅ Bundle optimization (`next.config.ts` - code splitting, tree shaking)
- ✅ Image optimization (WebP/AVIF, `next/image`)
- ✅ Performance budgets (`npm run performance:budget`)
- ✅ Lighthouse CI (`npm run lhci`)
- ⚠️ **Gap**: Real User Monitoring (RUM) - add performance tracking

**Owner**: Frontend Lead  
**Detection**: Lighthouse CI, performance budgets

---

## 5. BUSINESS RISKS

### B1: Vendor Lock-In - Supabase Dependency
**Impact**: Med | **Likelihood**: Low | **Status**: Accepted

**Description**:  
Heavy reliance on Supabase (auth, database, storage, realtime) creates migration risk if pricing changes or service degrades.

**Mitigation**:
- ✅ Use standard PostgreSQL (not Supabase-specific features where possible)
- ✅ Abstract database access layer (`packages/server/src/db/`)
- ⚠️ **Gap**: Database abstraction not complete - some direct Supabase client usage
- ✅ Keep Prisma schema as source of truth (enables migration to other PostgreSQL)

**Owner**: CTO  
**Detection**: Architecture reviews

---

### B2: Cost Overruns - OpenAI API Usage
**Impact**: High | **Likelihood**: Med | **Status**: Open

**Description**:  
Unbounded OpenAI API usage (meal generation) could result in unexpected costs, especially if rate limiting fails or prompts are inefficient.

**Mitigation**:
- ✅ Cost guard script (`npm run cost:guard`)
- ✅ AI optimization service (`@/lib/aiOptimization`) - caching, model selection
- ⚠️ **Gap**: Per-user cost limits - implement daily/monthly token budgets
- ⚠️ **Gap**: Cost alerts - add Slack/PagerDuty alerts for cost thresholds
- ✅ Token cost calculation exists (`StripeService.calculateTokenCost`)

**Owner**: Finance Lead  
**Detection**: Cost monitoring (`npm run cost:guard`), billing alerts

---

### B3: Compliance Violations - GDPR/CCPA Fines
**Impact**: High | **Likelihood**: Low | **Status**: Mitigated

**Description**:  
Regulatory violations could result in fines (up to 4% of revenue for GDPR).

**Mitigation**:
- ✅ DSAR system implemented
- ✅ Privacy preferences (`privacy_prefs` table)
- ✅ Data retention policies
- ⚠️ **Gap**: Automated compliance audits - quarterly automated checks
- ✅ Privacy officer contact (`PRIVACY_OFFICER_EMAIL`)

**Owner**: Privacy Officer  
**Detection**: Quarterly compliance audits (`npm run compliance:check`)

---

### B4: Payment Processing Failures - Stripe Outages
**Impact**: High | **Likelihood**: Low | **Status**: Open

**Description**:  
Stripe outages or webhook failures could prevent subscription renewals, causing revenue loss and churn.

**Mitigation**:
- ✅ Stripe webhook handler exists (`/api/stripe/webhook`)
- ⚠️ **Gap**: Webhook idempotency - ensure webhook handlers are idempotent
- ⚠️ **Gap**: Webhook retry logic - Stripe retries, but need to handle gracefully
- ⚠️ **Gap**: Payment failure notifications - alert users of payment issues
- ✅ Webhook signature verification (Stripe SDK handles this)

**Owner**: Backend Lead  
**Detection**: Stripe webhook monitoring, payment failure alerts

---

### B5: Third-Party Service Degradation - External Dependencies
**Impact**: Med | **Likelihood**: Med | **Status**: Open

**Description**:  
Dependencies on SendGrid (email), Cloudinary (images), Algolia (search) could degrade features if services fail.

**Mitigation**:
- ✅ Multiple CRM providers (`packages/adapters/crm/` - SendGrid, Klaviyo, noop)
- ⚠️ **Gap**: No fallback for image uploads (Cloudinary only)
- ⚠️ **Gap**: No health checks for third-party services
- ⚠️ **Gap**: No circuit breakers for external APIs

**Owner**: Backend Lead  
**Detection**: Third-party API monitoring, error rate alerts

---

## RISK SUMMARY

| Category | High Impact | Medium Impact | Low Impact | Total |
|----------|------------|---------------|------------|-------|
| Data | 2 | 1 | 0 | 3 |
| Security | 3 | 2 | 0 | 5 |
| Reliability | 2 | 3 | 0 | 5 |
| Product/UX | 0 | 2 | 1 | 3 |
| Business | 3 | 2 | 0 | 5 |
| **Total** | **10** | **10** | **1** | **21** |

**Open Risks**: 18  
**Mitigated Risks**: 3  
**Accepted Risks**: 1

---

## NEXT STEPS

1. **Immediate (Week 1)**:
   - Implement circuit breaker for OpenAI API
   - Add RLS policy testing to CI
   - Set up cost alerts for OpenAI usage
   - Add query timeout enforcement

2. **Short-term (Month 1)**:
   - Complete database abstraction layer
   - Implement per-user rate limiting
   - Add job retry policies
   - Set up third-party API health checks

3. **Ongoing**:
   - Monthly risk review
   - Quarterly compliance audits
   - Quarterly penetration testing
   - Continuous monitoring and alerting

---

## REVIEW HISTORY

- **2025-01-09**: Initial risk register created
