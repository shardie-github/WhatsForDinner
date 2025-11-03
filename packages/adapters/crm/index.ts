/**
 * CRM Adapter Factory
 * Switches between SendGrid, Klaviyo, or No-op based on env
 */

import { sendGridAdapter, SendGridAdapter } from './sendgrid.js';
import { klaviyoAdapter, KlaviyoAdapter } from './klaviyo.js';
import { noopAdapter, NoopAdapter } from './noop.js';
import type { CRMAdapter } from './types.js';

const provider = process.env.CRM_PROVIDER || 'noop';

export function getCRMAdapter(): CRMAdapter {
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
