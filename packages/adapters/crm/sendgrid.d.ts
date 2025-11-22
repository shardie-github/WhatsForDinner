/**
 * SendGrid CRM Adapter
 * Handles transactional and marketing emails via SendGrid
 */
import type { EmailMessage, EmailSubscription } from './types.js';
export interface SendGridConfig {
    apiKey?: string;
    fromEmail?: string;
    fromName?: string;
}
export declare class SendGridAdapter {
    private config;
    constructor(config?: SendGridConfig);
    /**
     * Send transactional email
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
    /**
     * Identify user (no-op for SendGrid - use contacts API if needed)
     */
    identify(user: {
        userId: string;
        email: string;
        attributes?: Record<string, unknown>;
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
     * Track event (no-op for SendGrid - use webhooks)
     */
    track(event: {
        userId?: string;
        email?: string;
        event: string;
        properties?: Record<string, unknown>;
    }): Promise<void>;
}
export declare const sendGridAdapter: SendGridAdapter;
//# sourceMappingURL=sendgrid.d.ts.map