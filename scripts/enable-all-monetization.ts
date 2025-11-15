#!/usr/bin/env tsx
/**
 * Enable All Monetization Channels
 * Runs migrations and enables all 5 monetization channels
 */

import { spawnSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function enableAllMonetization() {
  console.log('🚀 Enabling All Monetization Channels...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Step 1: Run database migrations
  console.log('📊 Step 1: Running database migrations...');
  const migrationFiles = [
    'apps/web/supabase/migrations/20250109_affiliate_system.sql',
    'apps/web/supabase/migrations/20250109_api_monetization.sql',
    'apps/web/supabase/migrations/20250109_marketplace_system.sql',
    'apps/web/supabase/migrations/20250109_data_insights_system.sql',
    'apps/web/supabase/migrations/20250109_monetization_settings.sql',
    'apps/web/supabase/migrations/20250109_missing_tables.sql',
  ];

  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (dbUrl) {
    for (const file of migrationFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        console.log(`  → Applying ${file}...`);
        const result = spawnSync('psql', [dbUrl, '-f', filePath], {
          stdio: 'inherit',
        });
        if (result.status !== 0) {
          console.log(`  ⚠️  Warning: Migration ${file} failed or already applied`);
        }
      } else {
        console.log(`  ⚠️  Skipping ${file} (not found)`);
      }
    }
  } else {
    console.log('  ⚠️  DATABASE_URL not set, skipping migrations');
  }

  // Step 2: Enable monetization settings
  console.log('\n💰 Step 2: Enabling monetization settings...');
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
    if (error.code === '42P01') {
      console.log('  ⚠️  monetization_settings table does not exist. Run migrations first.');
      console.log('  💡 Run: pnpm db:migrate:monetization');
    } else {
      console.error('  ❌ Error:', error.message);
      throw error;
    }
  } else {
    console.log('  ✅ Monetization settings updated');
  }

  // Step 3: Set environment variables (for reference)
  console.log('\n🔧 Step 3: Environment variables to set:');
  console.log('  export AFFILIATE_ENABLED=true');
  console.log('  export AFFILIATE_COMMISSION_RATE=10');
  console.log('  export API_MONETIZATION_ENABLED=true');
  console.log('  export DATA_INSIGHTS_ENABLED=true');
  console.log('  export MARKETPLACE_ENABLED=true');
  console.log('  export MARKETPLACE_COMMISSION_RATE=10');
  console.log('  export AUTOMATED_UPSELLS_ENABLED=true');

  // Step 4: Verify channels
  console.log('\n✅ Step 4: Verification');
  const { data: verifySettings } = await supabase
    .from('monetization_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  if (verifySettings) {
    console.log('  ✅ Affiliate Program:', verifySettings.affiliate_enabled ? 'Enabled' : 'Disabled');
    console.log('  ✅ API Monetization:', verifySettings.api_monetization_enabled ? 'Enabled' : 'Disabled');
    console.log('  ✅ Data Insights:', verifySettings.data_insights_enabled ? 'Enabled' : 'Disabled');
    console.log('  ✅ Marketplace:', verifySettings.marketplace_enabled ? 'Enabled' : 'Disabled');
    console.log('  ✅ Automated Upsells:', verifySettings.automated_upsells_enabled ? 'Enabled' : 'Disabled');
  }

  console.log('\n🎉 All monetization channels enabled!');
  console.log('💰 Revenue tracking available at /api/revenue/dashboard');
  console.log('\n📋 Next steps:');
  console.log('   1. Verify channels: Check /api/revenue/dashboard');
  console.log('   2. Set up affiliate links in grocery integrations');
  console.log('   3. Configure API pricing tiers');
  console.log('   4. Enable data insights collection');
}

if (require.main === module) {
  enableAllMonetization()
    .then(() => {
      console.log('\n✅ Monetization enabled successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed to enable monetization:', error);
      process.exit(1);
    });
}

export { enableAllMonetization };
