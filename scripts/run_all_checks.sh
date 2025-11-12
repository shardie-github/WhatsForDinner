#!/bin/bash
# Run All Manual Checks
# 
# Runs all scripts flagged for manual execution in dry-run mode where possible.
#
# Usage:
#   ./scripts/run_all_checks.sh [--live]
#
# Environment:
#   SUPABASE_DB_URL (optional) - PostgreSQL connection string (required for --live)

set -e

LIVE=false
if [[ "$1" == "--live" ]]; then
  LIVE=true
  if [[ -z "$SUPABASE_DB_URL" && -z "$DATABASE_URL" ]]; then
    echo "❌ SUPABASE_DB_URL or DATABASE_URL required for --live mode"
    exit 1
  fi
fi

echo "🔍 Running all manual checks..."
echo "Mode: $([ "$LIVE" == "true" ] && echo "LIVE" || echo "DRY-RUN")"
echo ""

# Preflight checks
echo "1️⃣  Running preflight checks..."
if [[ "$LIVE" == "true" ]]; then
  tsx scripts/agents/preflight.ts || echo "⚠️  Preflight checks failed (may need DB connection)"
else
  echo "   [DRY-RUN] Would check environment variables and database connectivity"
fi
echo ""

# Generate delta migration
echo "2️⃣  Generating delta migration..."
if [[ "$LIVE" == "true" ]]; then
  tsx scripts/agents/generate_delta_migration.ts || echo "⚠️  Delta migration generation failed (may need DB connection)"
else
  echo "   [DRY-RUN] Would introspect database and generate delta migration"
fi
echo ""

# ETL smoke tests (dry-run)
echo "3️⃣  Running ETL smoke tests (dry-run)..."
tsx scripts/etl/pull_events.ts --dry-run || echo "⚠️  Events ETL dry-run failed"
tsx scripts/etl/pull_ads_source_a.ts --dry-run || echo "⚠️  Source A ETL dry-run failed"
tsx scripts/etl/pull_ads_source_b.ts --dry-run || echo "⚠️  Source B ETL dry-run failed"
tsx scripts/etl/compute_metrics.ts --dry-run || echo "⚠️  Metrics computation dry-run failed"
echo ""

# Verify database
echo "4️⃣  Verifying database..."
if [[ "$LIVE" == "true" ]]; then
  tsx scripts/agents/verify_db.ts || echo "⚠️  Database verification failed"
else
  echo "   [DRY-RUN] Would verify tables, columns, indexes, RLS, policies"
fi
echo ""

# Data quality checks
echo "5️⃣  Running data quality checks..."
if [[ "$LIVE" == "true" ]]; then
  tsx scripts/agents/run_data_quality.ts || echo "⚠️  Data quality checks failed"
else
  echo "   [DRY-RUN] Would run data quality SQL checks"
fi
echo ""

# System doctor
echo "6️⃣  Running system doctor..."
if [[ "$LIVE" == "true" ]]; then
  tsx scripts/agents/system_doctor.ts || echo "⚠️  System doctor found issues (check backlog for tickets)"
else
  echo "   [DRY-RUN] Would run system health checks and create tickets on failure"
fi
echo ""

echo "✅ All checks completed"
echo ""
echo "📝 Next steps:"
echo "   1. Review any warnings above"
echo "   2. If using --live mode, check reports in /reports/exec/"
echo "   3. Apply migrations: ./scripts/apply_migrations.sh"
echo "   4. Enable monetization per /backlog/READY_realignment_001.md"
