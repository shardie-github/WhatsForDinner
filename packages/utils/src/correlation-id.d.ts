/**
 * Correlation ID Utilities
 *
 * Provides request correlation ID tracking for better debugging and tracing
 */
/**
 * Generate a correlation ID
 */
export declare function generateCorrelationId(): string;
/**
 * Extract correlation ID from headers
 */
export declare function getCorrelationIdFromHeaders(headers: Headers | Record<string, string>): string;
/**
 * Add correlation ID to response headers
 */
export declare function addCorrelationIdToHeaders(headers: Headers, correlationId: string): void;
//# sourceMappingURL=correlation-id.d.ts.map