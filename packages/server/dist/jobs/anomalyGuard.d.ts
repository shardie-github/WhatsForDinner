/**
 * Anomaly Guard Job
 * Monitors metrics and auto-pauses experiments if guardrails breached
 */
export declare function anomalyGuardProcessor(): Promise<{
    checked: number;
    paused: number;
    errors: number;
}>;
//# sourceMappingURL=anomalyGuard.d.ts.map