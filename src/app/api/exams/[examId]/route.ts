import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    const supabase = await createClient();

    // Fetch specific exam with sections and question types
    const { data: exam, error } = await supabase
      .from('exams')
      .select(
        `
        *,
        sections (
          *,
          question_types (
            *,
            questions(id)
          )
        )
      `
      )
      .eq('id', examId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
      }
      console.error('Error fetching exam:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Add question counts to question types
    if (exam.sections) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exam.sections = exam.sections.map((section: any) => ({
        ...section,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        question_types: section.question_types.map((qt: any) => ({
          ...qt,
          question_count: qt.questions?.length || 0,
          questions: undefined, // Remove questions array, just keep count
        })),
      }));
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error('Exam API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
