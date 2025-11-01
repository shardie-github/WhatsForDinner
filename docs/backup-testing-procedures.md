# Backup Testing Procedures

## Overview
This document outlines procedures for testing automated backups and disaster recovery capabilities.

## Current Status
- [x] Automated backups enabled (Supabase PITR)
- [x] Backup scripts created
- [ ] Backup restoration tested
- [ ] Disaster recovery procedure validated

## Backup Configuration

### Supabase Backups
- **Type**: Point-in-Time Recovery (PITR)
- **Retention**: 7 days (configurable)
- **Frequency**: Continuous (every few minutes)
- **Storage**: Supabase managed

### Manual Backup Script
Location: `scripts/backups-dr.js`

```bash
# Run manual backup
pnpm run backup:run

# Validate backup
pnpm run dr:validate
```

## Testing Schedule

### Weekly Tests
- [ ] Verify backup job completed successfully
- [ ] Check backup size is reasonable
- [ ] Verify backup is accessible

### Monthly Tests
- [ ] Test backup restoration
- [ ] Validate data integrity after restore
- [ ] Test disaster recovery procedure
- [ ] Document any issues found

### Quarterly Tests
- [ ] Full disaster recovery drill
- [ ] Test restoration to new environment
- [ ] Validate backup retention policies
- [ ] Review and update procedures

## Backup Testing Procedure

### Step 1: Verify Backup Exists
```bash
# Check Supabase dashboard for recent backups
# Or use Supabase CLI:
supabase backup list
```

### Step 2: Test Data Restoration
1. Create test database
2. Restore backup to test database
3. Verify data integrity:
   ```sql
   -- Check record counts
   SELECT COUNT(*) FROM recipes;
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM pantry_items;
   
   -- Check recent data
   SELECT * FROM recipes ORDER BY created_at DESC LIMIT 10;
   ```

### Step 3: Validate Schema
```sql
-- Verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verify RLS policies
SELECT tablename, policyname 
FROM pg_policies;
```

### Step 4: Test Application Connectivity
1. Update connection string to restored database
2. Test application functionality
3. Verify authentication works
4. Test recipe generation
5. Verify analytics data

## Disaster Recovery Testing

### Scenario 1: Complete Database Loss
1. Simulate database loss (on test instance)
2. Restore from latest backup
3. Verify application works
4. Document recovery time (RTO)
5. Verify data loss window (RPO)

### Scenario 2: Partial Data Corruption
1. Simulate corruption of specific tables
2. Restore affected tables from backup
3. Verify data integrity
4. Test application with restored data

### Scenario 3: Point-in-Time Recovery
1. Identify target recovery time
2. Restore to that specific point in time
3. Verify data at that point
4. Test application functionality

## Backup Validation Checklist

- [ ] Backup completes without errors
- [ ] Backup size is within expected range
- [ ] All tables are included in backup
- [ ] RLS policies are preserved
- [ ] Foreign key constraints are preserved
- [ ] Indexes are preserved
- [ ] Restored database can connect
- [ ] Application works with restored data
- [ ] No data corruption detected
- [ ] Recovery time meets SLA (RTO < 1 hour)

## Backup Monitoring

### Automated Alerts
Set up alerts for:
- Backup failures
- Backup size anomalies
- Backup age (if backup is too old)

### Monitoring Queries
```sql
-- Check last backup time (Supabase managed)
-- Note: This is typically managed by Supabase dashboard

-- Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));
```

## Recovery Time Objectives (RTO)

| Scenario | Target RTO | Current Performance |
|----------|------------|---------------------|
| Complete DB loss | < 1 hour | TBD |
| Partial corruption | < 30 minutes | TBD |
| Point-in-time restore | < 1 hour | TBD |

## Recovery Point Objectives (RPO)

| Data Type | Target RPO | Current Performance |
|-----------|-----------|---------------------|
| User data | < 5 minutes | Continuous (PITR) |
| Recipe data | < 5 minutes | Continuous (PITR) |
| Analytics | < 15 minutes | Continuous (PITR) |

## Backup Storage

### Current Setup
- **Provider**: Supabase
- **Location**: Supabase managed storage
- **Encryption**: At rest and in transit
- **Access**: Via Supabase dashboard or API

### Backup Retention
- **Daily backups**: 7 days
- **Weekly backups**: 4 weeks (if configured)
- **Monthly backups**: 12 months (if configured)

## Testing Documentation

### Test Results Template
```
Date: [Date]
Tester: [Name]
Backup Tested: [Backup ID/Time]
Test Type: [Full Restore/Point-in-Time/Partial]
Results:
- [ ] Backup accessible
- [ ] Restoration successful
- [ ] Data integrity verified
- [ ] Application works
- [ ] Performance acceptable
Issues Found: [List any issues]
Resolution: [How issues were resolved]
```

## Next Steps
1. Schedule first backup restoration test
2. Document recovery procedures
3. Set up backup monitoring alerts
4. Establish backup testing schedule
5. Train team on backup procedures
