import type { AnalyticsAdapter } from './types';

export class NoopAdapter implements AnalyticsAdapter {
  initialize(): void {
    // No-op
  }

  identify(): void {
    // No-op
  }

  track(): void {
    // No-op
  }

  screen(): void {
    // No-op
  }

  group(): void {
    // No-op
  }

  reset(): void {
    // No-op
  }

  setConsent(): void {
    // No-op
  }

  getConsentState(): boolean {
    return false;
  }
}
