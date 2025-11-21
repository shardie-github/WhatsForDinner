/**
 * Structured Logging Utility
 * 
 * Provides consistent, structured logging across the application with:
 * - Automatic PII redaction
 * - Structured JSON output for production
 * - Contextual logging (request IDs, user IDs)
 * - Log levels (debug, info, warn, error)
 * 
 * Usage:
 *   import { logger } from '@whats-for-dinner/utils/guardrails/logger';
 *   
 *   logger.info({ userId, action: 'meal_plan_created' }, 'Meal plan created');
 *   logger.error({ error, userId }, 'Failed to generate recipes');
 */

import pino from 'pino';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  userId?: string;
  requestId?: string;
  traceId?: string;
  [key: string]: unknown;
}

class GuardrailLogger {
  private pinoLogger: pino.Logger;

  constructor() {
    this.pinoLogger = pino({
      level: process.env.LOG_LEVEL || 'info',
      redact: {
        paths: [
          // PII fields
          'email',
          'password',
          'token',
          'apiKey',
          'secret',
          '*.email',
          '*.password',
          '*.token',
          '*.apiKey',
          '*.secret',
          // HTTP headers
          'req.headers.authorization',
          'req.headers.cookie',
          'req.headers.cookie',
          // Nested objects
          'user.email',
          'user.password',
          'credentials.token',
          'credentials.apiKey',
        ],
        remove: true,
      },
      formatters: {
        level: (label) => {
          return { level: label };
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    });
  }

  /**
   * Log debug message (development only)
   */
  debug(context: LogContext, message: string): void {
    this.pinoLogger.debug(context, message);
  }

  /**
   * Log info message
   */
  info(context: LogContext, message: string): void {
    this.pinoLogger.info(context, message);
  }

  /**
   * Log warning message
   */
  warn(context: LogContext, message: string): void {
    this.pinoLogger.warn(context, message);
  }

  /**
   * Log error message
   */
  error(context: LogContext & { error?: Error | unknown }, message: string): void {
    const errorContext = {
      ...context,
      error: context.error instanceof Error
        ? {
            name: context.error.name,
            message: context.error.message,
            stack: context.error.stack,
          }
        : String(context.error),
    };
    this.pinoLogger.error(errorContext, message);
  }

  /**
   * Create child logger with persistent context
   */
  child(context: LogContext): pino.Logger {
    return this.pinoLogger.child(context);
  }

  /**
   * Log structured event (for analytics/monitoring)
   */
  event(eventName: string, context: LogContext): void {
    this.pinoLogger.info(
      {
        ...context,
        event: eventName,
        timestamp: new Date().toISOString(),
      },
      `Event: ${eventName}`
    );
  }

  /**
   * Log performance metric
   */
  metric(metricName: string, value: number, context: LogContext): void {
    this.pinoLogger.info(
      {
        ...context,
        metric: metricName,
        value,
        unit: 'ms',
      },
      `Metric: ${metricName}=${value}ms`
    );
  }
}

export const logger = new GuardrailLogger();
