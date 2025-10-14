import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { createCheckoutSession } from '@/lib/stripe';

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
    const { planId, examId, successUrl, cancelUrl } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'planId is required' },
        { status: 400 }
      );
    }

    if (!examId) {
      return NextResponse.json(
        { error: 'examId is required' },
        { status: 400 }
      );
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'successUrl and cancelUrl are required' },
        { status: 400 }
      );
    }

    // Get user profile for customer details
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    // Get subscription plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('exam_id', examId)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription for this exam
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('id, plan_id')
      .eq('user_id', user.id)
      .eq('exam_id', examId)
      .eq('status', 'active')
      .gte('current_period_end', new Date().toISOString())
      .single();

    if (existingSubscription) {
      return NextResponse.json(
        {
          error: 'You already have an active subscription for this exam. Please cancel your current subscription first.',
          existing_subscription: existingSubscription
        },
        { status: 409 }
      );
    }

    // Create Stripe checkout session (no trials)
    const session = await createCheckoutSession({
      planId: planId,
      userId: user.id,
      userEmail: userProfile?.email || user.email || '',
      userName: userProfile?.full_name || undefined,
      successUrl: successUrl,
      cancelUrl: cancelUrl,
      trialDays: 0, // No trials in simplified system
    });

    return NextResponse.json({
      sessionId: session.id,
      checkoutUrl: session.url,
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);

    // Handle specific Stripe errors
    if (error instanceof Error) {
      if (error.message.includes('No such price')) {
        return NextResponse.json(
          { error: 'Invalid pricing configuration. Please contact support.' },
          { status: 400 }
        );
      }

      if (error.message.includes('Missing STRIPE')) {
        return NextResponse.json(
          { error: 'Payment processing is not configured. Please contact support.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}