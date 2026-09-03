/**
 * Unified Logging Service
 *
 * Provides consistent logging across the monorepo with:
 * - Environment-aware log levels
 * - Structured logging
 * - Sentry integration
 * - Performance tracking
 * - Redaction of sensitive data
 */
interface LogContext {
    [key: string]: unknown;
}
interface Logger {
    debug(message: string, context?: LogContext, source?: string, component?: string): void;
    info(message: string, context?: LogContext, source?: string, component?: string): void;
    warn(message: string, context?: LogContext, source?: string, component?: string): void;
    error(message: string, context?: LogContext, source?: string, component?: string): void;
}
/**
 * Create logger instance
 */
export declare function createLogger(source?: string): Logger;
/**
 * Default logger instance
 */
export declare const logger: Logger;
/**
 * Create logger for specific component
 */
export declare function createComponentLogger(component: string, source?: string): Logger;
export {};
//# sourceMappingURL=logger.d.ts.map