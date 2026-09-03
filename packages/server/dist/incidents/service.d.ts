/**
 * Incident Response Service
 *
 * Handles incident CRUD, timeline management, and SLA tracking
 */
export interface CreateIncidentInput {
    title: string;
    severity: 'low' | 'major' | 'critical';
    summary: string;
    openedBy: string;
}
export interface UpdateIncidentInput {
    status?: 'open' | 'mitigated' | 'closed';
    summary?: string;
}
export interface TimelineEntry {
    ts: string;
    actor_id: string;
    action: string;
    details?: Record<string, unknown>;
}
/**
 * Create a new incident
 */
export declare function createIncident(input: CreateIncidentInput): Promise<string>;
/**
 * Get incident by ID
 */
export declare function getIncident(incidentId: string): Promise<any>;
/**
 * List incidents with filters
 */
export declare function listIncidents(params: {
    status?: 'open' | 'mitigated' | 'closed';
    severity?: 'low' | 'major' | 'critical';
    openedBy?: string;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
}): Promise<any>;
/**
 * Update incident
 */
export declare function updateIncident(incidentId: string, actorId: string, input: UpdateIncidentInput): Promise<boolean>;
/**
 * Add timeline entry to incident
 */
export declare function addTimelineEntry(incidentId: string, actorId: string, action: string, details?: Record<string, unknown>): Promise<boolean>;
/**
 * Get incidents needing SLA attention
 */
export declare function getIncidentsNeedingAttention(): Promise<Array<{
    id: string;
    title: string;
    severity: string;
    hoursOpen: number;
}>>;
/**
 * Generate weekly incident digest
 */
export declare function generateWeeklyDigest(from: Date, to: Date): Promise<{
    total: any;
    byStatus: {
        open: any;
        mitigated: any;
        closed: any;
    };
    bySeverity: {
        critical: any;
        major: any;
        low: any;
    };
    avgTimeToClose: number;
    incidents: any;
}>;
//# sourceMappingURL=service.d.ts.map