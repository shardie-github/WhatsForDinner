/**
 * Digest Runner Job
 * Composes and sends weekly digest emails
 */
export declare function digestRunnerProcessor(data: {
    dayOfWeek?: number;
}): Promise<{
    sent: number;
    errors: number;
}>;
//# sourceMappingURL=digestRunner.d.ts.map