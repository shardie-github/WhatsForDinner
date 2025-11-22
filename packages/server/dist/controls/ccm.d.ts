/**
 * Controls Compliance Monitoring (CCM)
 *
 * SOC2/ISO27001 evidence capture, controls monitoring, automated collectors
 */
/**
 * Control definition
 */
export interface ControlDefinition {
    key: string;
    framework: 'soc2' | 'iso27001' | 'custom';
    name: string;
    description: string;
    owner: string;
    frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
    evidence_kind: 'log' | 'screenshot' | 'report' | 'config';
    testMethod: () => Promise<{
        pass: boolean;
        artifact?: string;
        meta?: Record<string, unknown>;
    }>;
}
/**
 * Record control evidence
 */
export declare function recordControlEvidence(controlId: string, result: 'pass' | 'fail' | 'waive', artifactUrl: string, artifactChecksum: string, collector: string, meta?: Record<string, unknown>): Promise<void>;
/**
 * Run collector for a control
 */
export declare function runCollector(control: ControlDefinition): Promise<void>;
/**
 * Bootstrap control registry
 */
export declare function bootstrapControls(): Promise<void>;
/**
 * Run all collectors (based on frequency)
 */
export declare function runControlsCheck(frequency?: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly'): Promise<{
    checked: number;
    passed: number;
    failed: number;
    errors: number;
}>;
/**
 * Get controls dashboard data
 */
export declare function getControlsDashboard(framework?: 'soc2' | 'iso27001' | 'custom'): Promise<{
    total: number;
    byStatus: {
        passing: number;
        failing: number;
        waived: number;
    };
    byFramework: {
        soc2: number;
        iso27001: number;
        custom: number;
    };
    controls: {
        owner: string;
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        description: string;
        status: "passing" | "failing" | "waived";
        key: string;
        notes: string | null;
        evidence_kind: "log" | "screenshot" | "report" | "config";
        framework: "custom" | "soc2" | "iso27001";
        frequency: "monthly" | "continuous" | "daily" | "weekly" | "quarterly";
        last_checked_at: Date | null;
    }[];
}>;
//# sourceMappingURL=ccm.d.ts.map