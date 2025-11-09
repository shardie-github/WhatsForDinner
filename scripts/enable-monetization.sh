#!/bin/bash
# Zero-Effort Monetization Enabler
# Run this script to enable all monetization channels

echo "🚀 Enabling All Monetization Channels..."

# Set environment variables
export AFFILIATE_ENABLED=true
export AFFILIATE_COMMISSION_RATE=10
export API_MONETIZATION_ENABLED=true
export DATA_INSIGHTS_ENABLED=true
export MARKETPLACE_ENABLED=true
export MARKETPLACE_COMMISSION_RATE=10
export AUTOMATED_UPSELLS_ENABLED=true

# Run database migrations
echo "📊 Running database migrations..."
psql $DATABASE_URL -f apps/web/supabase/migrations/20250109_affiliate_system.sql
psql $DATABASE_URL -f apps/web/supabase/migrations/20250109_api_monetization.sql

echo "✅ All monetization channels enabled!"
echo "💰 Revenue tracking available at /api/revenue/dashboard"
