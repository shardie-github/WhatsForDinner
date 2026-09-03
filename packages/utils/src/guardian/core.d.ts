/**
 * Guardian Core Service
 * Monitors data access, assesses risk, and enforces privacy boundaries
 */
import type { GuardianEvent, RiskAssessment, PolicyConfig, DataScope, DataClass } from './types';
export declare class Guardian {
    private policies;
    private ledgerPath;
    private policyPath;
    constructor(userId: string, ledgerDir?: string);
    private loadPolicies;
    private normalizeDataClasses;
    private getDefaultPolicies;
    private ensureLedgerDirectory;
    /**
     * Assess risk for a data access event
     */
    assessRisk(scope: DataScope, dataClass: DataClass, metadata?: Record<string, unknown>): RiskAssessment;
    private determineAction;
    private generateExplanation;
    /**
     * Process a data access event
     */
    processEvent(userId: string, scope: DataScope, dataClass: DataClass, action: string, target: string, metadata?: Record<string, unknown>): Promise<GuardianEvent>;
    private getLastLedgerHash;
    private appendToLedger;
    /**
     * Verify ledger integrity
     */
    verifyLedgerIntegrity(): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Get policy configuration
     */
    getPolicies(): PolicyConfig;
    /**
     * Update policy (creates new ledger entry)
     */
    updatePolicy(userId: string, updates: Partial<PolicyConfig>): Promise<void>;
}
//# sourceMappingURL=core.d.ts.map