/**
 * Guardian Inspector Agent
 * Background agent that analyzes logs hourly and generates trust reports
 */
import type { TrustReport } from './types';
export declare class GuardianInspector {
    private logsDir;
    constructor(logsDir?: string);
    /**
     * Analyze logs and generate trust report
     */
    analyzeAndGenerateReport(userId: string, periodStart: Date, periodEnd: Date): Promise<TrustReport>;
    private loadEventsInPeriod;
    private createEmptyReport;
    /**
     * Save trust report to file
     */
    saveReport(report: TrustReport, outputPath?: string): Promise<string>;
    /**
     * Generate weekly markdown report
     */
    generateWeeklyReport(report: TrustReport): Promise<string>;
}
//# sourceMappingURL=inspector.d.ts.map