/**
 * Price Optimizer Job
 * Automated price testing based on elasticity
 * If elasticity < -1 ? test +5% price
 * If elasticity > -0.5 ? test -5% price
 * Auto-pause if conversion drop > 10% or revenue drop > 5%
 */
/**
 * Automated price optimization loop
 */
export declare function optimizePrices(): Promise<void>;
//# sourceMappingURL=priceOptimizer.d.ts.map