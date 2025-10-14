import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ examId: string; sectionId: string; questionTypeId: string }> }
) {
  try {
    const { examId, sectionId, questionTypeId } = await params;
    const supabase = await createClient();

    // Fetch questions for the question type
    const { data: questions, error } = await supabase
      .from('questions')
      .select(
        `
        *,
        question_media (
          *,
          media (*)
        ),
        question_options (*)
      `
      )
      .eq('question_type_id', questionTypeId)
      .eq('is_active', true)
      .order('created_at');

    if (error) {
      console.error('Error fetching questions:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Questions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}