import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// Check if user is enrolled in a specific course
export async function GET(
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

    // Check enrollment status
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('user_course_access')
      .select('id, is_active')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('is_active', true)
      .single();

    if (enrollmentError) {
      // No enrollment found, return false
      return NextResponse.json({ is_enrolled: false });
    }

    return NextResponse.json({ 
      is_enrolled: enrollment.is_active,
      enrollment_id: enrollment.id
    });
  } catch (error) {
    console.error('Enrollment check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}