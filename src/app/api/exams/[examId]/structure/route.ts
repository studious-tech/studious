import { createClient } from '@/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    const supabase = await createClient();

    // Get exam details
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .eq('is_active', true)
      .single();

    if (examError || !exam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      );
    }

    // Get sections with question types and counts
    const { data: sections, error: sectionsError } = await supabase
      .from('sections')
      .select(`
        *,
        question_types:question_types(
          id,
          name,
          display_name,
          description,
          time_limit_seconds,
          order_index,
          is_active
        )
      `)
      .eq('exam_id', examId)
      .eq('is_active', true)
      .order('order_index');

    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
      return NextResponse.json(
        { error: 'Failed to fetch exam structure' },
        { status: 500 }
      );
    }

    // Get question counts for each question type
    const sectionsWithCounts = await Promise.all(
      (sections || []).map(async (section) => {
        const questionTypesWithCounts = await Promise.all(
          (section.question_types || []).map(async (qt: any) => {
            const { count } = await supabase
              .from('questions')
              .select('*', { count: 'exact', head: true })
              .eq('question_type_id', qt.id)
              .eq('is_active', true);

            return {
              ...qt,
              questionCount: count || 0,
            };
          })
        );

        return {
          ...section,
          question_types: questionTypesWithCounts.sort(
            (a, b) => a.order_index - b.order_index
          ),
          totalQuestions: questionTypesWithCounts.reduce(
            (sum, qt) => sum + qt.questionCount,
            0
          ),
        };
      })
    );

    const totalQuestions = sectionsWithCounts.reduce(
      (sum, section) => sum + section.totalQuestions,
      0
    );

    const structure = {
      exam: {
        ...exam,
        totalQuestions,
        totalSections: sectionsWithCounts.length,
        totalQuestionTypes: sectionsWithCounts.reduce(
          (sum, s) => sum + (s.question_types?.length || 0),
          0
        ),
      },
      sections: sectionsWithCounts,
    };

    return NextResponse.json(structure, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error in exam structure API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
