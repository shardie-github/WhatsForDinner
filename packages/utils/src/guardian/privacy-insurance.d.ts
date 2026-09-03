/**
 * Privacy Insurance Features
 * Private Mode Pulse, Sensitive Context Detection, MFA Bubble, Emergency Lockdown
 */
import { GuardianMiddleware } from './middleware';
export interface PrivacyState {
    privateModeActive: boolean;
    sensitiveContextActive: boolean;
    lockdownActive: boolean;
    mfaBubbleActive: boolean;
    mfaBubbleExpiresAt?: Date;
}
export declare class PrivacyInsurance {
    private middleware;
    private state;
    constructor(middleware: GuardianMiddleware);
    /**
     * Private Mode Pulse - Quick toggle to freeze telemetry instantly
     */
    togglePrivateMode(): void;
    isPrivateModeActive(): boolean;
    /**
     * Sensitive Context Detection
     * Automatically mutes monitoring when camera/microphone/location is active
     */
    detectSensitiveContext(): void;
    /**
     * MFA Bubble - Elevated session expires sooner when Guardian detects risk increase
     */
    activateMFABubble(durationMinutes?: number): void;
    checkMFABubble(): {
        active: boolean;
        expiresAt?: Date;
    };
    /**
     * Emergency Data Lockdown
     * 1-click killswitch → wipes local telemetry, pauses background sync
     */
    activateLockdown(): Promise<void>;
    deactivateLockdown(): Promise<void>;
    isLockdownActive(): boolean;
    /**
     * Get current privacy state
     */
    getState(): PrivacyState;
    /**
     * Adjust MFA bubble duration based on risk level
     */
    adjustMFABubbleForRisk(riskLevel: 'low' | 'medium' | 'high'): void;
}
//# sourceMappingURL=privacy-insurance.d.ts.map