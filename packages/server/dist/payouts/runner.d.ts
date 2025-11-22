/**
 * Payout Runner
 *
 * Computes partner payouts for a period, handles Stripe Connect transfers,
 * multi-currency conversion, rounding, and refund/chargeback handling
 */
/**
 * Run payout cycle for a period
 */
export declare function runPayoutCycle(periodStart: Date, periodEnd: Date, partnerId?: string): Promise<{
    processed: number;
    failed: number;
    totalPayoutCents: number;
}>;
/**
 * Admin endpoint to run payout cycle
 */
export declare function runPayoutCycleHandler(periodStart?: string, periodEnd?: string, partnerId?: string): Promise<{
    processed: number;
    failed: number;
    totalPayoutCents: number;
}>;
//# sourceMappingURL=runner.d.ts.map