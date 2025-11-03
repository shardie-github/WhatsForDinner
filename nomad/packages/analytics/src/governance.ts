import type { AnalyticsAdapter } from '@nomad/adapters';
import type { AnalyticsEvent, EventName, SamplingConfig } from './events';
import { sanitizeEvent, shouldSample, validateEvent } from './events';

export interface ConsentState {
  analytics: boolean;
  ads: boolean;
  functional: boolean;
}

export class AnalyticsGovernance {
  private adapter: AnalyticsAdapter | null = null;
  private consent: ConsentState = {
    analytics: false,
    ads: false,
    functional: false,
  };
  private sampling: SamplingConfig = { rate: 1.0 };
  private enabled = false;

  initialize(adapter: AnalyticsAdapter): void {
    this.adapter = adapter;
  }

  setConsent(state: ConsentState): void {
    this.consent = state;
    this.adapter?.setConsent(state.analytics);
    this.enabled = state.analytics;
  }

  getConsent(): ConsentState {
    return { ...this.consent };
  }

  setSampling(config: SamplingConfig): void {
    this.sampling = config;
  }

  track(event: AnalyticsEvent): void {
    if (!this.enabled || !this.adapter) {
      return;
    }

    // Validate event
    if (!validateEvent(event)) {
      console.warn('Invalid analytics event:', event);
      return;
    }

    // Apply sampling
    if (!shouldSample(event, this.sampling)) {
      return;
    }

    // Sanitize PII
    const sanitized = sanitizeEvent(event);

    // Track
    this.adapter.track(sanitized.name, sanitized.properties);
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.enabled || !this.adapter) {
      return;
    }

    // Sanitize traits
    const sanitized = traits ? sanitizeEvent({ name: 'identify' as EventName, properties: traits } as AnalyticsEvent).properties : undefined;

    this.adapter.identify(userId, sanitized);
  }

  screen(name: string, properties?: Record<string, unknown>): void {
    if (!this.enabled || !this.adapter) {
      return;
    }

    const sanitized = properties ? sanitizeEvent({ name: 'screen' as EventName, properties } as AnalyticsEvent).properties : undefined;

    this.adapter.screen(name, sanitized);
  }
}

export const analyticsGovernance = new AnalyticsGovernance();
