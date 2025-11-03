# Disaster Recovery & Business Continuity Plan (DR/BCP)

## Overview

This document outlines the disaster recovery and business continuity procedures for Nomad, ensuring RTO ? 2 hours and RPO ? 15 minutes.

## Recovery Objectives

- **RTO (Recovery Time Objective)**: ? 2 hours
- **RPO (Recovery Point Objective)**: ? 15 minutes
- **Availability Target**: 99.9% (43.2 minutes downtime/month)

## Backup Strategy

### Database Backups

#### PostgreSQL (Supabase)
- **Frequency**: Daily incremental backups
- **Retention**: 30 days
- **Location**: Object storage (S3/GCS) with versioning
- **Encryption**: AES-256-GCM
- **Verification**: Weekly checksum validation

#### Redis
- **Frequency**: Daily snapshots
- **Retention**: 30 days
- **Location**: Object storage
- **Verification**: Restore test weekly

### Storage Backups

#### Artifacts
- **Frequency**: Daily incremental
- **Retention**: 30 days
- **Location**: Versioned object storage bucket

#### Evidence (Immutable)
- **Frequency**: Daily snapshots
- **Retention**: 7 years (compliance requirement)
- **Location**: Immutable, versioned object storage bucket

### Backup Automation

```bash
# Run daily backup
pnpm backup:run

# Verify backup
pnpm backup:verify

# Weekly restore test
pnpm backup:restore-test
```

## Failover Procedures

### Multi-Region Supabase Replica

1. **Primary Region**: us-east-1 (Supabase Primary)
2. **Failover Region**: us-west-2 (Supabase Read Replica)
3. **DNS Failover**: Cloudflare Load Balancer

### DNS Failover Steps

1. **Detection**: Health check failure > 5 minutes
2. **Manual Trigger**: Via Cloudflare dashboard or API
3. **DNS Update**: Point to failover region (< 5 minutes TTL)
4. **Verification**: Confirm failover region health
5. **Monitoring**: Monitor application metrics

### Cloudflare Load Balancer Configuration

```yaml
pools:
  - name: primary
    origins:
      - name: supabase-primary
        address: db.primary.supabase.co
        enabled: true
  - name: failover
    origins:
      - name: supabase-failover
        address: db.failover.supabase.co
        enabled: true
```

## Restore Procedures

### Full Database Restore

1. **Identify Backup**: Select backup point (? 15 min RPO)
2. **Download Backup**: From object storage
3. **Decrypt**: Using backup encryption key
4. **Verify Checksum**: Ensure integrity
5. **Restore**: `pnpm restore:run --backup=<path>`
6. **Verify**: Run smoke tests

### Point-in-Time Recovery

1. **Identify Timestamp**: Determine recovery point
2. **Base Backup**: Restore most recent full backup
3. **WAL Replay**: Replay transaction logs to target time
4. **Verification**: Validate data consistency

## DR Drill Schedule

- **Quarterly Full DR Drill**: Complete failover and restore test
- **Monthly Partial Drill**: Backup verification and restore test
- **Weekly Automated Tests**: Checksum verification

## Failover Runbook

### Step 1: Assess Situation
- [ ] Confirm primary region failure
- [ ] Check health endpoints
- [ ] Verify external dependencies

### Step 2: Activate Failover
- [ ] Notify on-call team
- [ ] Trigger DNS failover (Cloudflare)
- [ ] Update environment variables (if needed)
- [ ] Verify failover region health

### Step 3: Post-Failover
- [ ] Monitor application metrics
- [ ] Verify data consistency
- [ ] Notify stakeholders
- [ ] Document incident

### Step 4: Recovery
- [ ] Investigate root cause
- [ ] Plan primary region restoration
- [ ] Schedule cutback window
- [ ] Execute cutback

## Business Continuity

### Critical Systems

1. **User Authentication**: Must remain available
2. **Payment Processing**: Must remain available
3. **Data Privacy (DSAR)**: Must remain available
4. **Admin Console**: Degraded acceptable

### Communication Plan

- **Internal**: Slack #incidents channel
- **External**: Status page (status.nomad.app)
- **Stakeholders**: Email notification

## Backup Verification

### Daily Automated Checks
- Checksum validation
- Backup size verification
- Storage accessibility test

### Weekly Manual Tests
- Restore test (dry-run)
- Checksum match verification
- Performance validation

## Retention Policy

- **Database Backups**: 30 days
- **Storage Backups**: 30 days
- **Evidence Backups**: 7 years (compliance)
- **Audit Logs**: 1 year

## Restoration Contacts

- **Database Admin**: [Contact]
- **Infrastructure Lead**: [Contact]
- **On-Call Engineer**: [Contact]
- **Cloud Provider Support**: [Contact]

## Testing Checklist

- [ ] Backup creation works
- [ ] Backup encryption verified
- [ ] Backup restore works
- [ ] Checksum validation works
- [ ] Failover DNS works
- [ ] Failover region accessible
- [ ] Point-in-time recovery works
- [ ] Notification system works

## Evidence Collection

All DR activities are logged and stored in:
- Incident management system
- Audit logs
- Backup verification reports

## Compliance Notes

- **GDPR**: Backup encryption required
- **SOC 2**: DR procedures must be tested quarterly
- **ISO 27001**: BCP must be documented and tested
