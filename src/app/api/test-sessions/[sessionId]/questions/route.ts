import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

// GET /api/test-sessions/[sessionId]/questions - Fetch questions for a test session
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

    // Verify user owns this session
    const { data: session, error: sessionError } = await supabase
      .from('test_sessions')
      .select('user_id, exam_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch session questions with full question data including ui_component
    const { data: sessionQuestions, error: questionsError } = await supabase
      .from('test_session_questions')
      .select(
        `
        id,
        sequence_number,
        allocated_time_seconds,
        is_attempted,
        is_completed,
        time_spent_seconds,
        questions (
          id,
          title,
          content,
          instructions,
          difficulty_level,
          expected_duration_seconds,
          correct_answer,
          blanks_config,
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
      `
      )
      .eq('session_id', sessionId)
      .order('sequence_number');

    if (questionsError) {
      console.error('Error fetching session questions:', questionsError);
      return NextResponse.json(
        { error: questionsError.message },
        { status: 400 }
      );
    }

    // Transform data for frontend consumption
    const transformedQuestions =
      sessionQuestions?.map((sq) => {
        // Handle the case where questions might be an array (Supabase returns arrays for joins)
        const question = Array.isArray(sq.questions)
          ? sq.questions[0]
          : sq.questions;
        const questionType = Array.isArray(question.question_types)
          ? question.question_types[0]
          : question.question_types;
        const section = Array.isArray(questionType.sections)
          ? questionType.sections[0]
          : questionType.sections;
        const exam = Array.isArray(section.exams)
          ? section.exams[0]
          : section.exams;

        return {
          sessionQuestionId: sq.id,
          sequenceNumber: sq.sequence_number,
          allocatedTimeSeconds: sq.allocated_time_seconds,
          isAttempted: sq.is_attempted,
          isCompleted: sq.is_completed,
          timeSpentSeconds: sq.time_spent_seconds,
          question: {
            id: question.id,
            title: question.title,
            content: question.content,
            instructions: question.instructions,
            difficultyLevel: question.difficulty_level,
            expectedDurationSeconds: question.expected_duration_seconds,
            correctAnswer: question.correct_answer,
            blanksConfig: question.blanks_config,
            questionType: {
              id: questionType.id,
              name: questionType.name,
              displayName: questionType.display_name,
              description: questionType.description,
              inputType: questionType.input_type,
              responseType: questionType.response_type,
              scoringMethod: questionType.scoring_method,
              timeLimitSeconds: questionType.time_limit_seconds,
              uiComponent: questionType.ui_component, // This is the key field!
              section: {
                id: section.id,
                name: section.name,
                displayName: section.display_name,
                exam: {
                  id: exam.id,
                  name: exam.name,
                  displayName: exam.display_name,
                },
              },
            },
            media:
              question.question_media?.map((qm: any) => ({
                id: qm.id,
                role: qm.media_role,
                displayOrder: qm.display_order,
                media: {
                  id: qm.media.id,
                  filename: qm.media.original_filename,
                  fileType: qm.media.file_type,
                  mimeType: qm.media.mime_type,
                  url: qm.media.public_url,
                  durationSeconds: qm.media.duration_seconds,
                  dimensions: qm.media.dimensions,
                },
              })) || [],
            options:
              question.question_options?.map((qo: any) => ({
                id: qo.id,
                text: qo.option_text,
                isCorrect: qo.is_correct,
                displayOrder: qo.display_order,
                mediaId: qo.option_media_id,
              })) || [],
          },
        };
      }) || [];

    return NextResponse.json({
      sessionId,
      examId: session.exam_id,
      questions: transformedQuestions,
      totalQuestions: transformedQuestions.length,
    });
  } catch (error) {
    console.error('Test session questions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
