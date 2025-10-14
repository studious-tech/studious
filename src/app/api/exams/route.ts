import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch exams with their sections and question types
    const { data: exams, error } = await supabase
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
      .eq('is_active', true)
      .order('created_at')
      .order('order_index', { referencedTable: 'sections' })
      .order('order_index', { referencedTable: 'sections.question_types' });

    if (error) {
      console.error('Error fetching exams:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(exams);
  } catch (error) {
    console.error('Exams API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
