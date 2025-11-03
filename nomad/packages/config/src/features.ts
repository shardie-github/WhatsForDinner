export type FeatureFlags = {
  ads: boolean;
  offlineMode: boolean;
  aiMealgen: boolean;
  wearableSync: boolean;
  partnerMode: boolean;
  seasonalThemes: boolean;
  arScan: boolean;
  voiceAssist: boolean;
};

export const defaultFlags: FeatureFlags = {
  ads: true,
  offlineMode: true,
  aiMealgen: true,
  wearableSync: true,
  partnerMode: false,
  seasonalThemes: true,
  arScan: false,
  voiceAssist: false,
};

export type RemoteConfig = {
  flags: Partial<FeatureFlags>;
  updatedAt: string;
};

export function mergeFlags(
  defaults: FeatureFlags,
  remote?: RemoteConfig
): FeatureFlags {
  return {
    ...defaults,
    ...(remote?.flags || {}),
  };
}

export function isFeatureEnabled(
  flags: FeatureFlags,
  feature: keyof FeatureFlags
): boolean {
  return flags[feature] === true;
}
