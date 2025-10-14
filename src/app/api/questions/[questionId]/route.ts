import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// GET /api/questions/[questionId] - Fetch a single question with all related data
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch question with all related data
    const { data: question, error } = await supabase
      .from('questions')
      .select(
        `
        *,
        question_types (
          *,
          sections (
            *,
            exams (*)
          )
        ),
        question_media (
          *,
          media (*)
        ),
        question_options (*)
      `
      )
      .eq('id', questionId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Question not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching question:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Question API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT/PATCH /api/questions/[questionId] - Update a question (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      content,
      instructions,
      difficulty_level,
      expected_duration_seconds,
      is_active,
      question_type_id,
    } = body;

    // Validate required fields
    if (!question_type_id) {
      return NextResponse.json(
        { error: 'question_type_id is required' },
        { status: 400 }
      );
    }

    // Update the question
    const { data: updatedQuestion, error } = await supabase
      .from('questions')
      .update({
        title: title || null,
        content: content || null,
        instructions: instructions || null,
        difficulty_level: difficulty_level || 3,
        expected_duration_seconds: expected_duration_seconds || null,
        is_active: is_active !== undefined ? is_active : true,
        question_type_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', questionId)
      .select(
        `
        *,
        question_types (*),
        question_media (*, media (*)),
        question_options (*)
      `
      )
      .single();

    if (error) {
      console.error('Error updating question:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error('Question update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/questions/[questionId] - Delete a question (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // First check if question exists
    const { data: existingQuestion, error: fetchError } = await supabase
      .from('questions')
      .select('id')
      .eq('id', questionId)
      .single();

    if (fetchError || !existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Delete related data first to avoid foreign key constraint issues
    // Delete question options
    await supabase.from('question_options').delete().eq('question_id', questionId);

    // Delete question media associations
    await supabase.from('question_media').delete().eq('question_id', questionId);

    // Delete question attempts
    const { data: sessionQuestions } = await supabase
      .from('test_session_questions')
      .select('id')
      .eq('question_id', questionId);

    if (sessionQuestions && sessionQuestions.length > 0) {
      const sessionQuestionIds = sessionQuestions.map((sq) => sq.id);
      
      // Delete question attempts
      await supabase
        .from('question_attempts')
        .delete()
        .in('session_question_id', sessionQuestionIds);
    }

    // Delete test session question associations
    await supabase
      .from('test_session_questions')
      .delete()
      .eq('question_id', questionId);

    // Finally delete the question
    const { error } = await supabase.from('questions').delete().eq('id', questionId);

    if (error) {
      console.error('Error deleting question:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Question delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}