export interface AnalyticsAdapter {
  initialize(...args: unknown[]): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  track(event: string, properties?: Record<string, unknown>): void;
  screen(name: string, properties?: Record<string, unknown>): void;
  group(groupId: string, traits?: Record<string, unknown>): void;
  reset(): void;
  setConsent(consented: boolean): void;
  getConsentState(): boolean;
}

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

export interface UserIdentity {
  userId: string;
  traits?: Record<string, unknown>;
}
