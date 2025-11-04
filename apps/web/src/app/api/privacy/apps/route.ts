import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth-middleware';
import { requireMFA } from '@/lib/privacy/mfa-middleware';
import crypto from 'crypto';

const consentSchema = z.object({
  monitoring_enabled: z.boolean(),
  data_retention_days: z.number().int().min(1).max(365),
  mfa_required: z.boolean(),
});

function hashValue(value: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

async function logPrivacyAction(
  supabase: any,
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  oldValue?: unknown,
  newValue?: unknown,
  metadata?: Record<string, unknown>
) {
  const oldHash = oldValue ? hashValue(oldValue) : null;
  const newHash = newValue ? hashValue(newValue) : null;

  await supabase.from('privacy_transparency_log').insert({
    user_id: userId,
    action,
    actor_id: userId,
    entity_type: entityType,
    entity_id: entityId,
    old_value_hash: oldHash,
    new_value_hash: newHash,
    metadata: metadata || {},
  });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const mfaResult = await requireMFA(request, 'consent_update');
  if (!mfaResult.success) {
    return mfaResult.response;
  }

  const supabase = createRouteHandlerClient({ cookies });
  const body = await request.json();
  const validated = consentSchema.parse(body);

  const { data: existingPrefs } = await supabase
    .from('privacy_prefs')
    .select('*')
    .eq('user_id', mfaResult.userId)
    .single();

  const { data: prefs, error } = await supabase
    .from('privacy_prefs')
    .upsert(
      {
        user_id: mfaResult.userId,
        monitoring_enabled: validated.monitoring_enabled,
        data_retention_days: validated.data_retention_days,
        mfa_required: validated.mfa_required,
        last_reviewed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logPrivacyAction(
    supabase,
    mfaResult.userId,
    validated.monitoring_enabled ? 'consent_granted' : 'consent_revoked',
    'privacy_prefs',
    mfaResult.userId,
    existingPrefs,
    prefs
  );

  return NextResponse.json({ success: true, data: prefs });
}
