import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// GET /api/question-attempts - Fetch question attempts for a user
// GET /api/question-attempts/[attemptId] - Fetch a single question attempt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId?: string }> }
) {
  try {
    const { attemptId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If attemptId is provided, fetch a single question attempt
    if (attemptId) {
      // Fetch the attempt with related data
      const { data: attempt, error } = await supabase
        .from('question_attempts')
        .select(
          `
          *,
          questions (
            id,
            title,
            content,
            instructions,
            difficulty_level,
            expected_duration_seconds,
            correct_answer,
            question_types (
              id,
              display_name,
              sections (
                id,
                display_name,
                exams (
                  id,
                  display_name
                )
              )
            )
          ),
          test_sessions (
            id,
            session_name,
            exams (
              id,
              display_name
            )
          )
        `
        )
        .eq('id', attemptId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
        }
        console.error('Error fetching question attempt:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json(attempt);
    }

    // Otherwise, fetch question attempts for a user (collection)
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const testSessionId = searchParams.get('test_session_id');
    const questionId = searchParams.get('question_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('question_attempts')
      .select(
        `
        *,
        questions (
          id,
          title,
          content,
          instructions,
          difficulty_level,
          expected_duration_seconds,
          question_types (
            id,
            display_name,
            sections (
              id,
              display_name,
              exams (
                id,
                display_name
              )
            )
          )
        ),
        test_sessions (
          id,
          session_name,
          exams (
            id,
            display_name
          )
        )
      `
      )
      .eq('user_id', user.id)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (testSessionId) {
      query = query.eq('test_session_id', testSessionId);
    }

    if (questionId) {
      query = query.eq('question_id', questionId);
    }

    const { data: attempts, error } = await query;

    if (error) {
      console.error('Error fetching question attempts:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(attempts || []);
  } catch (error) {
    console.error('Question attempts API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/question-attempts - Create a new question attempt
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      question_id,
      session_question_id,
      test_session_id,
      response_data,
      response_type,
      time_spent_seconds,
    } = body;

    // Validate required fields
    if (!question_id || !session_question_id || !test_session_id) {
      return NextResponse.json(
        { error: 'Missing required fields: question_id, session_question_id, test_session_id' },
        { status: 400 }
      );
    }

    if (response_data === undefined || !response_type) {
      return NextResponse.json(
        { error: 'Missing required fields: response_data, response_type' },
        { status: 400 }
      );
    }

    // Verify user owns the test session
    const { data: session, error: sessionError } = await supabase
      .from('test_sessions')
      .select('user_id')
      .eq('id', test_session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Test session not found' }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if an attempt already exists for this session question
    const { data: existingAttempt, error: existingError } = await supabase
      .from('question_attempts')
      .select('id')
      .eq('session_question_id', session_question_id)
      .eq('user_id', user.id)
      .maybeSingle();

    let attemptId: string;
    let isNewAttempt = false;

    if (existingAttempt) {
      // Update existing attempt
      attemptId = existingAttempt.id;
      
      const updateData: any = {
        response_data: response_data,
        response_type: response_type,
        time_spent_seconds: time_spent_seconds || 0,
        updated_at: new Date().toISOString(),
      };

      // Handle different response types
      if (response_type === 'text') {
        updateData.response_text = typeof response_data === 'string' ? response_data : JSON.stringify(response_data);
      } else if (response_type === 'selection') {
        updateData.selected_options = response_data;
      }

      const { error: updateError } = await supabase
        .from('question_attempts')
        .update(updateData)
        .eq('id', attemptId);

      if (updateError) {
        console.error('Error updating question attempt:', updateError);
        return NextResponse.json({ error: 'Failed to update attempt' }, { status: 400 });
      }
    } else {
      // Create new attempt
      isNewAttempt = true;
      
      const insertData: any = {
        user_id: user.id,
        question_id: question_id,
        test_session_id: test_session_id,
        session_question_id: session_question_id,
        response_data: response_data,
        response_type: response_type,
        time_spent_seconds: time_spent_seconds || 0,
        started_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
      };

      // Handle different response types
      if (response_type === 'text') {
        insertData.response_text = typeof response_data === 'string' ? response_data : JSON.stringify(response_data);
      } else if (response_type === 'selection') {
        insertData.selected_options = response_data;
      }

      const { data: newAttempt, error: insertError } = await supabase
        .from('question_attempts')
        .insert(insertData)
        .select('id')
        .single();

      if (insertError) {
        console.error('Error creating question attempt:', insertError);
        return NextResponse.json({ error: 'Failed to save attempt' }, { status: 400 });
      }

      attemptId = newAttempt.id;

      // Update session question to link to the attempt
      const { error: sessionQuestionError } = await supabase
        .from('test_session_questions')
        .update({
          question_attempt_id: attemptId,
          is_attempted: true,
          time_spent_seconds: time_spent_seconds || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session_question_id);

      if (sessionQuestionError) {
        console.error('Error updating session question:', sessionQuestionError);
        // Don't fail the whole operation, but log the error
      }
    }

    return NextResponse.json({
      success: true,
      attemptId,
      isNew: isNewAttempt,
      message: isNewAttempt ? 'Attempt saved successfully' : 'Attempt updated successfully',
    });
  } catch (error) {
    console.error('Question attempt API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/question-attempts/[attemptId] - Update a question attempt
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns this attempt
    const { data: existingAttempt, error: existingError } = await supabase
      .from('question_attempts')
      .select('user_id')
      .eq('id', attemptId)
      .single();

    if (existingError || !existingAttempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (existingAttempt.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const {
      response_data,
      response_type,
      time_spent_seconds,
    } = body;

    // Validate required fields
    if (response_data === undefined || !response_type) {
      return NextResponse.json(
        { error: 'Missing required fields: response_data, response_type' },
        { status: 400 }
      );
    }

    // Update the attempt
    const updateData: any = {
      response_data: response_data,
      response_type: response_type,
      time_spent_seconds: time_spent_seconds || 0,
      updated_at: new Date().toISOString(),
    };

    // Handle different response types
    if (response_type === 'text') {
      updateData.response_text = typeof response_data === 'string' ? response_data : JSON.stringify(response_data);
    } else if (response_type === 'selection') {
      updateData.selected_options = response_data;
    }

    const { data: updatedAttempt, error } = await supabase
      .from('question_attempts')
      .update(updateData)
      .eq('id', attemptId)
      .select(
        `
        *,
        questions (
          id,
          title,
          content,
          instructions,
          difficulty_level,
          expected_duration_seconds,
          question_types (
            id,
            display_name,
            sections (
              id,
              display_name,
              exams (
                id,
                display_name
              )
            )
          )
        ),
        test_sessions (
          id,
          session_name,
          exams (
            id,
            display_name
          )
        )
      `
      )
      .single();

    if (error) {
      console.error('Error updating question attempt:', error);
      return NextResponse.json({ error: 'Failed to update attempt' }, { status: 400 });
    }

    return NextResponse.json(updatedAttempt);
  } catch (error) {
    console.error('Question attempt update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/question-attempts/[attemptId] - Delete a question attempt
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns this attempt
    const { data: existingAttempt, error: existingError } = await supabase
      .from('question_attempts')
      .select('user_id')
      .eq('id', attemptId)
      .single();

    if (existingError || !existingAttempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (existingAttempt.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete the attempt
    const { error } = await supabase
      .from('question_attempts')
      .delete()
      .eq('id', attemptId);

    if (error) {
      console.error('Error deleting question attempt:', error);
      return NextResponse.json({ error: 'Failed to delete attempt' }, { status: 400 });
    }

    // Update session question to unlink the attempt
    const { error: sessionQuestionError } = await supabase
      .from('test_session_questions')
      .update({
        question_attempt_id: null,
        is_attempted: false,
        time_spent_seconds: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('question_attempt_id', attemptId);

    if (sessionQuestionError) {
      console.error('Error updating session question:', sessionQuestionError);
      // Don't fail the whole operation, but log the error
    }

    return NextResponse.json({ message: 'Attempt deleted successfully' });
  } catch (error) {
    console.error('Question attempt delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}