/**
 * SLO Budget Calculator & Exporter
 *
 * Tracks Service Level Objectives:
 * - Availability: 99.9% (0.1% error budget)
 * - Latency P95: < 400ms (5% error budget)
 * - Error Rate: < 0.1% (0.1% error budget)
 *
 * Exports metrics to Prometheus for Grafana dashboards
 */
export interface SLOTarget {
    name: string;
    target: number;
    window: number;
    errorBudget: number;
}
export interface SLOStatus {
    name: string;
    target: number;
    current: number;
    errorBudget: number;
    errorBudgetRemaining: number;
    status: 'green' | 'yellow' | 'red' | 'critical';
    window: number;
}
/**
 * Initialize SLO metrics
 */
export declare function initSLOMetrics(): void;
/**
 * Record a successful request for availability SLO
 */
export declare function recordAvailabilitySuccess(): void;
/**
 * Record a failed request for availability SLO
 */
export declare function recordAvailabilityFailure(): void;
/**
 * Record request latency for latency SLO
 */
export declare function recordLatency(latencyMs: number): void;
/**
 * Record an error for error rate SLO
 */
export declare function recordError(): void;
/**
 * Calculate SLO status from metrics
 */
export declare function calculateSLOStatus(sloTarget: SLOTarget, currentValue: number): SLOStatus;
/**
 * Get current SLO status for all targets
 *
 * Note: In production, this would query Prometheus for actual metrics
 * For now, returns current gauge values
 */
export declare function getCurrentSLOStatus(): Promise<SLOStatus[]>;
/**
 * Export SLO metrics summary for dashboards
 */
export declare function exportSLOSummary(): Promise<{
    slos: SLOStatus[];
    overall: {
        status: 'green' | 'yellow' | 'red' | 'critical';
        worstSLO: string;
    };
}>;
/**
 * Check if SLOs are within acceptable thresholds for deployment
 */
export declare function checkSLOForDeployment(): Promise<{
    canDeploy: boolean;
    reason?: string;
    slos: SLOStatus[];
}>;
//# sourceMappingURL=slo.d.ts.map