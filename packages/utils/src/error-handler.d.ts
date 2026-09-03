/**
 * Enhanced Error Handler
 *
 * Provides structured error handling with logging, user-friendly messages,
 * and proper error classification for monitoring and debugging.
 */
/**
 * Simple logger interface for error handling
 */
export interface Logger {
    error(message: string, context?: Record<string, unknown>, source?: string, component?: string): void;
    warn(message: string, context?: Record<string, unknown>, source?: string, component?: string): void;
    info(message: string, context?: Record<string, unknown>, source?: string, component?: string): void;
}
export interface ErrorContext {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    endpoint?: string;
    method?: string;
    [key: string]: unknown;
}
export interface ErrorHandlerOptions {
    /**
     * Logger instance for error logging
     */
    logger?: Logger;
    /**
     * Whether to log errors (default: true)
     */
    logErrors?: boolean;
    /**
     * Whether to include stack traces in logs (default: true in development)
     */
    includeStackTrace?: boolean;
    /**
     * Whether to sanitize error messages for user display (default: true)
     */
    sanitizeForUser?: boolean;
    /**
     * Custom error context
     */
    context?: ErrorContext;
}
/**
 * Handle error with logging and user-friendly response
 */
export declare function handleError(error: unknown, options?: ErrorHandlerOptions): {
    statusCode: number;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
};
/**
 * Async error handler wrapper for API routes
 */
export declare function withErrorHandler<T extends (...args: unknown[]) => Promise<Response>>(handler: T, options?: ErrorHandlerOptions): T;
/**
 * Error boundary for React components
 */
export declare function createErrorBoundary(logger?: Logger): {
    onError: (error: Error, errorInfo: {
        componentStack: string;
    }) => void;
};
//# sourceMappingURL=error-handler.d.ts.map