# 🚀 Self-Healing Data & Systems Stack - Execution Guide

**Status:** ✅ All scripts ready and tested  
**Last Updated:** 2025-01-27

---

## Quick Start

```bash
# 1. Set database connection
export SUPABASE_DB_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# 2. Run everything
./scripts/RUN_NOW.sh
```

---

## What Was Created

### ✅ Execution Scripts (5)
- `scripts/RUN_NOW.sh` - Quick execution wrapper
- `scripts/execute_migrations_and_checks.ts` - Complete execution
- `scripts/apply_migrations.sh` - Migration application
- `scripts/apply_all_migrations.ts` - TypeScript migration script
- `scripts/run_all_checks.sh` - All checks runner

### ✅ GitHub Actions Workflows (7)
- `.github/workflows/preflight.yml` - Preflight checks
- `.github/workflows/data-quality.yml` - Nightly DQ checks
- `.github/workflows/nightly-etl.yml` - Nightly ETL
- `.github/workflows/supabase-delta-apply.yml` - Delta migrations
- `.github/workflows/system-health.yml` - Weekly health sweep
- Plus 2 existing workflows

### ✅ Migrations (47)
- All migrations in `/supabase/migrations/` ready
- New: `000000000800_upsert_functions.sql` (self-healing SQL pack)
- All idempotent (safe to re-run)

### ✅ Documentation (7 files)
- `/reports/exec/EXECUTION_READY.md` - Execution guide
- `/reports/exec/FINAL_EXECUTION_STATUS.md` - Final status
- `/reports/exec/migration_and_workflow_setup_2025-01-27.md` - Setup summary
- `/reports/exec/run_summary_2025-01-27.md` - Run summary
- `/scripts/MASTER_SETUP.md` - Master setup guide
- Plus 2 more reports

---

## Execution Options

### Option 1: Run Everything (Recommended)
```bash
export SUPABASE_DB_URL="your-connection-string"
./scripts/RUN_NOW.sh
```

### Option 2: Step-by-Step
```bash
# 1. Apply migrations
./scripts/apply_migrations.sh

# 2. Run checks
./scripts/run_all_checks.sh --live

# 3. Verify
tsx scripts/agents/verify_db.ts
```

### Option 3: TypeScript Direct
```bash
export SUPABASE_DB_URL="your-connection-string"
tsx scripts/execute_migrations_and_checks.ts
```

---

## What Gets Executed

When you run `./scripts/RUN_NOW.sh`, it will:

1. ✅ **Apply Migrations** (47 files, idempotent)
2. ✅ **Preflight Checks** (env vars, DB connectivity)
3. ✅ **Generate Delta Migration** (missing objects only)
4. ✅ **Verify Database** (tables, columns, indexes, RLS)
5. ✅ **ETL Smoke Tests** (dry-run)
6. ✅ **Data Quality Checks** (NOT NULL, freshness, duplicates)
7. ✅ **System Doctor** (self-healing, creates tickets on failure)

---

## Testing (Dry-Run)

All scripts support dry-run mode:

```bash
# Test migrations
./scripts/apply_migrations.sh --dry-run

# Test ETL
tsx scripts/etl/pull_events.ts --dry-run
tsx scripts/etl/pull_ads_source_a.ts --dry-run
tsx scripts/etl/pull_ads_source_b.ts --dry-run
tsx scripts/etl/compute_metrics.ts --dry-run

# Test checks
./scripts/run_all_checks.sh  # Dry-run by default
```

---

## GitHub Actions

Workflows are configured and ready:

- **Preflight:** Runs on PRs to main
- **Data Quality:** Nightly at 02:00 America/Toronto
- **Nightly ETL:** Nightly at 01:10 America/Toronto
- **Delta Migrations:** On push to main (when migrations change)
- **System Health:** Weekly on Mondays at 07:30 UTC

**Required Secrets:**
- `SUPABASE_DB_URL` (required)
- `SLACK_WEBHOOK_URL` (optional)
- `GENERIC_SOURCE_A_TOKEN` (optional)
- `GENERIC_SOURCE_B_TOKEN` (optional)

---

## Troubleshooting

### "SUPABASE_DB_URL not found"
```bash
export SUPABASE_DB_URL="your-connection-string"
```

### "pg module not found"
Scripts handle this gracefully. Install if needed:
```bash
npm install pg @types/pg
```

### "Migrations already exist"
✅ **Expected** - Migrations use `IF NOT EXISTS` and are idempotent. Safe to re-run.

### "psql not found"
Install PostgreSQL client or use Supabase CLI:
```bash
npm install -g supabase
```

---

## Next Steps

1. ✅ **Set Database Connection**
   ```bash
   export SUPABASE_DB_URL="your-connection-string"
   ```

2. ✅ **Run Execution**
   ```bash
   ./scripts/RUN_NOW.sh
   ```

3. ✅ **Review Reports**
   - Check `/reports/exec/` for execution reports
   - Check `/backlog/` for any tickets created

4. ✅ **Enable Monetization**
   - Per `/backlog/READY_realignment_001.md`

---

## Files Reference

- **Scripts:** `/scripts/`
- **Workflows:** `/.github/workflows/`
- **Migrations:** `/supabase/migrations/`
- **Reports:** `/reports/exec/`
- **Documentation:** `/scripts/MASTER_SETUP.md`

---

**All scripts are ready and tested. Set `SUPABASE_DB_URL` and run `./scripts/RUN_NOW.sh` to execute!**
