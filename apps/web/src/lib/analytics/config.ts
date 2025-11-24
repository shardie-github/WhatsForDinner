/**
 * Analytics Configuration
 * 
 * Centralized configuration for analytics services
 */

interface AnalyticsConfig {
  posthog?: {
    apiKey: string;
    host: string;
  };
  mixpanel?: {
    token: string;
  };
  googleAnalytics?: {
    measurementId: string;
  };
  amplitude?: {
    apiKey: string;
  };
}

const config: AnalyticsConfig = {};

// PostHog Configuration
if (process.env.NEXT_PUBLIC_POSTHOG_KEY && typeof window !== 'undefined') {
  config.posthog = {
    apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
  };
}

// Mixpanel Configuration
if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
  config.mixpanel = {
    token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  };
}

// Google Analytics Configuration
if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
  config.googleAnalytics = {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  };
}

// Amplitude Configuration
if (process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY) {
  config.amplitude = {
    apiKey: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY,
  };
}

export { config };

/**
 * Initialize analytics providers
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;

  // Initialize PostHog
  if (config.posthog) {
    try {
      // Dynamic import to avoid SSR issues
      import('posthog-js').then((posthog) => {
        posthog.default.init(config.posthog!.apiKey, {
          api_host: config.posthog!.host,
          loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') {
              posthog.debug();
            }
          },
        });
        (window as any).posthog = posthog.default;
      });
    } catch (error) {
      console.warn('Failed to initialize PostHog:', error);
    }
  }

  // Initialize Mixpanel
  if (config.mixpanel) {
    try {
      import('mixpanel-browser').then((mixpanel) => {
        mixpanel.default.init(config.mixpanel!.token);
        (window as any).mixpanel = mixpanel.default;
      });
    } catch (error) {
      console.warn('Failed to initialize Mixpanel:', error);
    }
  }

  // Initialize Google Analytics
  if (config.googleAnalytics) {
    try {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalytics.measurementId}`;
      document.head.appendChild(script);

      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;
      gtag('js', new Date());
      gtag('config', config.googleAnalytics.measurementId);
    } catch (error) {
      console.warn('Failed to initialize Google Analytics:', error);
    }
  }

  // Initialize Amplitude
  if (config.amplitude) {
    try {
      import('@amplitude/analytics-browser').then((amplitude) => {
        amplitude.init(config.amplitude!.apiKey);
        (window as any).amplitude = amplitude;
      });
    } catch (error) {
      console.warn('Failed to initialize Amplitude:', error);
    }
  }
}

/**
 * Track event across all analytics providers
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') return;

  // PostHog
  if ((window as any).posthog) {
    (window as any).posthog.capture(eventName, properties);
  }

  // Mixpanel
  if ((window as any).mixpanel) {
    (window as any).mixpanel.track(eventName, properties);
  }

  // Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag('event', eventName, properties);
  }

  // Amplitude
  if ((window as any).amplitude) {
    (window as any).amplitude.track(eventName, properties);
  }
}

/**
 * Identify user across all analytics providers
 */
export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;

  // PostHog
  if ((window as any).posthog) {
    (window as any).posthog.identify(userId, traits);
  }

  // Mixpanel
  if ((window as any).mixpanel) {
    (window as any).mixpanel.identify(userId);
    if (traits) {
      (window as any).mixpanel.people.set(traits);
    }
  }

  // Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag('set', { user_id: userId });
  }

  // Amplitude
  if ((window as any).amplitude) {
    (window as any).amplitude.setUserId(userId);
    if (traits) {
      (window as any).amplitude.setUserProperties(traits);
    }
  }
}
