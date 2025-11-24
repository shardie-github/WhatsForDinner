#!/usr/bin/env tsx
/**
 * Enable Monetization Channels via API
 * Alternative to shell script - can be run programmatically
 */

import { createClient } from '@supabase/supabase-js';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('enable-monetization-api-ts');
async function enableMonetization() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  logger.info('🚀 Enabling All Monetization Channels...');

  // Enable all channels
  const settings = {
    id: 'default',
    affiliate_enabled: true,
    affiliate_commission_rate: 10,
    api_monetization_enabled: true,
    data_insights_enabled: true,
    marketplace_enabled: true,
    marketplace_commission_rate: 10,
    automated_upsells_enabled: true,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('monetization_settings')
    .upsert(settings, { onConflict: 'id' });

  if (error) {
    logger.error('❌ Error enabling monetization:', { error });
    throw error;
  }

  logger.info('✅ All monetization channels enabled!');
  logger.info('💰 Revenue tracking available at /api/revenue/dashboard');
  logger.info('');
  logger.info('📋 Enabled channels:');
  logger.info('   ✓ Affiliate Program (10% commission)');
  logger.info('   ✓ API Monetization');
  logger.info('   ✓ Data Insights');
  logger.info('   ✓ Marketplace (10% commission)');
  logger.info('   ✓ Automated Upsells');
}

if (require.main === module) {
  enableMonetization()
    .then(() => {
      logger.info('✅ Monetization enabled successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Failed to enable monetization:', { error });
      process.exit(1);
    });
}

export { enableMonetization };
