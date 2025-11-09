/**
 * Referral Program API
 * Create referral codes and track referrals
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withTelemetry } from '@/lib/telemetry/api-middleware';

async function handler(request: NextRequest) {
  try {
    const { createClient: createSupabaseClient } = await import('@/lib/supabase/server');
    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate unique referral code
    const referralCode = `REF-${user.id.slice(0, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Create referral record
    const { data: referral, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: user.id,
        referral_code: referralCode,
        reward_status: 'pending',
        reward_type: 'pro_extension',
        reward_value: 30, // 30 days free Pro
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year expiry
      })
      .select()
      .single();

    if (error) {
      // Check if referral already exists
      const { data: existing } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .eq('reward_status', 'pending')
        .limit(1)
        .single();

      if (existing) {
        return NextResponse.json({
          referralCode: existing.referral_code,
          referralLink: `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${existing.referral_code}`,
          reward: {
            type: existing.reward_type,
            value: existing.reward_value,
            description: '1 month free Pro for you and your friend',
          },
        });
      }

      return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 });
    }

    return NextResponse.json({
      referralCode: referral.referral_code,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${referral.referral_code}`,
      reward: {
        type: referral.reward_type,
        value: referral.reward_value,
        description: '1 month free Pro for you and your friend',
      },
    });
  } catch (error) {
    console.error('Referral creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    );
  }
}

export const POST = withTelemetry(handler);
