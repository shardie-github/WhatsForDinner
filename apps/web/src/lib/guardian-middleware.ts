/**
 * Guardian Middleware Integration
 * Hook Guardian into telemetry events
 */

import { createGuardianMiddleware } from '@whats-for-dinner/utils/guardian';
import type { NextRequest } from 'next/server';

let guardianMiddlewareCache: Map<string, ReturnType<typeof createGuardianMiddleware>> = new Map();

export async function processGuardianEvent(
  request: NextRequest,
  userId: string,
  event: {
    type: string;
    scope: 'user' | 'app' | 'api' | 'external';
    dataClass: 'telemetry' | 'location' | 'audio' | 'biometrics' | 'content' | 'credentials' | 'personal_info' | 'metadata';
    action: string;
    target: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    // Get or create Guardian middleware for this user
    if (!guardianMiddlewareCache.has(userId)) {
      guardianMiddlewareCache.set(
        userId,
        createGuardianMiddleware(userId, './guardian/logs')
      );
    }

    const guardian = guardianMiddlewareCache.get(userId)!;

    // Process the event
    await guardian.processTelemetryEvent({
      userId,
      ...event,
    });
  } catch (error) {
    // Don't block requests if Guardian fails
    // Error handled: Guardian event processing failed:
  }
}
