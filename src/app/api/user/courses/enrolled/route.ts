import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// Get all enrolled courses for the user
export async function GET() {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get enrolled courses
    const { data: enrolledCourses, error: coursesError } = await supabase
      .from('user_course_access')
      .select(`
        id,
        course:courses (
          *,
          exam:exams (name, display_name),
          modules:course_modules (
            *,
            videos:course_videos (*)
          ),
          materials:course_materials (*)
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('granted_at', { ascending: false });

    if (coursesError) {
      console.error('Enrolled courses fetch error:', coursesError);
      return NextResponse.json(
        { error: coursesError.message || 'Failed to fetch enrolled courses' },
        { status: 400 }
      );
    }

    // Extract course objects from the nested structure
    const courses = enrolledCourses.map((item: any) => item.course);

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Enrolled courses API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}