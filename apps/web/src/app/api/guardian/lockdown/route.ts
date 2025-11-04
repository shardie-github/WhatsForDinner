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
