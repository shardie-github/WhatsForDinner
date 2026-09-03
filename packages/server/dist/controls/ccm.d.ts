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
    total: any;
    byStatus: {
        passing: any;
        failing: any;
        waived: any;
    };
    byFramework: {
        soc2: any;
        iso27001: any;
        custom: any;
    };
    controls: any;
}>;
//# sourceMappingURL=ccm.d.ts.map