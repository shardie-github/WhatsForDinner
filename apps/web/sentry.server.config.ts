import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  // Filter out sensitive data
  beforeSend(event, hint) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-api-key'];
    }
    
    // Don't log full request body (may contain secrets)
    if (event.request?.data) {
      event.request.data = '[Redacted]';
    }
    
    return event;
  },
  
  // Ignore specific errors
  ignoreErrors: [
    // Database connection errors (these are expected during deploys)
    'ECONNREFUSED',
    'ETIMEDOUT',
    // Non-critical validation errors
    'ValidationError',
  ],
});
