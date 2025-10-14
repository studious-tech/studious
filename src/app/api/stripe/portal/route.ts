import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { getServerStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { returnUrl } = body;

    if (!returnUrl) {
      return NextResponse.json(
        { error: 'returnUrl is required' },
        { status: 400 }
      );
    }

    // Get user's Stripe customer ID from their subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .not('stripe_customer_id', 'is', null)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found. Please subscribe first.' },
        { status: 404 }
      );
    }

    // Create Stripe customer portal session
    const stripe = getServerStripe();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl,
    });

    return NextResponse.json({
      url: portalSession.url,
    });

  } catch (error) {
    console.error('Stripe portal error:', error);

    if (error instanceof Error) {
      if (error.message.includes('No such customer')) {
        return NextResponse.json(
          { error: 'Customer not found. Please contact support.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}