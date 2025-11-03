# Disaster Recovery & Business Continuity Plan (DR/BCP)

## Overview

This document outlines Nomad's disaster recovery and business continuity procedures to ensure RTO ? 2 hours and RPO ? 15 minutes.

## Recovery Objectives

- **RTO (Recovery Time Objective):** ? 2 hours
- **RPO (Recovery Point Objective):** ? 15 minutes

## Backup Strategy

### Daily Backups

- **Database:** Postgres incremental backups (daily at 2 AM UTC)
- **Redis:** Point-in-time snapshots (daily at 3 AM UTC)
- **Storage:** Artifacts and evidence buckets (versioned, immutable)
- **Retention:** 30 days

### Backup Verification

- Weekly automated restore tests
- Checksum verification on all backups
- Automated alerts on backup failures

### Backup Locations

1. **Primary:** Object storage (S3/GCS) in primary region
2. **Secondary:** Object storage in different region (failover)

## Failover Procedures

### Database Failover

1. **Primary Database Failure:**
   - Automated detection via health checks (< 30 seconds)
   - Automatic failover to Supabase replica (multi-region)
   - DNS update via Cloudflare (TTL: 60 seconds)
   - Estimated RTO: 5 minutes

2. **Manual Failover Steps:**
   ```bash
   # 1. Verify backup availability
   pnpm backup:verify
   
   # 2. Initiate failover (updates DNS)
   # Configured in Cloudflare dashboard or via API
   
   # 3. Verify connection to replica
   curl https://api.nomad.app/healthz
   ```

### Application Failover

1. **Vercel Deployment:**
   - Automatic failover to edge regions
   - Canary deployment rollback available
   - Rollback command: `vercel rollback`

2. **Redis Failover:**
   - Failover to replica (if configured)
   - Fallback to database for critical operations

### Multi-Region Strategy

- **Primary Region:** us-east-1 (Supabase primary)
- **Secondary Region:** eu-west-1 (Supabase replica)
- **DNS Failover:** Cloudflare Load Balancer with health checks

## Restoration Procedures

### Database Restoration

```bash
# 1. Identify backup to restore
pnpm backup:list

# 2. Restore from backup
pnpm backup:restore --type=postgres --backup=<backup-id> --dry-run

# 3. Verify restore (dry-run first)
pnpm backup:restore --type=postgres --backup=<backup-id>

# 4. Verify data integrity
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### Complete System Restoration

1. **Prerequisites:**
   - Access to backup storage
   - Database credentials
   - DNS control (Cloudflare)

2. **Steps:**
   ```bash
   # 1. Restore database
   pnpm backup:restore --type=postgres --backup=<latest>
   
   # 2. Restore Redis (if needed)
   pnpm backup:restore --type=redis --backup=<latest>
   
   # 3. Restore artifacts
   pnpm backup:restore --type=artifacts --backup=<latest>
   
   # 4. Verify health
   curl https://api.nomad.app/healthz
   
   # 5. Update DNS if needed
   # Cloudflare dashboard or API
   ```

## Communication Plan

### Incident Notification

- **Slack:** #incidents channel
- **PagerDuty:** Critical alerts
- **Status Page:** https://status.nomad.app (if configured)

### Stakeholder Communication

1. **Internal:** Immediate notification via Slack
2. **Customers:** Status page update within 15 minutes
3. **External:** Public status updates every 30 minutes

## Testing & Validation

### Quarterly DR Drill

1. **Test Scenario:** Simulate primary region failure
2. **Execution:** Manual failover to secondary region
3. **Validation:**
   - Verify all services operational
   - Check data consistency
   - Validate RTO/RPO targets
4. **Documentation:** Post-mortem report within 48 hours

### Weekly Backup Verification

- Automated weekly restore test
- Checksum verification
- Alert on any failures

## Contact Information

- **On-Call Engineer:** PagerDuty rotation
- **Infrastructure Lead:** infrastructure@nomad.app
- **Emergency:** +1-XXX-XXX-XXXX (if available)

## Revision History

- **v1.0** (2024-01-XX): Initial DR/BCP document