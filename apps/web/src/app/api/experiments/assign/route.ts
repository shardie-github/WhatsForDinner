import { NextResponse } from 'next/server';
import { assignVariant, shouldShowExperiment } from '@/lib/experiments';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabaseClient';

/**
 * GET /api/experiments/assign?experimentId=xxx
 * Assigns or retrieves variant for an experiment
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const experimentId = searchParams.get('experimentId');

    if (!experimentId) {
      return NextResponse.json(
        { error: 'experimentId is required' },
        { status: 400 }
      );
    }

    // Get user ID if authenticated
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    let userId: string | undefined;

    if (authHeader) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      } catch {
        // Not authenticated, continue as anonymous
      }
    }

    // Check if experiment should be shown
    if (!shouldShowExperiment(experimentId, userId)) {
      return NextResponse.json({ variant: 'control', active: false });
    }

    // Assign variant
    const variant = assignVariant(experimentId, userId);

    return NextResponse.json({
      experimentId,
      variant,
      active: true,
    });
  } catch (error) {
    console.error('Error assigning experiment variant:', error);
    return NextResponse.json(
      { error: 'Failed to assign variant' },
      { status: 500 }
    );
  }
}
