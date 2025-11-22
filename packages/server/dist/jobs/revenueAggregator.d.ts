/**
 * Revenue Aggregator Job
 * Nightly cron 00:05 UTC: aggregate daily transactions ? snapshots
 * Weekly task: compute cohort LTV/CAC segments
 */
/**
 * Daily aggregation job
 * Runs at 00:05 UTC
 */
export declare function dailyRevenueAggregation(): Promise<void>;
/**
 * Weekly LTV/CAC segment computation
 */
export declare function weeklyLTVSegmentation(): Promise<void>;
//# sourceMappingURL=revenueAggregator.d.ts.map