/**
 * Revenue Analytics Module
 * ETL jobs aggregating transactions ? revenue_snapshots
 * Computes KPIs: MRR, ARR, ARPU, LTV, CAC
 * Emits metrics ? Prometheus + PostHog events
 */
export interface RevenueMetrics {
    mrr_cents: number;
    arr_cents: number;
    arpu_cents: number;
    ltv_cents: number;
    cac_cents: number;
    churn_rate: number;
    conversion_rate: number;
}
/**
 * Aggregate revenue metrics for a given period
 */
export declare function aggregateRevenueSnapshot(period: Date): Promise<RevenueMetrics>;
/**
 * Get revenue summary for a period range
 */
export declare function getRevenueSummary(startDate: Date, endDate: Date): Promise<RevenueMetrics[]>;
//# sourceMappingURL=revenue.d.ts.map