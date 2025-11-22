/**
 * Journeys Runner Job
 * BullMQ worker processor for journey orchestration
 */
export declare function journeysRunnerProcessor(data: {
    batchSize?: number;
}): Promise<{
    processed: number;
    errors: number;
}>;
//# sourceMappingURL=journeysRunner.d.ts.map