import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// Check if user is admin
async function checkAdminAccess(): Promise<
  | { error: string; status: number; supabase?: never }
  | {
      user: unknown;
      supabase: Awaited<ReturnType<typeof createClient>>;
      error?: never;
      status?: never;
    }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 };
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { error: 'Admin access required', status: 403 };
  }

  return { user, supabase };
}

export async function GET() {
  try {
    const adminCheck = await checkAdminAccess();

    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    // Get total users
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // Get active users today (fallback if table doesn't exist)
    let activeUsersToday = 0;
    try {
      const { count } = await supabase
        .from('question_attempts')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);
      activeUsersToday = count || 0;
    } catch (error) {
      console.log('question_attempts table not found, using fallback');
    }

    // Get total questions
    const { count: totalQuestions } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get total attempts today (fallback if table doesn't exist)
    let attemptsToday = 0;
    try {
      const { count } = await supabase
        .from('question_attempts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);
      attemptsToday = count || 0;
    } catch (error) {
      console.log('question_attempts table not found, using fallback');
    }

    // Get active subscriptions (fallback if table doesn't exist)
    let activeSubscriptions = 0;
    let revenueThisMonth = 0;
    try {
      const { count } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString());
      activeSubscriptions = count || 0;

      // Calculate revenue this month (mock calculation)
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: monthlySubscriptions } = await supabase
        .from('user_subscriptions')
        .select('subscription_plans(price_monthly)')
        .gte('started_at', `${currentMonth}-01`)
        .eq('status', 'active');

      revenueThisMonth =
        monthlySubscriptions?.reduce((sum, sub) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return sum + ((sub as any).subscription_plans?.price_monthly || 0);
        }, 0) || 0;
    } catch (error) {
      console.log('subscription tables not found, using fallback');
    }

    // Get recent activity stats (fallback if table doesn't exist)
    let averageScoreToday = 0;
    try {
      const { data: recentAttempts } = await supabase
        .from('question_attempts')
        .select('created_at, final_score')
        .gte('created_at', `${today}T00:00:00`)
        .order('created_at', { ascending: false })
        .limit(100);

      const validAttempts = recentAttempts?.filter((a) => a.final_score !== null) || [];
      averageScoreToday = validAttempts.length > 0
        ? validAttempts.reduce((sum, a) => sum + (a.final_score || 0), 0) / validAttempts.length
        : 0;
    } catch (error) {
      console.log('question_attempts table not found, using fallback');
    }

    return NextResponse.json({
      total_users: totalUsers || 0,
      active_users_today: activeUsersToday,
      total_questions: totalQuestions || 0,
      total_attempts_today: attemptsToday,
      active_subscriptions: activeSubscriptions,
      revenue_this_month: Math.round(revenueThisMonth * 100) / 100,
      average_score_today: Math.round(averageScoreToday * 100) / 100,
      growth_metrics: {
        new_users_this_week: 0, // TODO: Implement
        retention_rate: 0, // TODO: Implement
        conversion_rate: 0, // TODO: Implement
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
