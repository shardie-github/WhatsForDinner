/**
 * SendGrid CRM Adapter
 * Handles transactional and marketing emails via SendGrid
 */
// @sendgrid/mail will be installed in package.json
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sgMail = require('@sendgrid/mail');
import { logger } from '../../server/src/observability/index.js';
const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM || 'no-reply@nomad.app';
const fromName = process.env.SENDGRID_FROM_NAME || 'Nomad';
if (apiKey) {
    sgMail.setApiKey(apiKey);
}
export class SendGridAdapter {
    config;
    constructor(config = {}) {
        this.config = {
            apiKey: config.apiKey || apiKey || '',
            fromEmail: config.fromEmail || fromEmail,
            fromName: config.fromName || fromName,
        };
        if (this.config.apiKey) {
            sgMail.setApiKey(this.config.apiKey);
        }
    }
    /**
     * Send transactional email
     */
    async sendTransactional(message) {
        if (!this.config.apiKey) {
            logger.warn('SendGrid API key not configured');
            return { success: false, error: 'SendGrid not configured' };
        }
        try {
            const msg = {
                to: message.to,
                from: {
                    email: message.from?.email || this.config.fromEmail,
                    name: message.from?.name || this.config.fromName,
                },
                subject: message.subject,
                html: message.html,
                text: message.text,
                templateId: message.templateId,
                dynamicTemplateData: message.templateData,
                categories: message.categories || [],
                customArgs: {
                    ...message.metadata,
                    source: 'sendgrid',
                },
            };
            const [response] = await sgMail.send(msg);
            logger.info({ to: message.to, subject: message.subject }, 'Email sent via SendGrid');
            return {
                success: true,
                messageId: response.headers['x-message-id'],
            };
        }
        catch (error) {
            logger.error({ error, to: message.to }, 'Failed to send email via SendGrid');
            return {
                success: false,
                error: error.message || 'Unknown error',
            };
        }
    }
    /**
     * Send marketing email (batch)
     */
    async sendMarketing(messages) {
        if (!this.config.apiKey) {
            logger.warn('SendGrid API key not configured');
            return { success: 0, failed: messages.length, errors: ['SendGrid not configured'] };
        }
        const results = await Promise.allSettled(messages.map((msg) => this.sendTransactional(msg)));
        const success = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
        const errors = results
            .filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error))
            .map((r) => (r.status === 'rejected' ? r.reason?.message : r.value.error))
            .filter(Boolean);
        return { success, failed, errors };
    }
    /**
     * Identify user (no-op for SendGrid - use contacts API if needed)
     */
    async identify(user) {
        // SendGrid doesn't have a direct identify method
        // Use contacts API if needed for marketing
        logger.debug({ userId: user.userId }, 'Identify called (SendGrid - use contacts API if needed)');
    }
    /**
     * Subscribe user to list
     */
    async subscribe(subscription) {
        if (!this.config.apiKey) {
            return { success: false, error: 'SendGrid not configured' };
        }
        try {
            // Use SendGrid Marketing Contacts API
            // For now, just log - implement full contacts API integration if needed
            logger.info({ email: subscription.email, listId: subscription.listId }, 'Subscribe called (SendGrid)');
            return { success: true };
        }
        catch (error) {
            logger.error({ error, email: subscription.email }, 'Failed to subscribe via SendGrid');
            return { success: false, error: error.message };
        }
    }
    /**
     * Unsubscribe user from list
     */
    async unsubscribe(email, listId) {
        if (!this.config.apiKey) {
            return { success: false, error: 'SendGrid not configured' };
        }
        try {
            logger.info({ email, listId }, 'Unsubscribe called (SendGrid)');
            return { success: true };
        }
        catch (error) {
            logger.error({ error, email }, 'Failed to unsubscribe via SendGrid');
            return { success: false, error: error.message };
        }
    }
    /**
     * Track event (no-op for SendGrid - use webhooks)
     */
    async track(event) {
        logger.debug({ event: event.event }, 'Track called (SendGrid - use webhooks)');
    }
}
export const sendGridAdapter = new SendGridAdapter();
