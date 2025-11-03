# Resilience & Failure Propagation Matrix

**Generated:** 2025-01-27  
**Scope:** Failure modes, blast radius, current guardrails, proposed mitigations

## Component Failure Matrix

| Component | Failure Mode | Blast Radius | Current Guardrail | Proposed Guardrail | Effort |
|-----------|--------------|--------------|-------------------|-------------------|---------|
| **Redis** | Connection timeout/loss | Queue stops, all background jobs fail | ❌ None (throws immediately) | Retry with exponential backoff (max 3 attempts, 1s/2s/4s), Circuit breaker (open after 5 failures), Health endpoint | S |
| **Supabase Auth** | Service outage | All authenticated requests fail | ⚠️ Supabase built-in retry (unknown config) | Client-side retry (max 2), Cached token refresh, Degraded mode (read-only) | M |
| **Supabase DB** | Connection pool exhaustion | All DB queries fail | ⚠️ Supabase managed (no app-level config) | Connection pool limits, Query timeout (30s), Read replica fallback, Connection health checks | M |
| **Queue Worker** | Process crash | Background jobs fail silently | ⚠️ Process signal handlers (SIGTERM/SIGINT) | Auto-restart (PM2/supervisor), Dead letter queue, Job retry (max 3), Health monitoring | M |
| **Stripe API** | Rate limit/outage | Payment processing fails | ❌ None | Exponential backoff, Idempotency keys, Webhook replay, Manual fallback flag | S |
| **OpenAI API** | Rate limit/outage | AI meal generation fails | ❌ None | Fallback to cached recipes, Rate limit headers, Queue jobs with backoff, Feature flag kill switch | S |
| **SendGrid/Klaviyo** | API outage | Email/CRM sync fails | ❌ None | Queue emails, Retry with backoff, Fallback to alternative provider, Degraded mode (log only) | S |
| **Environment Config** | Missing/invalid env var | App fails to start | ⚠️ Runtime errors | Startup validation (Zod schema), Missing var warnings, Default values where safe, Config validation endpoint | S |
| **Next.js Build** | Build failure | Deployment blocked | ⚠️ CI checks | Build cache, Parallel builds, Incremental builds, Rollback to last successful build | S |
| **Database Migration** | Migration failure | Schema drift, app breaks | ⚠️ Manual review | Rollback on failure, Migration dry-run, Schema validation, Automated testing | M |
| **Webhook Verification** | Invalid signature | Security risk, data corruption | ⚠️ Manual secret config | Automated secret rotation, Signature validation tests, Webhook replay endpoint | S |
| **Queue Job Handler** | Unknown job type | Job fails, no error recovery | ❌ None | Type-safe registry, Unknown job handler (log + DLQ), Job schema validation, Job versioning | S |
| **Redis Connection** | Connection lost | Queue operations fail | ❌ None | Connection retry, Health checks, Graceful degradation (sync mode), Redis Sentinel support | M |
| **API Route Handler** | Unhandled exception | 500 error, user-facing failure | ⚠️ Next.js error boundary | Global error handler, Error logging (Sentry), User-friendly error pages, Retry logic where appropriate | S |
| **Database Query** | Slow query/N+1 | User latency, DB load | ⚠️ Supabase query timeout (default) | Query timeouts (per-query), Query monitoring, N+1 detection, Connection pool limits | M |
| **Feature Flag** | Flag service down | Feature flags default to false | ⚠️ Local config fallback | Local cache (TTL), Default values, Feature flag kill switch, Degraded mode | S |
| **Sentry** | Error tracking down | Errors not logged | ⚠️ Non-blocking | Local error logging fallback, Batch sending, Retry queue, Non-critical path | S |
| **PostHog/Analytics** | Analytics API down | Analytics data loss | ⚠️ Non-blocking | Local queue, Batch sending, Retry logic, Non-critical path | S |
| **Static Asset CDN** | CDN outage | Images/assets fail to load | ⚠️ Next.js fallback | Multiple CDN fallbacks, Local asset fallback, Graceful degradation (placeholder images) | S |
| **Session Storage** | Cookie/session loss | User logged out | ⚠️ Supabase session management | Session refresh, Persistent storage fallback, Session health checks | M |
| **Rate Limiting** | Bypass/absence | API abuse, cost overrun | ❌ None (no rate limiting found) | Per-IP rate limiting, Per-user rate limiting, API key quotas, Cost guards | M |

## Failure Propagation Scenarios

### Scenario 1: API Outage (Stripe)
**Trigger:** Stripe API returns 503  
**Propagation:**
1. Payment webhook fails → Queue job retries → Exhausts retries → DLQ
2. User payment attempt fails → User sees error → Retry button → Another API call
3. **Blast Radius:** All payment operations, subscription renewals
4. **Mitigation:** 
   - Idempotency keys (prevents duplicate charges)
   - Queue payment jobs with backoff
   - Manual payment processing fallback
   - User notification: "Payment processing delayed"

### Scenario 2: Auth/Token Expiry
**Trigger:** Supabase JWT expires, refresh fails  
**Propagation:**
1. User request → Invalid token → Auth redirect → Refresh attempt → Failure
2. User logged out → Data loss (unsaved work) → User frustration
3. **Blast Radius:** All authenticated users (if refresh service down)
4. **Mitigation:**
   - Token refresh retry (max 2)
   - Cached token (localStorage)
   - Graceful logout with save prompt
   - Token refresh queue (background)

### Scenario 3: Schema Mismatch
**Trigger:** Migration applied but code not deployed  
**Propagation:**
1. New code queries non-existent column → DB error → 500 error
2. User sees error → Retry → Same error → User gives up
3. **Blast Radius:** All users, all affected features
4. **Mitigation:**
   - Schema version checks (app startup)
   - Backward-compatible migrations
   - Feature flags for new schema usage
   - Rollback plan

### Scenario 4: Queue Backlog
**Trigger:** Worker crashes, jobs accumulate  
**Propagation:**
1. Queue fills (1000+ jobs) → Redis memory pressure → Redis slow
2. New jobs fail to enqueue → User actions delayed
3. Worker restarts → Processes old jobs → User confusion
4. **Blast Radius:** All background jobs (emails, digests, analytics)
5. **Mitigation:**
   - Queue size monitoring
   - Job prioritization (critical vs. batch)
   - Queue cleanup (old jobs)
   - Worker health checks + auto-restart

### Scenario 5: Rate Limit Hit
**Trigger:** OpenAI rate limit (429)  
**Propagation:**
1. AI meal generation fails → User retries → More rate limit hits
2. Cost increases (if not idempotent) → Budget exceeded
3. User frustration → Feature unusable
4. **Blast Radius:** All AI-powered features
5. **Mitigation:**
   - Rate limit headers (respect Retry-After)
   - Queue jobs with backoff
   - Cached responses (where applicable)
   - Feature flag kill switch
   - User notification: "AI suggestions temporarily unavailable"

## Critical Paths Without Fallback

| Path | Component | Fallback | User Impact |
|------|-----------|----------|-------------|
| **User Login** | Supabase Auth | ❌ None | User cannot access app |
| **Payment Processing** | Stripe API | ❌ None | User cannot purchase |
| **Data Queries** | Supabase DB | ❌ None | App functionality broken |
| **Queue Processing** | Redis + Worker | ❌ None | Background jobs fail silently |
| **AI Meal Generation** | OpenAI API | ⚠️ Cached recipes (if available) | Feature degraded |

## Proposed Minimal Guardrails

### Priority 1: Critical (Implement First)
1. **Redis Connection Resilience**
   - Retry with exponential backoff
   - Circuit breaker pattern
   - Health endpoint: `/api/health/queue`

2. **Queue Worker Auto-Restart**
   - PM2 or supervisor process manager
   - Health check endpoint
   - Dead letter queue (DLQ) for failed jobs

3. **Environment Variable Validation**
   - Zod schema for all env vars
   - Startup validation with clear errors
   - Missing var warnings (non-blocking where safe)

4. **API Route Error Handling**
   - Global error handler
   - User-friendly error responses
   - Error logging (Sentry)

5. **Rate Limiting**
   - Per-IP rate limiting (basic)
   - Per-user rate limiting (auth required)
   - API key quotas (if applicable)

### Priority 2: High Value (Implement Next)
1. **Idempotency Keys**
   - Payment operations
   - Webhook processing
   - Critical mutations

2. **Circuit Breaker Pattern**
   - External APIs (Stripe, OpenAI, SendGrid)
   - Configurable thresholds
   - Fallback responses

3. **Query Timeout Guards**
   - Per-query timeouts (30s default)
   - Connection pool limits
   - Slow query monitoring

4. **Job Retry with Backoff**
   - Exponential backoff (1s, 2s, 4s, 8s)
   - Max retries (3)
   - DLQ for permanent failures

5. **Feature Flag Kill Switches**
   - AI features
   - Payment processing
   - External integrations

### Priority 3: Nice to Have (Future)
1. **Read Replica Fallback**
   - Supabase read replicas
   - Automatic failover
   - Read/write splitting

2. **Multi-CDN Asset Delivery**
   - Primary + fallback CDN
   - Automatic failover
   - Local asset caching

3. **Session Refresh Queue**
   - Background token refresh
   - Persistent session storage
   - Graceful logout handling

## Implementation Checklist

### Phase 1: Foundation (≤1 day)
- [ ] Add Redis connection retry logic
- [ ] Add queue health endpoint
- [ ] Add environment variable validation (Zod)
- [ ] Add global error handler for API routes
- [ ] Add basic rate limiting

### Phase 2: Resilience (≤1 week)
- [ ] Implement circuit breaker for external APIs
- [ ] Add job retry with backoff
- [ ] Add dead letter queue (DLQ)
- [ ] Add worker auto-restart (PM2)
- [ ] Add idempotency keys for payments

### Phase 3: Monitoring (≤2 weeks)
- [ ] Add query timeout guards
- [ ] Add slow query monitoring
- [ ] Add queue size alerts
- [ ] Add health check dashboard
- [ ] Add failure rate metrics

### Phase 4: Advanced (≤3 weeks)
- [ ] Implement read replica fallback
- [ ] Add multi-CDN asset delivery
- [ ] Add session refresh queue
- [ ] Add automated failover testing
- [ ] Add chaos engineering tests
