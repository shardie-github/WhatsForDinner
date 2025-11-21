# Operations Runbook

**Product:** What's for Dinner  
**Last Updated:** 2025-01-09  
**Owner:** SRE Team  
**On-Call:** [Define Rotation]

---

## Quick Reference

### Emergency Contacts

- **On-Call Engineer:** [Phone/Email]
- **Engineering Lead:** [Phone/Email]
- **CTO:** [Phone/Email]
- **Supabase Support:** [Support Portal]
- **Vercel Support:** [Support Portal]

### Critical URLs

- **Production:** https://whatsfordinner.app
- **Staging:** https://staging.whatsfordinner.app
- **Monitoring:** [Grafana/Prometheus URL]
- **Supabase Dashboard:** [URL]
- **Vercel Dashboard:** [URL]

### Health Check Commands

```bash
# Overall health
npm run health:check

# Quick status
npm run health:status

# Database connectivity
npm run db:perf

# Security scan
npm run security:self-check

# Smoke test
npm run smoke:test
```

---

## Incident Response

### Severity Levels

**P0 - Critical (Respond Immediately)**
- Complete service outage
- Data breach or security incident
- Data loss or corruption
- Payment processing failure

**P1 - High (Respond within 1 hour)**
- Partial service degradation (>50% users affected)
- Authentication failures
- Database connection issues
- High error rate (>5%)

**P2 - Medium (Respond within 4 hours)**
- Performance degradation
- Feature failures (non-critical)
- Elevated error rate (1-5%)
- Third-party service issues

**P3 - Low (Respond within 24 hours)**
- Minor bugs
- Performance optimizations
- Documentation updates

### Incident Response Process

1. **Acknowledge** (5 min)
   - Acknowledge alert/incident
   - Assess severity
   - Notify team if P0/P1

2. **Investigate** (15 min)
   - Check monitoring dashboards
   - Review error logs
   - Check recent deployments
   - Identify root cause

3. **Mitigate** (30 min)
   - Apply immediate fix (if possible)
   - Rollback deployment (if needed)
   - Scale resources (if needed)
   - Disable feature (if needed)

4. **Resolve** (1 hour)
   - Verify fix works
   - Monitor for recurrence
   - Document incident
   - Post-mortem (for P0/P1)

---

## Common Incidents

### Database Connection Failures

**Symptoms:**
- 500 errors on API routes
- "Connection refused" errors
- Timeout errors

**Diagnosis:**
```bash
# Check database connectivity
npm run db:perf

# Check Supabase status
curl https://status.supabase.com/api/v2/status.json

# Check connection pool
# (In Supabase dashboard: Settings > Database > Connection Pooling)
```

**Resolution:**
1. Check Supabase status page
2. Verify connection pooler is enabled
3. Check connection pool limits
4. Restart connection pooler (if possible)
5. Scale database (if needed)

**Prevention:**
- Monitor connection pool metrics
- Set up alerts for connection failures
- Use connection pooling
- Implement retry logic

---

### High Error Rate

**Symptoms:**
- Error rate >1% (P2) or >5% (P1)
- User complaints
- Monitoring alerts

**Diagnosis:**
```bash
# Check error logs
# (In Supabase dashboard: Logs > API Logs)

# Check recent deployments
git log --oneline -10

# Run health check
npm run health:check
```

**Resolution:**
1. Identify error pattern (check logs)
2. Check recent code changes
3. Rollback if recent deployment caused it
4. Fix root cause
5. Deploy fix

**Common Causes:**
- Recent deployment bug
- External API failure (OpenAI, Supabase)
- Database performance issues
- Rate limiting triggered

---

### Authentication Failures

**Symptoms:**
- Users can't log in
- 401 errors spike
- Session expiration issues

**Diagnosis:**
```bash
# Check Supabase Auth status
# (In Supabase dashboard: Authentication > Logs)

# Test authentication
curl -X POST https://[project].supabase.co/auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

**Resolution:**
1. Check Supabase Auth service status
2. Verify RLS policies (may block auth)
3. Check for recent auth configuration changes
4. Clear session cache (if applicable)
5. Escalate to Supabase support if needed

**Prevention:**
- Monitor auth failure rates
- Test auth after deployments
- Review RLS policies regularly

---

### Performance Degradation

**Symptoms:**
- Slow page loads (>3s)
- API response times >1s
- High database query times

**Diagnosis:**
```bash
# Check performance metrics
npm run performance:audit

# Check database slow queries
npm run db:perf

# Check bundle size
npm run analyze:bundle
```

**Resolution:**
1. Identify slow endpoints (check monitoring)
2. Check database query performance
3. Review recent code changes
4. Optimize slow queries
5. Add caching if needed
6. Scale resources if needed

**Common Causes:**
- N+1 database queries
- Missing database indexes
- Large bundle size
- External API latency
- Connection pool exhaustion

---

### OpenAI API Failures

**Symptoms:**
- Meal suggestions fail
- 429 (rate limit) errors
- 500 errors from OpenAI
- High costs

**Diagnosis:**
```bash
# Check OpenAI status
curl https://status.openai.com/api/v2/status.json

# Check API usage
# (In OpenAI dashboard: Usage)

# Check error logs
# (Look for OpenAI API errors in logs)
```

**Resolution:**
1. Check OpenAI status page
2. Verify API key is valid
3. Check rate limits (requests/minute)
4. Check usage limits (tokens/month)
5. Implement retry logic with exponential backoff
6. Add caching for common requests
7. Implement fallback to cached recipes

**Prevention:**
- Monitor OpenAI API usage and costs
- Set up alerts for rate limits
- Implement rate limiting per user
- Cache common meal suggestions
- Use cheaper models when possible

---

### Data Loss or Corruption

**Symptoms:**
- Missing user data
- Corrupted meal plans
- Inconsistent database state

**Diagnosis:**
```bash
# Check backup status
npm run backup:verify

# Check database integrity
# (In Supabase dashboard: Database > Backups)

# Review recent migrations
git log --oneline supabase/migrations/
```

**Resolution:**
1. **DO NOT PANIC** - Assess scope of data loss
2. Check backup availability
3. Restore from backup if needed
4. Identify root cause (migration, bug, manual error)
5. Fix root cause
6. Verify data integrity
7. Notify affected users (if PII involved)

**Prevention:**
- Test migrations on staging first
- Verify backups daily
- Test restore procedures monthly
- Use transactions for critical operations
- Implement data validation

---

## Monitoring & Alerts

### Key Metrics to Monitor

**Availability:**
- Uptime (target: 99.9%)
- Error rate (target: <1%)
- Health check failures

**Performance:**
- API response time p95 (target: <500ms)
- Database query time p95 (target: <100ms)
- Page load time (target: <2.5s LCP)

**Reliability:**
- External API success rate (target: >99%)
- Database connection success rate (target: 100%)
- Retry success rate (target: >90%)

**Security:**
- Failed login attempts
- Unusual access patterns
- Security scan failures

### Alert Thresholds

**Critical Alerts (P0):**
- Service down (health check fails >2 min)
- Error rate >10%
- Data breach detected
- Payment processing down

**High Alerts (P1):**
- Error rate >5% for 5 min
- Database connection failures
- Authentication failures spike
- External API failures

**Warning Alerts (P2):**
- Error rate >1% for 10 min
- Performance degradation (p95 >1s)
- High database query times
- Rate limiting triggered

### Monitoring Tools

- **Prometheus:** Metrics collection (`prometheus.yml`)
- **Grafana:** Dashboards and visualization
- **Alertmanager:** Alert routing (`alertmanager.yml`)
- **Supabase Dashboard:** Database and auth monitoring
- **Vercel Dashboard:** Deployment and performance

---

## Deployment Procedures

### Pre-Deployment Checklist

- [ ] All tests pass (`npm test`)
- [ ] Security checks pass (`npm run security:self-check`)
- [ ] Performance budgets met (`npm run performance:budget`)
- [ ] Database migrations tested on staging
- [ ] Feature flags configured (if needed)
- [ ] Rollback plan documented

### Deployment Steps

1. **Deploy to Staging:**
   ```bash
   git checkout staging
   git merge main
   git push origin staging
   # Vercel auto-deploys staging
   ```

2. **Verify Staging:**
   ```bash
   npm run smoke:test
   npm run health:check
   ```

3. **Deploy to Production:**
   ```bash
   git checkout main
   git merge staging
   git tag v1.x.x
   git push origin main --tags
   # Vercel auto-deploys production
   ```

4. **Verify Production:**
   ```bash
   npm run smoke:test:full-stack
   # Monitor error rates for 15 min
   ```

### Rollback Procedure

1. **Identify Bad Deployment:**
   - Check git log for recent commits
   - Identify deployment that caused issues

2. **Rollback:**
   ```bash
   # In Vercel dashboard: Deployments > [deployment] > Rollback
   # Or via CLI:
   vercel rollback [deployment-url]
   ```

3. **Verify Rollback:**
   - Check health endpoints
   - Monitor error rates
   - Verify critical features work

---

## Database Operations

### Backup & Restore

**Backup:**
```bash
# Supabase handles automated backups
# Verify backups daily:
npm run backup:verify

# Manual backup (if needed):
# (In Supabase dashboard: Database > Backups > Create Backup)
```

**Restore:**
```bash
# Restore from backup:
npm run backup:restore

# Or via Supabase dashboard:
# Database > Backups > [backup] > Restore
```

**Backup Schedule:**
- Automated: Daily (Supabase default)
- Retention: 7 days (verify in Supabase settings)
- Test restore: Monthly

### Migrations

**Apply Migration:**
```bash
# Test on staging first:
supabase db push --db-url $STAGING_DB_URL

# Apply to production:
supabase db push --db-url $PRODUCTION_DB_URL

# Or via Supabase dashboard:
# Database > Migrations > [migration] > Apply
```

**Rollback Migration:**
```bash
# Create rollback migration:
supabase migration new rollback_[migration_name]

# Apply rollback:
supabase db push
```

**Migration Best Practices:**
- Always test on staging first
- Use transactions for data changes
- Add indexes in separate migrations
- Never drop columns without deprecation period
- Document breaking changes

---

## Maintenance Windows

### Weekly Maintenance

**Monday Morning:**
- Review weekend incidents
- Check error rates and performance
- Review security alerts
- Update on-call rotation

**Tasks:**
- Review monitoring dashboards
- Check backup status
- Review dependency updates
- Update documentation

### Monthly Maintenance

**First Monday of Month:**
- Security audit (see Security Checklist)
- Review and update risk register
- Test backup restore
- Review and optimize costs

**Tasks:**
- Rotate secrets (if due)
- Review and update RLS policies
- Review and update monitoring alerts
- Performance optimization review

### Quarterly Maintenance

**First Monday of Quarter:**
- Comprehensive security audit
- Penetration testing (if scheduled)
- Disaster recovery drill
- Capacity planning review

---

## Troubleshooting Guide

### API Route Returns 500

1. Check error logs (Supabase dashboard)
2. Check recent deployments
3. Verify environment variables
4. Check database connectivity
5. Review code changes

### Database Slow Queries

1. Check slow query log (Supabase dashboard)
2. Identify missing indexes
3. Review query patterns
4. Optimize queries
5. Add indexes if needed

### High Costs

1. Check OpenAI API usage
2. Check Supabase usage (database size, API calls)
3. Check Vercel usage (bandwidth, function invocations)
4. Identify cost drivers
5. Optimize or set budgets

### Feature Flag Issues

1. Check feature flag configuration
2. Verify flag evaluation logic
3. Check user eligibility
4. Review flag rollout percentage
5. Disable flag if causing issues

---

## Escalation Path

1. **Level 1:** On-call engineer handles
2. **Level 2:** Engineering lead notified (P1/P0)
3. **Level 3:** CTO notified (P0 only)
4. **Level 4:** External support (Supabase, Vercel)

---

## Post-Incident Review

### For P0/P1 Incidents

1. **Schedule Review:** Within 48 hours
2. **Attendees:** Incident responders, engineering lead
3. **Document:**
   - Timeline of events
   - Root cause analysis
   - Impact assessment
   - Actions taken
   - Prevention measures
4. **Follow-up:**
   - Implement prevention measures
   - Update runbook
   - Share learnings with team

### Template

```markdown
# Incident: [Title]
**Date:** [Date]
**Severity:** P0/P1
**Duration:** [Time]

## Timeline
- [Time] - Incident detected
- [Time] - Investigation started
- [Time] - Root cause identified
- [Time] - Fix applied
- [Time] - Incident resolved

## Root Cause
[Description]

## Impact
- Users affected: [Number]
- Features affected: [List]
- Data loss: [Yes/No]

## Actions Taken
1. [Action]
2. [Action]

## Prevention Measures
1. [Measure]
2. [Measure]
```

---

## Resources

- **Risk Register:** `/docs/RISK_REGISTER.md`
- **Security Checklist:** `/docs/SECURITY_CHECKLIST.md`
- **Architecture:** `/ARCHITECTURE.md`
- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs

---

**Last Updated:** 2025-01-09  
**Next Review:** 2025-02-09  
**On-Call Rotation:** [Define Schedule]
