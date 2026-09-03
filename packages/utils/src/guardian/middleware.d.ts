/**
 * Guardian Middleware
 * Hooks into telemetry events and monitors data access
 */
import { Guardian } from './core';
import type { DataScope, DataClass } from './types';
export interface TelemetryEvent {
    userId: string;
    type: string;
    scope: DataScope;
    dataClass: DataClass;
    action: string;
    target: string;
    metadata?: Record<string, unknown>;
}
export declare class GuardianMiddleware {
    private guardian;
    private enabled;
    constructor(userId: string, ledgerDir?: string);
    /**
     * Enable or disable Guardian monitoring
     */
    setEnabled(enabled: boolean): void;
    /**
     * Process a telemetry event
     */
    processTelemetryEvent(event: TelemetryEvent): Promise<{
        allowed: boolean;
        action: string;
        explanation: string;
        riskLevel: string;
    }>;
    /**
     * Create a middleware wrapper for API calls
     */
    wrapApiCall<T>(userId: string, apiCall: () => Promise<T>, scope: DataScope, dataClass: DataClass, target: string, metadata?: Record<string, unknown>): Promise<T>;
    /**
     * Check if sensitive context is active (camera, microphone, etc.)
     */
    checkSensitiveContext(): {
        cameraActive: boolean;
        microphoneActive: boolean;
        locationActive: boolean;
    };
    /**
     * Get Guardian instance
     */
    getGuardian(): Guardian;
}
/**
 * Create Guardian middleware instance
 */
export declare function createGuardianMiddleware(userId: string, ledgerDir?: string): GuardianMiddleware;
//# sourceMappingURL=middleware.d.ts.map