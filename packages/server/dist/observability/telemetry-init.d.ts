/**
 * OpenTelemetry Telemetry Initialization
 *
 * Centralized telemetry setup for all services
 * Supports tracing, metrics, and logging
 */
import { NodeSDK } from '@opentelemetry/sdk-node';
declare let sdk: NodeSDK | null;
export declare function initializeTelemetry(): void;
/**
 * Shutdown telemetry SDK gracefully
 */
export declare function shutdownTelemetry(): Promise<void>;
export { sdk };
//# sourceMappingURL=telemetry-init.d.ts.map