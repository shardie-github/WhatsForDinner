/**
 * CRM Adapter Factory
 * Switches between SendGrid, Klaviyo, or No-op based on env
 */
import type { CRMAdapter } from './types.js';
export declare function getCRMAdapter(): CRMAdapter;
export declare const crmAdapter: CRMAdapter;
export * from './types.js';
export * from './sendgrid.js';
export * from './klaviyo.js';
export * from './noop.js';
//# sourceMappingURL=index.d.ts.map