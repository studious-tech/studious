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

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAccess();
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const body = await request.json();
    const { name, display_name, description, duration_minutes, total_score, is_active } = body;

    if (!name || !display_name) {
      return NextResponse.json(
        { error: 'Name and display_name are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Generate ID from name
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const { data: exam, error } = await supabase
      .from('exams')
      .insert({
        id,
        name,
        display_name,
        description,
        duration_minutes: duration_minutes || null,
        total_score: total_score || 100,
        is_active: is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating exam:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error('Admin exams POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}