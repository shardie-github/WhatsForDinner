/**
 * CRM Adapter Factory
 * Switches between SendGrid, Klaviyo, or No-op based on env
 */
import { sendGridAdapter } from './sendgrid.js';
import { klaviyoAdapter } from './klaviyo.js';
import { noopAdapter } from './noop.js';
const provider = process.env.CRM_PROVIDER || 'noop';
export function getCRMAdapter() {
    switch (provider) {
        case 'sendgrid':
            return sendGridAdapter;
        case 'klaviyo':
            return klaviyoAdapter;
        case 'noop':
        default:
            return noopAdapter;
    }
}
export const crmAdapter = getCRMAdapter();
export * from './types.js';
export * from './sendgrid.js';
export * from './klaviyo.js';
export * from './noop.js';
