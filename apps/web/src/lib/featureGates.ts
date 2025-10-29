/**
 * Feature Gates
 * Controls feature access based on subscription plan
 */

export type PlanType = 'free' | 'pro' | 'premium';

export interface FeatureConfig {
  name: string;
  free: boolean;
  pro: boolean;
  premium: boolean;
}

// Feature definitions
export const FEATURES: Record<string, FeatureConfig> = {
  // Core features (all plans)
  recipe_generation: {
    name: 'Recipe Generation',
    free: true,
    pro: true,
    premium: true,
  },
  
  // Pro features
  unlimited_recipes: {
    name: 'Unlimited Recipe Generations',
    free: false,
    pro: true,
    premium: true,
  },
  
  dietary_preferences: {
    name: 'Advanced Dietary Preferences',
    free: true,
    pro: true,
    premium: true,
  },
  
  recipe_saving: {
    name: 'Save Recipes',
    free: true,
    pro: true,
    premium: true,
  },
  
  // Premium features
  pantry_sync: {
    name: 'Pantry Sync Across Devices',
    free: false,
    pro: true,
    premium: true,
  },
  
  meal_planning: {
    name: 'Weekly Meal Planning',
    free: false,
    pro: false,
    premium: true,
  },
  
  grocery_integration: {
    name: 'Grocery Delivery Integration',
    free: false,
    pro: false,
    premium: true,
  },
  
  ai_personalization: {
    name: 'AI Personalization Learning',
    free: false,
    pro: true,
    premium: true,
  },
  
  export_recipes: {
    name: 'Export Recipes (PDF, CSV)',
    free: false,
    pro: true,
    premium: true,
  },
};

/**
 * Checks if a feature is available for a plan
 */
export function hasFeature(featureName: string, plan: PlanType): boolean {
  const feature = FEATURES[featureName];
  if (!feature) {
    return false; // Unknown feature, default to false
  }
  
  return feature[plan];
}

/**
 * Gets all features available for a plan
 */
export function getFeaturesForPlan(plan: PlanType): string[] {
  return Object.keys(FEATURES).filter(featureName => 
    hasFeature(featureName, plan)
  );
}

/**
 * Gets upgrade message for a feature
 */
export function getUpgradeMessage(featureName: string, currentPlan: PlanType): string {
  const feature = FEATURES[featureName];
  if (!feature) {
    return 'This feature is not available.';
  }
  
  if (feature.premium && currentPlan !== 'premium') {
    return `Upgrade to Premium to unlock ${feature.name}`;
  }
  
  if (feature.pro && currentPlan === 'free') {
    return `Upgrade to Pro to unlock ${feature.name}`;
  }
  
  return '';
}

/**
 * Determines which plan is needed for a feature
 */
export function getRequiredPlan(featureName: string): PlanType | null {
  const feature = FEATURES[featureName];
  if (!feature) {
    return null;
  }
  
  if (feature.premium) {
    return 'premium';
  }
  
  if (feature.pro) {
    return 'pro';
  }
  
  if (feature.free) {
    return 'free';
  }
  
  return null;
}
