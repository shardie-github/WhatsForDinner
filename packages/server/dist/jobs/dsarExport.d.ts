/**
 * DSAR Export Job
 *
 * Composes ZIP archive with user data export (profile, preferences, meal plans,
 * grocery lists, health metrics, messages metadata, events, analytics, consents)
 */
/**
 * Generate data export ZIP for DSAR request
 */
export declare function generateDSARExport(requestId: string): Promise<{
    artifactId: string;
    url: string;
    checksum: string;
}>;
/**
 * Process pending export requests
 */
export declare function processPendingExports(): Promise<{
    processed: number;
    errors: number;
}>;
//# sourceMappingURL=dsarExport.d.ts.map