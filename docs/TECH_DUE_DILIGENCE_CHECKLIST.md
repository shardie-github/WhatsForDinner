# Tech Due Diligence Checklist

**Purpose**: Minimal but sharp checklist for technical due diligence

---

## Tests to Add Soonest

### Critical Tests Missing

- [ ] **E2E User Journey Test** (`tests/e2e/user-journey.test.ts`)
  - Sign up → Add pantry → Generate recipe → Cook → Rate
  - **Priority**: HIGH
  - **Effort**: 4-6 hours

- [ ] **API Contract Tests** (`tests/api/contracts.test.ts`)
  - Test all API endpoints return expected schema
  - **Priority**: HIGH
  - **Effort**: 4-6 hours

- [ ] **Database Migration Tests** (`tests/db/migrations.test.ts`)
  - Test migrations can be applied and rolled back
  - **Priority**: MEDIUM
  - **Effort**: 2-3 hours

- [ ] **Multi-Tenant Isolation Tests** (`tests/security/tenant-isolation.test.ts`)
  - Verify RLS policies prevent cross-tenant access
  - **Priority**: HIGH
  - **Effort**: 3-4 hours

---

## Security Hotspots to Fix

### High Priority

- [ ] **Review RLS Policies** (`/supabase/migrations/014_consolidated_rls_security.sql`)
  - Verify all tables have RLS enabled
  - Test policies prevent unauthorized access
  - **Priority**: HIGH
  - **Effort**: 2-3 hours

- [ ] **Audit Environment Variables**
  - Ensure no secrets in code
  - Verify `.env.example` doesn't expose secrets
  - **Priority**: HIGH
  - **Effort**: 1 hour

- [ ] **API Rate Limiting**
  - Add rate limiting to API routes
  - Prevent abuse/DoS
  - **Priority**: MEDIUM
  - **Effort**: 4-6 hours

- [ ] **Input Validation**
  - Verify all user inputs are validated
  - Check for SQL injection, XSS vulnerabilities
  - **Priority**: HIGH
  - **Effort**: 4-6 hours

### Medium Priority

- [ ] **Secrets Rotation**
  - Document process for rotating secrets
  - Set up alerts for expired secrets
  - **Priority**: MEDIUM
  - **Effort**: 2-3 hours

- [ ] **Dependency Audit**
  - Run `pnpm audit` and fix vulnerabilities
  - Update dependencies regularly
  - **Priority**: MEDIUM
  - **Effort**: 1-2 hours

---

## Infrastructure & Data Risks

### Database Risks

- [ ] **Backup Strategy**
  - Verify Supabase backups are enabled
  - Test restore process
  - Document backup frequency
  - **Priority**: HIGH
  - **Effort**: 2-3 hours

- [ ] **Performance Monitoring**
  - Set up slow query monitoring
  - Add database performance alerts
  - **Priority**: MEDIUM
  - **Effort**: 3-4 hours

- [ ] **Schema Migration Safety**
  - Test migrations on staging first
  - Have rollback plan for each migration
  - **Priority**: HIGH
  - **Effort**: Ongoing

### Infrastructure Risks

- [ ] **Scalability Testing**
  - Load test API endpoints
  - Test database under load
  - Identify bottlenecks
  - **Priority**: MEDIUM
  - **Effort**: 8-10 hours

- [ ] **Cost Monitoring**
  - Set up cost alerts (Vercel, Supabase, OpenAI)
  - Track costs per user
  - **Priority**: MEDIUM
  - **Effort**: 2-3 hours

- [ ] **Disaster Recovery**
  - Document recovery procedures
  - Test failover scenarios
  - **Priority**: MEDIUM
  - **Effort**: 4-6 hours

### Data Risks

- [ ] **Data Retention Policies**
  - Document what data is kept and for how long
  - Implement data deletion for GDPR
  - **Priority**: HIGH
  - **Effort**: 4-6 hours

- [ ] **Data Export**
  - Implement user data export (GDPR requirement)
  - Test export functionality
  - **Priority**: HIGH
  - **Effort**: 4-6 hours

---

## Code Quality Issues

### High Priority

- [ ] **TypeScript Strict Mode**
  - Enable strict mode in `tsconfig.json`
  - Fix any types
  - **Priority**: MEDIUM
  - **Effort**: 8-10 hours

- [ ] **Test Coverage**
  - Increase coverage to 80%+
  - Focus on critical paths first
  - **Priority**: MEDIUM
  - **Effort**: Ongoing

### Medium Priority

- [ ] **Code Documentation**
  - Add JSDoc comments to public APIs
  - Document complex logic
  - **Priority**: LOW
  - **Effort**: Ongoing

- [ ] **Error Handling**
  - Ensure all errors are caught and logged
  - Add user-friendly error messages
  - **Priority**: MEDIUM
  - **Effort**: 4-6 hours

---

## Monitoring & Observability

### Missing Monitoring

- [ ] **Application Performance Monitoring**
  - Set up APM (Sentry, Datadog, etc.)
  - Track response times, error rates
  - **Priority**: HIGH
  - **Effort**: 2-3 hours

- [ ] **Business Metrics Dashboard**
  - Create `/admin/metrics` dashboard
  - Track DAU, MRR, retention
  - **Priority**: HIGH
  - **Effort**: 4-6 hours

- [ ] **Alerting**
  - Set up alerts for critical errors
  - Configure PagerDuty/Slack notifications
  - **Priority**: MEDIUM
  - **Effort**: 2-3 hours

---

## Summary

### Critical (Do First)
- E2E tests
- RLS policy review
- Backup strategy
- Data export (GDPR)
- Metrics dashboard

### Important (Do Soon)
- API contract tests
- Multi-tenant isolation tests
- Input validation
- Performance monitoring
- Cost monitoring

### Nice to Have (Do Later)
- Scalability testing
- Disaster recovery
- Code documentation
- TypeScript strict mode

---

**Last Updated**: 2025-01-28  
**Status**: ✅ Ready for use
