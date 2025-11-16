/**
 * OpenTelemetry Telemetry Initialization
 * 
 * Centralized telemetry setup for all services
 * Supports tracing, metrics, and logging
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';
import { PeriodicExportingMetricReader, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics';

let sdk: NodeSDK | null = null;
let initialized = false;

/**
 * Initialize OpenTelemetry SDK
 */
export function initializeTelemetry(): void {
  if (initialized) {
    return;
  }

  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  const serviceName = process.env.OTEL_SERVICE_NAME || 'whats-for-dinner-backend';
  const enableOtlp = process.env.ENABLE_OTLP !== 'false';

  // Only initialize if OTLP endpoint is configured or in development
  if (!enableOtlp && !otlpEndpoint && process.env.NODE_ENV !== 'development') {
    console.log('📊 OpenTelemetry: Disabled (no OTLP endpoint configured)');
    initialized = true;
    return;
  }

  try {
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    });

    const traceExporter = otlpEndpoint
      ? new OTLPTraceExporter({
          url: `${otlpEndpoint}/v1/traces`,
        })
      : undefined;

    sdk = new NodeSDK({
      resource,
      traceExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          // Disable fs instrumentation in production for performance
          '@opentelemetry/instrumentation-fs': {
            enabled: process.env.NODE_ENV === 'development',
          },
        }),
      ],
      metricReader: process.env.NODE_ENV === 'development'
        ? new PeriodicExportingMetricReader({
            exporter: new ConsoleMetricExporter(),
            exportIntervalMillis: 10000,
          })
        : undefined,
    });

    sdk.start();
    initialized = true;

    console.log(`✅ OpenTelemetry initialized: ${serviceName}`);
    if (otlpEndpoint) {
      console.log(`   📡 OTLP Endpoint: ${otlpEndpoint}`);
    } else {
      console.log('   📡 OTLP: Console exporter (development mode)');
    }
  } catch (error) {
    console.error('❌ Failed to initialize OpenTelemetry:', error);
    // Don't throw - telemetry failures shouldn't break the app
  }
}

/**
 * Shutdown telemetry SDK gracefully
 */
export async function shutdownTelemetry(): Promise<void> {
  if (sdk) {
    try {
      await sdk.shutdown();
      console.log('✅ OpenTelemetry shutdown complete');
    } catch (error) {
      console.error('❌ Error shutting down OpenTelemetry:', error);
    }
  }
}

/**
 * Auto-initialize in Node.js environments
 */
if (typeof require !== 'undefined' && require.main === module) {
  initializeTelemetry();
}

// Auto-initialize on import in server environments
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  initializeTelemetry();
}

export { sdk };
