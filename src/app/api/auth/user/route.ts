import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get active subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .single();

    return NextResponse.json({
      id: user.id,
      email: user.email,
      full_name: profile?.full_name || null,
      role: profile?.role || 'student',
      subscription: subscription
        ? {
            plan: subscription.subscription_plans?.display_name,
            status: subscription.status,
            expires_at: subscription.expires_at,
          }
        : null,
    });
  } catch (error) {
    console.error('Auth user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
