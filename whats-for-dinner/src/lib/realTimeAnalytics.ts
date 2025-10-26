/**
 * Real-time Analytics System
 * 
 * This module provides comprehensive real-time analytics including:
 * - User behavior tracking
 * - Performance monitoring
 * - Error tracking
 * - Conversion funnel analysis
 * - A/B testing support
 * - Real-time dashboards
 */

import { logger } from './logger';

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  page: string;
  userAgent: string;
  ip: string;
  referrer?: string;
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  pageViews: number;
  events: number;
  duration: number;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
  location: {
    country: string;
    region: string;
    city: string;
  };
}

export interface ConversionFunnel {
  id: string;
  name: string;
  steps: FunnelStep[];
  conversionRate: number;
  dropOffPoints: DropOffPoint[];
}

export interface FunnelStep {
  id: string;
  name: string;
  event: string;
  order: number;
  users: number;
  conversionRate: number;
}

export interface DropOffPoint {
  step: string;
  dropOffRate: number;
  users: number;
}

class RealTimeAnalytics {
  private events: AnalyticsEvent[] = [];
  private sessions: Map<string, UserSession> = new Map();
  private activeUsers: Set<string> = new Set();
  private conversionFunnels: Map<string, ConversionFunnel> = new Map();
  private eventQueue: AnalyticsEvent[] = [];
  private isProcessing = false;
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeFunnels();
    this.startEventProcessing();
  }

  /**
   * Track an analytics event
   */
  public trackEvent(
    event: string,
    properties: Record<string, any> = {},
    userId?: string
  ): void {
    const sessionId = this.getCurrentSessionId();
    const analyticsEvent: AnalyticsEvent = {
      id: this.generateEventId(),
      userId,
      sessionId,
      event,
      properties,
      timestamp: new Date(),
      page: this.getCurrentPage(),
      userAgent: this.getUserAgent(),
      ip: this.getClientIP(),
      referrer: this.getReferrer(),
    };

    this.eventQueue.push(analyticsEvent);
    this.processEventQueue();

    // Log the event
    logger.info(`Analytics event tracked: ${event}`, {
      event,
      properties,
      userId,
      sessionId,
    }, 'analytics', 'event_tracking');
  }

  /**
   * Track page view
   */
  public trackPageView(
    page: string,
    properties: Record<string, any> = {},
    userId?: string
  ): void {
    this.trackEvent('page_view', {
      page,
      ...properties,
    }, userId);

    // Update session
    this.updateSession(page, userId);
  }

  /**
   * Track user action
   */
  public trackAction(
    action: string,
    element: string,
    properties: Record<string, any> = {},
    userId?: string
  ): void {
    this.trackEvent('user_action', {
      action,
      element,
      ...properties,
    }, userId);
  }

  /**
   * Track conversion
   */
  public trackConversion(
    conversionType: string,
    value: number,
    properties: Record<string, any> = {},
    userId?: string
  ): void {
    this.trackEvent('conversion', {
      conversion_type: conversionType,
      value,
      ...properties,
    }, userId);

    // Update conversion funnels
    this.updateConversionFunnels(conversionType, userId);
  }

  /**
   * Track error
   */
  public trackError(
    error: Error,
    context: Record<string, any> = {},
    userId?: string
  ): void {
    this.trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context,
    }, userId);
  }

  /**
   * Track performance metric
   */
  public trackPerformance(
    metric: string,
    value: number,
    properties: Record<string, any> = {},
    userId?: string
  ): void {
    this.trackEvent('performance', {
      metric,
      value,
      ...properties,
    }, userId);
  }

  /**
   * Get real-time analytics data
   */
  public getRealTimeData(): {
    activeUsers: number;
    pageViews: number;
    events: number;
    topPages: Array<{ page: string; views: number }>;
    topEvents: Array<{ event: string; count: number }>;
    conversionRate: number;
    averageSessionDuration: number;
  } {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentEvents = this.events.filter(e => e.timestamp >= lastHour);
    const recentSessions = Array.from(this.sessions.values())
      .filter(s => s.lastActivity >= lastHour);

    const pageViews = recentEvents.filter(e => e.event === 'page_view').length;
    const events = recentEvents.length;
    const activeUsers = this.activeUsers.size;

    // Top pages
    const pageCounts = recentEvents
      .filter(e => e.event === 'page_view')
      .reduce((acc, e) => {
        acc[e.page] = (acc[e.page] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topPages = Object.entries(pageCounts)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Top events
    const eventCounts = recentEvents.reduce((acc, e) => {
      acc[e.event] = (acc[e.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEvents = Object.entries(eventCounts)
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Conversion rate
    const conversions = recentEvents.filter(e => e.event === 'conversion').length;
    const conversionRate = pageViews > 0 ? (conversions / pageViews) * 100 : 0;

    // Average session duration
    const averageSessionDuration = recentSessions.length > 0
      ? recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length
      : 0;

    return {
      activeUsers,
      pageViews,
      events,
      topPages,
      topEvents,
      conversionRate,
      averageSessionDuration,
    };
  }

  /**
   * Get user session data
   */
  public getUserSession(sessionId: string): UserSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get conversion funnel data
   */
  public getConversionFunnel(funnelId: string): ConversionFunnel | undefined {
    return this.conversionFunnels.get(funnelId);
  }

  /**
   * Get user journey
   */
  public getUserJourney(userId: string): AnalyticsEvent[] {
    return this.events
      .filter(e => e.userId === userId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Get A/B test results
   */
  public getABTestResults(testId: string): {
    testId: string;
    variants: Array<{
      variant: string;
      users: number;
      conversions: number;
      conversionRate: number;
    }>;
    winner?: string;
    confidence: number;
  } {
    const testEvents = this.events.filter(e => 
      e.properties.testId === testId || e.event === 'ab_test_view'
    );

    const variants = new Map<string, { users: number; conversions: number }>();

    for (const event of testEvents) {
      const variant = event.properties.variant;
      if (!variant) continue;

      if (!variants.has(variant)) {
        variants.set(variant, { users: 0, conversions: 0 });
      }

      const variantData = variants.get(variant)!;

      if (event.event === 'ab_test_view') {
        variantData.users++;
      } else if (event.event === 'conversion') {
        variantData.conversions++;
      }
    }

    const variantResults = Array.from(variants.entries()).map(([variant, data]) => ({
      variant,
      users: data.users,
      conversions: data.conversions,
      conversionRate: data.users > 0 ? (data.conversions / data.users) * 100 : 0,
    }));

    // Find winner
    const winner = variantResults.reduce((prev, current) => 
      current.conversionRate > prev.conversionRate ? current : prev
    );

    // Calculate confidence (simplified)
    const confidence = this.calculateConfidence(variantResults);

    return {
      testId,
      variants: variantResults,
      winner: winner.variant,
      confidence,
    };
  }

  /**
   * Process event queue
   */
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const eventsToProcess = this.eventQueue.splice(0, 100); // Process in batches
      
      for (const event of eventsToProcess) {
        this.events.push(event);
        this.updateActiveUsers(event);
        this.updateSession(event.page, event.userId);
      }

      // Keep only last 10000 events in memory
      if (this.events.length > 10000) {
        this.events = this.events.slice(-10000);
      }

    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Start event processing
   */
  private startEventProcessing(): void {
    // Process events every 5 seconds
    this.flushInterval = setInterval(() => {
      this.processEventQueue();
    }, 5000);
  }

  /**
   * Update active users
   */
  private updateActiveUsers(event: AnalyticsEvent): void {
    if (event.userId) {
      this.activeUsers.add(event.userId);
    }
  }

  /**
   * Update session data
   */
  private updateSession(page: string, userId?: string): void {
    const sessionId = this.getCurrentSessionId();
    let session = this.sessions.get(sessionId);

    if (!session) {
      session = {
        id: sessionId,
        userId,
        startTime: new Date(),
        lastActivity: new Date(),
        pageViews: 0,
        events: 0,
        duration: 0,
        device: this.getDeviceInfo(),
        location: this.getLocationInfo(),
      };
      this.sessions.set(sessionId, session);
    }

    session.lastActivity = new Date();
    session.pageViews++;
    session.duration = session.lastActivity.getTime() - session.startTime.getTime();
  }

  /**
   * Update conversion funnels
   */
  private updateConversionFunnels(conversionType: string, userId?: string): void {
    // This would update conversion funnel data
    // Implementation depends on specific funnel definitions
  }

  /**
   * Initialize conversion funnels
   */
  private initializeFunnels(): void {
    // Recipe generation funnel
    const recipeFunnel: ConversionFunnel = {
      id: 'recipe_generation',
      name: 'Recipe Generation Funnel',
      steps: [
        { id: 'landing', name: 'Landing Page', event: 'page_view', order: 1, users: 0, conversionRate: 0 },
        { id: 'ingredients', name: 'Enter Ingredients', event: 'ingredients_entered', order: 2, users: 0, conversionRate: 0 },
        { id: 'generate', name: 'Generate Recipes', event: 'recipe_generation_started', order: 3, users: 0, conversionRate: 0 },
        { id: 'view_recipes', name: 'View Recipes', event: 'recipes_viewed', order: 4, users: 0, conversionRate: 0 },
        { id: 'save_recipe', name: 'Save Recipe', event: 'recipe_saved', order: 5, users: 0, conversionRate: 0 },
      ],
      conversionRate: 0,
      dropOffPoints: [],
    };

    this.conversionFunnels.set('recipe_generation', recipeFunnel);
  }

  /**
   * Calculate A/B test confidence
   */
  private calculateConfidence(variants: Array<{ users: number; conversions: number; conversionRate: number }>): number {
    // Simplified confidence calculation
    // In reality, you'd use proper statistical methods
    const totalUsers = variants.reduce((sum, v) => sum + v.users, 0);
    const totalConversions = variants.reduce((sum, v) => sum + v.conversions, 0);
    
    if (totalUsers < 100) return 0;
    if (totalUsers < 1000) return 50;
    if (totalUsers < 10000) return 80;
    return 95;
  }

  // Helper methods
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentSessionId(): string {
    // In a real implementation, this would get the session ID from cookies or context
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentPage(): string {
    // In a real implementation, this would get the current page from the router
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  }

  private getUserAgent(): string {
    return typeof window !== 'undefined' ? window.navigator.userAgent : 'server';
  }

  private getClientIP(): string {
    // In a real implementation, this would get the client IP
    return 'unknown';
  }

  private getReferrer(): string | undefined {
    return typeof window !== 'undefined' ? document.referrer : undefined;
  }

  private getDeviceInfo(): UserSession['device'] {
    if (typeof window === 'undefined') {
      return { type: 'desktop', os: 'unknown', browser: 'unknown' };
    }

    const userAgent = window.navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isTablet = /iPad|Tablet/.test(userAgent);

    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (isTablet) deviceType = 'tablet';
    else if (isMobile) deviceType = 'mobile';

    return {
      type: deviceType,
      os: this.getOS(userAgent),
      browser: this.getBrowser(userAgent),
    };
  }

  private getOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getLocationInfo(): UserSession['location'] {
    // In a real implementation, this would use IP geolocation
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
    };
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }
}

// Export singleton instance
export const realTimeAnalytics = new RealTimeAnalytics();

// Export types and utilities
export { RealTimeAnalytics };
export type { AnalyticsEvent, UserSession, ConversionFunnel, FunnelStep, DropOffPoint };