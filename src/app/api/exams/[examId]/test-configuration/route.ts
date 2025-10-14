import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { 
  AvailableQuestionsResponse, 
  SectionWithQuestionTypes, 
  QuestionTypeWithStats,
  DifficultyLevel 
} from '@/types/test-session';

// GET /api/exams/[examId]/test-configuration - Get exam configuration data for test builder
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const supabase = await createClient();
    const { examId } = await params;
    
    // Get user for personalized stats (optional)
    const { data: { user } } = await supabase.auth.getUser();

    // Validate exam exists and is active
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('id, name, display_name, description, duration_minutes, total_score')
      .eq('id', examId)
      .eq('is_active', true)
      .single();

    if (examError || !exam) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      );
    }

    // Get sections with question types and question counts
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('sections')
      .select(`
        id,
        name,
        display_name,
        description,
        duration_minutes,
        order_index,
        question_types (
          id,
          name,
          display_name,
          description,
          input_type,
          response_type,
          time_limit_seconds,
          order_index,
          questions (
            id,
            difficulty_level,
            expected_duration_seconds
          )
        )
      `)
      .eq('exam_id', examId)
      .eq('is_active', true)
      .eq('question_types.is_active', true)
      .eq('question_types.questions.is_active', true)
      .order('order_index')
      .order('order_index', { referencedTable: 'question_types' });

    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
      return NextResponse.json({ error: sectionsError.message }, { status: 400 });
    }

    // Get user statistics if authenticated
    let userStats: Record<string, any> = {};
    if (user) {
      const { data: userStatsData } = await supabase
        .from('question_attempts')
        .select(`
          question_id,
          final_score,
          submitted_at,
          questions (
            id,
            question_type_id,
            difficulty_level
          )
        `)
        .eq('user_id', user.id)
        .not('final_score', 'is', null);

      // Process user stats by question type
      if (userStatsData) {
        for (const attempt of userStatsData) {
          const question = Array.isArray(attempt.questions) ? attempt.questions[0] : attempt.questions;
          const qtId = question?.question_type_id;
          if (!qtId) continue;

          if (!userStats[qtId]) {
            userStats[qtId] = {
              attempted: 0,
              correct: 0,
              total_score: 0,
              last_attempted: null
            };
          }

          userStats[qtId].attempted++;
          userStats[qtId].total_score += attempt.final_score || 0;
          
          if ((attempt.final_score || 0) >= 0.7) { // Consider 70% as correct
            userStats[qtId].correct++;
          }

          if (!userStats[qtId].last_attempted || 
              attempt.submitted_at > userStats[qtId].last_attempted) {
            userStats[qtId].last_attempted = attempt.submitted_at;
          }
        }
      }
    }

    // Process sections and calculate statistics
    const sections: SectionWithQuestionTypes[] = [];
    let totalQuestions = 0;
    const questionDistribution: Record<string, number> = {};

    for (const section of sectionsData || []) {
      const questionTypes: QuestionTypeWithStats[] = [];
      let sectionTotalQuestions = 0;

      for (const questionType of section.question_types || []) {
        const questions = questionType.questions || [];
        const qtQuestionCount = questions.length;
        
        // Calculate difficulty distribution
        const difficultyDistribution: Record<DifficultyLevel, number> = {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };

        let totalExpectedTime = 0;
        let questionCount = 0;

        for (const question of questions) {
          const difficulty = question.difficulty_level as DifficultyLevel;
          if (difficulty >= 1 && difficulty <= 5) {
            difficultyDistribution[difficulty]++;
          }
          
          totalExpectedTime += question.expected_duration_seconds || 0;
          questionCount++;
        }

        const averageTime = questionCount > 0 ? totalExpectedTime / questionCount : 
                           questionType.time_limit_seconds || 120;

        // Get user stats for this question type
        const qtUserStats = userStats[questionType.id];
        const userStatsForQt = qtUserStats ? {
          attempted: qtUserStats.attempted,
          correct: qtUserStats.correct,
          average_score: qtUserStats.attempted > 0 
            ? qtUserStats.total_score / qtUserStats.attempted 
            : 0,
          last_attempted: qtUserStats.last_attempted
        } : undefined;

        questionTypes.push({
          id: questionType.id,
          name: questionType.name,
          display_name: questionType.display_name,
          description: questionType.description,
          input_type: questionType.input_type,
          response_type: questionType.response_type,
          time_limit_seconds: questionType.time_limit_seconds,
          order_index: questionType.order_index,
          total_questions: qtQuestionCount,
          difficulty_distribution: difficultyDistribution,
          average_completion_time_seconds: averageTime,
          user_stats: userStatsForQt
        });

        sectionTotalQuestions += qtQuestionCount;
        questionDistribution[questionType.name] = qtQuestionCount;
      }

      sections.push({
        id: section.id,
        name: section.name,
        display_name: section.display_name,
        description: section.description,
        duration_minutes: section.duration_minutes,
        order_index: section.order_index,
        question_types: questionTypes,
        total_questions: sectionTotalQuestions
      });

      totalQuestions += sectionTotalQuestions;
    }

    const response: AvailableQuestionsResponse = {
      exam: {
        id: exam.id,
        name: exam.name,
        display_name: exam.display_name
      },
      sections,
      total_questions: totalQuestions,
      question_distribution: questionDistribution
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Test configuration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}