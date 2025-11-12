#!/bin/bash
# Apply All Supabase Migrations
# 
# This script applies all migrations in supabase/migrations/ directory.
# Safe to re-run (idempotent migrations).
#
# Usage:
#   ./scripts/apply_migrations.sh [--dry-run]
#
# Environment:
#   SUPABASE_DB_URL (required) - PostgreSQL connection string

set -e

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
fi

DB_URL="${SUPABASE_DB_URL:-$DATABASE_URL}"

if [[ -z "$DB_URL" && "$DRY_RUN" != "true" ]]; then
  echo "❌ SUPABASE_DB_URL or DATABASE_URL required (or use --dry-run)"
  exit 1
fi

echo "📦 Applying Supabase migrations..."
echo "Database: ${DB_URL%%@*}" # Hide password
echo "Dry-run: $DRY_RUN"
echo ""

# Get all migration files sorted
MIGRATIONS=$(ls -1 supabase/migrations/*.sql 2>/dev/null | sort -V)

if [[ -z "$MIGRATIONS" ]]; then
  echo "⚠️  No migration files found in supabase/migrations/"
  exit 0
fi

COUNT=$(echo "$MIGRATIONS" | wc -l)
echo "Found $COUNT migration file(s)"
echo ""

if [[ "$DRY_RUN" == "true" ]]; then
  echo "[DRY-RUN] Would apply migrations in order:"
  echo "$MIGRATIONS" | nl
  echo ""
  echo "✅ Dry-run complete"
  exit 0
fi

# Try Supabase CLI first
if command -v supabase &> /dev/null; then
  echo "🔧 Attempting via Supabase CLI..."
  if supabase db push --db-url "$DB_URL" --include-all 2>/dev/null; then
    echo "✅ Migrations applied via Supabase CLI"
    exit 0
  else
    echo "⚠️  Supabase CLI failed, falling back to psql..."
  fi
fi

# Fallback to psql
if ! command -v psql &> /dev/null; then
  echo "❌ psql not found. Please install PostgreSQL client."
  exit 1
fi

echo "🔧 Applying via psql..."
FAILED=0
APPLIED=0

while IFS= read -r migration; do
  echo "📄 Applying $(basename "$migration")..."
  if psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$migration" 2>&1; then
    echo "✅ Applied $(basename "$migration")"
    ((APPLIED++))
  else
    EXIT_CODE=$?
    if [[ $EXIT_CODE -eq 0 ]]; then
      echo "⏭️  Skipped $(basename "$migration") (may already be applied)"
    else
      echo "⚠️  Migration $(basename "$migration") failed (may already be applied or error)"
      ((FAILED++))
    fi
  fi
done <<< "$MIGRATIONS"

echo ""
echo "📊 Summary:"
echo "  Applied: $APPLIED"
echo "  Failed: $FAILED"
echo "  Total: $COUNT"

if [[ $FAILED -gt 0 ]]; then
  echo ""
  echo "⚠️  Some migrations failed. Check logs above."
  exit 1
fi

echo ""
echo "✅ All migrations applied successfully"
