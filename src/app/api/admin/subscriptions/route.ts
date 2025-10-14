import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// Get all subscriptions with user and plan details (Admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you may want to implement proper role checking)
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userProfile || userProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const examId = searchParams.get('exam_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('user_subscriptions')
      .select(`
        *,
        user_profiles!inner(id, full_name, email),
        subscription_plans!inner(id, name, display_name, exam_id, price_monthly, price_yearly)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (examId) {
      query = query.eq('subscription_plans.exam_id', examId);
    }

    const { data: subscriptions, error, count } = await query;

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('user_subscriptions')
      .select('id', { count: 'exact', head: true });

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    if (examId) {
      countQuery = countQuery.eq('subscription_plans.exam_id', examId);
    }

    const { count: totalCount } = await countQuery;

    return NextResponse.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Admin subscriptions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update subscription (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userProfile || userProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      subscription_id,
      status,
      expires_at,
      auto_renew,
      reset_usage,
    } = body;

    if (!subscription_id) {
      return NextResponse.json(
        { error: 'subscription_id is required' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
      if (status === 'canceled') {
        updateData.canceled_at = new Date().toISOString();
        updateData.auto_renew = false;
      }
    }

    if (expires_at) {
      updateData.expires_at = expires_at;
    }

    if (typeof auto_renew === 'boolean') {
      updateData.auto_renew = auto_renew;
    }

    if (reset_usage) {
      updateData.mock_tests_used = 0;
      updateData.practice_questions_used = 0;
    }

    // Update subscription
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('user_subscriptions')
      .update(updateData)
      .eq('id', subscription_id)
      .select(`
        *,
        user_profiles!inner(id, full_name, email),
        subscription_plans!inner(id, name, display_name, exam_id)
      `)
      .single();

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      message: 'Subscription updated successfully',
    });
  } catch (error) {
    console.error('Admin subscription update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}