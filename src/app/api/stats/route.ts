import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get public platform statistics
    const [
      { count: totalUsers },
      { count: totalQuestions },
      { count: totalAttempts },
      { data: exams },
    ] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('question_attempts')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('exams')
        .select('id, name, display_name')
        .eq('is_active', true),
    ]);

    // Get question counts by exam
    const examStats = await Promise.all(
      (exams || []).map(async (exam) => {
        const { count } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .in(
            'question_type_id',
            await supabase
              .from('question_types')
              .select('id')
              .in(
                'section_id',
                await supabase
                  .from('sections')
                  .select('id')
                  .eq('exam_id', exam.id)
                  .then((res) => res.data?.map((s) => s.id) || [])
              )
              .then((res) => res.data?.map((qt) => qt.id) || [])
          );

        return {
          exam_id: exam.id,
          exam_name: exam.display_name,
          question_count: count || 0,
        };
      })
    );

    return NextResponse.json({
      platform: {
        total_users: totalUsers || 0,
        total_questions: totalQuestions || 0,
        total_attempts: totalAttempts || 0,
        supported_exams: exams?.length || 0,
      },
      exams: examStats,
      last_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
