# Migration & Workflow Setup Summary

**Generated:** 2025-01-27  
**Status:** ✅ Complete  
**Action Required:** Set up GitHub Secrets and run migrations when DB is available

---

## Executive Summary

Successfully set up:
- ✅ Migration application scripts (idempotent, safe to re-run)
- ✅ GitHub Actions workflows (5 workflows added)
- ✅ Manual check scripts (dry-run support)
- ✅ Master setup documentation

**Next Steps:**
1. Set up GitHub Secrets (SUPABASE_DB_URL required)
2. Run migrations: `./scripts/apply_migrations.sh`
3. Run checks: `./scripts/run_all_checks.sh --live`
4. Verify workflows in GitHub Actions tab

---

## Migrations Setup

### Migration Files
- `/supabase/migrations/000000000800_upsert_functions.sql` - Self-healing SQL pack (idempotent)
- All existing migrations in `/supabase/migrations/` are ready to apply

### Migration Scripts Created
1. **`/scripts/apply_migrations.sh`** - Bash script for applying migrations
   - Supports `--dry-run` mode
   - Tries Supabase CLI first, falls back to psql
   - Safe to re-run (idempotent migrations)

2. **`/scripts/apply_all_migrations.ts`** - TypeScript script for applying migrations
   - Tracks applied migrations in `_migrations_applied` table
   - Supports `--dry-run` mode
   - Safe to re-run

### How to Apply Migrations

**Option 1: Bash Script (Recommended)**
```bash
# Dry-run first
./scripts/apply_migrations.sh --dry-run

# Apply for real
./scripts/apply_migrations.sh
```

**Option 2: TypeScript Script**
```bash
# Dry-run first
tsx scripts/apply_all_migrations.ts --dry-run

# Apply for real
tsx scripts/apply_all_migrations.ts
```

**Option 3: Supabase CLI**
```bash
supabase db push --db-url "$SUPABASE_DB_URL" --include-all
```

**Option 4: Direct psql**
```bash
for f in $(ls -1 supabase/migrations/*.sql | sort -V); do
  psql "$SUPABASE_DB_URL" -f "$f"
done
```

---

## GitHub Actions Workflows Added

All workflows have been added to `.github/workflows/`:

### 1. Preflight Checks (`preflight.yml`)
- **Triggers:** Manual, Pull Requests to main
- **Purpose:** Check environment variables and database connectivity
- **Status:** ✅ Added

### 2. Data Quality Checks (`data-quality.yml`)
- **Triggers:** Nightly (02:00 America/Toronto), Manual
- **Purpose:** Run data quality checks, recompute metrics
- **Status:** ✅ Added

### 3. Nightly ETL (`nightly-etl.yml`)
- **Triggers:** Nightly (01:10 America/Toronto), Manual
- **Purpose:** Run ETL pipeline (events, ads sources, metrics)
- **Status:** ✅ Added

### 4. Supabase Delta Apply (`supabase-delta-apply.yml`)
- **Triggers:** Manual, Push to main (when migrations change)
- **Purpose:** Generate delta migration, apply via CLI/psql, verify
- **Status:** ✅ Added

### 5. System Health (`system-health.yml`)
- **Triggers:** Weekly (Monday 07:30 UTC), Manual
- **Purpose:** Generate system health reports
- **Status:** ✅ Added

### Verification
```bash
ls -la .github/workflows/preflight.yml
ls -la .github/workflows/data-quality.yml
ls -la .github/workflows/nightly-etl.yml
ls -la .github/workflows/supabase-delta-apply.yml
ls -la .github/workflows/system-health.yml
```

---

## Manual Check Scripts

### `/scripts/run_all_checks.sh`
Runs all scripts flagged for manual execution:
- Preflight checks
- Delta migration generation
- ETL smoke tests (dry-run)
- Database verification
- Data quality checks
- System doctor

**Usage:**
```bash
# Dry-run (no DB connection needed)
./scripts/run_all_checks.sh

# Live mode (requires DB connection)
./scripts/run_all_checks.sh --live
```

---

## Required GitHub Secrets

Add these in GitHub → Settings → Secrets and variables → Actions:

### Required
- `SUPABASE_DB_URL` - PostgreSQL connection string

### Optional
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SLACK_WEBHOOK_URL` - Slack webhook for notifications
- `GENERIC_SOURCE_A_TOKEN` - Source A API token
- `GENERIC_SOURCE_B_TOKEN` - Source B API token

---

## Migration Status

### New Migration Created
- `000000000800_upsert_functions.sql` - Self-healing SQL pack
  - Extensions: pgcrypto, pg_trgm
  - Tables: events, spend, metrics_daily
  - Indexes: idx_events_name_time, idx_spend_platform_dt, idx_metrics_day
  - Functions: upsert_events, upsert_spend, recompute_metrics_daily, system_healthcheck
  - RLS: Enabled with basic SELECT policies
  - **Status:** Ready to apply (idempotent)

### Existing Migrations
- All migrations in `/supabase/migrations/` are ready to apply
- Use `./scripts/apply_migrations.sh` to apply all in order

---

## Execution Order

### Step 1: Set Up Secrets
1. Go to GitHub → Settings → Secrets and variables → Actions
2. Add `SUPABASE_DB_URL` (required)
3. Add optional secrets as needed

### Step 2: Apply Migrations
```bash
# Test first (dry-run)
./scripts/apply_migrations.sh --dry-run

# Apply for real
./scripts/apply_migrations.sh
```

### Step 3: Run Checks
```bash
# Test first (dry-run)
./scripts/run_all_checks.sh

# Run for real (requires DB)
./scripts/run_all_checks.sh --live
```

### Step 4: Verify Workflows
1. Go to GitHub → Actions tab
2. Verify workflows are visible
3. Trigger manually to test (workflow_dispatch)

---

## Files Created/Modified

### Scripts
- ✅ `/scripts/apply_migrations.sh` - Migration application script
- ✅ `/scripts/apply_all_migrations.ts` - TypeScript migration script
- ✅ `/scripts/run_all_checks.sh` - All checks runner
- ✅ `/scripts/MASTER_SETUP.md` - Setup documentation

### GitHub Actions Workflows
- ✅ `/.github/workflows/preflight.yml` - Preflight checks
- ✅ `/.github/workflows/data-quality.yml` - Data quality checks
- ✅ `/.github/workflows/nightly-etl.yml` - Nightly ETL
- ✅ `/.github/workflows/supabase-delta-apply.yml` - Delta migrations
- ✅ `/.github/workflows/system-health.yml` - System health

### Reports
- ✅ `/reports/exec/migration_and_workflow_setup_2025-01-27.md` - This file

---

## Next Steps

1. **Immediate:**
   - [ ] Set up GitHub Secrets (SUPABASE_DB_URL required)
   - [ ] Run `./scripts/apply_migrations.sh --dry-run` to verify
   - [ ] Apply migrations: `./scripts/apply_migrations.sh`

2. **Short-term:**
   - [ ] Run checks: `./scripts/run_all_checks.sh --live`
   - [ ] Verify workflows in GitHub Actions tab
   - [ ] Test workflows manually (workflow_dispatch)

3. **Ongoing:**
   - [ ] Monitor nightly ETL runs
   - [ ] Review weekly system health reports
   - [ ] Check data quality alerts

---

## Troubleshooting

### Migrations fail with "already exists"
✅ **Expected** - Migrations use `IF NOT EXISTS` and are idempotent. Safe to re-run.

### Database connection fails
- Verify `SUPABASE_DB_URL` is set correctly
- Check network connectivity
- Verify database is accessible

### Scripts fail with "command not found"
- Install dependencies: `npm install` or `pnpm install`
- Use `npx tsx` instead of `tsx` if not globally installed

### GitHub Actions workflows not running
- Verify workflows exist in `.github/workflows/`
- Check GitHub Actions tab for errors
- Verify secrets are set correctly
- Trigger manually via workflow_dispatch

---

**Generated by:** Migration & Workflow Setup System  
**Next Review:** After migrations are applied and workflows are verified
