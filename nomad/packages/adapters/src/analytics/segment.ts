import type { AnalyticsAdapter } from './types';

export class SegmentAdapter implements AnalyticsAdapter {
  private client: any = null;
  private initialized = false;

  initialize(writeKey: string): void {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    // Dynamic import for Segment
    import('@segment/analytics-next').then((analytics) => {
      analytics.load({ writeKey });
      this.client = analytics;
      this.initialized = true;
    });
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.client) return;
    this.client.identify(userId, traits);
  }

  track(event: string, properties?: Record<string, unknown>): void {
    if (!this.client) return;
    this.client.track(event, properties);
  }

  screen(name: string, properties?: Record<string, unknown>): void {
    if (!this.client) return;
    this.client.screen(name, properties);
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
    // Segment consent handled via middleware
  }

  getConsentState(): boolean {
    return true; // Segment doesn't expose consent directly
  }
}
