#!/usr/bin/env tsx
/**
 * Marketing Setup Script
 * 
 * Verifies all marketing systems are configured correctly
 */

import { verifyResendConfig } from '@/lib/marketing/resend-config';
import { config as analyticsConfig } from '@/lib/analytics/config';

async function main() {
  console.log('🔍 Verifying marketing setup...\n');

  let allGood = true;

  // Check Resend configuration
  console.log('📧 Checking email service (Resend)...');
  const resendConfigured = await verifyResendConfig();
  if (resendConfigured) {
    console.log('  ✅ Resend configured');
  } else {
    console.log('  ⚠️  Resend not configured (set RESEND_API_KEY)');
    allGood = false;
  }

  // Check analytics configuration
  console.log('\n📊 Checking analytics configuration...');
  let analyticsConfigured = false;
  
  if (analyticsConfig.posthog) {
    console.log('  ✅ PostHog configured');
    analyticsConfigured = true;
  }
  if (analyticsConfig.mixpanel) {
    console.log('  ✅ Mixpanel configured');
    analyticsConfigured = true;
  }
  if (analyticsConfig.googleAnalytics) {
    console.log('  ✅ Google Analytics configured');
    analyticsConfigured = true;
  }
  if (analyticsConfig.amplitude) {
    console.log('  ✅ Amplitude configured');
    analyticsConfigured = true;
  }

  if (!analyticsConfigured) {
    console.log('  ⚠️  No analytics providers configured');
    console.log('     Set at least one: POSTHOG_KEY, MIXPANEL_TOKEN, GA_MEASUREMENT_ID, or AMPLITUDE_API_KEY');
    allGood = false;
  }

  // Check KPI alerts
  console.log('\n🚨 Checking KPI alerts...');
  const kpiEmails = process.env.KPI_ALERT_EMAILS;
  if (kpiEmails) {
    console.log(`  ✅ KPI alerts configured: ${kpiEmails}`);
  } else {
    console.log('  ⚠️  KPI alerts not configured (set KPI_ALERT_EMAILS)');
    allGood = false;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (allGood) {
    console.log('✅ All marketing systems configured correctly!');
  } else {
    console.log('⚠️  Some marketing systems need configuration.');
    console.log('   Check .env.example for required environment variables.');
  }
  console.log('='.repeat(50) + '\n');

  process.exit(allGood ? 0 : 1);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
