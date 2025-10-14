import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/supabase/server';
import { getServerStripe, STRIPE_CONFIG } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      const stripe = getServerStripe();
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_CONFIG.webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(supabase, subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(supabase: any, subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.user_id;
    const planId = subscription.metadata?.plan_id;

    if (!userId || !planId) {
      console.error('Missing user_id or plan_id in subscription metadata');
      return;
    }

    // Get plan details to extract exam_id
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('exam_id')
      .eq('id', planId)
      .single();

    if (!plan) {
      console.error(`Plan not found: ${planId}`);
      return;
    }

    // Cancel any existing active subscription for this exam
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('exam_id', plan.exam_id)
      .eq('status', 'active')
      .neq('stripe_subscription_id', subscription.id);

    // Create new subscription in our database (clean schema)
    const { error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        exam_id: plan.exam_id,
        plan_id: planId,
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: subscription.id,
        status: subscription.status === 'active' ? 'active' : subscription.status,
        current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error creating subscription in database:', error);
    } else {
      console.log(`Subscription created for user ${userId}, plan ${planId}`);
    }

  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(supabase: any, subscription: Stripe.Subscription) {
  try {
    const updateData: any = {
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Handle cancellation
    if (subscription.status === 'canceled' || subscription.cancel_at_period_end) {
      updateData.canceled_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('user_subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error updating subscription in database:', error);
    } else {
      console.log(`Subscription updated: ${subscription.id}`);
    }

  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error canceling subscription in database:', error);
    } else {
      console.log(`Subscription canceled: ${subscription.id}`);
    }

  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}