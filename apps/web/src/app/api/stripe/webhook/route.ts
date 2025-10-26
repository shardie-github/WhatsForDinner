import { NextRequest, NextResponse } from 'next/server';
import { stripe, StripeService } from '@/lib/stripe';
import { supabase } from '@/lib/supabaseClient';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: any;

    try {
      event = StripeService.verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Check if we've already processed this event
    const { data: existingEvent } = await supabase
      .from('billing_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single();

    if (existingEvent) {
      console.log(`Event ${event.id} already processed`);
      return NextResponse.json({ received: true });
    }

    // Store the event
    await supabase.from('billing_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      data: event,
    });

    console.log(`Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await supabase
      .from('billing_events')
      .update({ processed: true })
      .eq('stripe_event_id', event.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  const { tenantId, userId, plan } = session.metadata;

  if (!tenantId || !userId || !plan) {
    console.error('Missing metadata in checkout session:', session.metadata);
    return;
  }

  // Update tenant with Stripe customer ID
  await supabase
    .from('tenants')
    .update({
      stripe_customer_id: session.customer,
    })
    .eq('id', tenantId);

  console.log(
    `Checkout completed for tenant ${tenantId}, user ${userId}, plan ${plan}`
  );
}

async function handleSubscriptionCreated(subscription: any) {
  const { tenantId, userId, plan } = subscription.metadata;

  if (!tenantId || !userId || !plan) {
    console.error('Missing metadata in subscription:', subscription.metadata);
    return;
  }

  // Create subscription record
  await supabase.from('subscriptions').insert({
    user_id: userId,
    tenant_id: tenantId,
    stripe_customer_id: subscription.customer,
    stripe_subscription_id: subscription.id,
    plan: plan,
    status: subscription.status,
    current_period_start: new Date(
      subscription.current_period_start * 1000
    ).toISOString(),
    current_period_end: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    metadata: subscription,
  });

  // Update tenant plan
  await supabase
    .from('tenants')
    .update({
      plan: plan,
      stripe_subscription_id: subscription.id,
      status: 'active',
    })
    .eq('id', tenantId);

  console.log(`Subscription created for tenant ${tenantId}, plan ${plan}`);
}

async function handleSubscriptionUpdated(subscription: any) {
  const { tenantId } = subscription.metadata;

  if (!tenantId) {
    console.error('Missing tenantId in subscription metadata');
    return;
  }

  // Update subscription record
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      metadata: subscription,
    })
    .eq('stripe_subscription_id', subscription.id);

  // Update tenant status if subscription is cancelled
  if (subscription.status === 'canceled') {
    await supabase
      .from('tenants')
      .update({
        plan: 'free',
        status: 'inactive',
      })
      .eq('id', tenantId);
  }

  console.log(
    `Subscription updated for tenant ${tenantId}, status: ${subscription.status}`
  );
}

async function handleSubscriptionDeleted(subscription: any) {
  const { tenantId } = subscription.metadata;

  if (!tenantId) {
    console.error('Missing tenantId in subscription metadata');
    return;
  }

  // Update subscription record
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
    })
    .eq('stripe_subscription_id', subscription.id);

  // Downgrade tenant to free plan
  await supabase
    .from('tenants')
    .update({
      plan: 'free',
      status: 'inactive',
    })
    .eq('id', tenantId);

  console.log(`Subscription deleted for tenant ${tenantId}`);
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription
  );
  const { tenantId } = subscription.metadata;

  if (!tenantId) {
    console.error('Missing tenantId in subscription metadata');
    return;
  }

  // Update tenant status to active
  await supabase
    .from('tenants')
    .update({
      status: 'active',
    })
    .eq('id', tenantId);

  console.log(`Payment succeeded for tenant ${tenantId}`);
}

async function handleInvoicePaymentFailed(invoice: any) {
  const subscription = await stripe.subscriptions.retrieve(
    invoice.subscription
  );
  const { tenantId } = subscription.metadata;

  if (!tenantId) {
    console.error('Missing tenantId in subscription metadata');
    return;
  }

  // Update tenant status to suspended
  await supabase
    .from('tenants')
    .update({
      status: 'suspended',
    })
    .eq('id', tenantId);

  console.log(`Payment failed for tenant ${tenantId}`);
}
