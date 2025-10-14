import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// POST /api/test-sessions/[sessionId]/start - Start a test session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const supabase = await createClient();
    const { sessionId } = await params;
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate session exists and user owns it
    const { data: session, error: sessionError } = await supabase
      .from('test_sessions')
      .select('id, user_id, status, is_timed, total_duration_minutes')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Test session not found' },
        { status: 404 }
      );
    }

    // Check if session can be started
    if (session.status !== 'draft') {
      return NextResponse.json(
        { error: `Cannot start session with status: ${session.status}` },
        { status: 400 }
      );
    }

    // Update session to active status
    const { data: updatedSession, error: updateError } = await supabase
      .from('test_sessions')
      .update({
        status: 'active',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error starting test session:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Calculate session expiry for timed sessions
    const sessionData = {
      ...updatedSession,
      expires_at: session.is_timed && session.total_duration_minutes
        ? new Date(Date.now() + session.total_duration_minutes * 60 * 1000).toISOString()
        : null
    };

    return NextResponse.json({
      session: sessionData,
      message: 'Test session started successfully'
    });

  } catch (error) {
    console.error('Start test session API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}