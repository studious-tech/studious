import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// POST /api/question-attempts - Create or update a question attempt
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
      questionId,
      sessionQuestionId,
      testSessionId,
      response,
      responseType,
      timeSpentSeconds,
    } = body;

    // Validate required fields
    if (!questionId || !sessionQuestionId || !testSessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: questionId, sessionQuestionId, testSessionId' },
        { status: 400 }
      );
    }

    if (response === undefined || !responseType) {
      return NextResponse.json(
        { error: 'Missing required fields: response, responseType' },
        { status: 400 }
      );
    }

    // Verify user owns the test session
    const { data: session, error: sessionError } = await supabase
      .from('test_sessions')
      .select('user_id')
      .eq('id', testSessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Test session not found' }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify session question exists
    const { data: sessionQuestion, error: sessionQuestionError } = await supabase
      .from('test_session_questions')
      .select('id')
      .eq('id', sessionQuestionId)
      .eq('session_id', testSessionId)
      .eq('question_id', questionId)
      .single();

    if (sessionQuestionError || !sessionQuestion) {
      return NextResponse.json({ error: 'Session question not found' }, { status: 404 });
    }

    // Check if an attempt already exists for this session question
    const { data: existingAttempt, error: existingError } = await supabase
      .from('question_attempts')
      .select('id')
      .eq('session_question_id', sessionQuestionId)
      .eq('user_id', user.id)
      .maybeSingle();

    let attemptId: string;
    let isNewAttempt = false;

    if (existingAttempt) {
      // Update existing attempt
      attemptId = existingAttempt.id;
      
      const updateData: any = {
        response_data: response,
        response_type: responseType,
        time_spent_seconds: timeSpentSeconds || 0,
        updated_at: new Date().toISOString(),
      };

      // Handle different response types
      if (responseType === 'text') {
        updateData.response_text = typeof response === 'string' ? response : JSON.stringify(response);
      } else if (responseType === 'selection') {
        updateData.selected_options = response;
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
        question_id: questionId,
        test_session_id: testSessionId,
        session_question_id: sessionQuestionId,
        response_data: response,
        response_type: responseType,
        time_spent_seconds: timeSpentSeconds || 0,
        started_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
      };

      // Handle different response types
      if (responseType === 'text') {
        insertData.response_text = typeof response === 'string' ? response : JSON.stringify(response);
      } else if (responseType === 'selection') {
        insertData.selected_options = response;
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
          time_spent_seconds: timeSpentSeconds || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionQuestionId);

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