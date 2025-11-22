/**
 * No-op CRM Adapter
 * Disabled mode for development/testing
 */
import type { EmailMessage, EmailSubscription } from './types.js';
export declare class NoopAdapter {
    sendTransactional(_message: EmailMessage): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    sendMarketing(_messages: EmailMessage[]): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
    identify(_user: {
        userId: string;
        email: string;
        attributes?: Record<string, unknown>;
    }): Promise<void>;
    subscribe(_subscription: EmailSubscription): Promise<{
        success: boolean;
        error?: string;
    }>;
    unsubscribe(_email: string, _listId?: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    track(_event: {
        userId?: string;
        email?: string;
        event: string;
        properties?: Record<string, unknown>;
    }): Promise<void>;
}
export declare const noopAdapter: NoopAdapter;
//# sourceMappingURL=noop.d.ts.map