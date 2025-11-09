/**
 * Product Simplification Feature Flags
 * Archive enterprise features, focus on core value prop
 */

export interface FeatureFlags {
  // Core Features (Always Enabled)
  pantry: boolean;
  mealSuggestions: boolean;
  groceryList: boolean;
  
  // Enterprise Features (Can be disabled)
  federation: boolean;
  nomad: boolean;
  marketplace: boolean;
  communityPortal: boolean;
  
  // Advanced Features (Optional)
  familyPlanning: boolean;
  nutritionalAnalysis: boolean;
  mealPrep: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // Core - Always enabled
  pantry: true,
  mealSuggestions: true,
  groceryList: true,
  
  // Enterprise - Disabled by default (simplification)
  federation: false,
  nomad: false,
  marketplace: false,
  communityPortal: false,
  
  // Advanced - Enabled (core differentiators)
  familyPlanning: true,
  nutritionalAnalysis: true,
  mealPrep: true,
};

export function getFeatureFlags(): FeatureFlags {
  // In production, load from database or environment
  // For now, return defaults
  return {
    ...DEFAULT_FEATURE_FLAGS,
    // Override with environment variables if set
    federation: process.env.FEATURE_FEDERATION === 'true',
    nomad: process.env.FEATURE_NOMAD === 'true',
    marketplace: process.env.FEATURE_MARKETPLACE === 'true',
    communityPortal: process.env.FEATURE_COMMUNITY_PORTAL === 'true',
  };
}

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature] ?? false;
}

/**
 * Check if enterprise features should be shown
 */
export function shouldShowEnterpriseFeatures(): boolean {
  return isFeatureEnabled('federation') || 
         isFeatureEnabled('nomad') || 
         isFeatureEnabled('marketplace') || 
         isFeatureEnabled('communityPortal');
}

/**
 * Get simplified feature set (core only)
 */
export function getCoreFeatures(): FeatureFlags {
  const flags = getFeatureFlags();
  return {
    pantry: flags.pantry,
    mealSuggestions: flags.mealSuggestions,
    groceryList: flags.groceryList,
    federation: false,
    nomad: false,
    marketplace: false,
    communityPortal: false,
    familyPlanning: flags.familyPlanning,
    nutritionalAnalysis: flags.nutritionalAnalysis,
    mealPrep: flags.mealPrep,
  };
}
