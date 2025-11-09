/**
 * Retention Automation Cron Job
 * Runs daily and weekly retention automation
 */

import { NextRequest, NextResponse } from 'next/server';
import { retentionAutomation } from '@/lib/retention/automation';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const frequency = searchParams.get('frequency') || 'daily';

  try {
    if (frequency === 'daily') {
      await retentionAutomation.runDailyAutomation();
      return NextResponse.json({ success: true, message: 'Daily retention automation completed' });
    } else if (frequency === 'weekly') {
      await retentionAutomation.runWeeklyAutomation();
      return NextResponse.json({ success: true, message: 'Weekly retention automation completed' });
    } else {
      return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 });
    }
  } catch (error) {
    console.error('Retention automation error:', error);
    return NextResponse.json(
      { error: 'Failed to run retention automation' },
      { status: 500 }
    );
  }
}
