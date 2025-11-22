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
export declare function getIncident(incidentId: string): Promise<{
    opened_by_user: {
        role: "superadmin" | "finance" | "reviewer" | "support" | "privacy_officer" | "auditor";
        id: string;
        email: string;
        created_at: Date;
        updated_at: Date;
        status: "active" | "suspended";
        last_login_at: Date | null;
    } | null;
    id: string;
    created_at: Date;
    updated_at: Date;
    title: string;
    status: "open" | "mitigated" | "closed";
    severity: "low" | "major" | "critical";
    summary: string;
    opened_by: string;
    timeline: {
        ts: string;
        actor_id: string;
        action: string;
        details?: Record<string, unknown>;
    }[];
    closed_at: Date | null;
} | null>;
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
}): Promise<{
    opened_by_user: {
        role: "superadmin" | "finance" | "reviewer" | "support" | "privacy_officer" | "auditor";
        id: string;
        email: string;
        created_at: Date;
        updated_at: Date;
        status: "active" | "suspended";
        last_login_at: Date | null;
    } | null;
    id: string;
    created_at: Date;
    updated_at: Date;
    title: string;
    status: "open" | "mitigated" | "closed";
    severity: "low" | "major" | "critical";
    summary: string;
    opened_by: string;
    timeline: {
        ts: string;
        actor_id: string;
        action: string;
        details?: Record<string, unknown>;
    }[];
    closed_at: Date | null;
}[]>;
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
    total: number;
    byStatus: {
        open: number;
        mitigated: number;
        closed: number;
    };
    bySeverity: {
        critical: number;
        major: number;
        low: number;
    };
    avgTimeToClose: number;
    incidents: {
        id: string;
        created_at: Date;
        updated_at: Date;
        title: string;
        status: "open" | "mitigated" | "closed";
        severity: "low" | "major" | "critical";
        summary: string;
        opened_by: string;
        timeline: {
            ts: string;
            actor_id: string;
            action: string;
            details?: Record<string, unknown>;
        }[];
        closed_at: Date | null;
    }[];
}>;
//# sourceMappingURL=service.d.ts.map