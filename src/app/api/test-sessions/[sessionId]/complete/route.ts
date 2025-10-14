import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// POST /api/test-sessions/[sessionId]/complete - Complete a test session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const supabase = await createClient();
    const { sessionId } = await params;

    console.log('Complete API - Session ID:', sessionId);

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Complete API - Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Complete API - User ID:', user.id);

    // Get session info
    const { data: session, error: sessionError } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      console.error('Complete API - Session not found:', sessionError);
      return NextResponse.json(
        { error: 'Test session not found', details: sessionError?.message },
        { status: 404 }
      );
    }

    console.log('Complete API - Session found:', session.id, 'Status:', session.status);

    // Validate session can be completed
    if (session.status !== 'active') {
      console.error('Complete API - Invalid status:', session.status);
      return NextResponse.json(
        { error: `Cannot complete session with status: ${session.status}` },
        { status: 400 }
      );
    }

    // Simply mark session as completed
    console.log('Complete API - Updating session status to completed');

    const { data: updatedSession, error: updateError } = await supabase
      .from('test_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Complete API - Error updating session:', updateError);
      return NextResponse.json({ error: updateError.message, details: updateError }, { status: 400 });
    }

    console.log('Complete API - Session completed successfully:', updatedSession.id);

    return NextResponse.json({
      session: updatedSession,
      message: 'Test session completed successfully'
    });

  } catch (error) {
    console.error('Complete test session API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
