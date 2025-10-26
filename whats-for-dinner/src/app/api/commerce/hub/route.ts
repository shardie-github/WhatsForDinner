import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabaseClient';
import { AICommerceHub } from '@/lib/aiCommerceHub';
import { z } from 'zod';

const CommerceHubRequestSchema = z.object({
  action: z.enum([
    'summary',
    'reconcile',
    'pricing_suggestion',
    'revenue_analysis',
  ]),
  period: z.string().optional().default('30d'),
  region: z.string().optional().default('global'),
  tenant_id: z.string().optional(),
  partner_id: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, period, region, tenant_id, partner_id } =
      CommerceHubRequestSchema.parse(body);

    // Get tenant context
    const headersList = headers();
    const requestTenantId = headersList.get('x-tenant-id') || tenant_id;

    if (!requestTenantId) {
      return NextResponse.json(
        { error: 'Tenant information required' },
        { status: 400 }
      );
    }

    // Initialize AI Commerce Hub
    const commerceHub = new AICommerceHub();

    let result: any;

    switch (action) {
      case 'summary':
        result = await commerceHub.getFinancialSummary(
          requestTenantId,
          period,
          region
        );
        break;
      case 'reconcile':
        result = await commerceHub.reconcileInvoices(requestTenantId, period);
        break;
      case 'pricing_suggestion':
        result = await commerceHub.getPricingSuggestions(
          requestTenantId,
          region
        );
        break;
      case 'revenue_analysis':
        result = await commerceHub.analyzeRevenueStreams(
          requestTenantId,
          period,
          partner_id
        );
        break;
      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    return NextResponse.json({
      success: true,
      action,
      data: result,
      metadata: {
        period,
        region,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Commerce Hub error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Commerce Hub request failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'summary';
    const period = searchParams.get('period') || '30d';
    const region = searchParams.get('region') || 'global';
    const tenant_id = searchParams.get('tenant_id');

    // Get tenant context
    const headersList = headers();
    const requestTenantId = headersList.get('x-tenant-id') || tenant_id;

    if (!requestTenantId) {
      return NextResponse.json(
        { error: 'Tenant information required' },
        { status: 400 }
      );
    }

    // Initialize AI Commerce Hub
    const commerceHub = new AICommerceHub();

    let result: any;

    switch (action) {
      case 'summary':
        result = await commerceHub.getFinancialSummary(
          requestTenantId,
          period,
          region
        );
        break;
      case 'pricing_suggestion':
        result = await commerceHub.getPricingSuggestions(
          requestTenantId,
          region
        );
        break;
      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    return NextResponse.json({
      success: true,
      action,
      data: result,
      metadata: {
        period,
        region,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Commerce Hub GET error:', error);
    return NextResponse.json(
      { error: 'Commerce Hub request failed' },
      { status: 500 }
    );
  }
}
