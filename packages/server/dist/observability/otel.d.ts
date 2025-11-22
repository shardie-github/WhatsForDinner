/**
 * OpenTelemetry Global Tracer & Metrics Exporter
 *
 * Initializes global OpenTelemetry SDK with:
 * - OTLP trace exporter (Tempo-compatible)
 * - Prometheus metrics exporter
 * - Auto-instrumentation for HTTP, DB, Redis
 * - Resource attributes (service name, version, environment)
 */
export interface OTELConfig {
    serviceName?: string;
    serviceVersion?: string;
    environment?: string;
    otlpEndpoint?: string;
    prometheusPort?: number;
    enablePrometheus?: boolean;
    enableOTLP?: boolean;
}
/**
 * Initialize global OpenTelemetry SDK
 */
export declare function initOpenTelemetrySDK(config?: OTELConfig): Promise<void>;
/**
 * Get global tracer
 */
export declare function getTracer(name?: string): import("@opentelemetry/api").Tracer;
/**
 * Get global meter
 */
export declare function getMeter(name?: string): import("@opentelemetry/api").Meter;
/**
 * Shutdown OpenTelemetry SDK gracefully
 */
export declare function shutdownOpenTelemetry(): Promise<void>;
/**
 * Create a span with automatic error handling
 */
export declare function withSpan<T>(name: string, fn: (span: ReturnType<typeof getTracer> extends infer T ? T : never) => Promise<T>): Promise<T>;
//# sourceMappingURL=otel.d.ts.map