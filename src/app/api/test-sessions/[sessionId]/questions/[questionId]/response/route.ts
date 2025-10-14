import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// POST /api/test-sessions/[sessionId]/questions/[questionId]/response - Save question response
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; questionId: string }> }
) {
  try {
    const { sessionId, questionId } = await params;
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
      response,
      responseType,
      timeSpentSeconds,
    } = body;

    console.log('Response API - Received body:', { response, responseType, timeSpentSeconds });

    // Validate required fields
    if (response === undefined || response === null || !responseType) {
      console.error('Response API - Missing required fields:', { response, responseType });
      return NextResponse.json(
        { error: 'Missing required fields: response, responseType' },
        { status: 400 }
      );
    }

    // Verify user owns this session
    const { data: session, error: sessionError } = await supabase
      .from('test_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Test session not found' }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Find the session question
    const { data: sessionQuestion, error: sessionQuestionError } = await supabase
      .from('test_session_questions')
      .select('id')
      .eq('session_id', sessionId)
      .eq('question_id', questionId)
      .single();

    if (sessionQuestionError || !sessionQuestion) {
      return NextResponse.json({ error: 'Session question not found' }, { status: 404 });
    }

    // Check if an attempt already exists for this session question
    const { data: existingAttempt, error: existingError } = await supabase
      .from('question_attempts')
      .select('id')
      .eq('session_question_id', sessionQuestion.id)
      .eq('user_id', user.id)
      .maybeSingle();

    let attemptId: string;
    let isNewAttempt = false;

    if (existingAttempt) {
      // Update existing attempt
      attemptId = existingAttempt.id;
      
      const updateData: any = {
        response_data: response,
        time_spent_seconds: timeSpentSeconds,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Handle different response types
      if (responseType === 'text') {
        updateData.response_text = typeof response === 'string' ? response : JSON.stringify(response);
      } else if (responseType === 'selection') {
        updateData.selected_options = Array.isArray(response) ? response : [response];
      } else if (responseType === 'media') {
        updateData.response_media_id = response;
      }

      console.log('Response API - Updating attempt:', updateData);

      const { error: updateError } = await supabase
        .from('question_attempts')
        .update(updateData)
        .eq('id', attemptId);

      if (updateError) {
        console.error('Error updating question attempt:', updateError);
        return NextResponse.json({ error: 'Failed to update attempt', details: updateError.message }, { status: 400 });
      }

      console.log('Response API - Attempt updated:', attemptId);
    } else {
      // Create new attempt
      isNewAttempt = true;
      
      const insertData: any = {
        user_id: user.id,
        question_id: questionId,
        test_session_id: sessionId,
        session_question_id: sessionQuestion.id,
        response_data: response,
        time_spent_seconds: timeSpentSeconds,
        started_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        scoring_status: 'pending',
      };

      // Handle different response types
      if (responseType === 'text') {
        insertData.response_text = typeof response === 'string' ? response : JSON.stringify(response);
      } else if (responseType === 'selection') {
        insertData.selected_options = Array.isArray(response) ? response : [response];
      } else if (responseType === 'media') {
        insertData.response_media_id = response;
      }

      console.log('Response API - Inserting attempt:', insertData);

      const { data: newAttempt, error: insertError } = await supabase
        .from('question_attempts')
        .insert(insertData)
        .select('id')
        .single();

      if (insertError) {
        console.error('Error creating question attempt:', insertError);
        console.error('Insert data was:', insertData);
        return NextResponse.json({
          error: 'Failed to save attempt',
          details: insertError.message
        }, { status: 400 });
      }

      console.log('Response API - Attempt created:', newAttempt);

      attemptId = newAttempt.id;

      // Update session question to link to the attempt
      const { error: sessionQuestionError } = await supabase
        .from('test_session_questions')
        .update({
          question_attempt_id: attemptId,
          is_attempted: true,
          time_spent_seconds: timeSpentSeconds,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionQuestion.id);

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
    console.error('Question response API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/test-sessions/[sessionId]/questions/[questionId]/response - Get question response
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string; questionId: string }> }
) {
  try {
    const { sessionId, questionId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns this session
    const { data: session, error: sessionError } = await supabase
      .from('test_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Test session not found' }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Find the session question
    const { data: sessionQuestion, error: sessionQuestionError } = await supabase
      .from('test_session_questions')
      .select('id')
      .eq('session_id', sessionId)
      .eq('question_id', questionId)
      .single();

    if (sessionQuestionError || !sessionQuestion) {
      return NextResponse.json({ error: 'Session question not found' }, { status: 404 });
    }

    // Fetch the attempt
    const { data: attempt, error } = await supabase
      .from('question_attempts')
      .select('*')
      .eq('session_question_id', sessionQuestion.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Attempt not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching question attempt:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(attempt);
  } catch (error) {
    console.error('Question response API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}