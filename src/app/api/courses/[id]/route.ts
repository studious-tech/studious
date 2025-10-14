import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch specific course with modules, videos, and materials
    const { data: course, error } = await supabase
      .from('courses')
      .select(
        `
        *,
        exam:exams (name, display_name),
        modules:course_modules (
          *,
          videos:course_videos (*)
        ),
        materials:course_materials (*)
      `
      )
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }
      console.error('Error fetching course:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check enrollment for premium courses
    if (course.is_premium && user) {
      // Check if user has an active premium subscription for this exam
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select(
          `
          id,
          plan:subscription_plans (id, exam_id)
        `
        )
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .single();

      // Check if user is enrolled in this course
      const { data: enrollment } = await supabase
        .from('user_course_access')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .eq('is_active', true)
        .single();

      // User needs either a subscription or enrollment for premium courses
      if (!subscription && !enrollment) {
        return NextResponse.json(
          { error: 'Premium subscription or course enrollment required' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Course API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}