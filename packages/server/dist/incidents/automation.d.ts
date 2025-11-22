/**
 * Incident Management Automation
 *
 * Automatically detects, creates, and triages incidents based on:
 * - Error rate spikes
 * - SLO violations
 * - Health check failures
 * - External alert webhooks
 *
 * Features:
 * - Auto-incident creation with severity assessment
 * - Triage assignment based on severity
 * - Slack/PagerDuty notifications
 * - Timeline auto-append
 */
export interface IncidentTrigger {
    type: 'error_rate_spike' | 'slo_violation' | 'health_check_failure' | 'external_alert';
    severity: 'low' | 'major' | 'critical';
    title: string;
    summary: string;
    metrics?: Record<string, number>;
    threshold?: number;
}
export interface AutoIncidentConfig {
    errorRateThreshold: number;
    errorRateWindow: number;
    slackWebhook?: string;
    pagerdutyApiKey?: string;
    autoAssignTriage: boolean;
    systemUserId: string;
}
/**
 * Detect error rate spike from metrics
 */
export declare function detectErrorRateSpike(currentErrorRate: number, baselineErrorRate: number, config: AutoIncidentConfig): Promise<IncidentTrigger | null>;
/**
 * Detect SLO violations
 */
export declare function detectSLOViolations(): Promise<IncidentTrigger | null>;
/**
 * Detect health check failures
 */
export declare function detectHealthCheckFailures(): Promise<IncidentTrigger | null>;
/**
 * Create incident from trigger
 */
export declare function createIncidentFromTrigger(trigger: IncidentTrigger, config: AutoIncidentConfig): Promise<string | null>;
/**
 * Run incident detection cycle
 */
export declare function runIncidentDetection(config: AutoIncidentConfig): Promise<string[]>;
/**
 * Auto-update incident timeline based on metrics
 */
export declare function autoUpdateIncidentTimeline(incidentId: string, updates: {
    status?: string;
    metrics?: Record<string, number>;
    notes?: string;
}, config: AutoIncidentConfig): Promise<void>;
/**
 * Default configuration
 */
export declare function getDefaultConfig(): AutoIncidentConfig;
//# sourceMappingURL=automation.d.ts.map