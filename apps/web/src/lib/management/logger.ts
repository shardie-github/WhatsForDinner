/**
 * Logging and Monitoring Utilities
 * Provides structured logging with different levels and monitoring integration
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  [key: string]: unknown;
}

class Logger {
  private level: LogLevel;
  private context: LogContext = {};

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  clearContext(): void {
    this.context = {};
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (level < this.level) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      ...this.context,
      ...data,
    };

    // Console logging
    const consoleMethod = level === LogLevel.ERROR ? 'error' :
                         level === LogLevel.WARN ? 'warn' :
                         level === LogLevel.DEBUG ? 'debug' : 'log';
    
    console[consoleMethod](`[${logEntry.level}]`, logEntry.message, logEntry);

    // Send to monitoring service (e.g., Sentry, LogRocket)
    if (level >= LogLevel.ERROR && typeof window !== 'undefined') {
      // Integrate with your monitoring service
      if ((window as any).Sentry) {
        (window as any).Sentry.captureException(new Error(message), {
          extra: logEntry,
        });
      }
    }
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const errorData = error instanceof Error ? {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
    } : { error };
    
    this.log(LogLevel.ERROR, message, { ...errorData, ...data });
  }

  // Performance logging
  performance(name: string, duration: number, metadata?: Record<string, unknown>): void {
    this.info(`Performance: ${name}`, {
      duration,
      ...metadata,
    });
  }

  // User action logging
  track(event: string, properties?: Record<string, unknown>): void {
    this.info(`Event: ${event}`, properties);
    
    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, properties);
    }
  }
}

// Singleton instance
export const logger = new Logger(
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
);

// Export convenience functions
export const log = {
  debug: (message: string, data?: Record<string, unknown>) => logger.debug(message, data),
  info: (message: string, data?: Record<string, unknown>) => logger.info(message, data),
  warn: (message: string, data?: Record<string, unknown>) => logger.warn(message, data),
  error: (message: string, error?: Error | unknown, data?: Record<string, unknown>) =>
    logger.error(message, error, data),
  performance: (name: string, duration: number, metadata?: Record<string, unknown>) =>
    logger.performance(name, duration, metadata),
  track: (event: string, properties?: Record<string, unknown>) =>
    logger.track(event, properties),
};
