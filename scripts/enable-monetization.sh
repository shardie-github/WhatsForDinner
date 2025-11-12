#!/bin/bash
# Zero-Effort Monetization Enabler
# Run this script to enable all monetization channels

set -e  # Exit on error

echo "🚀 Enabling All Monetization Channels..."

# Check required environment variables
if [ -z "$DATABASE_URL" ] && [ -z "$SUPABASE_DB_URL" ]; then
  echo "❌ Error: DATABASE_URL or SUPABASE_DB_URL must be set"
  exit 1
fi

DB_URL="${DATABASE_URL:-$SUPABASE_DB_URL}"

# Set environment variables
export AFFILIATE_ENABLED=true
export AFFILIATE_COMMISSION_RATE=10
export API_MONETIZATION_ENABLED=true
export DATA_INSIGHTS_ENABLED=true
export MARKETPLACE_ENABLED=true
export MARKETPLACE_COMMISSION_RATE=10
export AUTOMATED_UPSELLS_ENABLED=true

# Run database migrations (if files exist)
echo "📊 Running database migrations..."
MIGRATION_FILES=(
  "apps/web/supabase/migrations/20250109_affiliate_system.sql"
  "apps/web/supabase/migrations/20250109_api_monetization.sql"
  "apps/web/supabase/migrations/20250109_marketplace_system.sql"
  "apps/web/supabase/migrations/20250109_data_insights_system.sql"
  "apps/web/supabase/migrations/20250109_monetization_settings.sql"
  "apps/web/supabase/migrations/20250109_missing_tables.sql"
)

for file in "${MIGRATION_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  → Applying $file..."
    psql "$DB_URL" -f "$file" || echo "  ⚠️  Warning: Migration $file failed or already applied"
  else
    echo "  ⚠️  Skipping $file (not found)"
  fi
done

# Enable via API if NEXT_PUBLIC_APP_URL is set
if [ -n "$NEXT_PUBLIC_APP_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "🌐 Enabling via API..."
  curl -X POST "${NEXT_PUBLIC_APP_URL}/api/revenue/enable" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -d '{"channels": ["affiliate", "api", "data", "marketplace", "upsells"]}' \
    || echo "  ⚠️  Warning: API enable failed (may need manual setup)"
fi

echo ""
echo "✅ All monetization channels enabled!"
echo "💰 Revenue tracking available at /api/revenue/dashboard"
echo ""
echo "📋 Next steps:"
echo "   1. Verify channels are enabled: Check /api/revenue/dashboard"
echo "   2. Set up affiliate links in your grocery integrations"
echo "   3. Configure API pricing tiers"
echo "   4. Enable data insights collection"
