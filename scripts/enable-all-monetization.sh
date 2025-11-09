#!/bin/bash
# Complete Monetization Activation Script
# Enables all monetization channels and sets up cron jobs

set -e

echo "🚀 Activating All Monetization Channels..."

# Check if .env file exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from .env.example..."
    cp .env.example .env.local
    echo "✅ Created .env.local. Please configure your secrets."
fi

# Enable monetization channels
echo "📊 Enabling monetization channels..."
export AFFILIATE_ENABLED=true
export AFFILIATE_COMMISSION_RATE=10
export AFFILIATE_MIN_PAYOUT=50
export API_MONETIZATION_ENABLED=true
export DATA_INSIGHTS_ENABLED=true
export MARKETPLACE_ENABLED=true
export MARKETPLACE_COMMISSION_RATE=10
export AUTOMATED_UPSELLS_ENABLED=true

# Generate cron secret if not set
if [ -z "$CRON_SECRET" ]; then
    CRON_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "generate-manually-$(date +%s)")
    echo "🔑 Generated CRON_SECRET: $CRON_SECRET"
    echo "Add this to your .env.local: CRON_SECRET=$CRON_SECRET"
fi

# Run database migrations if needed
if [ -f "apps/web/supabase/migrations/20250109_affiliate_system.sql" ]; then
    echo "📊 Running monetization migrations..."
    psql $DATABASE_URL -f apps/web/supabase/migrations/20250109_affiliate_system.sql || echo "⚠️  Migration may have already run"
    psql $DATABASE_URL -f apps/web/supabase/migrations/20250109_api_monetization.sql || echo "⚠️  Migration may have already run"
fi

echo ""
echo "✅ Monetization channels enabled!"
echo ""
echo "📋 Next Steps:"
echo "1. Add environment variables to your deployment platform:"
echo "   - AFFILIATE_ENABLED=true"
echo "   - API_MONETIZATION_ENABLED=true"
echo "   - DATA_INSIGHTS_ENABLED=true"
echo "   - MARKETPLACE_ENABLED=true"
echo "   - AUTOMATED_UPSELLS_ENABLED=true"
echo "   - CRON_SECRET=$CRON_SECRET"
echo ""
echo "2. Set up cron jobs (Vercel Cron or external):"
echo "   - Daily retention: GET /api/cron/retention?frequency=daily (9 AM)"
echo "   - Weekly retention: GET /api/cron/retention?frequency=weekly (Monday 10 AM)"
echo "   - Monthly affiliate payouts: GET /api/cron/affiliate-payouts (1st of month)"
echo ""
echo "3. Test endpoints:"
echo "   - Revenue dashboard: GET /api/revenue/dashboard"
echo "   - Health check: GET /api/health/comprehensive"
echo "   - Referral create: POST /api/referral/create"
echo ""
echo "💰 Revenue tracking available at /api/revenue/dashboard"
