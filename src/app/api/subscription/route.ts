import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// Clean subscription API - matches the simplified database schema
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
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use the helper function to get subscription status
    const { data: subscriptionStatus, error } = await supabase
      .rpc('get_user_subscription_status', {
        p_user_id: user.id,
        p_exam_id: examId
      });

    if (error) {
      console.error('Error fetching subscription status:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const status = subscriptionStatus[0];

    // Simple response based on clean schema
    return NextResponse.json({
      has_subscription: status.has_subscription,
      plan_type: status.has_subscription ? 'pro' : 'free',
      plan_name: status.plan_name,
      status: status.status,
      expires_at: status.current_period_end,
      stripe_customer_id: status.stripe_customer_id,

      // Free users have limits, Pro users get unlimited
      limits: {
        mock_tests: status.has_subscription ? 'unlimited' : 2,
        practice_questions: status.has_subscription ? 'unlimited' : 50
      }
    });

  } catch (error) {
    console.error('Subscription API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}