import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch active courses with their exams
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
        )
      `
      )
      .eq('is_active', true)
      .order('sort_order')
      .order('created_at');

    if (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Courses API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}