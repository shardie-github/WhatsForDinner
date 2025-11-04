/**
 * Conversion Funnel Tracking
 * Tracks users through: awareness → interest → consideration → purchase → retention
 */

import { analytics } from './analytics';

export type FunnelStage = 
  | 'awareness'
  | 'interest'
  | 'consideration'
  | 'purchase'
  | 'retention';

export interface FunnelEvent {
  stage: FunnelStage;
  action: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

class FunnelTracker {
  private currentStage: FunnelStage | null = null;
  private sessionStartTime: Date = new Date();
  private stageStartTimes: Map<FunnelStage, Date> = new Map();

  /**
   * Track funnel stage progression
   */
  async trackStage(stage: FunnelStage, properties?: Record<string, any>) {
    const previousStage = this.currentStage;
    this.currentStage = stage;
    
    const stageStartTime = this.stageStartTimes.get(stage) || new Date();
    this.stageStartTimes.set(stage, stageStartTime);

    // Calculate time in previous stage
    let timeInPreviousStage = 0;
    if (previousStage && previousStage !== stage) {
      const prevStartTime = this.stageStartTimes.get(previousStage);
      if (prevStartTime) {
        timeInPreviousStage = Date.now() - prevStartTime.getTime();
      }
    }

    // Track event
    await analytics.trackEvent('funnel_stage', {
      stage,
      previous_stage: previousStage,
      time_in_previous_stage_ms: timeInPreviousStage,
      session_duration_ms: Date.now() - this.sessionStartTime.getTime(),
      ...properties,
    });

    // Track stage-specific events
    await this.trackStageSpecificEvent(stage, properties);
  }

  /**
   * Track stage-specific events
   */
  private async trackStageSpecificEvent(stage: FunnelStage, properties?: Record<string, any>) {
    switch (stage) {
      case 'awareness':
        await analytics.trackEvent('funnel_awareness', {
          source: properties?.source || 'unknown',
          referrer: properties?.referrer || document.referrer,
          ...properties,
        });
        break;

      case 'interest':
        await analytics.trackEvent('funnel_interest', {
          page_viewed: properties?.page || window.location.pathname,
          time_on_page_ms: properties?.time_on_page || 0,
          ...properties,
        });
        break;

      case 'consideration':
        await analytics.trackEvent('funnel_consideration', {
          action_taken: properties?.action || 'pricing_viewed',
          ...properties,
        });
        break;

      case 'purchase':
        await analytics.trackEvent('funnel_purchase', {
          plan_selected: properties?.plan,
          price: properties?.price,
          conversion_value: properties?.value || 0,
          ...properties,
        });
        break;

      case 'retention':
        await analytics.trackEvent('funnel_retention', {
          days_since_signup: properties?.days_since_signup || 0,
          recipes_generated: properties?.recipes_generated || 0,
          ...properties,
        });
        break;
    }
  }

  /**
   * Track conversion (purchase completion)
   */
  async trackConversion(plan: string, price: number, metadata?: Record<string, any>) {
    await this.trackStage('purchase', {
      plan,
      price,
      value: price,
      conversion_completed: true,
      ...metadata,
    });

    // Also track as conversion event
    await analytics.trackEvent('conversion_completed', {
      plan,
      price,
      revenue: price,
      ...metadata,
    });
  }

  /**
   * Track drop-off (user leaves funnel)
   */
  async trackDropOff(stage: FunnelStage, reason?: string) {
    await analytics.trackEvent('funnel_dropoff', {
      stage,
      reason: reason || 'unknown',
      time_in_stage_ms: this.getTimeInStage(stage),
      session_duration_ms: Date.now() - this.sessionStartTime.getTime(),
    });
  }

  /**
   * Get time spent in current stage
   */
  private getTimeInStage(stage: FunnelStage): number {
    const startTime = this.stageStartTimes.get(stage);
    if (!startTime) return 0;
    return Date.now() - startTime.getTime();
  }

  /**
   * Initialize funnel tracking on page load
   */
  initialize() {
    // Auto-detect stage based on current page
    const path = window.location.pathname;
    
    if (path === '/' || path.startsWith('/landing')) {
      this.trackStage('awareness', { source: 'landing_page' });
    } else if (path === '/pricing' || path === '/features') {
      this.trackStage('consideration', { page: path });
    } else if (path.startsWith('/signup') || path.startsWith('/auth')) {
      this.trackStage('purchase', { action: 'signup_initiated' });
    } else if (path.startsWith('/pantry') || path.startsWith('/recipes')) {
      this.trackStage('retention', { page: path });
    } else {
      this.trackStage('interest', { page: path });
    }

    // Track page visibility changes (potential drop-off)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.currentStage) {
        this.trackDropOff(this.currentStage, 'page_hidden');
      }
    });

    // Track before unload (bounce)
    window.addEventListener('beforeunload', () => {
      if (this.currentStage && this.currentStage !== 'retention') {
        this.trackDropOff(this.currentStage, 'page_unload');
      }
    });
  }
}

// Singleton instance
export const funnelTracker = new FunnelTracker();

// Auto-initialize on import (client-side only)
if (typeof window !== 'undefined') {
  funnelTracker.initialize();
}
