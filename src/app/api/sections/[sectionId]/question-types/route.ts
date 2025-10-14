import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const { sectionId } = await params;
    const supabase = await createClient();

    // Fetch question types for the section
    const { data: questionTypes, error } = await supabase
      .from('question_types')
      .select(
        `
        *,
        sections (
          id,
          name,
          display_name,
          exams (
            id,
            name,
            display_name
          )
        ),
        questions!inner(id)
      `
      )
      .eq('section_id', sectionId)
      .eq('is_active', true)
      .order('order_index');

    if (error) {
      console.error('Error fetching question types:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Add question counts and clean up data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questionTypesWithCounts = questionTypes.map((qt: any) => ({
      ...qt,
      question_count: qt.questions?.length || 0,
      questions: undefined, // Remove questions array, just keep count
    }));

    return NextResponse.json(questionTypesWithCounts);
  } catch (error) {
    console.error('Question types API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
