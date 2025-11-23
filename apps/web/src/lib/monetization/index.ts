/**
 * Monetization Module - Unified Export
 * 
 * Exports all monetization features for easy importing
 */

// Re-export original monetization manager
export { monetization, MONETIZATION_MODE } from './monetization-manager';
export type { Product, PurchaseResult } from './monetization-manager';

// New monetization features
export { valueEngine } from './value-engine';
export { usagePremium } from './usage-premium';
export { freemiumConverter } from './freemium-converter';
export { enhancedReferral } from './referral-enhanced';
export { dynamicPricing } from './dynamic-pricing';
export { retentionMonetization } from './retention-monetization';

// Types
export type {
  CustomerValueProfile,
  UpsellOpportunity,
  PremiumFeature,
} from './value-engine';

export type {
  UsagePremiumFeature,
  UsageCredits,
} from './usage-premium';

export type {
  ConversionTrigger,
  PaywallStrategy,
} from './freemium-converter';

export type {
  ReferralReward,
  ReferralProgram,
  ReferralStats,
} from './referral-enhanced';

export type {
  PricingTier,
  DynamicPricingOffer,
} from './dynamic-pricing';

export type {
  RetentionOffer,
  ChurnRiskProfile,
} from './retention-monetization';
