/**
 * Feature Flags Helper
 *
 * Reads feature flags from config/flags.json with environment awareness.
 * Supports staging-only flags for canary testing.
 */
export interface FeatureFlag {
    enabled: boolean;
    env?: string | string[];
    description?: string;
}
export interface FlagsConfig {
    [key: string]: FeatureFlag;
}
/**
 * Check if a feature flag is enabled
 *
 * @param flagName - Name of the feature flag
 * @param defaultValue - Default value if flag not found
 * @returns true if flag is enabled for current environment
 */
export declare function isFlagEnabled(flagName: string, defaultValue?: boolean): boolean;
/**
 * Get all flags for current environment
 */
export declare function getFlags(): Record<string, boolean>;
/**
 * Clear flags cache (useful for testing)
 */
export declare function clearFlagsCache(): void;
/**
 * Check if canary flag is enabled
 * Convenience method for canary_example flag
 */
export declare function isCanaryEnabled(): boolean;
//# sourceMappingURL=flags.d.ts.map