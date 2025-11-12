#!/usr/bin/env tsx
/**
 * Verify Monetization Channels Are Enabled
 * Checks if monetization channels are properly enabled
 */

import { createClient } from '@supabase/supabase-js';

async function verifyMonetization() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔍 Verifying monetization channels...');

  // Check monetization settings
  const { data: settings, error } = await supabase
    .from('monetization_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  if (error || !settings) {
    console.log('❌ Monetization settings not found');
    console.log('   Run: pnpm monetization:enable');
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

  console.log('');
  console.log('📊 Monetization Status:');
  console.log('');

  if (enabledChannels.length > 0) {
    console.log('✅ Enabled channels:');
    enabledChannels.forEach((channel) => {
      console.log(`   ✓ ${channel}`);
    });
  }

  if (disabledChannels.length > 0) {
    console.log('');
    console.log('❌ Disabled channels:');
    disabledChannels.forEach((channel) => {
      console.log(`   ✗ ${channel}`);
    });
  }

  console.log('');
  console.log('💰 Revenue Dashboard: /api/revenue/dashboard');

  return enabledChannels.length > 0;
}

if (require.main === module) {
  verifyMonetization()
    .then((enabled) => {
      if (enabled) {
        console.log('✅ Monetization verification complete');
        process.exit(0);
      } else {
        console.log('⚠️  No monetization channels enabled');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Verification failed:', error);
      process.exit(1);
    });
}

export { verifyMonetization };
