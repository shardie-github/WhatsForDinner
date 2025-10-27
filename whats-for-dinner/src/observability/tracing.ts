/**
 * OpenTelemetry Tracing Setup
 * 
 * Features:
 * - Distributed tracing
 * - Custom spans
 * - Automatic instrumentation
 * - Trace context propagation
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api';

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'whats-for-dinner',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable some instrumentations that might be too noisy
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

// Start the SDK
sdk.start();

// Get tracer
const tracer = trace.getTracer('whats-for-dinner', '1.0.0');

export interface SpanContext {
  traceId: string;
  spanId: string;
  traceFlags: number;
}

export interface SpanOptions {
  kind?: SpanKind;
  attributes?: Record<string, string | number | boolean>;
  startTime?: number;
}

/**
 * Create a new span
 */
export function createSpan(
  name: string,
  options: SpanOptions = {}
): ReturnType<typeof tracer.startSpan> {
  return tracer.startSpan(name, {
    kind: options.kind || SpanKind.INTERNAL,
    attributes: options.attributes || {},
  });
}

/**
 * Execute function within a span
 */
export async function withSpan<T>(
  name: string,
  fn: (span: ReturnType<typeof tracer.startSpan>) => Promise<T>,
  options: SpanOptions = {}
): Promise<T> {
  const span = createSpan(name, options);
  
  try {
    const result = await fn(span);
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Execute synchronous function within a span
 */
export function withSpanSync<T>(
  name: string,
  fn: (span: ReturnType<typeof tracer.startSpan>) => T,
  options: SpanOptions = {}
): T {
  const span = createSpan(name, options);
  
  try {
    const result = fn(span);
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    span.recordException(error instanceof Error ? error : new Error(String(error)));
    throw error;
  } finally {
    span.end();
  }
}

/**
 * Add attributes to current span
 */
export function addSpanAttributes(attributes: Record<string, string | number | boolean>): void {
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    activeSpan.setAttributes(attributes);
  }
}

/**
 * Add event to current span
 */
export function addSpanEvent(name: string, attributes?: Record<string, string | number | boolean>): void {
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    activeSpan.addEvent(name, attributes);
  }
}

/**
 * Get current span context
 */
export function getCurrentSpanContext(): SpanContext | undefined {
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    const spanContext = activeSpan.spanContext();
    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
      traceFlags: spanContext.traceFlags,
    };
  }
  return undefined;
}

/**
 * Database operation span
 */
export async function withDatabaseSpan<T>(
  operation: string,
  table: string,
  fn: (span: ReturnType<typeof tracer.startSpan>) => Promise<T>
): Promise<T> {
  return withSpan(`db.${operation}`, fn, {
    kind: SpanKind.CLIENT,
    attributes: {
      'db.operation': operation,
      'db.table': table,
      'db.system': 'supabase',
    },
  });
}

/**
 * HTTP request span
 */
export async function withHttpSpan<T>(
  method: string,
  url: string,
  fn: (span: ReturnType<typeof tracer.startSpan>) => Promise<T>
): Promise<T> {
  return withSpan(`http.${method.toLowerCase()}`, fn, {
    kind: SpanKind.CLIENT,
    attributes: {
      'http.method': method,
      'http.url': url,
    },
  });
}

/**
 * Business operation span
 */
export async function withBusinessSpan<T>(
  operation: string,
  fn: (span: ReturnType<typeof tracer.startSpan>) => Promise<T>
): Promise<T> {
  return withSpan(`business.${operation}`, fn, {
    kind: SpanKind.INTERNAL,
    attributes: {
      'business.operation': operation,
    },
  });
}

/**
 * AI operation span
 */
export async function withAISpan<T>(
  operation: string,
  model: string,
  fn: (span: ReturnType<typeof tracer.startSpan>) => Promise<T>
): Promise<T> {
  return withSpan(`ai.${operation}`, fn, {
    kind: SpanKind.CLIENT,
    attributes: {
      'ai.operation': operation,
      'ai.model': model,
    },
  });
}

/**
 * Shutdown tracing
 */
export async function shutdownTracing(): Promise<void> {
  await sdk.shutdown();
}

export { tracer, sdk };
export default tracer;