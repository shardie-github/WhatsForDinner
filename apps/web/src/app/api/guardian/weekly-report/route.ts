import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { guardianInspector } from '../../../../../../guardian/inspector';

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
