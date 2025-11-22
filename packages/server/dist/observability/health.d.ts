/**
 * Aggregated Health Check Endpoints
 *
 * Provides /healthz endpoint that aggregates health from:
 * - Web service
 * - API service
 * - Queue workers
 * - Background jobs
 * - Database connections
 * - Redis connections
 * - External dependencies
 */
import { FastifyInstance } from 'fastify';
export interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    services: Record<string, ServiceHealth>;
    overall: {
        uptime: number;
        version: string;
        environment: string;
    };
}
export interface ServiceHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency?: number;
    error?: string;
    details?: Record<string, unknown>;
}
/**
 * Aggregate all health checks
 */
export declare function aggregateHealthCheck(): Promise<HealthCheckResult>;
/**
 * Register health check endpoints on Fastify instance
 */
export declare function registerHealthRoutes(app: FastifyInstance): void;
/**
 * Standalone health check function (for use in scripts)
 */
export declare function runHealthCheck(): Promise<HealthCheckResult>;
//# sourceMappingURL=health.d.ts.map