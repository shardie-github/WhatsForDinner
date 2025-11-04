/**
 * Guardian API Routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { guardianCore } from '../guardian/core';
import { guardianInspector } from '../guardian/inspector';
import { trustFabricAI } from '../guardian/recommendations';
import { guardTelemetryEvent, guardApiCall, handleSensitiveContext } from '../guardian/middleware';
import type { TrustReport, TrustFabricModel, GuardianRecommendation } from '../guardian/types';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/guardian/trust-report
 * Get user's trust report
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const report = await guardianInspector.inspectUser(user.id);

    return NextResponse.json(report);
  } catch (error) {
    console.error('Failed to get trust report:', error);
    return NextResponse.json(
      { error: 'Failed to generate trust report' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/guardian/weekly-report
 * Get weekly markdown report
 */
export async function GETWeeklyReport(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const markdown = await guardianInspector.generateWeeklyReport(user.id);

    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
      },
    });
  } catch (error) {
    console.error('Failed to get weekly report:', error);
    return NextResponse.json(
      { error: 'Failed to generate weekly report' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/guardian/recommendations
 * Get personalized recommendations
 */
export async function GETRecommendations(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recommendations = await trustFabricAI.generateRecommendations(user.id);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/guardian/fabric/export
 * Export Trust Fabric model
 */
export async function GETExportFabric(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const model = await trustFabricAI.exportModel(user.id);

    return NextResponse.json(model, {
      headers: {
        'Content-Disposition': `attachment; filename="trust_fabric_${user.id}.json"`,
      },
    });
  } catch (error) {
    console.error('Failed to export fabric:', error);
    return NextResponse.json(
      { error: 'Failed to export Trust Fabric model' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/guardian/fabric/import
 * Import Trust Fabric model
 */
export async function POSTImportFabric(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const model = (await request.json()) as TrustFabricModel;
    
    // Verify user owns the model
    if (model.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Model user ID mismatch' },
        { status: 403 }
      );
    }

    await trustFabricAI.importModel(model);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to import fabric:', error);
    return NextResponse.json(
      { error: 'Failed to import Trust Fabric model' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/guardian/private-mode
 * Toggle private mode
 */
export async function POSTPrivateMode(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { enabled } = await request.json();

    if (enabled) {
      guardianCore.enablePrivateMode();
    } else {
      guardianCore.disablePrivateMode();
    }

    return NextResponse.json({ success: true, private_mode: enabled });
  } catch (error) {
    console.error('Failed to toggle private mode:', error);
    return NextResponse.json(
      { error: 'Failed to toggle private mode' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/guardian/lockdown
 * Emergency data lockdown
 */
export async function POSTLockdown(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await guardianCore.lockdown();

    return NextResponse.json({ success: true, lockdown: true });
  } catch (error) {
    console.error('Failed to activate lockdown:', error);
    return NextResponse.json(
      { error: 'Failed to activate lockdown' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/guardian/release-lockdown
 * Release lockdown
 */
export async function POSTReleaseLockdown(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    guardianCore.releaseLockdown();

    return NextResponse.json({ success: true, lockdown: false });
  } catch (error) {
    console.error('Failed to release lockdown:', error);
    return NextResponse.json(
      { error: 'Failed to release lockdown' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/guardian/events
 * Get recent guardian events
 */
export async function GETEvents(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ledgerFile = path.join('/tmp/guardian/logs', `${user.id}.jsonl`);
    
    if (!fs.existsSync(ledgerFile)) {
      return NextResponse.json({ events: [] });
    }

    const content = fs.readFileSync(ledgerFile, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    const entries = lines.map((line) => JSON.parse(line));

    // Get last 50 entries
    const recentEntries = entries.slice(-50).reverse();

    return NextResponse.json({ events: recentEntries });
  } catch (error) {
    console.error('Failed to get events:', error);
    return NextResponse.json(
      { error: 'Failed to get events' },
      { status: 500 }
    );
  }
}
