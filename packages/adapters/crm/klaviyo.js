/**
 * Klaviyo CRM Adapter
 * Handles identify, track, subscribe, and send flows via Klaviyo API
 */
import { logger } from '../../server/src/observability/index.js';
const apiKey = process.env.KLAVIYO_API_KEY;
const listId = process.env.KLAVIYO_LIST_ID;
export class KlaviyoAdapter {
    apiKey;
    baseUrl = 'https://a.klaviyo.com/api';
    listId;
    constructor(config) {
        this.apiKey = config?.apiKey || apiKey || '';
        this.listId = config?.listId || listId;
    }
    async request(endpoint, method, data) {
        if (!this.apiKey) {
            throw new Error('Klaviyo API key not configured');
        }
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Klaviyo-API-Key ${this.apiKey}`,
                'revision': '2024-10-15',
                'Content-Type': 'application/json',
            },
            body: data ? JSON.stringify({ data }) : undefined,
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Klaviyo API error: ${response.status} ${error}`);
        }
        return response.json();
    }
    /**
     * Identify user
     */
    async identify(user) {
        try {
            const profile = {
                data: {
                    type: 'profile',
                    attributes: {
                        email: user.email,
                        external_id: user.userId,
                        ...user.attributes,
                    },
                },
            };
            await this.request('/profiles', 'POST', profile);
            logger.info({ userId: user.userId, email: user.email }, 'User identified in Klaviyo');
        }
        catch (error) {
            logger.error({ error, userId: user.userId }, 'Failed to identify user in Klaviyo');
            throw error;
        }
    }
    /**
     * Track event
     */
    async track(event) {
        try {
            const klaviyoEvent = {
                data: {
                    type: 'event',
                    attributes: {
                        metric: {
                            data: {
                                type: 'metric',
                                attributes: {
                                    name: event.event,
                                },
                            },
                        },
                        properties: event.properties,
                        profile: event.userId || event.email ? {
                            data: {
                                type: 'profile',
                                attributes: {
                                    ...(event.email ? { email: event.email } : {}),
                                    ...(event.userId ? { external_id: event.userId } : {}),
                                },
                            },
                        } : undefined,
                        time: new Date().toISOString(),
                    },
                },
            };
            await this.request('/events', 'POST', klaviyoEvent);
            logger.debug({ event: event.event }, 'Event tracked in Klaviyo');
        }
        catch (error) {
            logger.error({ error, event: event.event }, 'Failed to track event in Klaviyo');
            // Don't throw - tracking failures shouldn't break flow
        }
    }
    /**
     * Subscribe user to list
     */
    async subscribe(subscription) {
        try {
            const list = subscription.listId || this.listId;
            if (!list) {
                return { success: false, error: 'List ID required' };
            }
            // First, ensure profile exists
            if (subscription.userId) {
                await this.identify({
                    userId: subscription.userId,
                    email: subscription.email,
                });
            }
            // Add profile to list
            const profile = {
                data: {
                    type: 'profile',
                    attributes: {
                        email: subscription.email,
                        ...(subscription.userId ? { external_id: subscription.userId } : {}),
                    },
                },
            };
            await this.request(`/lists/${list}/relationships/profiles`, 'POST', { data: [profile] });
            logger.info({ email: subscription.email, listId: list }, 'User subscribed to Klaviyo list');
            return { success: true };
        }
        catch (error) {
            logger.error({ error, email: subscription.email }, 'Failed to subscribe via Klaviyo');
            return { success: false, error: error.message };
        }
    }
    /**
     * Unsubscribe user from list
     */
    async unsubscribe(email, listId) {
        try {
            const list = listId || this.listId;
            if (!list) {
                return { success: false, error: 'List ID required' };
            }
            // Get profile ID by email
            const profiles = await this.request(`/profiles?filter=equals(email,"${email}")`, 'GET');
            if (profiles.data && profiles.data.length > 0) {
                const profileId = profiles.data[0].id;
                await this.request(`/lists/${list}/relationships/profiles`, 'DELETE', {
                    data: [{ type: 'profile', id: profileId }],
                });
            }
            logger.info({ email, listId: list }, 'User unsubscribed from Klaviyo list');
            return { success: true };
        }
        catch (error) {
            logger.error({ error, email }, 'Failed to unsubscribe via Klaviyo');
            return { success: false, error: error.message };
        }
    }
    /**
     * Send email via Klaviyo flow
     */
    async sendTransactional(message) {
        try {
            // Klaviyo uses flows for sending emails
            // For transactional, use a flow trigger
            if (message.templateId) {
                // Trigger flow by template ID
                await this.track({
                    email: message.to,
                    event: `email_${message.templateId}`,
                    properties: message.templateData,
                });
                return { success: true, messageId: `klaviyo_${Date.now()}` };
            }
            // For custom HTML, use Klaviyo's email sending API (requires campaign setup)
            logger.warn('Custom HTML emails require Klaviyo campaign setup');
            return { success: false, error: 'Template-based emails only' };
        }
        catch (error) {
            logger.error({ error, to: message.to }, 'Failed to send email via Klaviyo');
            return { success: false, error: error.message };
        }
    }
    /**
     * Send marketing email (batch)
     */
    async sendMarketing(messages) {
        const results = await Promise.allSettled(messages.map((msg) => this.sendTransactional(msg)));
        const success = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
        const errors = results
            .filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error))
            .map((r) => (r.status === 'rejected' ? r.reason?.message : r.value.error))
            .filter(Boolean);
        return { success, failed, errors };
    }
}
export const klaviyoAdapter = new KlaviyoAdapter();
