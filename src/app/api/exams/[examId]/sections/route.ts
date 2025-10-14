import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    const supabase = await createClient();

    // Fetch sections for the exam
    const { data: sections, error } = await supabase
      .from('sections')
      .select(
        `
        *,
        question_types (
          *,
          questions(id)
        )
      `
      )
      .eq('exam_id', examId)
      .eq('is_active', true)
      .order('order_index');

    if (error) {
      console.error('Error fetching sections:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Add question counts to question types
    const sectionsWithCounts = sections.map((section) => ({
      ...section,
      question_types: section.question_types?.map((qt: any) => ({
        ...qt,
        question_count: qt.questions?.length || 0,
        questions: undefined, // Remove questions array, just keep count
      })),
    }));

    return NextResponse.json(sectionsWithCounts);
  } catch (error) {
    console.error('Sections API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}