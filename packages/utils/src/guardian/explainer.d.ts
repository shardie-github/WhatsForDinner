/**
 * Guardian GPT Explainer
 * Local LLM wrapper for summarizing what data was used, why, and by whom
 */
export interface ExplanationRequest {
    question: string;
    userId: string;
    context?: {
        eventId?: string;
        periodStart?: Date;
        periodEnd?: Date;
    };
}
export declare class GuardianGPT {
    private inspector;
    constructor(logsDir?: string);
    /**
     * Explain what happened with user data
     */
    explain(request: ExplanationRequest): Promise<string>;
    private loadEventById;
    private loadEventsFromReport;
    private explainWhatData;
    private explainWhy;
    private explainWho;
    private explainDisableImpact;
    private explainGeneral;
    private inferPurpose;
}
//# sourceMappingURL=explainer.d.ts.map