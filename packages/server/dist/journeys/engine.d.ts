/**
 * Journey Orchestration Engine
 * Stateless rules engine with state persistence
 * Built-in journeys: onboarding, habit_loop, premium_upsell, churn_save, winback
 */
export interface JourneyRule {
    key: string;
    name: string;
    steps: JourneyStep[];
}
export interface JourneyStep {
    key: string;
    name: string;
    trigger: (user: UserContext, state?: JourneyState) => Promise<boolean>;
    action: (user: UserContext, state?: JourneyState) => Promise<void>;
    delay?: number;
}
export interface UserContext {
    id: string;
    email: string;
    plan: string;
    created_at: Date;
    [key: string]: unknown;
}
export interface JourneyState {
    id: string;
    user_id: string;
    key: string;
    step: string;
    last_sent_at: Date | null;
    meta: Record<string, unknown>;
    created_at: Date;
    updated_at: Date;
}
export declare const builtInJourneys: JourneyRule[];
/**
 * Process a single journey for a user
 */
export declare function processJourney(userId: string, journey: JourneyRule): Promise<void>;
/**
 * Run all journeys for eligible users
 * Called by BullMQ worker
 */
export declare function runJourneys(): Promise<{
    processed: number;
    errors: number;
}>;
/**
 * Manually trigger a journey step (admin)
 */
export declare function triggerJourneyStep(userId: string, journeyKey: string, stepKey: string): Promise<void>;
//# sourceMappingURL=engine.d.ts.map