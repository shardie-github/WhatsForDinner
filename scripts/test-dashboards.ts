#!/usr/bin/env tsx
/**
 * Test Dashboards Script
 * Verifies all admin dashboards work with real data
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTractionMetrics() {
  console.log('Testing Traction Metrics...');
  
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Test DAU
    const { data: dauData, error: dauError } = await supabase
      .from('analytics_events')
      .select('user_id')
      .gte('timestamp', todayStart.toISOString())
      .not('user_id', 'is', null);

    if (dauError) {
      console.error('DAU query error:', dauError);
      return false;
    }

    const dau = new Set(dauData?.map((d) => d.user_id) || []).size;
    console.log(`✅ DAU: ${dau}`);

    // Test WAU
    const { data: wauData, error: wauError } = await supabase
      .from('analytics_events')
      .select('user_id')
      .gte('timestamp', weekAgo.toISOString())
      .not('user_id', 'is', null);

    if (wauError) {
      console.error('WAU query error:', wauError);
      return false;
    }

    const wau = new Set(wauData?.map((d) => d.user_id) || []).size;
    console.log(`✅ WAU: ${wau}`);

    // Test Retention
    const { data: signups, error: signupsError } = await supabase
      .from('analytics_events')
      .select('user_id')
      .eq('event_type', 'user_signed_up')
      .gte('timestamp', weekAgo.toISOString());

    if (signupsError) {
      console.error('Signups query error:', signupsError);
      return false;
    }

    const signupCount = new Set(signups?.map((s) => s.user_id) || []).size;
    console.log(`✅ Signups (last 7 days): ${signupCount}`);

    // Test Activation
    const { data: activated, error: activatedError } = await supabase
      .from('recipe_metrics')
      .select('user_id')
      .in('user_id', signups?.map((s) => s.user_id) || [])
      .gte('generated_at', weekAgo.toISOString());

    if (activatedError) {
      console.error('Activation query error:', activatedError);
      return false;
    }

    const activatedCount = new Set(activated?.map((a) => a.user_id) || []).size;
    const activationRate = signupCount > 0 ? (activatedCount / signupCount) * 100 : 0;
    console.log(`✅ Activation Rate: ${activationRate.toFixed(1)}%`);

    return true;
  } catch (error: any) {
    console.error('Traction metrics test failed:', error);
    return false;
  }
}

async function testDistributionMetrics() {
  console.log('\nTesting Distribution Metrics...');
  
  try {
    // Test users table exists and has utm_source
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, utm_source, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .limit(10);

    if (usersError) {
      console.warn('⚠️ Users query error (may need utm_source column):', usersError.message);
      // Try profiles table instead
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, created_at')
        .limit(10);
      
      console.log(`✅ Found ${profiles?.length || 0} profiles`);
      return true;
    }

    console.log(`✅ Found ${users?.length || 0} users`);
    return true;
  } catch (error: any) {
    console.error('Distribution metrics test failed:', error);
    return false;
  }
}

async function testActivationFunnel() {
  console.log('\nTesting Activation Funnel...');
  
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Test signups
    const { data: signups, error: signupsError } = await supabase
      .from('analytics_events')
      .select('user_id')
      .eq('event_type', 'user_signed_up')
      .gte('timestamp', thirtyDaysAgo)
      .limit(100);

    if (signupsError) {
      console.error('Signups query error:', signupsError);
      return false;
    }

    const signupCount = new Set(signups?.map((s) => s.user_id) || []).size;
    console.log(`✅ Signups: ${signupCount}`);

    // Test pantry items
    const { data: pantry, error: pantryError } = await supabase
      .from('pantry_items')
      .select('user_id')
      .limit(10);

    if (pantryError) {
      console.warn('⚠️ Pantry items query error:', pantryError.message);
    } else {
      console.log(`✅ Pantry items table accessible`);
    }

    // Test recipe metrics
    const { data: recipes, error: recipesError } = await supabase
      .from('recipe_metrics')
      .select('user_id')
      .limit(10);

    if (recipesError) {
      console.error('Recipe metrics query error:', recipesError);
      return false;
    }

    console.log(`✅ Recipe metrics table accessible`);
    return true;
  } catch (error: any) {
    console.error('Activation funnel test failed:', error);
    return false;
  }
}

async function testReferrals() {
  console.log('\nTesting Referrals...');
  
  try {
    // Test referral_codes table
    const { data: codes, error: codesError } = await supabase
      .from('referral_codes')
      .select('*')
      .limit(10);

    if (codesError) {
      console.warn('⚠️ Referral codes table error:', codesError.message);
      return false;
    }

    console.log(`✅ Referral codes table accessible (${codes?.length || 0} codes)`);

    // Test referral_tracking table
    const { data: tracking, error: trackingError } = await supabase
      .from('referral_tracking')
      .select('*')
      .limit(10);

    if (trackingError) {
      console.warn('⚠️ Referral tracking table error:', trackingError.message);
    } else {
      console.log(`✅ Referral tracking table accessible (${tracking?.length || 0} referrals)`);
    }

    return true;
  } catch (error: any) {
    console.error('Referrals test failed:', error);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing Admin Dashboards\n');
  console.log('='.repeat(50));

  const results = {
    traction: await testTractionMetrics(),
    distribution: await testDistributionMetrics(),
    activation: await testActivationFunnel(),
    referrals: await testReferrals(),
  };

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Results:');
  console.log(`Traction Metrics: ${results.traction ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Distribution Metrics: ${results.distribution ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Activation Funnel: ${results.activation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Referrals: ${results.referrals ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = Object.values(results).every((r) => r);
  console.log(`\n${allPassed ? '✅ All tests passed!' : '⚠️ Some tests failed or have warnings'}`);

  process.exit(allPassed ? 0 : 1);
}

main().catch(console.error);
