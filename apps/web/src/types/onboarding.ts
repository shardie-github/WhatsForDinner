/**
 * Onboarding-related TypeScript types
 */

export interface OnboardingUpdateData {
  first_recipe_generated?: boolean;
  pantry_items_added?: boolean;
  preferences_set?: boolean;
  [key: string]: boolean | undefined;
}
