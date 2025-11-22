/**
 * Billing stub with Stripe webhooks
 */
import Stripe from 'stripe';
export declare const ENABLE_BILLING: boolean;
export declare function handleStripeWebhook(event: Stripe.Event): Promise<void>;
//# sourceMappingURL=stripe-webhook.d.ts.map