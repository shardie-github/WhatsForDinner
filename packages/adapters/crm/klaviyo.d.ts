/**
 * Klaviyo CRM Adapter
 * Handles identify, track, subscribe, and send flows via Klaviyo API
 */
import type { EmailMessage, EmailSubscription } from './types.js';
export declare class KlaviyoAdapter {
    private apiKey;
    private baseUrl;
    private listId?;
    constructor(config?: {
        apiKey?: string;
        listId?: string;
    });
    private request;
    /**
     * Identify user
     */
    identify(user: {
        userId: string;
        email: string;
        attributes?: Record<string, unknown>;
    }): Promise<void>;
    /**
     * Track event
     */
    track(event: {
        userId?: string;
        email?: string;
        event: string;
        properties?: Record<string, unknown>;
    }): Promise<void>;
    /**
     * Subscribe user to list
     */
    subscribe(subscription: EmailSubscription): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Unsubscribe user from list
     */
    unsubscribe(email: string, listId?: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Send email via Klaviyo flow
     */
    sendTransactional(message: EmailMessage): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    /**
     * Send marketing email (batch)
     */
    sendMarketing(messages: EmailMessage[]): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
}
export declare const klaviyoAdapter: KlaviyoAdapter;
//# sourceMappingURL=klaviyo.d.ts.map