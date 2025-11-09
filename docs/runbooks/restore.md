# Database Restore Runbook

## ⚠️ Important Notes

- **No PII:** This runbook contains only procedural steps. No sensitive data or credentials are included.
- **Backup Verification:** Always verify backup integrity before restore
- **Test Restores:** Perform test restores in staging environment first
- **Documentation:** Document all restore operations for audit purposes

## Prerequisites

- Access to Supabase dashboard or database admin access
- Backup file location and verification
- Staging environment for testing (recommended)
- Maintenance window scheduled (for production restores)

## Pre-Restore Checklist

- [ ] Backup verified and accessible
- [ ] Backup timestamp confirmed
- [ ] Restore point identified (timestamp or backup ID)
- [ ] Impact assessment completed
- [ ] Stakeholders notified
- [ ] Maintenance window scheduled (if production)
- [ ] Rollback plan prepared

## Restore Scenarios

### Scenario 1: Point-in-Time Restore (Supabase)

**Use Case:** Restore to a specific timestamp before data corruption or accidental deletion.

**Steps:**

1. **Access Supabase Dashboard**
   - Navigate to Database > Backups
   - Locate backup closest to desired restore point

2. **Verify Backup**
   - Check backup timestamp
   - Verify backup size and status
   - Confirm backup contains required data

3. **Create Restore Request**
   - Use Supabase dashboard restore feature
   - Select restore point (timestamp)
   - Choose target database (staging first, then production)

4. **Monitor Restore Progress**
   - Watch restore job status
   - Monitor database metrics
   - Check for errors in logs

5. **Verify Restore**
   - Run data integrity checks
   - Verify critical tables
   - Test application functionality
   - Compare record counts with expected values

6. **Post-Restore**
   - Update application configuration if needed
   - Notify stakeholders
   - Document restore operation
   - Schedule post-mortem if needed

### Scenario 2: Table-Level Restore

**Use Case:** Restore specific table(s) without full database restore.

**Steps:**

1. **Identify Affected Tables**
   - List tables to restore
   - Verify backup contains these tables

2. **Export from Backup** (if using SQL dump)
   ```bash
   # Extract specific table from backup
   pg_restore -t table_name backup.dump > table_restore.sql
   ```

3. **Restore to Staging First**
   - Restore table to staging database
   - Verify data integrity
   - Test application functionality

4. **Restore to Production**
   - Schedule maintenance window
   - Backup current state (safety measure)
   - Restore table
   - Verify restore

5. **Post-Restore**
   - Verify foreign key constraints
   - Check application functionality
   - Monitor for issues
   - Document operation

### Scenario 3: Schema-Only Restore

**Use Case:** Restore database schema without data (for structure recovery).

**Steps:**

1. **Export Schema from Backup**
   ```bash
   pg_dump --schema-only -f schema.sql database_name
   ```

2. **Review Schema**
   - Compare with current schema
   - Identify differences
   - Plan migration if needed

3. **Apply Schema**
   - Test in staging first
   - Apply to production during maintenance window
   - Verify schema changes

## Verification Steps

### Data Integrity Checks

```sql
-- Check table row counts
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Verify critical tables
SELECT COUNT(*) FROM critical_table;

-- Check for orphaned records
SELECT COUNT(*) FROM child_table c
LEFT JOIN parent_table p ON c.parent_id = p.id
WHERE p.id IS NULL;
```

### Application Verification

- [ ] Health check passes: `curl /api/health`
- [ ] Critical user flows work
- [ ] Authentication/authorization functional
- [ ] API endpoints respond correctly
- [ ] No error spikes in logs

## Rollback Plan

If restore causes issues:

1. **Immediate Actions**
   - Stop restore if in progress
   - Assess impact
   - Notify team

2. **Rollback Steps**
   - Restore from pre-restore backup (if created)
   - Or restore to previous known good state
   - Verify rollback success

3. **Post-Rollback**
   - Document what went wrong
   - Schedule post-mortem
   - Update restore procedures

## Post-Restore Tasks

### Immediate (0-1 hour)

- [ ] Verify data integrity
- [ ] Test critical application functions
- [ ] Monitor error rates
- [ ] Check performance metrics

### Short-term (1-24 hours)

- [ ] Monitor for data inconsistencies
- [ ] Review application logs
- [ ] Check user reports
- [ ] Verify backup system working

### Documentation

- [ ] Document restore operation
- [ ] Record restore point used
- [ ] Note any issues encountered
- [ ] Update runbook if procedures changed
- [ ] Schedule post-mortem if needed

## Backup Evidence

**Backup Metadata Location:** Check prior agent artifacts for backup evidence metadata.

**Verification:**
- Backup timestamp
- Backup size
- Backup location
- Backup verification status

**Note:** Full backup verification requires manual review of backup system logs and metadata.

## Related Documentation

- [Disaster Recovery Procedures](../disaster-recovery-procedures.md)
- [Backup Testing Procedures](../backup-testing-procedures.md)
- [Database Migration Guide](../../DATABASE_MIGRATION_GUIDE.md)

## Emergency Contacts

- **Database Admin:** [Contact Info]
- **DevOps Lead:** [Contact Info]
- **Supabase Support:** [If applicable]

---

**Last Updated:** {{ timestamp }}  
**Owner:** DevOps Team  
**Review Frequency:** Quarterly
