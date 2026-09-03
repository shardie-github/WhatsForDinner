/* eslint-disable no-console */
/**
 * Sentry Configuration
 * 
 * Centralized Sentry configuration for error tracking
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const ENABLE_SENTRY = process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true' || 
                      process.env.ENABLE_SENTRY === 'true' ||
                      (ENVIRONMENT === 'production' && SENTRY_DSN);

export function initSentry() {
  if (!ENABLE_SENTRY || !SENTRY_DSN) {
    return;
  }

  const sentryBrowser = Sentry as unknown as {
    replayIntegration?: (options: { maskAllText: boolean; blockAllMedia: boolean }) => Sentry.Integration;
  };

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    enabled: ENABLE_SENTRY,
    
    // Performance Monitoring
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
    
    // Session Replay (optional)
    replaysSessionSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    
    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    
    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'atomicFindClose',
      // Network errors
      'NetworkError',
      'Failed to fetch',
      // Known non-critical errors
      'ResizeObserver loop limit exceeded',
    ],
    
    // Filter out sensitive data
    beforeSend(event) {
      // Remove sensitive data from event
      if (event.request) {
        // Remove passwords from request data
        if (event.request.data) {
          const data = event.request.data as Record<string, unknown>;
          if (data.password) {
            data.password = '[REDACTED]';
          }
          if (data.token) {
            data.token = '[REDACTED]';
          }
        }
        
        // Remove sensitive headers
        if (event.request.headers) {
          const headers = event.request.headers as Record<string, string>;
          if (headers.authorization) {
            headers.authorization = '[REDACTED]';
          }
          if (headers.cookie) {
            headers.cookie = '[REDACTED]';
          }
        }
      }
      
      return event;
    },
    
    // Integrations (browser-only)
    integrations: typeof sentryBrowser.replayIntegration === 'function' ? [
      sentryBrowser.replayIntegration({
        maskAllText: true,
        blockAllMedia: false,
      }),
    ] : [],
  });
}

// Export Sentry instance for manual error reporting
export { Sentry };

// Helper function to capture errors
export function captureError(error: Error, context?: Record<string, unknown>) {
  if (!ENABLE_SENTRY) {
    console.error('Error (Sentry disabled):', error, context);
    return;
  }
  
  Sentry.captureException(error, {
    extra: context,
  });
}

// Helper function to capture messages
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, unknown>) {
  if (!ENABLE_SENTRY) {
    console.log(`Message (Sentry disabled) [${level}]:`, message, context);
    return;
  }
  
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

// Helper to set user context
export function setUserContext(user: { id: string; email?: string; name?: string }) {
  if (!ENABLE_SENTRY) return;
  
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  });
}

// Helper to clear user context
export function clearUserContext() {
  if (!ENABLE_SENTRY) return;
  
  Sentry.setUser(null);
}
