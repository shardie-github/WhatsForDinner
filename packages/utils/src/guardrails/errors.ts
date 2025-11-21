/**
 * Error Handling Utilities
 * 
 * Provides consistent error types and handling across the application:
 * - Typed error classes for different error scenarios
 * - Error codes for client-side handling
 * - Automatic error logging
 * - User-friendly error messages
 * 
 * Usage:
 *   import { AppError, ErrorCode } from '@whats-for-dinner/utils/guardrails/errors';
 *   
 *   throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid ingredients', { field: 'ingredients' });
 */

import { logger } from './logger';

export enum ErrorCode {
  // Client errors (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CONFLICT = 'CONFLICT',

  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CIRCUIT_BREAKER_OPEN = 'CIRCUIT_BREAKER_OPEN',
}

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly context: ErrorContext;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    context: ErrorContext = {},
    statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.isOperational = true;

    // Map error codes to HTTP status codes
    this.statusCode =
      statusCode ||
      this.getStatusCodeForCode(code);

    // Log error
    logger.error(
      {
        error: this,
        ...context,
      },
      `Error: ${code} - ${message}`
    );

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  private getStatusCodeForCode(code: ErrorCode): number {
    switch (code) {
      case ErrorCode.VALIDATION_ERROR:
        return 400;
      case ErrorCode.AUTHENTICATION_ERROR:
        return 401;
      case ErrorCode.AUTHORIZATION_ERROR:
        return 403;
      case ErrorCode.NOT_FOUND:
        return 404;
      case ErrorCode.CONFLICT:
        return 409;
      case ErrorCode.RATE_LIMIT_EXCEEDED:
        return 429;
      case ErrorCode.TIMEOUT_ERROR:
        return 504;
      case ErrorCode.CIRCUIT_BREAKER_OPEN:
        return 503;
      default:
        return 500;
    }
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON(): {
    code: ErrorCode;
    message: string;
    statusCode: number;
    context?: ErrorContext;
  } {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: process.env.NODE_ENV === 'development' ? this.context : undefined,
    };
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, context: ErrorContext = {}) {
    super(ErrorCode.VALIDATION_ERROR, message, context, 400);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context: ErrorContext = {}) {
    super(ErrorCode.AUTHENTICATION_ERROR, message, context, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', context: ErrorContext = {}) {
    super(ErrorCode.AUTHORIZATION_ERROR, message, context, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, context: ErrorContext = {}) {
    super(ErrorCode.NOT_FOUND, `${resource} not found`, context, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', context: ErrorContext = {}) {
    super(ErrorCode.RATE_LIMIT_EXCEEDED, message, context, 429);
    this.name = 'RateLimitError';
  }
}

/**
 * External API error (502/503)
 */
export class ExternalApiError extends AppError {
  constructor(
    service: string,
    message: string,
    context: ErrorContext = {}
  ) {
    super(
      ErrorCode.EXTERNAL_API_ERROR,
      `${service}: ${message}`,
      { ...context, service },
      502
    );
    this.name = 'ExternalApiError';
  }
}

/**
 * Timeout error (504)
 */
export class TimeoutError extends AppError {
  constructor(operation: string, timeoutMs: number, context: ErrorContext = {}) {
    super(
      ErrorCode.TIMEOUT_ERROR,
      `${operation} timed out after ${timeoutMs}ms`,
      { ...context, timeoutMs },
      504
    );
    this.name = 'TimeoutError';
  }
}

/**
 * Circuit breaker open error (503)
 */
export class CircuitBreakerOpenError extends AppError {
  constructor(service: string, context: ErrorContext = {}) {
    super(
      ErrorCode.CIRCUIT_BREAKER_OPEN,
      `Circuit breaker open for ${service}`,
      { ...context, service },
      503
    );
    this.name = 'CircuitBreakerOpenError';
  }
}

/**
 * Error handler middleware for API routes
 */
export function handleError(error: unknown): {
  statusCode: number;
  body: { code: ErrorCode; message: string; context?: ErrorContext };
} {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: error.toJSON(),
    };
  }

  // Unknown error - log and return generic error
  logger.error({ error }, 'Unhandled error');
  
  return {
    statusCode: 500,
    body: {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
      context: process.env.NODE_ENV === 'development' ? { error: String(error) } : undefined,
    },
  };
}
