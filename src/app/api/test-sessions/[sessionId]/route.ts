import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// GET /api/test-sessions/[sessionId] - Fetch test session with questions
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch test session with all related data
    const { data: session, error } = await supabase
      .from('test_sessions')
      .select(
        `
        *,
        exams (
          id,
          name,
          display_name,
          description,
          duration_minutes,
          total_score,
          is_active,
          created_at,
          updated_at
        ),
        test_session_questions (
          id,
          session_id,
          question_id,
          sequence_number,
          allocated_time_seconds,
          is_attempted,
          is_completed,
          time_spent_seconds,
          question_attempt_id,
          created_at,
          updated_at,
          questions (
            id,
            question_type_id,
            title,
            content,
            instructions,
            difficulty_level,
            expected_duration_seconds,
            correct_answer,
            blanks_config,
            is_active,
            created_at,
            updated_at,
            question_types (
              id,
              name,
              display_name,
              description,
              input_type,
              response_type,
              scoring_method,
              time_limit_seconds,
              ui_component,
              sections (
                id,
                name,
                display_name,
                exams (
                  id,
                  name,
                  display_name
                )
              )
            ),
            question_media (
              id,
              media_role,
              display_order,
              media (
                id,
                original_filename,
                file_type,
                mime_type,
                file_size,
                public_url,
                duration_seconds,
                dimensions
              )
            ),
            question_options (
              id,
              option_text,
              is_correct,
              display_order,
              option_media_id
            )
          )
        )
      `
      )
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Test session not found' }, { status: 404 });
      }
      console.error('Error fetching test session:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Transform the data to match frontend expectations
    const transformedSession = {
      ...session,
      exam: Array.isArray(session.exams) ? session.exams[0] : session.exams, // Supabase returns 'exams' but frontend expects 'exam'
      exams: undefined, // Remove the original 'exams' field
    };

    return NextResponse.json(transformedSession);
  } catch (error) {
    console.error('Test session API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/test-sessions/[sessionId]/start - Start a test session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
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
      .select('user_id, status')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Test session not found' }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (session.status !== 'draft') {
      return NextResponse.json(
        { error: 'Test session is already started or completed' },
        { status: 400 }
      );
    }

    // Start the test session
    const { data: updatedSession, error } = await supabase
      .from('test_sessions')
      .update({
        status: 'active',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error starting test session:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Test session start API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/test-sessions/[sessionId]/pause - Pause a test session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
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
      .select('user_id, status')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Test session not found' }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Pause the test session
    const { data: updatedSession, error } = await supabase
      .from('test_sessions')
      .update({
        status: 'paused',
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error pausing test session:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Test session pause API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/test-sessions/[sessionId]/complete - Complete a test session
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
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
      .select('user_id, status')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Test session not found' }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Complete the test session
    const { data: updatedSession, error } = await supabase
      .from('test_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error completing test session:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Test session complete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}