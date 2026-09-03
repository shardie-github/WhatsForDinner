/**
 * Data Retention Policy Runner
 *
 * Automatically purges expired records based on retention policies
 */
/**
 * Run retention policies
 */
export declare function runRetentionPolicies(dryRun?: boolean): Promise<{
    processed: number;
    deleted: number;
    errors: number;
    details: Array<{
        category: string;
        deleted: number;
        error?: string;
    }>;
}>;
/**
 * Get retention policy preview
 */
export declare function getRetentionPreview(category: string, days: number): Promise<{
    category: string;
    retentionDays: number;
    cutoffDate: string;
    recordsToDelete: number;
    oldestRecord: any;
}>;
/**
 * Initialize default retention policies
 */
export declare function initializeDefaultPolicies(): Promise<void>;
//# sourceMappingURL=retentionRunner.d.ts.map