/**
 * Marketing Analytics Dashboard API
 * 
 * Provides marketing metrics and conversion data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getConversionFunnel } from '@/lib/marketing/conversion-tracking';

export async function GET(request: NextRequest) {
  // In production, fetch from analytics database
  // This is a placeholder structure

  const funnel = await getConversionFunnel();

  const dashboard = {
    overview: {
      totalUsers: 10000,
      activeUsers: 7500,
      newSignups: 500,
      upgrades: 50,
      revenue: 5000,
      conversionRate: 0.05,
    },
    funnel,
    sources: {
      organic: { users: 4000, conversions: 200 },
      direct: { users: 3000, conversions: 150 },
      social: { users: 2000, conversions: 80 },
      email: { users: 1000, conversions: 70 },
    },
    campaigns: [
      {
        name: 'Welcome Email Sequence',
        sent: 500,
        opened: 400,
        clicked: 200,
        converted: 50,
        conversionRate: 0.1,
      },
      {
        name: 'Upgrade Nudge Campaign',
        sent: 1000,
        opened: 600,
        clicked: 150,
        converted: 30,
        conversionRate: 0.03,
      },
    ],
    topContent: [
      {
        title: '10 Meal Planning Tips',
        views: 5000,
        signups: 250,
        conversionRate: 0.05,
      },
      {
        title: 'Quick Weeknight Dinners',
        views: 3000,
        signups: 150,
        conversionRate: 0.05,
      },
    ],
  };

  return NextResponse.json(dashboard);
}
