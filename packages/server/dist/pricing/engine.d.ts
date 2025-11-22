/**
 * Pricing Engine
 * Intelligent price recommendation with elasticity, Van Westendorp, and geo-pricing
 */
export interface PriceRecommendation {
    price_cents: number;
    confidence: number;
    reason: string;
    source: 'base' | 'elasticity' | 'vanwestendorp' | 'experiment' | 'geopricing';
}
/**
 * Main API: Get recommended price with explainable reason
 */
export declare function getRecommendedPrice(plan: string, country: string, platform: 'ios' | 'android' | 'web', currency?: string): Promise<PriceRecommendation>;
//# sourceMappingURL=engine.d.ts.map