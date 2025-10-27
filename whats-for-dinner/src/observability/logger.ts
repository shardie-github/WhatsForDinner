/**
 * Structured Logger with Correlation IDs and PII Redaction
 * 
 * Features:
 * - Structured JSON logging
 * - Correlation ID tracking
 * - PII redaction
 * - Log levels
 * - Context enrichment
 */

import { v4 as uuidv4 } from 'uuid';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  operation?: string;
  duration?: number;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private correlationId: string;
  private context: LogContext = {};

  constructor(initialContext: LogContext = {}) {
    this.correlationId = initialContext.correlationId || uuidv4();
    this.context = {
      ...initialContext,
      correlationId: this.correlationId,
    };
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: LogContext): Logger {
    return new Logger({
      ...this.context,
      ...additionalContext,
    });
  }

  /**
   * Set correlation ID for request tracking
   */
  setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId;
    this.context.correlationId = correlationId;
  }

  /**
   * Redact PII from data
   */
  private redactPII(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const piiFields = [
      'password',
      'token',
      'secret',
      'key',
      'email',
      'phone',
      'ssn',
      'creditCard',
      'cvv',
      'pin',
      'authorization',
      'cookie',
      'session',
    ];

    const redacted = { ...data };

    for (const key in redacted) {
      if (piiFields.some(field => key.toLowerCase().includes(field))) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object') {
        redacted[key] = this.redactPII(redacted[key]);
      }
    }

    return redacted;
  }

  /**
   * Format log entry
   */
  private formatLogEntry(
    level: LogLevel,
    message: string,
    context: LogContext = {},
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.redactPII({
        ...this.context,
        ...context,
      }),
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  /**
   * Write log entry
   */
  private writeLog(entry: LogEntry): void {
    // In production, this would send to your logging service
    // For now, we'll output to console with proper formatting
    const output = JSON.stringify(entry, null, 2);
    
    switch (entry.level) {
      case 'debug':
        console.debug(output);
        break;
      case 'info':
        console.info(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'error':
      case 'fatal':
        console.error(output);
        break;
    }
  }

  /**
   * Log methods
   */
  debug(message: string, context: LogContext = {}): void {
    this.writeLog(this.formatLogEntry('debug', message, context));
  }

  info(message: string, context: LogContext = {}): void {
    this.writeLog(this.formatLogEntry('info', message, context));
  }

  warn(message: string, context: LogContext = {}): void {
    this.writeLog(this.formatLogEntry('warn', message, context));
  }

  error(message: string, error?: Error, context: LogContext = {}): void {
    this.writeLog(this.formatLogEntry('error', message, context, error));
  }

  fatal(message: string, error?: Error, context: LogContext = {}): void {
    this.writeLog(this.formatLogEntry('fatal', message, context, error));
  }

  /**
   * Performance logging
   */
  time(label: string): void {
    console.time(`[${this.correlationId}] ${label}`);
  }

  timeEnd(label: string): void {
    console.timeEnd(`[${this.correlationId}] ${label}`);
  }

  /**
   * Business metrics logging
   */
  metric(name: string, value: number, context: LogContext = {}): void {
    this.info(`Metric: ${name}`, {
      ...context,
      metricName: name,
      metricValue: value,
      type: 'metric',
    });
  }

  /**
   * User action logging
   */
  userAction(action: string, context: LogContext = {}): void {
    this.info(`User Action: ${action}`, {
      ...context,
      action,
      type: 'user_action',
    });
  }

  /**
   * API request logging
   */
  apiRequest(method: string, url: string, context: LogContext = {}): void {
    this.info(`API Request: ${method} ${url}`, {
      ...context,
      method,
      url,
      type: 'api_request',
    });
  }

  /**
   * API response logging
   */
  apiResponse(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context: LogContext = {}
  ): void {
    this.info(`API Response: ${method} ${url}`, {
      ...context,
      method,
      url,
      statusCode,
      duration,
      type: 'api_response',
    });
  }
}

// Default logger instance
export const logger = new Logger();

// Factory function for creating loggers
export function createLogger(context: LogContext = {}): Logger {
  return new Logger(context);
}

// Request logger middleware for Next.js
export function requestLogger(req: any, res: any, next: any) {
  const requestLogger = createLogger({
    requestId: req.headers['x-request-id'] || uuidv4(),
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });

  req.logger = requestLogger;

  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    requestLogger.apiResponse(
      req.method,
      req.url,
      res.statusCode,
      duration,
      {
        responseSize: res.get('content-length'),
      }
    );
  });

  next();
}

export default logger;