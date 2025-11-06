#!/usr/bin/env node
/**
 * Privacy Monitoring Demo Script
 * Seeds fake user, enables monitoring, runs synthetic events, exports, deletes, and prints transparency log
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { secretsManager } from './secrets-manager-unified.mjs';

const supabaseUrl = (await secretsManager.getSecret('NEXT_PUBLIC_SUPABASE_URL')) || process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = (await secretsManager.getSecret('SUPABASE_SERVICE_ROLE_KEY')) || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  
  // Step 1: Create fake user
    const fakeUserId = uuidv4();
  const fakeEmail = `demo-${fakeUserId.substring(0, 8)}@example.com`;

  // Note: In real scenario, create user via Supabase Auth
  // For demo, we'll use a test user ID directly
    
  // Step 2: Set privacy preferences (enable monitoring)
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
  
  // Step 3: Add app to allowlist
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
  
  // Step 4: Set signal toggle
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
  
  // Step 5: Generate synthetic telemetry events
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
  
  // Step 6: Log privacy actions to transparency log
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
  
  // Step 7: Export data (simulate)
    const exportData = {
    exported_at: new Date().toISOString(),
    user_id: fakeUserId,
    preferences: prefs,
    apps: [app],
    signals: [signal],
    events: events,
  };
            
  // Step 8: Print transparency log
    const { data: logEntries } = await supabase
    .from('privacy_transparency_log')
    .select('*')
    .eq('user_id', fakeUserId)
    .order('ts', { ascending: false })
    .limit(10);

  if (logEntries && logEntries.length > 0) {
        for (const entry of logEntries) {
      .toLocaleString()}`);
    }
  } else {
      }
  
  // Step 9: Cleanup (optional - comment out to keep data for inspection)
    const cleanup = process.argv.includes('--keep-data') ? false : true;

  if (cleanup) {
    await supabase.from('telemetry_events').delete().eq('user_id', fakeUserId);
    await supabase.from('signal_toggles').delete().eq('user_id', fakeUserId);
    await supabase.from('app_allowlist').delete().eq('user_id', fakeUserId);
    await supabase.from('privacy_prefs').delete().eq('user_id', fakeUserId);
    await supabase.from('privacy_transparency_log').delete().eq('user_id', fakeUserId);
      } else {
    \n');
  }

            }

main().catch((error) => {
  console.error('❌ Demo failed:', error);
  process.exit(1);
});
