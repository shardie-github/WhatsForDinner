/**
 * Activation Tracking
 * Track when users hit "aha moment" (first recipe generated)
 */

import { analytics } from './analytics';
import { supabase } from './supabaseClient';

export interface AhaMomentEvent {
  userId: string;
  recipeId: number;
  timeToFirstRecipe: number; // seconds
  pantryItemsCount: number;
  timestamp: string;
}

/**
 * Track "aha moment" - when user generates first recipe
 */
export async function trackAhaMoment(event: AhaMomentEvent): Promise<void> {
  try {
    // Track in analytics
    await analytics.trackEvent('aha_moment', {
      user_id: event.userId,
      recipe_id: event.recipeId,
      time_to_first_recipe: event.timeToFirstRecipe,
      pantry_items_count: event.pantryItemsCount,
      timestamp: event.timestamp,
    });

    // Track in database (if activation_events table exists, or use analytics_events)
    const { error } = await supabase.from('analytics_events').insert({
      event_type: 'aha_moment',
      user_id: event.userId,
      properties: {
        recipe_id: event.recipeId,
        time_to_first_recipe: event.timeToFirstRecipe,
        pantry_items_count: event.pantryItemsCount,
      },
      timestamp: event.timestamp,
    });

    if (error) {
      console.error('Failed to track aha moment:', error);
    }
  } catch (err) {
    console.error('Failed to track aha moment:', err);
  }
}

/**
 * Check if user has hit "aha moment"
 */
export async function hasHitAhaMoment(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('id')
      .eq('event_type', 'aha_moment')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      throw error;
    }

    return (data?.length || 0) > 0;
  } catch (err) {
    console.error('Failed to check aha moment:', err);
    return false;
  }
}

/**
 * Calculate activation rate
 * Formula: Users who hit "aha moment" / Total signups
 */
export async function calculateActivationRate(days: number = 7): Promise<number> {
  try {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Get total signups
    const { data: signups, error: signupsError } = await supabase
      .from('analytics_events')
      .select('user_id')
      .eq('event_type', 'user_signed_up')
      .gte('timestamp', cutoffDate);

    if (signupsError) {
      throw signupsError;
    }

    // Get users who hit "aha moment"
    const { data: activated, error: activatedError } = await supabase
      .from('analytics_events')
      .select('user_id')
      .eq('event_type', 'aha_moment')
      .gte('timestamp', cutoffDate);

    if (activatedError) {
      throw activatedError;
    }

    const totalSignups = new Set(signups?.map((s) => s.user_id) || []).size;
    const activatedUsers = new Set(activated?.map((a) => a.user_id) || []).size;

    return totalSignups > 0 ? (activatedUsers / totalSignups) * 100 : 0;
  } catch (err) {
    console.error('Failed to calculate activation rate:', err);
    return 0;
  }
}
