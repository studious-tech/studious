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

    const { data: courses, error } = await supabase
      .from('courses')
      .select(
        `
        *,
        exam:exams (id, name, display_name),
        modules:course_modules (
          id,
          name,
          display_name,
          is_active,
          videos:course_videos (
            id,
            name,
            display_name,
            duration_seconds,
            is_active
          )
        ),
        materials:course_materials (
          id,
          name,
          display_name,
          file_type,
          file_size,
          is_active
        )
      `
      )
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Admin courses GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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
    const {
      exam_id,
      name,
      display_name,
      description,
      thumbnail_media_id,
      difficulty_level,
      duration_minutes,
      is_active,
      is_premium,
      sort_order,
    } = body;

    if (!exam_id || !name || !display_name) {
      return NextResponse.json(
        { error: 'exam_id, name and display_name are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Generate ID from exam_id and name
    const id = `${exam_id}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        id,
        exam_id,
        name,
        display_name,
        description,
        thumbnail_media_id: thumbnail_media_id || null,
        difficulty_level: difficulty_level || 1,
        duration_minutes: duration_minutes || null,
        is_active: is_active ?? true,
        is_premium: is_premium ?? false,
        sort_order: sort_order || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Admin courses POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
