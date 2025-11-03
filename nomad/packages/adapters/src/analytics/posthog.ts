import type { AnalyticsAdapter, AnalyticsEvent, UserIdentity } from './types';

export class PostHogAdapter implements AnalyticsAdapter {
  private client: any = null;
  private initialized = false;

  initialize(apiKey: string, options?: { host?: string }): void {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    // Dynamic import for PostHog
    import('posthog-js').then((posthog) => {
      posthog.default.init(apiKey, {
        api_host: options?.host || 'https://app.posthog.com',
        autocapture: false, // Privacy-friendly
        capture_pageview: false,
        capture_pageleave: false,
        opt_out_capturing_by_default: false,
      });

      this.client = posthog.default;
      this.initialized = true;
    });
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.client) return;
    this.client.identify(userId, traits);
  }

  track(event: string, properties?: Record<string, unknown>): void {
    if (!this.client) return;
    this.client.capture(event, properties);
  }

  screen(name: string, properties?: Record<string, unknown>): void {
    if (!this.client) return;
    this.client.capture('$screen', { ...properties, screen_name: name });
  }

  group(groupId: string, traits?: Record<string, unknown>): void {
    if (!this.client) return;
    this.client.group(groupId, traits);
  }

  reset(): void {
    if (!this.client) return;
    this.client.reset();
  }

  setConsent(consented: boolean): void {
    if (!this.client) return;
    if (consented) {
      this.client.opt_in_capturing();
    } else {
      this.client.opt_out_capturing();
    }
  }

  getConsentState(): boolean {
    if (!this.client) return false;
    return !this.client.has_opted_out_capturing?.() ?? true;
  }
}
