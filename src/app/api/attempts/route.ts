import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { updateUserProgress } from '@/lib/progress';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('question_id');
    const limit = searchParams.get('limit') || '10';

    let query = supabase
      .from('question_attempts')
      .select(
        `
        *,
        questions (
          id,
          title,
          content,
          question_type_id
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (questionId) {
      query = query.eq('question_id', questionId);
    }

    const { data: attempts, error } = await query.limit(parseInt(limit));

    if (error) {
      console.error('Error fetching attempts:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(attempts);
  } catch (error) {
    console.error('Attempts GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
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
      response_text = null,
      selected_options = null,
      time_spent_seconds = null,
    } = body;

    if (!question_id) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }

    // Check if question exists and is active
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('id, is_active')
      .eq('id', question_id)
      .eq('is_active', true)
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        { error: 'Question not found or inactive' },
        { status: 404 }
      );
    }

    // Create the attempt
    const { data: attempt, error } = await supabase
      .from('question_attempts')
      .insert({
        user_id: user.id,
        question_id,
        response_text,
        selected_options,
        started_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        time_spent_seconds,
        scoring_status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating attempt:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Update progress tracking
    try {
      await updateUserProgress({
        userId: user.id,
        questionId: question_id,
        timeSpentSeconds: time_spent_seconds || 0,
        // isCorrect and score will be updated when AI scoring completes
      });
    } catch (progressError) {
      console.error('Error updating progress:', progressError);
      // Don't fail the attempt creation if progress update fails
    }

    return NextResponse.json(attempt);
  } catch (error) {
    console.error('Attempts POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
