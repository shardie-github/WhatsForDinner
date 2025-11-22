/**
 * Observability suite with OpenTelemetry
 */
import { NodeSDK } from '@opentelemetry/sdk-node';
export declare function initializeObservability(): {
    sdk: NodeSDK;
    metrics: {
        p95Latency: number;
        errorRate: number;
        cost: number;
    };
    shutdown: () => Promise<void>;
};
export default initializeObservability;
//# sourceMappingURL=telemetry.d.ts.map