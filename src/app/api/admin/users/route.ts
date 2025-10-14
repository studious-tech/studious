import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// Check if user is admin
async function checkAdminAccess() {
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

export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAccess();

    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }

    if (!['student', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be student or admin' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update user role
    const { data: updatedUser, error } = await supabase
      .from('user_profiles')
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Admin users PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAccess();

    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const subscriptionStatus = searchParams.get('subscription_status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    // Note: Subscription status filtering removed due to missing FK relationship
    // TODO: Add proper foreign key relationship between user_profiles and user_subscriptions

    // Get total count for pagination
    const { count } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    const { data: users, error } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // Get attempt count
        const { count: attemptCount } = await supabase
          .from('question_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Get last activity
        const { data: lastAttempt } = await supabase
          .from('question_attempts')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Get subscription status
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select(`
            status,
            expires_at,
            subscription_plans (
              display_name
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('expires_at', { ascending: false })
          .limit(1);

        return {
          ...user,
          subscription_status: subscription?.[0]?.status || 'inactive',
          stats: {
            total_attempts: attemptCount || 0,
            last_activity: lastAttempt?.[0]?.created_at || null,
          },
        };
      })
    );

    return NextResponse.json({
      users: usersWithStats,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
