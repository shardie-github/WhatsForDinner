/**
 * Billing Stub - Stripe webhooks + feature flag
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

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
  console.log(`Handling webhook: ${event.type}`);

  // Log webhook for audit
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const webhookLog = join(REPORTS_DIR, 'webhooks.json');
  let webhooks: WebhookEvent[] = [];
  
  if (existsSync(webhookLog)) {
    webhooks = JSON.parse(require('fs').readFileSync(webhookLog, 'utf-8'));
import { secretsManager } from './secrets-manager-unified.mjs';
  }

  webhooks.push(event);
  writeFileSync(webhookLog, JSON.stringify(webhooks, null, 2));

  // Handle event types
  switch (event.type) {
    case 'checkout.session.completed':
      console.log('Checkout completed');
      break;
    case 'customer.subscription.created':
      console.log('Subscription created');
      break;
    case 'customer.subscription.updated':
      console.log('Subscription updated');
      break;
    case 'customer.subscription.deleted':
      console.log('Subscription cancelled');
      break;
  }
}

function isBillingEnabled(): boolean {
  return (await secretsManager.getSecret('ENABLE_BILLING')) || process.env.ENABLE_BILLING === 'true';
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
      console.log('✅ Webhook test passed');
    });
  } else if (command === 'check') {
    console.log(`Billing enabled: ${isBillingEnabled()}`);
  } else {
    console.log('Usage: billing-stub.ts [test|check]');
    process.exit(1);
  }
}

export { validateStripeWebhook, handleWebhook, isBillingEnabled };
