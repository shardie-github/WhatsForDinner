/**
 * Guardian System - Core Types
 * Self-governing privacy guardian that monitors data access and builds trust
 */
export type DataScope = 'user' | 'app' | 'api' | 'external';
export type DataClass = 'telemetry' | 'location' | 'audio' | 'biometrics' | 'content' | 'credentials' | 'personal_info' | 'metadata';
export type RiskLevel = 'low' | 'medium' | 'high';
export type ResponseAction = 'allow' | 'mask' | 'redact' | 'block' | 'alert';
export interface GuardianEvent {
    eventId: string;
    timestamp: string;
    userId: string;
    scope: DataScope;
    dataClass: DataClass;
    action: string;
    target: string;
    metadata: {
        path?: string;
        method?: string;
        payloadSize?: number;
        duration?: number;
        [key: string]: unknown;
    };
    riskScore: number;
    riskLevel: RiskLevel;
    guardianAction: ResponseAction;
    explanation: string;
    fingerprint: string;
    previousHash?: string;
}
export interface RiskAssessment {
    riskScore: number;
    riskLevel: RiskLevel;
    factors: Array<{
        factor: string;
        impact: number;
        likelihood: number;
        weight: number;
    }>;
    guardianAction: ResponseAction;
    explanation: string;
}
export interface TrustReport {
    userId: string;
    periodStart: string;
    periodEnd: string;
    totalEvents: number;
    eventsByRisk: {
        low: number;
        medium: number;
        high: number;
    };
    eventsByClass: Record<DataClass, number>;
    eventsByScope: Record<DataScope, number>;
    actionsTaken: Record<ResponseAction, number>;
    trustScore: number;
    anomalies: Array<{
        type: string;
        description: string;
        timestamp: string;
    }>;
    policyChanges: Array<{
        timestamp: string;
        change: string;
    }>;
    confidenceScore: number;
    generatedAt: string;
}
export interface PolicyConfig {
    allowedScopes: DataScope[];
    dataClasses: {
        [key in DataClass]: {
            riskWeight: number;
            defaultAction: ResponseAction;
            requiresConsent: boolean;
        };
    };
    riskWeights: {
        impact: number;
        likelihood: number;
    };
    responseActions: {
        [key in ResponseAction]: {
            threshold: number;
            description: string;
        };
    };
}
export interface TrustFabricModel {
    userId: string;
    comfortZones: {
        [key in DataClass]?: {
            averageTrust: number;
            preferredAction: ResponseAction;
            disabledSignals: string[];
        };
    };
    privacyModeToggles: number;
    averageTrustResponses: Record<ResponseAction, number>;
    learnedPreferences: {
        alwaysAllows: DataClass[];
        alwaysBlocks: DataClass[];
        frequentlyModified: string[];
    };
    lastUpdated: string;
}
export interface GuardianLedgerEntry {
    eventId: string;
    timestamp: string;
    type: 'guardian_event' | 'policy_change' | 'user_action' | 'system_event';
    scope: DataScope;
    userDecision?: ResponseAction;
    guardianAction: ResponseAction;
    sha256: string;
    previousHash?: string;
    metadata: Record<string, unknown>;
}
//# sourceMappingURL=types.d.ts.map