/**
 * Guardian Optimization Utilities
 * Performance optimizations and caching strategies
 */
import { Guardian } from './core';
import type { GuardianEvent, TrustReport } from './types';
export declare class OptimizedGuardian extends Guardian {
    private riskCache;
    private cacheTTL;
    constructor(userId: string, ledgerDir?: string);
    /**
     * Cached risk assessment
     */
    assessRiskCached(scope: string, dataClass: string, metadata?: Record<string, unknown>): any;
    clearCache(): void;
}
/**
 * Batch ledger writer for performance
 */
export declare class BatchLedgerWriter {
    private ledgerPath;
    private queue;
    private batchSize;
    private flushInterval;
    private timer;
    constructor(ledgerPath: string);
    add(event: GuardianEvent): void;
    flush(): Promise<void>;
    private startTimer;
    stop(): void;
}
/**
 * Optimized Inspector with report caching
 */
export declare class OptimizedInspector {
    private logsDir;
    private reportCache;
    private cacheTTL;
    constructor(logsDir: string);
    analyzeAndGenerateReportCached(userId: string, periodStart: Date, periodEnd: Date): Promise<TrustReport>;
    clearCache(): void;
}
/**
 * Compressed ledger storage for large-scale deployments
 */
export declare class CompressedLedgerWriter {
    private ledgerPath;
    private queue;
    private compressionThreshold;
    constructor(ledgerPath: string);
    addCompressed(event: GuardianEvent): Promise<void>;
    private compressAndWrite;
    flush(): Promise<void>;
}
/**
 * Performance monitoring for Guardian operations
 */
export declare class GuardianPerformanceMonitor {
    private metrics;
    recordEventProcessing(duration: number): void;
    recordRiskAssessment(duration: number): void;
    recordLedgerWrite(duration: number): void;
    getStats(): {
        eventProcessing: {
            avg: number;
            p95: number;
            p99: number;
        };
        riskAssessment: {
            avg: number;
            p95: number;
            p99: number;
        };
        ledgerWrite: {
            avg: number;
            p95: number;
            p99: number;
        };
    };
}
export declare const performanceMonitor: GuardianPerformanceMonitor;
//# sourceMappingURL=optimization.d.ts.map