# Production Deployment Runbook

**Version**: 1.0  
**Last Updated**: 2025-01-21  
**Owner**: DevOps Team

---

## Overview

This runbook provides step-by-step instructions for deploying What's For Dinner to production. Follow these procedures carefully to ensure a safe and successful deployment.

---

## Pre-Deployment Checklist

### 1. Pre-Deployment Validation

Run all validation checks before proceeding:

```bash
# Run comprehensive checks
pnpm check:all

# Individual checks
pnpm lint
pnpm type-check
pnpm test
pnpm rls:test
pnpm db:perf
pnpm health:check
pnpm security:audit
pnpm slo:check
```

**All checks must pass before proceeding.**

### 2. Staging Validation

Ensure staging deployment is successful and validated:

- [ ] Staging deployment successful
- [ ] All critical user journeys tested in staging
- [ ] Database migrations tested in staging
- [ ] Performance metrics within SLO targets
- [ ] No critical errors in staging logs
- [ ] Feature flags configured correctly

### 3. Pre-Launch Communication

- [ ] Team notified of deployment window
- [ ] Stakeholders informed (if applicable)
- [ ] Support team briefed
- [ ] Maintenance window scheduled (if needed)

---

## Deployment Procedure

### Phase 1: Pre-Deployment

#### 1.1 Backup Database

```bash
# Create manual backup
cd whats-for-dinner
supabase db dump --project-ref <PRODUCTION_REF> > backup_$(date +%Y%m%d_%H%M%S).sql

# Or use Supabase dashboard:
# Dashboard > Database > Backups > Create Backup
```

**Verify backup completion before proceeding.**

#### 1.2 Verify Environment Variables

Check all required environment variables are set in Vercel:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `OPENAI_API_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_APP_URL`

#### 1.3 Check Feature Flags

Review feature flag configuration in Supabase:

```sql
-- Check active feature flags
SELECT name, is_enabled, environment, rollout_percentage 
FROM config_flags 
WHERE is_enabled = true;
```

Verify:
- [ ] No beta features enabled in production
- [ ] Maintenance mode disabled
- [ ] Rollout percentages appropriate

---

### Phase 2: Database Migration

#### 2.1 Review Migrations

```bash
cd whats-for-dinner
supabase migration list
```

Verify:
- [ ] All migrations tested in staging
- [ ] Migration order correct
- [ ] No conflicting migrations

#### 2.2 Apply Migrations (If Needed)

```bash
# Check pending migrations
supabase migration list --project-ref <PRODUCTION_REF>

# Apply migrations
supabase db push --project-ref <PRODUCTION_REF>
```

**IMPORTANT**: Only apply migrations if they've been tested in staging.

#### 2.3 Verify Migration Success

```bash
# Check migration status
supabase migration list --project-ref <PRODUCTION_REF>

# Run RLS tests
pnpm rls:test

# Check database performance
pnpm db:perf
```

---

### Phase 3: Application Deployment

#### 3.1 Promote to Production (Vercel)

**Option A: Via GitHub Actions (Recommended)**

1. Go to GitHub Actions → Vercel Promotion Gates
2. Run workflow with:
   - Environment: `production`
   - Branch: `main`
3. Wait for all checks to pass
4. Review deployment preview

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login
vercel login

# Promote latest deployment
vercel promote <deployment-url> --prod
```

#### 3.2 Verify Deployment

```bash
# Health check
curl -f https://whats-for-dinner.vercel.app/api/health

# Expected response: {"status":"healthy","timestamp":"..."}
```

---

### Phase 4: Post-Deployment Validation

#### 4.1 Smoke Tests

Run critical path tests:

```bash
# Health check
curl -f https://whats-for-dinner.vercel.app/api/health

# API endpoint test
curl -f https://whats-for-dinner.vercel.app/api/recipes/popular

# Check homepage loads
curl -I https://whats-for-dinner.vercel.app/
```

#### 4.2 Functional Tests

Manually verify:
- [ ] Homepage loads correctly
- [ ] Sign up flow works
- [ ] Login works
- [ ] Recipe generation works
- [ ] Payment flow works (test mode)

#### 4.3 Performance Check

```bash
# Run performance audit
pnpm perf:analyze

# Check SLOs
pnpm slo:check
```

Verify:
- [ ] API latency p95 < 300ms
- [ ] Error rate < 0.1%
- [ ] Availability ≥ 99.9%

---

### Phase 5: Monitoring

#### 5.1 Monitor Key Metrics (First 30 Minutes)

Watch for:
- Error rate spikes
- Latency increases
- Unusual traffic patterns
- Database connection issues
- API failures

#### 5.2 Check Logs

```bash
# Vercel logs (via dashboard or CLI)
vercel logs --follow

# Supabase logs
# Dashboard > Logs > API Logs
```

#### 5.3 Verify Analytics

- [ ] Events tracking correctly
- [ ] Conversions tracked
- [ ] No tracking errors

---

## Rollback Procedure

If critical issues arise:

### Quick Rollback (≤ 5 minutes)

1. **Identify Issue**: Check error logs and monitoring
2. **Assess Impact**: Determine if rollback needed
3. **Promote Previous Deployment**:
   ```bash
   vercel promote <previous-deployment-url> --prod
   ```
4. **Verify Rollback**: 
   ```bash
   curl -f https://whats-for-dinner.vercel.app/api/health
   ```
5. **Notify Team**: Alert stakeholders of rollback

### Full Rollback Procedure

See [DOCS/RELEASES.md](./DOCS/RELEASES.md) for detailed rollback steps.

---

## Emergency Procedures

### Critical Issue Detected

1. **Immediate Action**: Rollback to last known good state
2. **Investigation**: Root cause analysis
3. **Communication**: Notify team and stakeholders
4. **Fix**: Develop fix in separate branch
5. **Testing**: Thoroughly test fix in staging
6. **Re-deploy**: Follow deployment procedure

### Database Issues

1. **Check Migration Status**: Verify migrations completed
2. **Check Connection**: Verify database connectivity
3. **Review Logs**: Check for errors
4. **Rollback Migration**: If migration caused issue
5. **Restore Backup**: If data corruption suspected

### Performance Issues

1. **Check SLO Dashboard**: Review performance metrics
2. **Identify Bottleneck**: Database, API, or frontend
3. **Scale Resources**: If infrastructure issue
4. **Optimize Queries**: If database issue
5. **Enable Feature Flags**: Rollback features if needed

---

## Post-Deployment Tasks

### Immediate (Within 1 Hour)

- [ ] Monitor error rates and logs
- [ ] Verify critical user journeys
- [ ] Check performance metrics
- [ ] Review analytics events
- [ ] Confirm no critical issues

### Short Term (Within 24 Hours)

- [ ] Review daily metrics
- [ ] Check user feedback
- [ ] Analyze conversion funnel
- [ ] Review error reports
- [ ] Update documentation if needed

### Weekly

- [ ] Review SLO performance
- [ ] Analyze user metrics
- [ ] Review cost analysis
- [ ] Plan next deployment
- [ ] Update runbooks

---

## Common Issues & Solutions

### Issue: Build Fails

**Symptoms**: Vercel build fails  
**Solution**:
1. Check build logs for errors
2. Verify environment variables
3. Check dependency versions
4. Review recent code changes

### Issue: Migration Fails

**Symptoms**: Database migration error  
**Solution**:
1. Check migration SQL syntax
2. Verify database permissions
3. Check for conflicting migrations
4. Review migration order

### Issue: High Error Rate

**Symptoms**: Error rate > 0.1%  
**Solution**:
1. Check application logs
2. Review recent changes
3. Check database connectivity
4. Verify API endpoints
5. Consider rollback if critical

### Issue: Performance Degradation

**Symptoms**: Latency > 300ms p95  
**Solution**:
1. Check database query performance
2. Review API endpoint performance
3. Check for resource constraints
4. Review recent code changes
5. Consider scaling resources

---

## Success Criteria

Deployment is successful if:

- ✅ All smoke tests pass
- ✅ Health check returns healthy
- ✅ Error rate < 0.1%
- ✅ API latency p95 < 300ms
- ✅ Critical user journeys work
- ✅ No critical errors in logs
- ✅ Analytics tracking correctly

---

## Contacts

### Deployment Support

- **DevOps Team**: devops@whats-for-dinner.com
- **On-Call**: Check PagerDuty/on-call rotation
- **Emergency**: +1-XXX-XXX-XXXX

### Escalation Path

1. **Level 1**: Development team
2. **Level 2**: DevOps team
3. **Level 3**: Engineering leadership
4. **Level 4**: Emergency response team

---

## Appendix

### Required Environment Variables

See [.env.example](./.env.example) for complete list.

### Key Commands Reference

```bash
# Health check
pnpm health:check

# Security audit
pnpm security:audit

# Performance check
pnpm perf:analyze

# RLS test
pnpm rls:test

# SLO check
pnpm slo:check

# Full validation
pnpm check:all
```

### Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [GitHub Actions](https://github.com/whats-for-dinner/actions)

---

**Last Updated**: 2025-01-21  
**Next Review**: Quarterly or after significant changes