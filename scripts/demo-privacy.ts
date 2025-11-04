#!/usr/bin/env node
/**
 * Privacy Monitoring Demo Script
 * Seeds fake user, enables monitoring, runs synthetic events, exports, deletes, and prints transparency log
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🔐 Privacy Monitoring Demo\n');

  // Step 1: Create fake user
  console.log('1️⃣ Creating fake user...');
  const fakeUserId = uuidv4();
  const fakeEmail = `demo-${fakeUserId.substring(0, 8)}@example.com`;

  // Note: In real scenario, create user via Supabase Auth
  // For demo, we'll use a test user ID directly
  console.log(`   User ID: ${fakeUserId}`);
  console.log(`   Email: ${fakeEmail}\n`);

  // Step 2: Set privacy preferences (enable monitoring)
  console.log('2️⃣ Setting privacy preferences...');
  const { data: prefs, error: prefsError } = await supabase
    .from('privacy_prefs')
    .upsert({
      user_id: fakeUserId,
      monitoring_enabled: true,
      data_retention_days: 14,
      mfa_required: true,
      last_reviewed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (prefsError) {
    console.error('   ❌ Failed to set preferences:', prefsError.message);
    process.exit(1);
  }
  console.log('   ✅ Monitoring enabled\n');

  // Step 3: Add app to allowlist
  console.log('3️⃣ Adding app to allowlist...');
  const { data: app, error: appError } = await supabase
    .from('app_allowlist')
    .insert({
      user_id: fakeUserId,
      app_id: 'demo-app',
      app_name: 'Demo Application',
      enabled: true,
      scope: 'metadata_only',
    })
    .select()
    .single();

  if (appError) {
    console.error('   ❌ Failed to add app:', appError.message);
    process.exit(1);
  }
  console.log(`   ✅ App "${app.app_name}" added\n`);

  // Step 4: Set signal toggle
  console.log('4️⃣ Setting signal toggle...');
  const { data: signal, error: signalError } = await supabase
    .from('signal_toggles')
    .insert({
      user_id: fakeUserId,
      signal_key: 'window_titles',
      enabled: true,
      sampling_rate: '1.0',
    })
    .select()
    .single();

  if (signalError) {
    console.error('   ❌ Failed to set signal:', signalError.message);
    process.exit(1);
  }
  console.log(`   ✅ Signal "${signal.signal_key}" enabled\n`);

  // Step 5: Generate synthetic telemetry events
  console.log('5️⃣ Generating synthetic telemetry events...');
  const events = [];
  for (let i = 0; i < 5; i++) {
    const { data: event, error: eventError } = await supabase
      .from('telemetry_events')
      .insert({
        user_id: fakeUserId,
        app_id: 'demo-app',
        event_type: 'app_focus',
        duration_ms: Math.floor(Math.random() * 60000),
        metadata_redacted_json: {
          window_title: `Demo Window ${i}`,
          timestamp: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (!eventError) {
      events.push(event);
    }
  }
  console.log(`   ✅ Generated ${events.length} events\n`);

  // Step 6: Log privacy actions to transparency log
  console.log('6️⃣ Logging privacy actions...');
  await supabase.from('privacy_transparency_log').insert({
    user_id: fakeUserId,
    action: 'consent_granted',
    actor_id: fakeUserId,
    entity_type: 'privacy_prefs',
    entity_id: fakeUserId,
    metadata: {
      demo: true,
    },
  });
  console.log('   ✅ Transparency log entry created\n');

  // Step 7: Export data (simulate)
  console.log('7️⃣ Exporting data...');
  const exportData = {
    exported_at: new Date().toISOString(),
    user_id: fakeUserId,
    preferences: prefs,
    apps: [app],
    signals: [signal],
    events: events,
  };
  console.log('   ✅ Export data prepared\n');
  console.log('   Export summary:');
  console.log(`   - Preferences: 1`);
  console.log(`   - Apps: 1`);
  console.log(`   - Signals: 1`);
  console.log(`   - Events: ${events.length}\n`);

  // Step 8: Print transparency log
  console.log('8️⃣ Privacy Transparency Log:');
  const { data: logEntries } = await supabase
    .from('privacy_transparency_log')
    .select('*')
    .eq('user_id', fakeUserId)
    .order('ts', { ascending: false })
    .limit(10);

  if (logEntries && logEntries.length > 0) {
    console.log('\n   Recent actions:');
    for (const entry of logEntries) {
      console.log(`   - ${entry.action} at ${new Date(entry.ts).toLocaleString()}`);
    }
  } else {
    console.log('   No log entries found');
  }
  console.log('');

  // Step 9: Cleanup (optional - comment out to keep data for inspection)
  console.log('9️⃣ Cleaning up demo data...');
  const cleanup = process.argv.includes('--keep-data') ? false : true;

  if (cleanup) {
    await supabase.from('telemetry_events').delete().eq('user_id', fakeUserId);
    await supabase.from('signal_toggles').delete().eq('user_id', fakeUserId);
    await supabase.from('app_allowlist').delete().eq('user_id', fakeUserId);
    await supabase.from('privacy_prefs').delete().eq('user_id', fakeUserId);
    await supabase.from('privacy_transparency_log').delete().eq('user_id', fakeUserId);
    console.log('   ✅ Demo data cleaned up\n');
  } else {
    console.log('   ⏭️  Keeping demo data (use --keep-data flag)\n');
  }

  console.log('✅ Demo completed successfully!');
  console.log(`\n   User ID: ${fakeUserId}`);
  console.log(`   Monitoring: Enabled`);
  console.log(`   Apps: 1`);
  console.log(`   Signals: 1`);
  console.log(`   Events: ${events.length}`);
}

main().catch((error) => {
  console.error('❌ Demo failed:', error);
  process.exit(1);
});
