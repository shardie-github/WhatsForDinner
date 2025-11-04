import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { guardianCore } from '../../../../../../guardian/core';

export async function POST(request: NextRequest) {
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
