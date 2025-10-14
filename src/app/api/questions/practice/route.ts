import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionTypeId = searchParams.get('question_type_id');
    const count = parseInt(searchParams.get('count') || '1');

    if (!questionTypeId) {
      return NextResponse.json(
        { error: 'question_type_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's recent attempts to avoid repetition
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentAttempts } = await supabase
      .from('question_attempts')
      .select('question_id')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString());

    const recentQuestionIds = recentAttempts?.map((a) => a.question_id) || [];

    // Get user's average performance for difficulty matching
    const { data: userProgress } = await supabase
      .from('user_progress')
      .select('average_score')
      .eq('user_id', user.id)
      .eq('question_type_id', questionTypeId)
      .single();

    // Determine target difficulty based on performance
    let targetDifficulty = 3; // Default medium
    if (userProgress?.average_score) {
      if (userProgress.average_score >= 80) targetDifficulty = 4;
      else if (userProgress.average_score >= 60) targetDifficulty = 3;
      else if (userProgress.average_score >= 40) targetDifficulty = 2;
      else targetDifficulty = 1;
    }

    // Build query for optimal question selection
    let query = supabase
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
      .eq('is_active', true);

    // Exclude recent questions if any
    if (recentQuestionIds.length > 0) {
      query = query.not('id', 'in', `(${recentQuestionIds.join(',')})`);
    }

    // Prefer target difficulty ±1 level
    query = query
      .gte('difficulty_level', Math.max(1, targetDifficulty - 1))
      .lte('difficulty_level', Math.min(5, targetDifficulty + 1));

    const { data: questions, error } = await query
      .limit(count * 3) // Get more than needed for randomization
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching practice questions:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!questions || questions.length === 0) {
      // Fallback: get any questions for this type
      const { data: fallbackQuestions, error: fallbackError } = await supabase
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
        .limit(count)
        .order('created_at', { ascending: false });

      if (fallbackError) {
        return NextResponse.json(
          { error: fallbackError.message },
          { status: 400 }
        );
      }

      return NextResponse.json(fallbackQuestions || []);
    }

    // Select questions in order (no randomization)
    const selectedQuestions = questions.slice(0, count);

    return NextResponse.json(selectedQuestions);
  } catch (error) {
    console.error('Practice questions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
