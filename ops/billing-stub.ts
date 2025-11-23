/**
 * Billing Stub - Stripe webhooks + feature flag
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { secretsManager } from '../scripts/secrets-manager-unified.mjs';
import { createComponentLogger } from '@whats-for-dinner/utils';

const logger = createComponentLogger('billing-stub-ts');
const REPORTS_DIR = join(process.cwd(), 'ops', 'reports');

interface WebhookEvent {
  type: string;
  data: any;
  timestamp: string;
}

async function validateStripeWebhook(signature: string, payload: string): Promise<boolean> {
  const stripe = require('stripe')((await secretsManager.getSecret('STRIPE_SECRET_KEY')) || process.env.STRIPE_SECRET_KEY);
  
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      (await secretsManager.getSecret('STRIPE_WEBHOOK_SECRET')) || process.env.STRIPE_WEBHOOK_SECRET
    );
    return true;
  } catch (error) {
    return false;
  }
}

async function handleWebhook(event: WebhookEvent): Promise<void> {
  
  // Log webhook for audit
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const webhookLog = join(REPORTS_DIR, 'webhooks.json');
  let webhooks: WebhookEvent[] = [];
  
  if (existsSync(webhookLog)) {
    webhooks = JSON.parse(require('fs').readFileSync(webhookLog, 'utf-8'));
  }

  webhooks.push(event);
  writeFileSync(webhookLog, JSON.stringify(webhooks, null, 2));

  // Handle event types
  switch (event.type) {
    case 'checkout.session.completed':
      logger.info('Checkout session completed:', { id: event.data.id });
      break;
    case 'customer.subscription.created':
      logger.info('Subscription created:', { id: event.data.id });
      break;
    case 'customer.subscription.updated':
      logger.info('Subscription updated:', { id: event.data.id });
      break;
    case 'customer.subscription.deleted':
      logger.info('Subscription deleted:', { id: event.data.id });
      break;
  }
}

async function isBillingEnabled(): Promise<boolean> {
  return (await secretsManager.getSecret('ENABLE_BILLING')) === 'true' || process.env.ENABLE_BILLING === 'true';
}

if (require.main === module) {
  const command = process.argv[2];

  if (command === 'test') {
    // Test webhook validation
    const testEvent: WebhookEvent = {
      type: 'checkout.session.completed',
      data: { id: 'test' },
      timestamp: new Date().toISOString()
    };
    handleWebhook(testEvent).then(() => {
      logger.info('Webhook test completed');
    });
  } else if (command === 'check') {
    isBillingEnabled().then(enabled => {
      logger.info(`Billing is ${enabled ? 'enabled' : 'disabled'}`);
    });
  } else {
    logger.error('Usage: billing-stub.ts [test|check]');
    process.exit(1);
  }
}

export { validateStripeWebhook, handleWebhook, isBillingEnabled };
