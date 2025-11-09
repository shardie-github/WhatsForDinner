/**
 * Comprehensive Health Check API
 * Checks all system components and returns health status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface HealthCheck {
  component: string;
  status: 'healthy' | 'degraded' | 'down';
  message: string;
  latency?: number;
}

export async function GET(request: NextRequest) {
  const checks: HealthCheck[] = [];
  const startTime = Date.now();

  // 1. Database Health
  try {
    const dbStart = Date.now();
    const supabase = createClient();
    const { error } = await supabase.from('profiles').select('id').limit(1);
    const dbLatency = Date.now() - dbStart;

    checks.push({
      component: 'Database',
      status: error ? 'degraded' : 'healthy',
      message: error ? `Database error: ${error.message}` : 'Database connection healthy',
      latency: dbLatency,
    });
  } catch (error) {
    checks.push({
      component: 'Database',
      status: 'down',
      message: error instanceof Error ? error.message : 'Database unavailable',
    });
  }

  // 2. Stripe API Health
  try {
    const stripeStart = Date.now();
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia',
    });
    await stripe.customers.list({ limit: 1 });
    const stripeLatency = Date.now() - stripeStart;

    checks.push({
      component: 'Stripe API',
      status: 'healthy',
      message: 'Stripe API connection healthy',
      latency: stripeLatency,
    });
  } catch (error) {
    checks.push({
      component: 'Stripe API',
      status: 'degraded',
      message: error instanceof Error ? error.message : 'Stripe API unavailable',
    });
  }

  // 3. Revenue Dashboard Health
  try {
    const revenueStart = Date.now();
    const response = await fetch(`${request.nextUrl.origin}/api/revenue/dashboard`, {
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || 'test'}`,
      },
    });
    const revenueLatency = Date.now() - revenueStart;

    checks.push({
      component: 'Revenue Dashboard',
      status: response.ok ? 'healthy' : 'degraded',
      message: response.ok ? 'Revenue dashboard operational' : `HTTP ${response.status}`,
      latency: revenueLatency,
    });
  } catch (error) {
    checks.push({
      component: 'Revenue Dashboard',
      status: 'down',
      message: error instanceof Error ? error.message : 'Revenue dashboard unavailable',
    });
  }

  // 4. Monetization Channels Health
  const monetizationChannels = [
    { name: 'Affiliate', env: 'AFFILIATE_ENABLED' },
    { name: 'API Monetization', env: 'API_MONETIZATION_ENABLED' },
    { name: 'Data Insights', env: 'DATA_INSIGHTS_ENABLED' },
    { name: 'Marketplace', env: 'MARKETPLACE_ENABLED' },
    { name: 'Automated Upsells', env: 'AUTOMATED_UPSELLS_ENABLED' },
  ];

  monetizationChannels.forEach(channel => {
    const enabled = process.env[channel.env] === 'true';
    checks.push({
      component: channel.name,
      status: enabled ? 'healthy' : 'degraded',
      message: enabled ? 'Channel enabled' : 'Channel disabled',
    });
  });

  // Calculate overall health
  const healthyCount = checks.filter(c => c.status === 'healthy').length;
  const totalChecks = checks.length;
  const healthPercentage = (healthyCount / totalChecks) * 100;

  const overallStatus = healthPercentage >= 80 ? 'healthy' : healthPercentage >= 60 ? 'degraded' : 'down';

  const totalLatency = Date.now() - startTime;

  return NextResponse.json({
    status: overallStatus,
    healthPercentage: Math.round(healthPercentage),
    checks,
    timestamp: new Date().toISOString(),
    latency: totalLatency,
    version: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  });
}
