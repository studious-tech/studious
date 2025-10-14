import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// Enroll user in a course
export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const supabase = await createClient();

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if course exists and is active
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, is_active, is_premium, exam_id')
      .eq('id', courseId)
      .eq('is_active', true)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found or inactive' }, { status: 404 });
    }

    // Check if user is already enrolled
    const { data: existingEnrollment } = await supabase
      .from('user_course_access')
      .select('id, is_active')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('is_active', true)
      .single();

    if (existingEnrollment) {
      return NextResponse.json({ message: 'Already enrolled in this course' }, { status: 200 });
    }

    // For premium courses, check if user has valid subscription
    if (course.is_premium) {
      const { data: subscription, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          plan:subscription_plans (id, exam_id)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .single();

      if (subscriptionError || !subscription || (subscription as any).plan?.exam_id !== course.exam_id) {
        return NextResponse.json(
          { error: 'Premium subscription required for this course' },
          { status: 403 }
        );
      }
    }

    // Create enrollment record
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('user_course_access')
      .insert({
        user_id: user.id,
        course_id: courseId,
        access_type: 'enrolled',
        granted_at: new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (enrollmentError) {
      console.error('Enrollment creation error:', enrollmentError);
      return NextResponse.json(
        { error: enrollmentError.message || 'Failed to enroll in course' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: 'Successfully enrolled in course',
      enrollment_id: enrollment.id
    });
  } catch (error) {
    console.error('Course enrollment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}