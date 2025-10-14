import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// Clean subscription plans API - only returns 2 plans per exam with Stripe price IDs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('exam_id');

    if (!examId) {
      return NextResponse.json(
        { error: 'exam_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get subscription plans for the exam (only 2: monthly and yearly)
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('exam_id', examId)
      .eq('is_active', true)
      .order('billing_interval'); // month first, then year

    if (error) {
      console.error('Error fetching subscription plans:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription plans' },
        { status: 500 }
      );
    }

    // Transform to clean format
    const cleanPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name, // 'monthly' or 'yearly'
      display_name: plan.display_name,
      description: plan.description,
      billing_interval: plan.billing_interval, // 'month' or 'year'
      price: {
        amount: plan.price_amount, // in cents
        currency: plan.currency,
        formatted: `$${(plan.price_amount / 100).toFixed(2)}`
      },
      stripe_price_id: plan.stripe_price_id,
      savings: plan.billing_interval === 'year' ? 40 : 0, // 40% savings for yearly
      features: [
        'Unlimited practice questions',
        'Unlimited mock tests',
        'AI-powered feedback',
        'Performance analytics',
        'Study progress tracking',
        'Expert tips and strategies',
        'Mobile app access',
        'Priority support'
      ]
    }));

    return NextResponse.json({
      success: true,
      plans: cleanPlans
    });

  } catch (error) {
    console.error('Subscription plans API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}