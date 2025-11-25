# Database Migrations & Schema Management

**Last Updated:** $(date)  
**Agent:** Unified Background Agent v3.0

---

## Overview

This document describes the database schema, migration strategy, and how to maintain consistency between Prisma schema and Supabase migrations.

---

## Schema Architecture

### Database Provider
- **Provider:** PostgreSQL (via Supabase)
- **ORM:** Prisma 5.22.0
- **Engine:** WASM (for Termux/Android compatibility)
- **Migration Tool:** Supabase CLI + Prisma Migrate

### Current Schema Status

**Tables in Prisma Schema:** 20+ tables
- Core: `users`, `households`, `recipes`, `meal_plans`, `grocery_lists`
- Growth: `referral_programs`, `referral_codes`, `referrals`, `email_subscriptions`
- Privacy: `privacy_prefs`, `app_allowlist`, `signal_toggles`, `telemetry_events`
- Compliance: `dsar_requests`, `privacy_transparency_log`, `mfa_enforced_sessions`

---

## Migration Directories

⚠️ **Current Issue:** Multiple migration directories detected

1. `/apps/web/supabase/migrations` - Primary location (37+ migrations)
2. `/supabase/migrations` - Secondary location
3. `/whats-for-dinner/supabase/migrations` - Legacy location

**Recommendation:** Consolidate all migrations into `/apps/web/supabase/migrations`

---

## Migration Naming Convention

### Current Patterns
- Timestamp-based: `20250109_affiliate_system.sql`
- Date-based: `2025-11-05_meal_prefs.sql`
- Sequential: `001_create_tables.sql`, `002_analytics_logging_tables.sql`
- Master: `99999999999999_master_consolidated_schema.sql`

### Recommended Standard
Use timestamp-based naming: `YYYYMMDDHHMMSS_description.sql`

Example: `20250109120000_add_user_preferences.sql`

---

## Schema Validation

### Running Schema Validation

```bash
# Check for schema drift
pnpm db:validate

# List all migrations
pnpm db:validate --list-migrations
```

### What It Checks

1. **Table Consistency**
   - Tables in Prisma schema exist in migrations
   - Tables in migrations exist in Prisma schema

2. **Migration Fragmentation**
   - Detects multiple migration directories
   - Warns about inconsistent naming

3. **Database Connection**
   - Validates DATABASE_URL is set
   - Tests Prisma connection

---

## Prisma Schema vs Supabase Migrations

### Current State

**Prisma Schema** (`prisma/schema.prisma`)
- Source of truth for TypeScript types
- Used by Prisma Client generation
- Defines relationships and constraints

**Supabase Migrations** (`apps/web/supabase/migrations/*.sql`)
- Source of truth for database structure
- Applied via Supabase CLI
- Contains RLS policies, functions, triggers

### Reconciliation Strategy

1. **Prisma First** (Recommended for new features)
   ```bash
   # 1. Update Prisma schema
   # 2. Generate migration
   pnpm prisma migrate dev --name add_feature
   # 3. Export to Supabase format
   pnpm db:sync
   ```

2. **SQL First** (For complex migrations)
   ```bash
   # 1. Create SQL migration
   # 2. Apply via Supabase CLI
   supabase migration up
   # 3. Pull schema changes to Prisma
   pnpm db:pull
   ```

---

## Migration Best Practices

### 1. Always Test Locally First

```bash
# Start local Supabase
supabase start

# Apply migrations
supabase migration up

# Verify schema
pnpm db:validate
```

### 2. Use Transactions

```sql
BEGIN;

-- Your migration SQL here

COMMIT;
```

### 3. Include Rollback Strategy

```sql
-- Migration: add_column_to_table
ALTER TABLE users ADD COLUMN new_field TEXT;

-- Rollback (keep in comments):
-- ALTER TABLE users DROP COLUMN new_field;
```

### 4. Document Breaking Changes

```sql
-- BREAKING CHANGE: Removes deprecated column
-- Migration: 20250109120000_remove_deprecated_field.sql
-- Affected: users table
-- Action Required: Update application code before deploying
ALTER TABLE users DROP COLUMN deprecated_field;
```

---

## Row-Level Security (RLS)

### RLS Policies

All user-scoped tables have RLS enabled:

```sql
-- Example: Users can only see their own data
CREATE POLICY "Users can view own data" ON recipes
  FOR SELECT USING (auth.uid() = user_id);
```

### Policy Management

- Policies are defined in migration files
- Test policies with `supabase db test`
- Document policy changes in migration comments

---

## Indexes

### Current Indexes

Key indexes defined in Prisma schema:
- `meal_plans_user_day_idx` - (userId, day)
- `health_metrics_user_kind_ts_idx` - (userId, kind, ts)
- `events_user_ts_idx` - (userId, ts)
- `messages_room_ts_idx` - (roomId, ts)

### Index Best Practices

1. **Index Foreign Keys**
   ```prisma
   @@index([userId], name: "recipes_user_id_idx")
   ```

2. **Index Query Patterns**
   ```prisma
   @@index([userId, day], name: "meal_plans_user_day_idx")
   ```

3. **Monitor Index Usage**
   ```sql
   SELECT * FROM pg_stat_user_indexes;
   ```

---

## Common Issues & Solutions

### Issue: Schema Drift

**Symptoms:**
- Prisma schema doesn't match database
- Migrations fail to apply

**Solution:**
```bash
# 1. Validate schema
pnpm db:validate

# 2. Sync Prisma from database
pnpm db:pull

# 3. Create migration to reconcile
pnpm prisma migrate dev --name reconcile_schema
```

### Issue: Migration Conflicts

**Symptoms:**
- Multiple migrations modify same table
- Migration order issues

**Solution:**
1. Review migration order
2. Consolidate conflicting migrations
3. Create baseline migration if needed

### Issue: RLS Policy Errors

**Symptoms:**
- Queries fail with permission errors
- Users can't access their own data

**Solution:**
```bash
# Test RLS policies
supabase db test

# Check policy definitions
psql $DATABASE_URL -c "\d+ recipes"
```

---

## Migration Workflow

### Development

1. **Create Migration**
   ```bash
   # Option 1: Prisma-first
   pnpm prisma migrate dev --name feature_name
   
   # Option 2: SQL-first
   touch apps/web/supabase/migrations/$(date +%Y%m%d%H%M%S)_feature_name.sql
   ```

2. **Test Locally**
   ```bash
   supabase migration up
   pnpm db:validate
   ```

3. **Commit Migration**
   ```bash
   git add apps/web/supabase/migrations/
   git commit -m "feat: add feature_name migration"
   ```

### CI/CD

Migrations are applied automatically via GitHub Actions:

**Workflow:** `.github/workflows/supabase-migrate.yml`

**Process:**
1. Validates migration files
2. Applies migrations to staging/production
3. Runs schema validation
4. Reports results

---

## Schema Documentation

### Table Relationships

```
users
  ├── households (owner)
  ├── household_members
  ├── meal_plans
  ├── recipes
  ├── health_metrics
  └── privacy_prefs

households
  ├── household_members
  ├── meal_plans
  ├── grocery_lists
  └── rooms

referral_programs
  ├── referral_codes
  └── referrals
```

### Key Constraints

- **UUID Primary Keys:** All tables use UUIDs
- **Cascade Deletes:** Related records deleted automatically
- **Timestamps:** Created/updated timestamps on all tables
- **JSONB Fields:** Flexible JSON storage for preferences

---

## Tools & Scripts

### Available Commands

```bash
# Generate Prisma Client
pnpm db:generate

# Create migration
pnpm db:migrate:dev

# Apply migrations
pnpm db:migrate

# Pull schema from database
pnpm db:pull

# Sync Prisma from Supabase
pnpm db:sync

# Validate schema
pnpm db:validate

# Open Prisma Studio
pnpm db:studio
```

---

## Future Improvements

1. **Consolidate Migrations**
   - Move all migrations to single directory
   - Create baseline migration
   - Archive old migrations

2. **Automated Testing**
   - Test migrations in CI
   - Validate RLS policies
   - Check for breaking changes

3. **Schema Documentation**
   - Auto-generate ER diagrams
   - Document all tables/columns
   - Maintain changelog

---

## References

- [Prisma Migration Guide](https://www.prisma.io/docs/guides/migrate)
- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/ddl-best-practices.html)
