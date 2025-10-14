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
    const { exam_id, name, display_name, description, duration_minutes, order_index, is_active } = body;

    if (!exam_id || !name || !display_name) {
      return NextResponse.json(
        { error: 'exam_id, name and display_name are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Generate ID from exam_id and name
    const id = `${exam_id}-${name}`;

    const { data: section, error } = await supabase
      .from('sections')
      .insert({
        id,
        exam_id,
        name,
        display_name,
        description,
        duration_minutes: duration_minutes || null,
        order_index: order_index || 1,
        is_active: is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating section:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error('Admin sections POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}