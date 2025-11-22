/**
 * Self-Healing Job Supervisor
 *
 * Monitors and automatically heals:
 * - Queue workers (restart stalled jobs)
 * - Database queries (kill runaway queries > 30s)
 * - Failed migrations (auto-rollback)
 * - Stuck processes
 */
interface SelfHealConfig {
    queueName: string;
    redisUrl: string;
    maxQueryDuration: number;
    enableAutoRollback: boolean;
}
/**
 * Monitor queue workers and restart stalled jobs
 */
export declare function monitorQueueWorkers(config: SelfHealConfig): Promise<void>;
/**
 * Kill runaway database queries (> 30 seconds)
 */
export declare function killRunawayQueries(db: any, config: SelfHealConfig): Promise<void>;
/**
 * Auto-rollback failed migrations
 */
export declare function autoRollbackMigrations(db: any, config: SelfHealConfig): Promise<void>;
/**
 * Run all self-healing checks
 */
export declare function runSelfHealing(config: SelfHealConfig): Promise<void>;
/**
 * Default configuration
 */
export declare function getDefaultSelfHealConfig(): SelfHealConfig;
export {};
//# sourceMappingURL=selfHeal.d.ts.map