import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Check if we're on server side and have required env vars
const isServer = typeof window === 'undefined';
const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;

// Server-side Stripe instance (only initialize if on server)
export const stripe =
  isServer && hasStripeKey
    ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-08-27.basil',
      })
    : null;

// Helper function to get Stripe instance with error handling
export const getServerStripe = () => {
  if (!isServer) {
    throw new Error('Stripe instance should only be used on the server side');
  }

  if (!hasStripeKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }

  return stripe!;
};

// Client-side Stripe instance
export const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  }

  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};

// Stripe configuration constants
export const STRIPE_CONFIG = {
  // Webhook endpoint secret
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,

  // Price IDs for each plan (clean 2-plan system)
  priceIds: {
    'pte-monthly': process.env.STRIPE_PTE_MONTHLY_PRICE_ID!,
    'pte-yearly': process.env.STRIPE_PTE_YEARLY_PRICE_ID!,
    'ielts-monthly': process.env.STRIPE_IELTS_MONTHLY_PRICE_ID!,
    'ielts-yearly': process.env.STRIPE_IELTS_YEARLY_PRICE_ID!,
  } as Record<string, string>,

  // Customer portal configuration
  customerPortalUrl: 'https://billing.stripe.com/p/login/test_',
};

// Helper function to get Stripe price ID from plan ID
export function getStripePriceId(planId: string): string {
  const priceId = STRIPE_CONFIG.priceIds[planId];
  if (!priceId) {
    throw new Error(`No Stripe price ID found for plan: ${planId}`);
  }
  return priceId;
}

// Helper function to get plan ID from Stripe price ID
export function getPlanIdFromStripePrice(stripePriceId: string): string {
  const planId = Object.keys(STRIPE_CONFIG.priceIds).find(
    (key) => STRIPE_CONFIG.priceIds[key] === stripePriceId
  );

  if (!planId) {
    throw new Error(`No plan ID found for Stripe price: ${stripePriceId}`);
  }

  return planId;
}

// Create customer in Stripe
export async function createStripeCustomer(params: {
  email: string;
  name?: string;
  userId: string;
}): Promise<Stripe.Customer> {
  const stripe = getServerStripe();
  return await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      supabase_user_id: params.userId,
    },
  });
}

// Get or create Stripe customer
export async function getOrCreateStripeCustomer(params: {
  email: string;
  name?: string;
  userId: string;
}): Promise<Stripe.Customer> {
  // First, try to find existing customer by email
  const stripe = getServerStripe();
  const existingCustomers = await stripe.customers.list({
    email: params.email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer if none found
  return await createStripeCustomer(params);
}

// Create checkout session for subscription
export async function createCheckoutSession(params: {
  planId: string;
  userId: string;
  userEmail: string;
  userName?: string;
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
}): Promise<Stripe.Checkout.Session> {
  const customer = await getOrCreateStripeCustomer({
    email: params.userEmail,
    name: params.userName,
    userId: params.userId,
  });

  const priceId = getStripePriceId(params.planId);

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customer.id,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      plan_id: params.planId,
      user_id: params.userId,
    },
    subscription_data: {
      metadata: {
        plan_id: params.planId,
        user_id: params.userId,
      },
    },
  };

  // Add trial period if specified
  if (params.trialDays && params.trialDays > 0) {
    sessionParams.subscription_data!.trial_period_days = params.trialDays;
  }

  const stripe = getServerStripe();
  return await stripe.checkout.sessions.create(sessionParams);
}

// Create customer portal session
export async function createCustomerPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const stripe = getServerStripe();
  return await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });
}

// Get subscription by Stripe subscription ID
export async function getStripeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getServerStripe();
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['customer', 'items.data.price'],
  });
}

// Cancel subscription in Stripe
export async function cancelStripeSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd = true
): Promise<Stripe.Subscription> {
  const stripe = getServerStripe();
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: cancelAtPeriodEnd,
  });
}

// Reactivate subscription in Stripe
export async function reactivateStripeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getServerStripe();
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}
