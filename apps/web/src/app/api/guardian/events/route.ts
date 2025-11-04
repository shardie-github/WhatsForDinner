import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { trustFabricAI } from '../../../../../../../guardian/recommendations';

export async function GET(request: NextRequest) {
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
