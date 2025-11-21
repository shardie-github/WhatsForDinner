# Guardrails Implementation Guide

**Product:** What's for Dinner  
**Created:** 2025-01-09  
**Status:** Ready for Implementation

---

## Overview

This document outlines the guardrail systems and risk mitigations implemented to ensure the repository can grow safely without breaking everything. It provides a structured approach to reliability, security, and operational excellence.

---

## Deliverables

### 1. Risk Register (`/docs/RISK_REGISTER.md`)

Comprehensive technical risk assessment covering:
- **20 identified risks** across 5 categories (Data, Security, Reliability, Product/UX, Business)
- **Risk scoring** (Impact × Likelihood)
- **Mitigation strategies** for each risk
- **Ownership and review schedule**

**Key Risks Identified:**
- No retry logic for external APIs (Score: 6)
- OpenAI API rate limits and costs (Score: 6)
- Database connection pool exhaustion (Score: 6)
- PII exposure in logs (Score: 6)
- Silent authentication failures (Score: 4)

### 2. Security Checklist (`/docs/SECURITY_CHECKLIST.md`)

Pre-deployment and quarterly security audit checklist covering:
- Authentication & authorization
- Secrets management
- Input validation & injection prevention
- API security
- Data protection
- Infrastructure security
- Monitoring & incident response

### 3. Operations Runbook (`/docs/OPERATIONS_RUNBOOK.md`)

Practical guide for on-call engineers covering:
- Incident response procedures
- Common incidents and resolutions
- Monitoring & alerting
- Deployment procedures
- Database operations
- Maintenance windows

### 4. Guardrail Utilities (`/packages/utils/src/`)

Code utilities for reliability and error handling:
- **Retry logic** (`retry.ts`) - Exponential backoff, circuit breaker
- **Configuration** (`config.ts`) - Type-safe config with validation
- **Error handling** (`error-handler.ts`) - Structured error responses
- **Error taxonomy** (`errors.ts`) - Consistent error codes

---

## Implementation Priority

### Phase 1: Critical (Week 1)

**Must implement immediately:**

1. **Retry Logic for External APIs**
   - File: `/packages/utils/src/retry.ts`
   - Action: Wrap OpenAI API calls with retry utility
   - Impact: Prevents transient failures from affecting users

2. **Fix Silent Authentication Failures**
   - File: `/apps/web/src/app/api/user/me/route.ts`
   - Action: Use `AppError` class and return proper status codes
   - Impact: Better error messages, easier debugging

3. **PII Scrubbing in Logs**
   - File: `/apps/web/src/lib/logger.ts`
   - Action: Add `sanitizeContext()` function to strip PII
   - Impact: GDPR compliance, reduced privacy risk

### Phase 2: High Priority (Week 2-3)

**Implement within 2-3 weeks:**

4. **Error Handling Consistency**
   - File: `/packages/utils/src/error-handler.ts`
   - Action: Use `withErrorHandler` wrapper in all API routes
   - Impact: Consistent error responses, better UX

5. **Configuration Management**
   - File: `/packages/utils/src/config.ts`
   - Action: Migrate to centralized config with validation
   - Impact: Type safety, easier environment management

6. **Database Connection Monitoring**
   - Action: Add connection pool metrics to monitoring
   - Impact: Early detection of connection issues

### Phase 3: Medium Priority (Month 2)

**Implement within 1-2 months:**

7. **GDPR Compliance Endpoints**
   - Action: Implement `/api/user/data-export` and `/api/user/delete-account`
   - Impact: Legal compliance, user trust

8. **Backup Verification**
   - Action: Automate backup restore tests (monthly)
   - Impact: Confidence in disaster recovery

9. **OpenAI API Cost Controls**
   - Action: Implement rate limiting and cost tracking
   - Impact: Cost predictability, budget control

---

## Guardrail Systems

### 1. Feature Flags & Configuration Strategy

**Current State:**
- Feature flags table exists (`feature_flags`)
- No centralized configuration management

**Recommendation:**
- Use environment variables for feature flags (`FEATURE_*`)
- Implement feature flag service with user-level targeting
- Document feature flag lifecycle (create → test → rollout → deprecate)

**Implementation:**
```typescript
import { getFeatureFlag } from '@whats-for-dinner/utils/config';

if (getFeatureFlag('new_meal_suggestions')) {
  // New feature code
}
```

### 2. Logging & Structured Events

**Current State:**
- Logger exists (`apps/web/src/lib/logger.ts`)
- Logs written to database (`logs` table)
- No PII scrubbing

**Recommendation:**
- Implement structured logging with consistent schema
- Add PII scrubbing function
- Emit events for critical operations:
  - User signup/login
  - Meal suggestion generation
  - Payment processing
  - Data export/deletion

**Implementation:**
```typescript
import { logger } from '@/lib/logger';
import { sanitizeContext } from '@/lib/logger-utils';

logger.info('Meal suggestion generated', sanitizeContext({
  userId: user.id,
  pantryItems: pantryItems.length,
  // Email scrubbed automatically
}));
```

### 3. Monitoring & Alerting

**Current State:**
- Prometheus configured (`prometheus.yml`)
- Alert rules defined (`alerts.yml`)
- No comprehensive dashboard

**Recommendation:**
- Set up Grafana dashboards for:
  - Error rates by endpoint
  - API response times (p50, p95, p99)
  - Database connection pool metrics
  - External API success rates (OpenAI, Supabase)
- Configure alerts for:
  - Error rate >1% (P2) or >5% (P1)
  - Response time p95 >1s
  - Database connection failures
  - Backup failures

**Alert Thresholds:**
- **P0 (Critical):** Service down, error rate >10%
- **P1 (High):** Error rate >5%, auth failures
- **P2 (Medium):** Error rate >1%, performance degradation

### 4. Access Control Model

**Current State:**
- Supabase RLS policies exist
- Admin routes protected in preview
- No RBAC implementation

**Recommendation:**
- Implement role-based access control:
  - **User:** Own data only
  - **Household Member:** Shared household data
  - **Admin:** All data (with audit log)
- Add admin role check utility:
```typescript
export async function requireAdmin(userId: string): Promise<void> {
  const user = await usersRepo.findById(userId);
  if (user?.role !== 'admin') {
    throw new AuthorizationError('Admin access required');
  }
}
```

---

## Testing Strategy

### Critical Path Tests

**Must have tests for:**

1. **Authentication Flow**
   - Login success/failure
   - Session expiration
   - Token refresh

2. **Data Access**
   - User can only access own data
   - Household members can access shared data
   - RLS policies enforced

3. **Error Handling**
   - Proper error codes returned
   - User-friendly error messages
   - No stack traces in production

4. **External API Integration**
   - OpenAI API retry logic
   - Supabase connection retry
   - Rate limiting works

### Test Coverage Goals

- **Critical paths:** 80%+ coverage
- **API routes:** 70%+ coverage
- **Utilities:** 90%+ coverage
- **Overall:** 60%+ coverage

---

## Monitoring & Observability

### Key Metrics to Track

**Availability:**
- Uptime (target: 99.9%)
- Error rate (target: <1%)
- Health check success rate

**Performance:**
- API response time p95 (target: <500ms)
- Database query time p95 (target: <100ms)
- Page load time (target: <2.5s LCP)

**Reliability:**
- External API success rate (target: >99%)
- Retry success rate (target: >90%)
- Database connection success rate (target: 100%)

**Security:**
- Failed login attempts
- Unusual access patterns
- Security scan failures

### Structured Events to Emit

**User Events:**
- `user.signup` - User registered
- `user.login` - User logged in
- `user.logout` - User logged out
- `user.data_export` - User exported data
- `user.delete_account` - User deleted account

**Application Events:**
- `meal_suggestion.generated` - Meal suggestion created
- `meal_suggestion.accepted` - User accepted suggestion
- `meal_suggestion.rejected` - User rejected suggestion
- `recipe.viewed` - Recipe viewed
- `grocery_list.created` - Grocery list created

**System Events:**
- `api.error` - API error occurred
- `external_api.failure` - External API failed
- `database.slow_query` - Slow database query
- `backup.completed` - Backup completed
- `backup.failed` - Backup failed

---

## Configuration Management

### Environment Variables

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-only)

**Optional:**
- `OPENAI_API_KEY` - OpenAI API key
- `RETRY_MAX_ATTEMPTS` - Max retry attempts (default: 3)
- `API_TIMEOUT_MS` - API timeout (default: 30000)
- `FEATURE_*` - Feature flags

### Feature Flags

**Naming Convention:**
- `FEATURE_NEW_MEAL_SUGGESTIONS` - New meal suggestion algorithm
- `FEATURE_OFFLINE_MODE` - Offline recipe browsing
- `FEATURE_ADMIN_PANEL` - Admin panel access

**Lifecycle:**
1. Create flag in database
2. Add environment variable
3. Implement feature behind flag
4. Test with small user group
5. Rollout gradually
6. Remove flag after full rollout

---

## Rollout Plan

### Week 1: Foundation
- [ ] Implement retry logic utilities
- [ ] Fix silent authentication failures
- [ ] Add PII scrubbing to logger
- [ ] Update error handling in critical API routes

### Week 2: Configuration & Monitoring
- [ ] Migrate to centralized config
- [ ] Set up monitoring dashboards
- [ ] Configure alert thresholds
- [ ] Implement structured event logging

### Week 3: Testing & Documentation
- [ ] Add tests for critical paths
- [ ] Document guardrail systems
- [ ] Train team on new utilities
- [ ] Review and update runbooks

### Week 4: Compliance & Hardening
- [ ] Implement GDPR endpoints
- [ ] Set up backup verification
- [ ] Add cost controls for OpenAI
- [ ] Security audit

---

## Success Metrics

**Reliability:**
- Error rate <1% (currently unknown)
- Uptime >99.9% (currently unknown)
- External API success rate >99%

**Security:**
- Zero critical vulnerabilities
- All security checklist items pass
- No PII in logs

**Operational:**
- Mean time to resolution <1 hour (P1)
- All incidents documented
- Runbook usage >80% of incidents

---

## Maintenance

### Weekly
- Review error rates and performance
- Check security alerts
- Update risk register if new risks identified

### Monthly
- Security audit (see Security Checklist)
- Backup restore test
- Review and update monitoring alerts
- Performance optimization review

### Quarterly
- Comprehensive risk review
- Penetration testing (if scheduled)
- Disaster recovery drill
- Capacity planning review

---

## Resources

- **Risk Register:** `/docs/RISK_REGISTER.md`
- **Security Checklist:** `/docs/SECURITY_CHECKLIST.md`
- **Operations Runbook:** `/docs/OPERATIONS_RUNBOOK.md`
- **Retry Utility:** `/packages/utils/src/retry.ts`
- **Config Utility:** `/packages/utils/src/config.ts`
- **Error Handler:** `/packages/utils/src/error-handler.ts`

---

## Next Steps

1. **Review** this document with the team
2. **Prioritize** implementation tasks
3. **Assign** owners for each phase
4. **Schedule** implementation sprints
5. **Track** progress in project management tool

---

**Last Updated:** 2025-01-09  
**Next Review:** 2025-01-16  
**Owner:** Engineering Lead
