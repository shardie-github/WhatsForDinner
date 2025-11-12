# Master Setup Script

This document describes how to apply all migrations and run all checks.

## Prerequisites

1. **Set up environment variables:**
   ```bash
   export SUPABASE_DB_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
   # Optional:
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
   export GENERIC_SOURCE_A_TOKEN="your-source-a-token"
   export GENERIC_SOURCE_B_TOKEN="your-source-b-token"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

## Step 1: Apply All Migrations

Apply all Supabase migrations (idempotent, safe to re-run):

```bash
# Dry-run first (recommended)
./scripts/apply_migrations.sh --dry-run

# Apply for real
./scripts/apply_migrations.sh
```

**Or use the TypeScript script:**
```bash
tsx scripts/apply_all_migrations.ts --dry-run
tsx scripts/apply_all_migrations.ts
```

**Or use Supabase CLI directly:**
```bash
supabase db push --db-url "$SUPABASE_DB_URL" --include-all
```

## Step 2: Run All Checks

Run all manual checks (dry-run mode by default):

```bash
# Dry-run (no DB connection needed)
./scripts/run_all_checks.sh

# Live mode (requires DB connection)
./scripts/run_all_checks.sh --live
```

**Individual checks:**
```bash
# Preflight
tsx scripts/agents/preflight.ts

# Generate delta migration
tsx scripts/agents/generate_delta_migration.ts

# ETL smoke tests (dry-run)
tsx scripts/etl/pull_events.ts --dry-run
tsx scripts/etl/pull_ads_source_a.ts --dry-run
tsx scripts/etl/pull_ads_source_b.ts --dry-run
tsx scripts/etl/compute_metrics.ts --dry-run

# Verify database
tsx scripts/agents/verify_db.ts

# Data quality checks
tsx scripts/agents/run_data_quality.ts

# System doctor
tsx scripts/agents/system_doctor.ts
```

## Step 3: Verify GitHub Actions Workflows

The following workflows have been added to `.github/workflows/`:

- ✅ `preflight.yml` - Preflight checks on PR
- ✅ `data-quality.yml` - Nightly data quality checks
- ✅ `nightly-etl.yml` - Nightly ETL pipeline
- ✅ `supabase-delta-apply.yml` - Delta migration application
- ✅ `system-health.yml` - Weekly system health sweep

**Verify they exist:**
```bash
ls -la .github/workflows/preflight.yml
ls -la .github/workflows/data-quality.yml
ls -la .github/workflows/nightly-etl.yml
ls -la .github/workflows/supabase-delta-apply.yml
ls -la .github/workflows/system-health.yml
```

## Step 4: Enable GitHub Secrets

Add the following secrets in GitHub → Settings → Secrets and variables → Actions:

- `SUPABASE_DB_URL` (required)
- `SUPABASE_URL` (optional)
- `SUPABASE_SERVICE_ROLE_KEY` (optional)
- `SLACK_WEBHOOK_URL` (optional)
- `GENERIC_SOURCE_A_TOKEN` (optional)
- `GENERIC_SOURCE_B_TOKEN` (optional)

## Step 5: Next Steps

1. **Enable monetization:** Per `/backlog/READY_realignment_001.md`
2. **Review system health:** Check `/reports/system_health_2025-01-27.md`
3. **Launch experiments:** Review `/growth/portfolio.md`
4. **Monitor:** Check GitHub Actions workflows are running

## Troubleshooting

### Migrations fail with "already exists"
This is expected for idempotent migrations. They use `IF NOT EXISTS` and are safe to re-run.

### Database connection fails
- Verify `SUPABASE_DB_URL` is set correctly
- Check network connectivity
- Verify database is accessible

### Scripts fail with "command not found"
- Install dependencies: `npm install` or `pnpm install`
- Ensure `tsx` is available: `npm install -g tsx` or use `npx tsx`

### GitHub Actions workflows not running
- Verify workflows exist in `.github/workflows/`
- Check GitHub Actions tab for errors
- Verify secrets are set correctly

## Files Created

- `/scripts/apply_migrations.sh` - Migration application script
- `/scripts/apply_all_migrations.ts` - TypeScript migration script
- `/scripts/run_all_checks.sh` - All checks runner
- `/.github/workflows/preflight.yml` - Preflight workflow
- `/.github/workflows/data-quality.yml` - Data quality workflow
- `/.github/workflows/nightly-etl.yml` - Nightly ETL workflow
- `/.github/workflows/supabase-delta-apply.yml` - Delta migration workflow
- `/.github/workflows/system-health.yml` - System health workflow
