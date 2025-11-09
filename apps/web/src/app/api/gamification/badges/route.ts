/**
 * Gamification Badges API
 */

import { NextRequest, NextResponse } from 'next/server';
import { withTelemetry } from '@/lib/telemetry/api-middleware';
import { gamificationSystem } from '@/lib/gamification/system';

async function handler(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const badges = await gamificationSystem.getUserBadges(userId);
    return NextResponse.json({ badges });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

export const GET = withTelemetry(handler);
