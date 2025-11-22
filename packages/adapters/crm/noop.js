/**
 * No-op CRM Adapter
 * Disabled mode for development/testing
 */
import { logger } from '../../server/src/observability/index.js';
export class NoopAdapter {
    async sendTransactional(_message) {
        logger.debug({ to: _message.to }, 'Email send skipped (noop mode)');
        return { success: true, messageId: `noop_${Date.now()}` };
    }
    async sendMarketing(_messages) {
        logger.debug({ count: _messages.length }, 'Marketing emails skipped (noop mode)');
        return { success: _messages.length, failed: 0, errors: [] };
    }
    async identify(_user) {
        logger.debug('Identify skipped (noop mode)');
    }
    async subscribe(_subscription) {
        logger.debug('Subscribe skipped (noop mode)');
        return { success: true };
    }
    async unsubscribe(_email, _listId) {
        logger.debug('Unsubscribe skipped (noop mode)');
        return { success: true };
    }
    async track(_event) {
        logger.debug('Track skipped (noop mode)');
    }
}
export const noopAdapter = new NoopAdapter();
