import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: prefs } = await supabase
    .from('privacy_prefs')
    .select('*')
    .eq('user_id', authResult.context.user.id)
    .single();

  const { data: apps } = await supabase
    .from('app_allowlist')
    .select('*')
    .eq('user_id', authResult.context.user.id);

  const { data: signals } = await supabase
    .from('signal_toggles')
    .select('*')
    .eq('user_id', authResult.context.user.id);

  return NextResponse.json({
    success: true,
    data: {
      preferences: prefs || {
        monitoring_enabled: false,
        data_retention_days: 14,
        mfa_required: true,
      },
      apps: apps || [],
      signals: signals || [],
    },
  });
}
