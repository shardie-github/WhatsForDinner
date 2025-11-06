/**
 * Conversion Tracker Component
 * Tracks conversions and attributes them to programs
 */

'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { handleAttributionOnSignup, getAttributionCode } from '@/lib/programs/tracking';
import { trackProgramEvent } from '@/lib/programs/tracking';

interface ConversionTrackerProps {
  userId: string;
  conversionType: 'signup' | 'subscription' | 'trial';
  revenueAmount?: number;
}

export function ConversionTracker({ 
  userId, 
  conversionType, 
  revenueAmount 
}: ConversionTrackerProps) {
  const supabase = createClientComponentClient();

  useEffect(() => {
    const trackConversion = async () => {
      // Process attribution
      await handleAttributionOnSignup(userId);

      // Check for referral code
      const refCode = getAttributionCode('ref');
      if (refCode) {
        const { data: referral } = await supabase
          .from('referrals')
          .select('id')
          .eq('referral_code', refCode)
          .single();

        if (referral) {
          await trackProgramEvent({
            programType: 'referral',
            programId: referral.id,
            eventType: 'conversion',
            metadata: {
              conversion_type: conversionType,
              revenue_amount: revenueAmount || 0,
            },
          });
        }
      }

      // Check for affiliate code
      const affCode = getAttributionCode('aff');
      if (affCode) {
        const { data: affiliate } = await supabase
          .from('affiliates')
          .select('id')
          .eq('affiliate_code', affCode)
          .single();

        if (affiliate) {
          await trackProgramEvent({
            programType: 'affiliate',
            programId: affiliate.id,
            eventType: 'conversion',
            metadata: {
              conversion_type: conversionType,
              revenue_amount: revenueAmount || 0,
            },
          });

          // Create affiliate conversion record
          await fetch('/api/programs/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              program_type: 'affiliate',
              program_id: affiliate.id,
              event_type: 'conversion',
              user_id: userId,
              metadata: {
                conversion_type: conversionType,
                revenue_amount: revenueAmount || 0,
              },
            }),
          });
        }
      }
    };

    if (userId) {
      void trackConversion();
    }
  }, [userId, conversionType, revenueAmount, supabase]);

  return null; // This component doesn't render anything
}
