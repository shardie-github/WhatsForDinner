/**
 * Guardian Integration Hooks
 * Integrate Guardian with existing telemetry and observability
 */

import { guardTelemetryEvent, guardApiCall, handleSensitiveContext } from '../../guardian/middleware';
import { guardianCore } from '../../guardian/core';
import { guardianInspector } from '../../guardian/inspector';
import { trustFabricAI } from '../../guardian/recommendations';

/**
 * Initialize Guardian system
 */
export async function initializeGuardian() {
  await guardianCore.initialize();
  
  // Start inspector agent (runs hourly)
  guardianInspector.start(1);
  
  console.log('✅ Guardian system initialized');
}

/**
 * Hook into existing observability system
 */
export function hookIntoObservability() {
  // This would be called from apps/web/src/lib/observability.ts
  // to intercept telemetry events
}

/**
 * Hook into API routes
 */
export function hookIntoApiRoutes() {
  // This would be called from Next.js middleware
  // to guard API calls
}

/**
 * Hook into MFA system
 */
export function hookIntoMFA() {
  // Integrate with apps/web/src/lib/privacy/mfa-middleware.ts
  // Guardian can trigger MFA requirements based on risk
}

/**
 * Hook into privacy preferences
 */
export function hookIntoPrivacyPrefs() {
  // Integrate with existing privacy_prefs table
  // Guardian reads user preferences and adjusts policies
}

// Export for use in app initialization
export { guardianCore, guardianInspector, trustFabricAI };
