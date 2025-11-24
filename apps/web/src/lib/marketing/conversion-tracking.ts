/**
 * Conversion Tracking System
 * 
 * Tracks user actions and conversions for optimization
 */

interface ConversionEvent {
  userId?: string;
  event: string;
  properties?: Record<string, unknown>;
  timestamp: Date;
  sessionId?: string;
}

interface ConversionFunnel {
  step: string;
  users: number;
  conversions: number;
  conversionRate: number;
}

/**
 * Track conversion events
 */
export function trackConversion(event: ConversionEvent): void {
  // Send to analytics (PostHog, Mixpanel, etc.)
  if (typeof window !== 'undefined') {
    // PostHog
    if ((window as any).posthog) {
      (window as any).posthog.capture(event.event, {
        ...event.properties,
        timestamp: event.timestamp.toISOString(),
      });
    }

    // Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', event.event, {
        ...event.properties,
      });
    }

    // Custom analytics endpoint
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(() => {
      // Silently fail if analytics unavailable
    });
  }
}

/**
 * Track signup conversion
 */
export function trackSignup(userId: string, source: string): void {
  trackConversion({
    userId,
    event: 'user_signed_up',
    properties: {
      source,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date(),
  });
}

/**
 * Track first meal planned
 */
export function trackFirstMeal(userId: string): void {
  trackConversion({
    userId,
    event: 'first_meal_planned',
    properties: {
      milestone: 'activation',
    },
    timestamp: new Date(),
  });
}

/**
 * Track upgrade conversion
 */
export function trackUpgrade(userId: string, plan: string, amount: number): void {
  trackConversion({
    userId,
    event: 'user_upgraded',
    properties: {
      plan,
      amount,
      revenue: amount,
    },
    timestamp: new Date(),
  });
}

/**
 * Track key conversion events
 */
export const conversionEvents = {
  pageView: (path: string) => trackConversion({
    event: 'page_view',
    properties: { path },
    timestamp: new Date(),
  }),

  signupStarted: (source: string) => trackConversion({
    event: 'signup_started',
    properties: { source },
    timestamp: new Date(),
  }),

  signupCompleted: (userId: string, source: string) => {
    trackSignup(userId, source);
  },

  onboardingStarted: (userId: string) => trackConversion({
    userId,
    event: 'onboarding_started',
    timestamp: new Date(),
  }),

  onboardingCompleted: (userId: string) => trackConversion({
    userId,
    event: 'onboarding_completed',
    timestamp: new Date(),
  }),

  firstMealPlanned: (userId: string) => {
    trackFirstMeal(userId);
  },

  pricingViewed: (userId?: string) => trackConversion({
    userId,
    event: 'pricing_viewed',
    timestamp: new Date(),
  }),

  upgradeStarted: (userId: string, plan: string) => trackConversion({
    userId,
    event: 'upgrade_started',
    properties: { plan },
    timestamp: new Date(),
  }),

  upgradeCompleted: (userId: string, plan: string, amount: number) => {
    trackUpgrade(userId, plan, amount);
  },

  featureUsed: (userId: string, feature: string) => trackConversion({
    userId,
    event: 'feature_used',
    properties: { feature },
    timestamp: new Date(),
  }),
};

/**
 * Calculate conversion funnel
 */
export async function getConversionFunnel(): Promise<ConversionFunnel[]> {
  // In production, fetch from analytics database
  // This is a placeholder structure
  
  return [
    {
      step: 'signup_started',
      users: 1000,
      conversions: 800,
      conversionRate: 0.8,
    },
    {
      step: 'signup_completed',
      users: 800,
      conversions: 600,
      conversionRate: 0.75,
    },
    {
      step: 'onboarding_completed',
      users: 600,
      conversions: 400,
      conversionRate: 0.67,
    },
    {
      step: 'first_meal_planned',
      users: 400,
      conversions: 300,
      conversionRate: 0.75,
    },
    {
      step: 'pricing_viewed',
      users: 300,
      conversions: 100,
      conversionRate: 0.33,
    },
    {
      step: 'upgrade_completed',
      users: 100,
      conversions: 50,
      conversionRate: 0.5,
    },
  ];
}

/**
 * Get conversion rate for specific event
 */
export async function getConversionRate(event: string): Promise<number> {
  const funnel = await getConversionFunnel();
  const step = funnel.find((s) => s.step === event);
  return step?.conversionRate || 0;
}
