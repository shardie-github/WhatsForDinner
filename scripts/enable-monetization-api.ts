#!/usr/bin/env tsx
/**
 * Enable Monetization Channels via API
 * Alternative to shell script - can be run programmatically
 */

import { createClient } from '@supabase/supabase-js';

async function enableMonetization() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🚀 Enabling All Monetization Channels...');

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
    console.error('❌ Error enabling monetization:', error);
    throw error;
  }

  console.log('✅ All monetization channels enabled!');
  console.log('💰 Revenue tracking available at /api/revenue/dashboard');
  console.log('');
  console.log('📋 Enabled channels:');
  console.log('   ✓ Affiliate Program (10% commission)');
  console.log('   ✓ API Monetization');
  console.log('   ✓ Data Insights');
  console.log('   ✓ Marketplace (10% commission)');
  console.log('   ✓ Automated Upsells');
}

if (require.main === module) {
  enableMonetization()
    .then(() => {
      console.log('✅ Monetization enabled successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to enable monetization:', error);
      process.exit(1);
    });
}

export { enableMonetization };
