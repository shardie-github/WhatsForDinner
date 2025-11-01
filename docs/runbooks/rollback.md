# Rollback Runbook

## Overview

This runbook describes the rollback procedure for "What's for Dinner".

---

## When to Rollback

Rollback should be considered when:

1. Health check endpoints return errors
2. Critical user flows are broken
3. Error rate spikes (>1% for 5 minutes)
4. Database issues occur
5. Security vulnerabilities are discovered
6. Performance degradation (>3s p95 latency)

---

## Rollback Strategy

### Application Rollback (Vercel)

Vercel automatically keeps previous deployments. Rollback is instant via dashboard.

### Database Rollback

?? **WARNING**: Database rollbacks require careful consideration of data safety.

---

## Quick Rollback (Application Only)

### Via Vercel Dashboard

1. Go to Vercel Dashboard
2. Select project
3. Go to "Deployments" tab
4. Find last known good deployment
5. Click "..." menu ? "Promote to Production"
6. Verify health checks pass

### Via Vercel CLI

```bash
vercel rollback [deployment-url]
```

---

## Full Rollback (Application + Database)

### Step 1: Application Rollback

Follow "Quick Rollback" steps above.

### Step 2: Database Rollback (If Needed)

?? **CAUTION**: Only rollback database if:

1. Migration introduced breaking changes
2. Data integrity is at risk
3. No data was created since migration

#### Create Rollback Migration

```sql
-- Example: Rollback migration for adding a column
-- File: apps/web/supabase/migrations/XXX_rollback_column.sql

BEGIN;

-- Drop the column added in the previous migration
ALTER TABLE recipes DROP COLUMN IF EXISTS new_column;

COMMIT;
```

#### Apply Rollback

```bash
cd whats-for-dinner
supabase db push --project-ref YOUR_PROJECT_REF
```

#### Verify Rollback

```sql
-- Verify schema is correct
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'recipes';
```

---

## Post-Rollback Validation

After rollback:

1. ? **Health Check**: `curl https://your-app.vercel.app/api/health`
2. ? **Readiness**: `curl https://your-app.vercel.app/api/readyz`
3. ? **Homepage**: Verify homepage loads
4. ? **Critical Flow**: Test recipe generation
5. ? **Error Monitoring**: Check Sentry for errors
6. ? **Database**: Verify schema is correct

---

## Data Safety Notes

### Before Rolling Back Database

1. **Backup**: Ensure backups are recent
2. **Data Loss**: Understand what data will be lost
3. **Dependencies**: Check if other services depend on new schema
4. **Timeline**: Consider time since deployment (more data = higher risk)

### Safe Rollback Patterns

1. **Additive Changes**: Usually safe to rollback (dropping columns/tables)
2. **Destructive Changes**: Risky (dropping data, changing types)
3. **RLS Policies**: Usually safe to rollback

### Unsafe Rollback Patterns

1. **Data Migrations**: May cause data inconsistencies
2. **Foreign Key Changes**: May break relationships
3. **Index Changes**: May impact performance but usually safe

---

## Rollback Testing

### Test Rollback Procedure

1. Deploy to staging
2. Test rollback procedure
3. Verify application works after rollback
4. Document any issues

---

## Communication

When performing rollback:

1. **Notify Team**: Alert team in Slack/Discord
2. **Document**: Document reason for rollback
3. **Investigate**: Create issue to investigate root cause
4. **Fix**: Create fix PR for the issue

---

## Rollback Checklist

- [ ] Identify last known good deployment
- [ ] Verify health checks before rollback
- [ ] Rollback application (Vercel)
- [ ] Assess if database rollback is needed
- [ ] If database rollback needed, verify data safety
- [ ] Apply database rollback (if needed)
- [ ] Verify post-rollback health checks
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Communicate rollback to team
- [ ] Document rollback reason
- [ ] Create issue to fix root cause

---

## Preventing Rollbacks

To prevent future rollbacks:

1. **Testing**: Comprehensive test coverage
2. **Staging**: Test in staging before production
3. **Gradual Rollout**: Use feature flags for risky changes
4. **Monitoring**: Set up alerts for critical metrics
5. **Reviews**: Thorough code reviews
6. **Documentation**: Document breaking changes

---

*Last updated: 2025-01-21*
