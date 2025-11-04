# Disaster Recovery Playbook

## Overview

This playbook defines automated procedures for disaster recovery rehearsals and actual recovery scenarios.

## Objectives

- **RTO (Recovery Time Objective)**: < 4 hours
- **RPO (Recovery Point Objective)**: < 1 hour (last snapshot)

## Pre-Flight Checks

Before running DR rehearsal:

```bash
# Check snapshot availability
pnpm ops snapshot list

# Verify backup encryption keys
# Verify Supabase project access
# Verify Vercel deployment access
```

## Quarterly DR Rehearsal

Automated CI job runs quarterly:

```yaml
# .github/workflows/dr-rehearsal.yml
name: DR Rehearsal
on:
  schedule:
    - cron: '0 0 1 */3 *' # Quarterly
```

### Steps

1. **Spin Temporary Environment**
   ```bash
   # Create temporary Supabase project
   supabase projects create --name dr-rehearsal-$(date +%s)
   ```

2. **Restore Latest Snapshot**
   ```bash
   pnpm ops restore snapshot-<latest-id>
   ```

3. **Run Smoke Tests**
   ```bash
   pnpm ops test:e2e
   pnpm ops check
   ```

4. **Verify Data Integrity**
   ```bash
   # Run data integrity checks
   pnpm ops sb-guard
   ```

5. **Measure RTO/RPO**
   - Record start time
   - Record completion time
   - Calculate RTO
   - Verify snapshot timestamp (RPO)

6. **Generate Report**
   - Output to `/ops/reports/dr-rehearsal-<timestamp>.md`
   - Include RTO/RPO metrics
   - Document any issues

7. **Cleanup**
   ```bash
   # Destroy temporary environment
   supabase projects delete <temp-project-id>
   ```

## Actual DR Scenario

### Detection

- Monitor alerts trigger DR protocol
- Verify incident severity
- Activate on-call engineer

### Recovery Steps

1. **Assess Damage**
   ```bash
   pnpm ops doctor
   pnpm ops check
   ```

2. **Restore Database**
   ```bash
   # List available snapshots
   pnpm ops snapshot list
   
   # Restore most recent
   pnpm ops restore snapshot-<id>
   ```

3. **Redeploy Application**
   ```bash
   # Trigger Vercel deployment
   vercel --prod
   ```

4. **Verify Recovery**
   ```bash
   pnpm ops test:e2e
   pnpm ops check
   ```

5. **Post-Recovery**
   - Document incident
   - Review RTO/RPO
   - Update playbook if needed

## Snapshot Strategy

- **Frequency**: Daily automated snapshots
- **Retention**: 30 days
- **Encryption**: All snapshots encrypted
- **Storage**: Multiple regions

## Communication

- **Slack**: #incidents channel
- **Status Page**: Update status page
- **Customers**: Email notification if > 1 hour downtime

## Testing Schedule

- **Quarterly**: Full DR rehearsal
- **Monthly**: Snapshot restore test
- **Weekly**: Smoke test on restored snapshot

## Success Criteria

✅ RTO < 4 hours
✅ RPO < 1 hour
✅ All smoke tests pass
✅ Data integrity verified
✅ Zero data loss
