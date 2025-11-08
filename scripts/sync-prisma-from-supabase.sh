#!/bin/bash
# Sync Prisma schema from Supabase database
# This introspects the actual Supabase database and updates prisma/schema.prisma

set -e

echo "🔄 Syncing Prisma schema from Supabase..."

if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  echo "   Set it in .env.local or export it:"
  echo "   export DATABASE_URL='postgresql://postgres:PASSWORD@db.ghqyxhbyyirveptgwoqm.supabase.co:5432/postgres?sslmode=require'"
  exit 1
fi

# Backup current schema
if [ -f "prisma/schema.prisma" ]; then
  echo "📦 Backing up current schema..."
  cp prisma/schema.prisma "prisma/schema.prisma.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Pull schema from database
echo "🔍 Introspecting Supabase database..."
npx prisma db pull

# Format the schema
echo "✨ Formatting schema..."
npx prisma format

# Generate client
echo "🔨 Generating Prisma client..."
npx prisma generate

echo "✅ Prisma schema synced from Supabase!"
echo ""
echo "Next steps:"
echo "  1. Review prisma/schema.prisma"
echo "  2. Commit changes if everything looks good"
echo "  3. Run: pnpm prisma migrate dev (if you need to create migrations)"
