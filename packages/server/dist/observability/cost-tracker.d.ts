/**
 * Cost caps and throttling
 */
export interface CostConfig {
    dailyLimit: number;
    monthlyLimit: number;
    throttling: {
        enabled: boolean;
        maxRequestsPerMinute: number;
    };
}
export declare function getCostConfig(): CostConfig;
export declare class CostTracker {
    private requests;
    private dailyCost;
    private monthlyCost;
    checkQuota(): boolean;
    recordRequest(cost?: number): void;
    shouldThrottle(): boolean;
    getCostBreakdown(): {
        daily: number;
        monthly: number;
        requests: number;
        throttled: boolean;
    };
}
export declare const costTracker: CostTracker;
//# sourceMappingURL=cost-tracker.d.ts.map