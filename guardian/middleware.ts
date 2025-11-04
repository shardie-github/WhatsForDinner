/**
 * Guardian Middleware
 * Hooks into telemetry, API calls, and content processing
 */

import type { NextRequest, NextResponse } from 'next/server';
import { guardianCore } from './core';
import type { DataScope, DataClass } from './types';

/**
 * Middleware hook for telemetry events
 */
export async function guardTelemetryEvent(
  userId: string,
  eventType: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  await guardianCore.processEvent({
    user_id: userId,
    type: eventType,
    scope: 'app',
    data_class: 'telemetry',
    source: 'telemetry',
    metadata,
  });
}

/**
 * Middleware hook for API calls
 */
export async function guardApiCall(
  userId: string,
  endpoint: string,
  method: string,
  hasData: boolean,
  metadata: Record<string, unknown> = {}
): Promise<{ allowed: boolean; action: string }> {
  const event = await guardianCore.processEvent({
    user_id: userId,
    type: `${method} ${endpoint}`,
    scope: endpoint.startsWith('/api/external') ? 'external' : 'api',
    data_class: hasData ? 'content' : 'metadata',
    source: 'api_call',
    metadata: {
      endpoint,
      method,
      ...metadata,
    },
  });

  return {
    allowed: event.action_taken !== 'block',
    action: event.action_taken,
  };
}

/**
 * Middleware hook for content processing
 */
export async function guardContentProcessing(
  userId: string,
  contentType: string,
  metadata: Record<string, unknown> = {}
): Promise<{ allowed: boolean; redacted: boolean }> {
  const event = await guardianCore.processEvent({
    user_id: userId,
    type: `content_processing_${contentType}`,
    scope: 'app',
    data_class: 'content',
    source: 'content_processing',
    metadata: {
      content_type: contentType,
      ...metadata,
    },
  });

  return {
    allowed: event.action_taken !== 'block',
    redacted: event.action_taken === 'redact' || event.action_taken === 'mask',
  };
}

/**
 * Next.js middleware wrapper
 */
export function withGuardian(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Extract user ID from request
    const userId = req.headers.get('x-user-id') || 'anonymous';
    
    // Guard API call
    const guardResult = await guardApiCall(
      userId,
      req.nextUrl.pathname,
      req.method,
      req.body !== null,
      {
        user_agent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for'),
      }
    );

    if (!guardResult.allowed) {
      return NextResponse.json(
        { error: 'Access blocked by Guardian', reason: guardResult.action },
        { status: 403 }
      );
    }

    // Continue with handler
    return handler(req);
  };
}

/**
 * Detect sensitive context (camera, microphone, etc.)
 */
export function detectSensitiveContext(
  metadata: Record<string, unknown>
): { active: boolean; sensors: string[] } {
  const sensors: string[] = [];
  
  if (metadata.camera_active) sensors.push('camera');
  if (metadata.microphone_active) sensors.push('microphone');
  if (metadata.location_active) sensors.push('location');
  if (metadata.biometrics_active) sensors.push('biometrics');

  return {
    active: sensors.length > 0,
    sensors,
  };
}

/**
 * Auto-mute Guardian when sensitive context detected
 */
export async function handleSensitiveContext(
  userId: string,
  sensors: string[]
): Promise<void> {
  if (sensors.includes('camera') || sensors.includes('microphone')) {
    // Temporarily mute telemetry monitoring
    guardianCore.enablePrivateMode();
    
    // Log the detection
    await guardianCore.processEvent({
      user_id: userId,
      type: 'sensitive_context_detected',
      scope: 'app',
      data_class: sensors.includes('camera') ? 'audio' : 'audio',
      source: 'telemetry',
      metadata: {
        sensors,
        auto_muted: true,
      },
    });
  }
}
