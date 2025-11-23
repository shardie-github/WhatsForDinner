#!/usr/bin/env tsx
/**
 * Verify Monetization Channels Are Enabled
 * Checks if monetization channels are properly enabled
 */

import { createClient } from '@supabase/supabase-js';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('verify-monetization-enabled-ts');
async function verifyMonetization() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  logger.info('🔍 Verifying monetization channels...');

  // Check monetization settings
  const { data: settings, error } = await supabase
    .from('monetization_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  if (error || !settings) {
    logger.info('❌ Monetization settings not found');
    logger.info('   Run: pnpm monetization:enable');
    return false;
  }

  const channels = {
    affiliate: settings.affiliate_enabled,
    api: settings.api_monetization_enabled,
    data: settings.data_insights_enabled,
    marketplace: settings.marketplace_enabled,
    upsells: settings.automated_upsells_enabled,
  };

  const enabledChannels = Object.entries(channels)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);

  const disabledChannels = Object.entries(channels)
    .filter(([_, enabled]) => !enabled)
    .map(([name]) => name);

  logger.info('');
  logger.info('📊 Monetization Status:');
  logger.info('');

  if (enabledChannels.length > 0) {
    logger.info('✅ Enabled channels:');
    enabledChannels.forEach((channel) => {
      logger.info('   ✓ ${channel}');
    });
  }

  if (disabledChannels.length > 0) {
    logger.info('');
    logger.info('❌ Disabled channels:');
    disabledChannels.forEach((channel) => {
      logger.info('   ✗ ${channel}');
    });
  }

  logger.info('');
  logger.info('💰 Revenue Dashboard: /api/revenue/dashboard');

  return enabledChannels.length > 0;
}

if (require.main === module) {
  verifyMonetization()
    .then((enabled) => {
      if (enabled) {
        logger.info('✅ Monetization verification complete');
        process.exit(0);
      } else {
        logger.info('⚠️  No monetization channels enabled');
        process.exit(1);
      }
    })
    .catch((error) => {
      logger.error('❌ Verification failed:', { error });
      process.exit(1);
    });
}

export { verifyMonetization };
