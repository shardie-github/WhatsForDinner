/**
 * Price Rollout Job
 * Activates scheduled pricing rules and expires promos
 */
export declare function priceRolloutProcessor(): Promise<{
    activated: number;
    expired: number;
    errors: number;
}>;
//# sourceMappingURL=priceRollout.d.ts.map