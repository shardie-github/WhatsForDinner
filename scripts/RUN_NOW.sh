#!/bin/bash
# RUN_NOW.sh - Execute migrations and checks immediately
# 
# This script will apply migrations and run all checks.
# Make sure SUPABASE_DB_URL or DATABASE_URL is set.

set -e

echo "🚀 Self-Healing Data & Systems Stack - Execution"
echo "================================================"
echo ""

# Check for DB URL
if [[ -z "$SUPABASE_DB_URL" && -z "$DATABASE_URL" ]]; then
  echo "❌ SUPABASE_DB_URL or DATABASE_URL required"
  echo ""
  echo "Usage:"
  echo "  export SUPABASE_DB_URL='postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres'"
  echo "  ./scripts/RUN_NOW.sh"
  echo ""
  exit 1
fi

export SUPABASE_DB_URL="${SUPABASE_DB_URL:-$DATABASE_URL}"
export DATABASE_URL="$SUPABASE_DB_URL"

echo "✅ Database URL configured"
echo ""

# Install dependencies if needed
if ! command -v tsx &> /dev/null; then
  echo "📦 Installing tsx..."
  npm install -g tsx || pnpm add -g tsx || echo "⚠️  Could not install tsx, trying npx..."
fi

# Run the TypeScript execution script
echo "🚀 Executing migrations and checks..."
echo ""

if command -v tsx &> /dev/null; then
  tsx scripts/execute_migrations_and_checks.ts
elif command -v npx &> /dev/null; then
  npx tsx scripts/execute_migrations_and_checks.ts
else
  echo "❌ tsx not found. Please install: npm install -g tsx"
  exit 1
fi

echo ""
echo "✅ Execution complete!"
