import { createClient } from '@/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    const supabase = await createClient();

    // Get user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch courses for the exam
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select(`
        *,
        course_modules:course_modules(
          id,
          name,
          display_name,
          description,
          duration_minutes,
          sort_order,
          is_active,
          course_videos:course_videos(count)
        )
      `)
      .eq('exam_id', examId)
      .eq('is_active', true)
      .order('sort_order');

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      );
    }

    // If user is logged in, get their progress
    let coursesWithProgress = courses;
    if (user) {
      coursesWithProgress = await Promise.all(
        (courses || []).map(async (course) => {
          // Get user's access status
          const { data: access } = await supabase
            .from('user_course_access')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', course.id)
            .single();

          // Get user's progress
          const { data: progress } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', course.id)
            .single();

          // Calculate module stats
          const totalModules = course.course_modules?.length || 0;
          const totalVideos = course.course_modules?.reduce(
            (sum: number, m: any) => sum + (m.course_videos?.[0]?.count || 0),
            0
          ) || 0;

          return {
            ...course,
            hasAccess: !!access || !course.is_premium,
            progress: progress?.progress_percentage || 0,
            totalModules,
            totalVideos,
          };
        })
      );
    } else {
      // For non-logged-in users
      coursesWithProgress = (courses || []).map((course) => ({
        ...course,
        hasAccess: !course.is_premium,
        progress: 0,
        totalModules: course.course_modules?.length || 0,
        totalVideos:
          course.course_modules?.reduce(
            (sum: number, m: any) => sum + (m.course_videos?.[0]?.count || 0),
            0
          ) || 0,
      }));
    }

    return NextResponse.json(coursesWithProgress, {
      headers: {
        'Cache-Control': 'private, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error in courses API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
