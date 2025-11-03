// Typed event catalog for analytics

export type EventName =
  | 'MealAdded'
  | 'MealRemoved'
  | 'MealPlanGenerated'
  | 'MealPlanExported'
  | 'RecipeViewed'
  | 'RecipeFavorited'
  | 'RecipeShared'
  | 'GroceryItemAdded'
  | 'GroceryItemChecked'
  | 'GroceryListShared'
  | 'HealthMetricRecorded'
  | 'HealthMetricSynced'
  | 'FamilyMessageSent'
  | 'FamilyMemberInvited'
  | 'PremiumUpsellViewed'
  | 'PremiumUpsellClicked'
  | 'PremiumSubscribed'
  | 'AdImpression'
  | 'AdClicked'
  | 'PartnerConnected'
  | 'PartnerCartCreated'
  | 'OnboardingCompleted'
  | 'SettingsChanged'
  | 'SearchPerformed'
  | 'StreakMilestone'
  | 'BadgeEarned';

export interface BaseEvent {
  name: EventName;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface MealAddedEvent extends BaseEvent {
  name: 'MealAdded';
  properties: {
    mealId: string;
    slot: string;
    day: string;
    recipeId?: string;
  };
}

export interface MealPlanGeneratedEvent extends BaseEvent {
  name: 'MealPlanGenerated';
  properties: {
    days: number;
    mealsGenerated: number;
    source: 'ai' | 'manual' | 'template';
  };
}

export interface PremiumUpsellViewedEvent extends BaseEvent {
  name: 'PremiumUpsellViewed';
  properties: {
    location: string;
    userPlan: string;
  };
}

export interface AdImpressionEvent extends BaseEvent {
  name: 'AdImpression';
  properties: {
    slot: string;
    type: 'admob' | 'gpt' | 'house';
    adUnitId?: string;
  };
}

export type AnalyticsEvent =
  | MealAddedEvent
  | MealPlanGeneratedEvent
  | PremiumUpsellViewedEvent
  | AdImpressionEvent
  | (BaseEvent & { name: EventName; properties?: Record<string, unknown> });

// PII guard: fields that should never be tracked
const PII_FIELDS = new Set([
  'email',
  'password',
  'creditCard',
  'ssn',
  'phone',
  'address',
  'fullName',
]);

export function sanitizeEvent(event: AnalyticsEvent): AnalyticsEvent {
  const sanitized = { ...event };

  if (sanitized.properties) {
    const props = { ...sanitized.properties };
    
    for (const key in props) {
      if (PII_FIELDS.has(key.toLowerCase())) {
        delete props[key];
      }
    }

    sanitized.properties = props;
  }

  return sanitized;
}

// Sampling configuration
export interface SamplingConfig {
  rate: number; // 0-1, probability of sending event
  excludeEvents?: EventName[];
}

export function shouldSample(event: AnalyticsEvent, config: SamplingConfig): boolean {
  if (config.excludeEvents?.includes(event.name)) {
    return true;
  }

  return Math.random() < config.rate;
}

// Event validation
export function validateEvent(event: unknown): event is AnalyticsEvent {
  if (!event || typeof event !== 'object') {
    return false;
  }

  const e = event as Partial<AnalyticsEvent>;
  
  if (!e.name || typeof e.name !== 'string') {
    return false;
  }

  return true;
}
