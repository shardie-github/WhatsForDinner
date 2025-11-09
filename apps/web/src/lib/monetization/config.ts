/**
 * Monetization Configuration
 * Centralized configuration for all monetization channels
 */

export const MONETIZATION_CONFIG = {
  affiliate: {
    enabled: process.env.AFFILIATE_ENABLED === 'true',
    commissionRate: parseFloat(process.env.AFFILIATE_COMMISSION_RATE || '10'),
    minPayout: parseFloat(process.env.AFFILIATE_MIN_PAYOUT || '50'),
  },
  api: {
    enabled: process.env.API_MONETIZATION_ENABLED === 'true',
    pricing: {
      basic: { pricePer1K: 0.01 },
      pro: { pricePer1K: 0.005 },
      enterprise: { pricePer1K: 0.002 },
    },
  },
  dataInsights: {
    enabled: process.env.DATA_INSIGHTS_ENABLED === 'true',
    anonymizationRequired: true,
  },
  marketplace: {
    enabled: process.env.MARKETPLACE_ENABLED === 'true',
    commissionRate: parseFloat(process.env.MARKETPLACE_COMMISSION_RATE || '10'),
  },
  automatedUpsells: {
    enabled: process.env.AUTOMATED_UPSELLS_ENABLED === 'true',
    triggerThreshold: 0.3, // 30% probability threshold
  },
};

export function isMonetizationEnabled(channel: keyof typeof MONETIZATION_CONFIG): boolean {
  return MONETIZATION_CONFIG[channel].enabled;
}

export function getAllEnabledChannels(): string[] {
  return Object.entries(MONETIZATION_CONFIG)
    .filter(([_, config]) => {
      if ('enabled' in config) {
        return config.enabled;
      }
      return false;
    })
    .map(([key]) => key);
}
