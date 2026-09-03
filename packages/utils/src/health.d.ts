/**
 * Production Health Check Utilities
 *
 * Provides comprehensive health checking for production monitoring:
 * - Database connectivity
 * - External service availability
 * - System resource checks
 * - Dependency health
 */
export interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    checks: Record<string, CheckResult>;
    uptime: number;
    version?: string;
}
export interface CheckResult {
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    latency?: number;
    details?: Record<string, unknown>;
}
export interface HealthCheckOptions {
    /**
     * Include detailed information in response
     */
    includeDetails?: boolean;
    /**
     * Timeout for individual checks (ms)
     */
    checkTimeout?: number;
    /**
     * Custom checks to run
     */
    customChecks?: Record<string, () => Promise<CheckResult>>;
}
/**
 * Run comprehensive health check
 */
export declare function runHealthCheck(options?: HealthCheckOptions): Promise<HealthCheckResult>;
/**
 * Create health check endpoint handler
 */
export declare function createHealthCheckHandler(options?: HealthCheckOptions): () => Promise<Response>;
/**
 * Liveness probe - simple check if service is running
 */
export declare function createLivenessHandler(): () => Response;
/**
 * Readiness probe - check if service is ready to accept traffic
 */
export declare function createReadinessHandler(): Promise<Response>;
//# sourceMappingURL=health.d.ts.map