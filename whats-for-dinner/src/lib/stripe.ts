import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export const STRIPE_CONFIG = {
  plans: {
    free: {
      name: 'Free',
      price: 0,
      features: ['3 AI meals per day', '1 pantry list', 'Basic recipes'],
      limits: {
        dailyMeals: 3,
        pantryLists: 1,
        aiTokens: 1000,
      },
    },
    pro: {
      name: 'Pro',
      price: 9.99,
      priceId: process.env.STRIPE_PRO_PRICE_ID,
      features: [
        'Unlimited AI meals',
        'Unlimited pantry lists',
        'AI nutrition summaries',
        'Advanced recipe filtering',
        'Export recipes',
      ],
      limits: {
        dailyMeals: 1000,
        pantryLists: -1, // unlimited
        aiTokens: 50000,
      },
    },
    family: {
      name: 'Family',
      price: 19.99,
      priceId: process.env.STRIPE_FAMILY_PRICE_ID,
      features: [
        'Everything in Pro',
        'Up to 5 family members',
        'Shared pantry lists',
        'Family meal planning',
        'Priority support',
      ],
      limits: {
        dailyMeals: 1000,
        pantryLists: -1, // unlimited
        aiTokens: 100000,
        maxMembers: 5,
      },
    },
  },
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
};

export type PlanType = keyof typeof STRIPE_CONFIG.plans;

export interface CreateCheckoutSessionParams {
  tenantId: string;
  userId: string;
  plan: PlanType;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCustomerPortalSessionParams {
  tenantId: string;
  userId: string;
  returnUrl: string;
}

export class StripeService {
  /**
   * Create a Stripe checkout session for subscription
   */
  static async createCheckoutSession({
    tenantId,
    userId,
    plan,
    successUrl,
    cancelUrl,
  }: CreateCheckoutSessionParams) {
    const planConfig = STRIPE_CONFIG.plans[plan];

    if (!planConfig.priceId) {
      throw new Error(`Price ID not configured for plan: ${plan}`);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tenantId,
        userId,
        plan,
      },
      subscription_data: {
        metadata: {
          tenantId,
          userId,
          plan,
        },
      },
    });

    return session;
  }

  /**
   * Create a customer portal session for subscription management
   */
  static async createCustomerPortalSession({
    tenantId,
    userId,
    returnUrl,
  }: CreateCustomerPortalSessionParams) {
    // First, get the customer ID from the tenant
    const { data: tenant } = await supabase
      .from('tenants')
      .select('stripe_customer_id')
      .eq('id', tenantId)
      .single();

    if (!tenant?.stripe_customer_id) {
      throw new Error('No Stripe customer found for tenant');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripe_customer_id,
      return_url: returnUrl,
    });

    return session;
  }

  /**
   * Get subscription details
   */
  static async getSubscription(subscriptionId: string) {
    return await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method', 'customer'],
    });
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(subscriptionId: string, immediately = false) {
    if (immediately) {
      return await stripe.subscriptions.cancel(subscriptionId);
    } else {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  }

  /**
   * Update subscription plan
   */
  static async updateSubscriptionPlan(
    subscriptionId: string,
    newPlan: PlanType
  ) {
    const planConfig = STRIPE_CONFIG.plans[newPlan];

    if (!planConfig.priceId) {
      throw new Error(`Price ID not configured for plan: ${newPlan}`);
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: planConfig.priceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(payload: string, signature: string) {
    if (!STRIPE_CONFIG.webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }

    return stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
  }

  /**
   * Calculate usage-based pricing for AI tokens
   */
  static calculateTokenCost(tokens: number, model: string): number {
    const pricing = {
      'gpt-4o': 0.005, // $0.005 per 1K tokens
      'gpt-4o-mini': 0.00015, // $0.00015 per 1K tokens
    };

    const pricePer1K =
      pricing[model as keyof typeof pricing] || pricing['gpt-4o-mini'];
    return (tokens / 1000) * pricePer1K;
  }
}

// Import supabase client
import { supabase } from './supabaseClient';
