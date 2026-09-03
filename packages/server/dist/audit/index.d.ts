/**
 * Audit Logging System
 *
 * Immutable audit logs with cryptographic signatures for tamper detection
 */
export interface AuditLogEntry {
    actorId: string;
    entityKind: string;
    entityId?: string;
    action: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    reason?: string;
}
/**
 * Log an audit action
 */
export declare function logAction(actorId: string, entityKind: string, action: string, options?: {
    entityId?: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    reason?: string;
}): Promise<string>;
/**
 * Verify audit log signature
 */
export declare function verifyAuditLogSignature(logId: string): Promise<boolean>;
/**
 * Background task to verify all audit log signatures
 */
export declare function verifyAllAuditLogs(): Promise<{
    total: number;
    valid: number;
    invalid: number;
    invalidIds: string[];
}>;
/**
 * Get audit logs with pagination
 */
export declare function getAuditLogs(params: {
    actorId?: string;
    entityKind?: string;
    entityId?: string;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
}): Promise<{
    data: any;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
//# sourceMappingURL=index.d.ts.map