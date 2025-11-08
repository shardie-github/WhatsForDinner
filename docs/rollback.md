# Database Rollback Guide

This guide explains how to rollback database migrations and restore from backups.

## Prerequisites

- Supabase project access
- Database backup (recommended before migrations)
- `psql` or Supabase SQL Editor access

## Creating Backups

### Before Migration

Always create a backup before running migrations:

```bash
# Using pg_dump
pg_dump "postgresql://postgres:PASSWORD@db.ghqyxhbyyirveptgwoqm.supabase.co:5432/postgres?sslmode=require" \
  > backup_$(date +%Y%m%d_%H%M%S).sql

# Or use Supabase Dashboard
# Dashboard → Database → Backups → Create Backup
```

### Automated Backup

Set up automated backups in Supabase Dashboard:
- Go to **Settings → Database → Backups**
- Enable **Point-in-time Recovery** (PITR)
- Configure backup retention period

## Rolling Back Migrations

### Method 1: Prisma Migrate Rollback

```bash
# Check migration status
pnpm prisma migrate status

# Rollback last migration
pnpm prisma migrate resolve --rolled-back <migration_name>

# Or reset to specific migration
pnpm prisma migrate reset --to <migration_name>
```

**Note**: `migrate reset` will **delete all data**. Use with caution.

### Method 2: Manual SQL Rollback

1. Identify the migration to rollback
2. Create reverse SQL script
3. Run in Supabase SQL Editor

Example:

```sql
-- Rollback 052_rls_app_tables.sql
DROP POLICY IF EXISTS "own read" ON public.users;
DROP POLICY IF EXISTS "own write" ON public.users;
-- ... etc
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

### Method 3: Restore from Backup

```bash
# Restore from backup file
psql "postgresql://postgres:PASSWORD@db.ghqyxhbyyirveptgwoqm.supabase.co:5432/postgres?sslmode=require" \
  < backup_20240101_120000.sql

# Or use Supabase Dashboard
# Dashboard → Database → Backups → Restore
```

## Point-in-Time Recovery (PITR)

If PITR is enabled in Supabase:

1. Go to Supabase Dashboard → Database → Backups
2. Select restore point (timestamp)
3. Click "Restore to this point"
4. Confirm restoration

**Warning**: This will restore the entire database to that point, losing all data after.

## Migration Status

### Check Applied Migrations

```bash
pnpm prisma migrate status
```

Or query directly:

```sql
SELECT * FROM _prisma_migrations ORDER BY finished_at DESC;
```

### Check Supabase Migrations

```sql
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC;
```

## Emergency Procedures

### Complete Database Reset

**⚠️ WARNING: This deletes all data**

```bash
# Reset Prisma migrations
pnpm prisma migrate reset

# Or manually drop and recreate
psql "postgresql://..." -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

### Restore from Production Backup

1. Export production database
2. Import to target environment
3. Verify data integrity
4. Update application configuration

## Best Practices

### Before Migrations

1. ✅ Create backup
2. ✅ Test migration on staging first
3. ✅ Review migration SQL
4. ✅ Check for breaking changes
5. ✅ Notify team

### During Migrations

1. ✅ Monitor migration progress
2. ✅ Check for errors
3. ✅ Verify data integrity
4. ✅ Test application functionality

### After Migrations

1. ✅ Verify migration applied successfully
2. ✅ Test critical functionality
3. ✅ Monitor error logs
4. ✅ Keep backup for 7+ days

## Troubleshooting

### Migration Stuck

1. Check database connection
2. Review migration SQL for locks
3. Check for long-running queries
4. Consider canceling and retrying

### Partial Migration Applied

1. Check `_prisma_migrations` table
2. Identify which steps completed
3. Manually complete or rollback
4. Fix migration script and retry

### Data Loss

1. Stop application immediately
2. Do NOT run more migrations
3. Restore from backup
4. Investigate root cause
5. Fix migration script
6. Retry migration

## Recovery Checklist

- [ ] Stop application traffic (if possible)
- [ ] Identify migration that caused issue
- [ ] Check if backup exists
- [ ] Restore from backup or rollback migration
- [ ] Verify data integrity
- [ ] Test application functionality
- [ ] Document incident
- [ ] Fix migration script
- [ ] Retry migration (if needed)

## Support

For Supabase-specific issues:
- Supabase Dashboard → Support
- Supabase Discord: https://discord.supabase.com
- Supabase Docs: https://supabase.com/docs
