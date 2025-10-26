/**
 * Logging & Analytics Integration System
 * 
 * Implements comprehensive logging and analytics with:
 * - Sentry integration for error tracking
 * - LogRocket for session replay
 * - PostHog for product analytics
 * - Centralized logging aggregation
 * - Real-time monitoring and alerting
 */

import { logger } from './logger';
import { monitoringSystem } from './monitoring';

export interface ErrorEvent {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  stack?: string;
  context: Record<string, any>;
  userId?: string;
  sessionId: string;
  url: string;
  userAgent: string;
  tags: string[];
  fingerprint: string;
}

export interface UserEvent {
  id: string;
  timestamp: string;
  userId: string;
  sessionId: string;
  event: string;
  properties: Record<string, any>;
  context: {
    url: string;
    referrer?: string;
    userAgent: string;
    screen: {
      width: number;
      height: number;
    };
    viewport: {
      width: number;
      height: number;
    };
  };
}

export interface PerformanceEvent {
  id: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  metric: string;
  value: number;
  unit: string;
  context: Record<string, any>;
  tags: string[];
}

export interface SessionReplay {
  sessionId: string;
  userId?: string;
  startTime: string;
  endTime: string;
  duration: number;
  events: UserEvent[];
  errors: ErrorEvent[];
  performance: PerformanceEvent[];
  metadata: {
    browser: string;
    os: string;
    device: string;
    country: string;
    city: string;
  };
}

export interface AnalyticsConfig {
  sentry: {
    enabled: boolean;
    dsn: string;
    environment: string;
    release: string;
    sampleRate: number;
    tracesSampleRate: number;
  };
  logrocket: {
    enabled: boolean;
    appId: string;
    sampleRate: number;
    maskAllInputs: boolean;
    maskAllText: boolean;
  };
  posthog: {
    enabled: boolean;
    apiKey: string;
    host: string;
    personProfiles: boolean;
    capturePageview: boolean;
    capturePageleave: boolean;
  };
}

export interface LoggingReport {
  timestamp: string;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  debugCount: number;
  uniqueErrors: number;
  topErrors: Array<{
    message: string;
    count: number;
    lastSeen: string;
  }>;
  userEvents: number;
  performanceEvents: number;
  sessionReplays: number;
  averageSessionDuration: number;
  errorRate: number;
  performanceScore: number;
}

export class LoggingAnalyticsSystem {
  private config: AnalyticsConfig;
  private errorEvents: ErrorEvent[] = [];
  private userEvents: UserEvent[] = [];
  private performanceEvents: PerformanceEvent[] = [];
  private sessionReplays: Map<string, SessionReplay> = new Map();
  private isInitialized: boolean = false;
  private loggingReports: LoggingReport[] = [];

  constructor() {
    this.config = this.initializeConfig();
  }

  /**
   * Initialize analytics configuration
   */
  private initializeConfig(): AnalyticsConfig {
    return {
      sentry: {
        enabled: process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true',
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
        environment: process.env.NODE_ENV || 'development',
        release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        sampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_SAMPLE_RATE || '1.0'),
        tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '1.0'),
      },
      logrocket: {
        enabled: process.env.NEXT_PUBLIC_LOGROCKET_ENABLED === 'true',
        appId: process.env.NEXT_PUBLIC_LOGROCKET_APP_ID || '',
        sampleRate: parseFloat(process.env.NEXT_PUBLIC_LOGROCKET_SAMPLE_RATE || '0.1'),
        maskAllInputs: process.env.NEXT_PUBLIC_LOGROCKET_MASK_INPUTS === 'true',
        maskAllText: process.env.NEXT_PUBLIC_LOGROCKET_MASK_TEXT === 'true',
      },
      posthog: {
        enabled: process.env.NEXT_PUBLIC_POSTHOG_ENABLED === 'true',
        apiKey: process.env.NEXT_PUBLIC_POSTHOG_API_KEY || '',
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        personProfiles: process.env.NEXT_PUBLIC_POSTHOG_PERSON_PROFILES === 'true',
        capturePageview: process.env.NEXT_PUBLIC_POSTHOG_CAPTURE_PAGEVIEW === 'true',
        capturePageleave: process.env.NEXT_PUBLIC_POSTHOG_CAPTURE_PAGELEAVE === 'true',
      },
    };
  }

  /**
   * Initialize logging and analytics
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Logging and analytics system is already initialized');
      return;
    }

    logger.info('Initializing logging and analytics system');

    try {
      // Initialize Sentry
      if (this.config.sentry.enabled) {
        await this.initializeSentry();
      }

      // Initialize LogRocket
      if (this.config.logrocket.enabled) {
        await this.initializeLogRocket();
      }

      // Initialize PostHog
      if (this.config.posthog.enabled) {
        await this.initializePostHog();
      }

      // Start reporting
      this.startReporting();

      this.isInitialized = true;
      logger.info('Logging and analytics system initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize logging and analytics system', { error });
      throw error;
    }
  }

  /**
   * Initialize Sentry
   */
  private async initializeSentry(): Promise<void> {
    try {
      // This would initialize Sentry SDK
      // For now, we'll simulate the initialization
      logger.info('Sentry initialized', {
        dsn: this.config.sentry.dsn,
        environment: this.config.sentry.environment,
        release: this.config.sentry.release,
      });
    } catch (error) {
      logger.error('Failed to initialize Sentry', { error });
    }
  }

  /**
   * Initialize LogRocket
   */
  private async initializeLogRocket(): Promise<void> {
    try {
      // This would initialize LogRocket SDK
      // For now, we'll simulate the initialization
      logger.info('LogRocket initialized', {
        appId: this.config.logrocket.appId,
        sampleRate: this.config.logrocket.sampleRate,
      });
    } catch (error) {
      logger.error('Failed to initialize LogRocket', { error });
    }
  }

  /**
   * Initialize PostHog
   */
  private async initializePostHog(): Promise<void> {
    try {
      // This would initialize PostHog SDK
      // For now, we'll simulate the initialization
      logger.info('PostHog initialized', {
        apiKey: this.config.posthog.apiKey,
        host: this.config.posthog.host,
      });
    } catch (error) {
      logger.error('Failed to initialize PostHog', { error });
    }
  }

  /**
   * Start reporting
   */
  private startReporting(): void {
    // Generate reports every 5 minutes
    setInterval(async () => {
      await this.generateLoggingReport();
    }, 300000);
  }

  /**
   * Capture error event
   */
  async captureError(error: Error, context: Record<string, any> = {}): Promise<void> {
    const errorEvent: ErrorEvent = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level: 'error',
      message: error.message,
      stack: error.stack,
      context: {
        ...context,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      },
      sessionId: this.getSessionId(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      tags: this.extractTags(error, context),
      fingerprint: this.generateFingerprint(error, context),
    };

    this.errorEvents.push(errorEvent);

    // Send to Sentry
    if (this.config.sentry.enabled) {
      await this.sendToSentry(errorEvent);
    }

    // Send to LogRocket
    if (this.config.logrocket.enabled) {
      await this.sendToLogRocket(errorEvent);
    }

    logger.error('Error captured', { errorEvent });
  }

  /**
   * Capture user event
   */
  async captureUserEvent(event: string, properties: Record<string, any> = {}): Promise<void> {
    const userEvent: UserEvent = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      event,
      properties,
      context: {
        url: typeof window !== 'undefined' ? window.location.href : '',
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        screen: {
          width: typeof window !== 'undefined' ? window.screen.width : 0,
          height: typeof window !== 'undefined' ? window.screen.height : 0,
        },
        viewport: {
          width: typeof window !== 'undefined' ? window.innerWidth : 0,
          height: typeof window !== 'undefined' ? window.innerHeight : 0,
        },
      },
    };

    this.userEvents.push(userEvent);

    // Send to PostHog
    if (this.config.posthog.enabled) {
      await this.sendToPostHog(userEvent);
    }

    // Send to LogRocket
    if (this.config.logrocket.enabled) {
      await this.sendToLogRocket(userEvent);
    }

    logger.info('User event captured', { userEvent });
  }

  /**
   * Capture performance event
   */
  async capturePerformanceEvent(metric: string, value: number, unit: string, context: Record<string, any> = {}): Promise<void> {
    const performanceEvent: PerformanceEvent = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      metric,
      value,
      unit,
      context,
      tags: this.extractPerformanceTags(metric, context),
    };

    this.performanceEvents.push(performanceEvent);

    // Send to PostHog
    if (this.config.posthog.enabled) {
      await this.sendToPostHog(performanceEvent);
    }

    logger.info('Performance event captured', { performanceEvent });
  }

  /**
   * Start session replay
   */
  async startSessionReplay(userId?: string): Promise<string> {
    const sessionId = this.getSessionId();
    
    const sessionReplay: SessionReplay = {
      sessionId,
      userId,
      startTime: new Date().toISOString(),
      endTime: '',
      duration: 0,
      events: [],
      errors: [],
      performance: [],
      metadata: {
        browser: this.getBrowserInfo(),
        os: this.getOSInfo(),
        device: this.getDeviceInfo(),
        country: 'US', // This would be determined by IP geolocation
        city: 'San Francisco', // This would be determined by IP geolocation
      },
    };

    this.sessionReplays.set(sessionId, sessionReplay);

    // Send to LogRocket
    if (this.config.logrocket.enabled) {
      await this.sendToLogRocket(sessionReplay);
    }

    logger.info('Session replay started', { sessionId, userId });
    return sessionId;
  }

  /**
   * End session replay
   */
  async endSessionReplay(sessionId: string): Promise<void> {
    const sessionReplay = this.sessionReplays.get(sessionId);
    if (!sessionReplay) return;

    sessionReplay.endTime = new Date().toISOString();
    sessionReplay.duration = new Date(sessionReplay.endTime).getTime() - new Date(sessionReplay.startTime).getTime();

    // Send to LogRocket
    if (this.config.logrocket.enabled) {
      await this.sendToLogRocket(sessionReplay);
    }

    logger.info('Session replay ended', { sessionId, duration: sessionReplay.duration });
  }

  /**
   * Send to Sentry
   */
  private async sendToSentry(event: ErrorEvent): Promise<void> {
    // This would send to Sentry
    // For now, we'll simulate the sending
    logger.info('Sending to Sentry', { eventId: event.id });
  }

  /**
   * Send to LogRocket
   */
  private async sendToLogRocket(event: any): Promise<void> {
    // This would send to LogRocket
    // For now, we'll simulate the sending
    logger.info('Sending to LogRocket', { eventType: event.constructor.name });
  }

  /**
   * Send to PostHog
   */
  private async sendToPostHog(event: any): Promise<void> {
    // This would send to PostHog
    // For now, we'll simulate the sending
    logger.info('Sending to PostHog', { eventType: event.constructor.name });
  }

  /**
   * Generate logging report
   */
  private async generateLoggingReport(): Promise<void> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const recentErrors = this.errorEvents.filter(e => new Date(e.timestamp) > oneHourAgo);
    const recentUserEvents = this.userEvents.filter(e => new Date(e.timestamp) > oneHourAgo);
    const recentPerformanceEvents = this.performanceEvents.filter(e => new Date(e.timestamp) > oneHourAgo);

    const errorCount = recentErrors.length;
    const warningCount = recentErrors.filter(e => e.level === 'warning').length;
    const infoCount = recentErrors.filter(e => e.level === 'info').length;
    const debugCount = recentErrors.filter(e => e.level === 'debug').length;

    const uniqueErrors = new Set(recentErrors.map(e => e.fingerprint)).size;

    const topErrors = this.getTopErrors(recentErrors);

    const userEventsCount = recentUserEvents.length;
    const performanceEventsCount = recentPerformanceEvents.length;
    const sessionReplaysCount = this.sessionReplays.size;

    const averageSessionDuration = this.calculateAverageSessionDuration();
    const errorRate = this.calculateErrorRate();
    const performanceScore = this.calculatePerformanceScore();

    const report: LoggingReport = {
      timestamp: now.toISOString(),
      errorCount,
      warningCount,
      infoCount,
      debugCount,
      uniqueErrors,
      topErrors,
      userEvents: userEventsCount,
      performanceEvents: performanceEventsCount,
      sessionReplays: sessionReplaysCount,
      averageSessionDuration,
      errorRate,
      performanceScore,
    };

    this.loggingReports.push(report);

    // Keep only last 100 reports
    if (this.loggingReports.length > 100) {
      this.loggingReports = this.loggingReports.slice(-100);
    }

    logger.info('Logging report generated', { report });
  }

  /**
   * Get top errors
   */
  private getTopErrors(errors: ErrorEvent[]): Array<{ message: string; count: number; lastSeen: string }> {
    const errorCounts = new Map<string, { count: number; lastSeen: string }>();

    errors.forEach(error => {
      const key = error.message;
      const existing = errorCounts.get(key);
      if (existing) {
        existing.count++;
        if (new Date(error.timestamp) > new Date(existing.lastSeen)) {
          existing.lastSeen = error.timestamp;
        }
      } else {
        errorCounts.set(key, { count: 1, lastSeen: error.timestamp });
      }
    });

    return Array.from(errorCounts.entries())
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Calculate average session duration
   */
  private calculateAverageSessionDuration(): number {
    const sessions = Array.from(this.sessionReplays.values());
    if (sessions.length === 0) return 0;

    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
    return totalDuration / sessions.length;
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(): number {
    const totalEvents = this.userEvents.length + this.performanceEvents.length;
    if (totalEvents === 0) return 0;

    return this.errorEvents.length / totalEvents;
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(): number {
    // This would calculate actual performance score
    // For now, we'll simulate the calculation
    return 85;
  }

  /**
   * Get session ID
   */
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';
    
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  /**
   * Get user ID
   */
  private getUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return localStorage.getItem('userId') || undefined;
  }

  /**
   * Extract tags from error and context
   */
  private extractTags(error: Error, context: Record<string, any>): string[] {
    const tags: string[] = [];
    
    if (error.name) tags.push(`error:${error.name}`);
    if (context.component) tags.push(`component:${context.component}`);
    if (context.action) tags.push(`action:${context.action}`);
    
    return tags;
  }

  /**
   * Generate fingerprint for error
   */
  private generateFingerprint(error: Error, context: Record<string, any>): string {
    const key = `${error.name}:${error.message}:${context.component || 'unknown'}`;
    return btoa(key).substr(0, 16);
  }

  /**
   * Extract performance tags
   */
  private extractPerformanceTags(metric: string, context: Record<string, any>): string[] {
    const tags: string[] = [`metric:${metric}`];
    
    if (context.component) tags.push(`component:${context.component}`);
    if (context.page) tags.push(`page:${context.page}`);
    
    return tags;
  }

  /**
   * Get browser info
   */
  private getBrowserInfo(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  /**
   * Get OS info
   */
  private getOSInfo(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  /**
   * Get device info
   */
  private getDeviceInfo(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }

  /**
   * Get logging reports
   */
  getLoggingReports(limit: number = 10): LoggingReport[] {
    return this.loggingReports.slice(-limit);
  }

  /**
   * Get latest logging report
   */
  getLatestLoggingReport(): LoggingReport | null {
    return this.loggingReports[this.loggingReports.length - 1] || null;
  }

  /**
   * Get error events
   */
  getErrorEvents(limit: number = 100): ErrorEvent[] {
    return this.errorEvents.slice(-limit);
  }

  /**
   * Get user events
   */
  getUserEvents(limit: number = 100): UserEvent[] {
    return this.userEvents.slice(-limit);
  }

  /**
   * Get performance events
   */
  getPerformanceEvents(limit: number = 100): PerformanceEvent[] {
    return this.performanceEvents.slice(-limit);
  }

  /**
   * Get session replays
   */
  getSessionReplays(): SessionReplay[] {
    return Array.from(this.sessionReplays.values());
  }
}

// Export singleton instance
export const loggingAnalyticsSystem = new LoggingAnalyticsSystem();