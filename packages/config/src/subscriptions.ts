/**
 * Subscription Plans Configuration
 * Maps subscription SKUs to plans for iOS and Android
 */

export type SubscriptionPlan = 'free' | 'premium_monthly' | 'premium_annual' | 'partner';

export interface SubscriptionSKU {
  ios: string;
  android: string;
  plan: SubscriptionPlan;
  name: string;
  description: string;
  price?: number; // In cents
  currency?: string;
}

export const SUBSCRIPTION_SKUS: Record<SubscriptionPlan, SubscriptionSKU> = {
  free: {
    ios: '',
    android: '',
    plan: 'free',
    name: 'Free',
    description: 'Basic features with ads',
  },
  premium_monthly: {
    ios: 'com.nomad.premium.month',
    android: 'nomad_premium_month',
    plan: 'premium_monthly',
    name: 'Premium Monthly',
    description: 'Premium features, no ads, monthly subscription',
  },
  premium_annual: {
    ios: 'com.nomad.premium.year',
    android: 'nomad_premium_year',
    plan: 'premium_annual',
    name: 'Premium Annual',
    description: 'Premium features, no ads, annual subscription (save 20%)',
  },
  partner: {
    ios: '',
    android: '',
    plan: 'partner',
    name: 'Partner',
    description: 'Partner entitlement (granted via server)',
  },
};

/**
 * Get SKU by platform and plan
 */
export function getSKU(platform: 'ios' | 'android', plan: SubscriptionPlan): string {
  return SUBSCRIPTION_SKUS[plan][platform] || '';
}

/**
 * Get plan by SKU
 */
export function getPlanBySKU(platform: 'ios' | 'android', sku: string): SubscriptionPlan | null {
  for (const [plan, config] of Object.entries(SUBSCRIPTION_SKUS)) {
    if (config[platform] === sku) {
      return plan as SubscriptionPlan;
    }
  }
  return null;
}

/**
 * Check if plan is premium (includes monthly, annual, partner)
 */
export function isPremiumPlan(plan: SubscriptionPlan): boolean {
  return plan !== 'free';
}

/**
 * Get platform-agnostic plan name
 */
export function getPlanDisplayName(plan: SubscriptionPlan): string {
  return SUBSCRIPTION_SKUS[plan].name;
}
