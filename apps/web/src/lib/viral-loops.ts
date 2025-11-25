/**
 * Viral Loop Tracking
 * Tracks shares → signups → shares chain to measure viral coefficient
 */

import { analytics } from './analytics';
import { supabase } from './supabaseClient';

export interface SocialShareEvent {
  recipeId?: number;
  platform: string;
  shareUrl: string;
  userId?: string;
}

export interface ViralLoopMetrics {
  totalShares: number;
  signupsFromShares: number;
  sharesFromSignups: number;
  viralCoefficient: number;
}

/**
 * Track a social share
 */
export async function trackSocialShare(event: SocialShareEvent): Promise<void> {
  try {
    // Track in analytics
    await analytics.trackEvent('social_share', {
      recipe_id: event.recipeId,
      platform: event.platform,
      share_url: event.shareUrl,
      user_id: event.userId,
      timestamp: new Date().toISOString(),
    });

    // Track in database (if social_shares table exists)
    const { error } = await supabase.from('social_shares').insert({
      recipe_id: event.recipeId,
      platform: event.platform,
      share_url: event.shareUrl,
      user_id: event.userId,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to track social share:', error);
    }
  } catch (err) {
    console.error('Failed to track social share:', err);
  }
}

/**
 * Calculate viral coefficient
 * Formula: (Signups from shares + Shares from signups) / Total users
 */
export async function calculateViralCoefficient(): Promise<ViralLoopMetrics> {
  try {
    // Get total shares
    const { data: shares, error: sharesError } = await supabase
      .from('social_shares')
      .select('id')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (sharesError) {
      throw sharesError;
    }

    // Get signups from shares (users who signed up with utm_source=social_share)
    const { data: signupsFromShares, error: signupsError } = await supabase
      .from('users')
      .select('id')
      .eq('utm_source', 'social_share')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (signupsError) {
      throw signupsError;
    }

    // Get shares from signups (users who shared after signing up)
    const { data: sharesFromSignups, error: sharesFromSignupsError } = await supabase
      .from('social_shares')
      .select('id, user_id')
      .not('user_id', 'is', null)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (sharesFromSignupsError) {
      throw sharesFromSignupsError;
    }

    // Get total users
    const { data: totalUsers, error: totalUsersError } = await supabase
      .from('users')
      .select('id')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (totalUsersError) {
      throw totalUsersError;
    }

    const totalShares = shares?.length || 0;
    const signupsFromSharesCount = signupsFromShares?.length || 0;
    const sharesFromSignupsCount = sharesFromSignups?.length || 0;
    const totalUsersCount = totalUsers?.length || 0;

    // Calculate viral coefficient
    const viralCoefficient =
      totalUsersCount > 0
        ? (signupsFromSharesCount + sharesFromSignupsCount) / totalUsersCount
        : 0;

    return {
      totalShares,
      signupsFromShares: signupsFromSharesCount,
      sharesFromSignups: sharesFromSignupsCount,
      viralCoefficient,
    };
  } catch (err) {
    console.error('Failed to calculate viral coefficient:', err);
    return {
      totalShares: 0,
      signupsFromShares: 0,
      sharesFromSignups: 0,
      viralCoefficient: 0,
    };
  }
}

/**
 * Track referral signup
 */
export async function trackReferralSignup(
  referrerId: string,
  refereeId: string,
  referralCode: string
): Promise<void> {
  try {
    // Track in analytics
    await analytics.trackEvent('referral_signup', {
      referrer_id: referrerId,
      referee_id: refereeId,
      referral_code: referralCode,
      timestamp: new Date().toISOString(),
    });

    // Track in database (if referral_tracking table exists)
    const { error } = await supabase.from('referral_tracking').insert({
      referrer_id: referrerId,
      referee_id: refereeId,
      referral_code: referralCode,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to track referral signup:', error);
    }
  } catch (err) {
    console.error('Failed to track referral signup:', err);
  }
}
