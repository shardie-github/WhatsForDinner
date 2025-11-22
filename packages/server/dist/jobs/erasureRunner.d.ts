/**
 * DSAR Erasure Runner
 *
 * Idempotent erasure across tables: soft-delete then purge after grace period.
 * Respects legal hold. Writes erasure logs.
 */
/**
 * Process erasure request
 */
export declare function processErasure(requestId: string): Promise<{
    success: boolean;
    skipped?: boolean;
    reason?: string;
    erasureLogId?: string;
}>;
/**
 * Process hard deletions (for records past grace period)
 */
export declare function processHardDeletions(): Promise<{
    processed: number;
    errors: number;
}>;
/**
 * Run erasure job (process pending erase requests)
 */
export declare function runErasureJob(): Promise<{
    processed: number;
    hardDeleted: number;
    errors: number;
    skipped: number;
}>;
//# sourceMappingURL=erasureRunner.d.ts.map