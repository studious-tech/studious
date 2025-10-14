import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import {
  CreateTestSessionRequest,
  CreateTestSessionResponse,
  TestSession,
  TestConfigurationForm,
  QuestionSelectionCriteria,
  SelectedQuestion,
} from '@/types/test-session';

// GET /api/test-sessions - Fetch user's test sessions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const examId = searchParams.get('exam_id');
    const status = searchParams.get('status');
    const sessionType = searchParams.get('session_type');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');
    const offset = (page - 1) * perPage;

    // Build query
    let query = supabase
      .from('test_sessions')
      .select(
        `
        *,
        exams!test_sessions_exam_id_fkey (
          id,
          name,
          display_name
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + perPage - 1);

    // Apply filters
    if (examId) {
      query = query.eq('exam_id', examId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (sessionType) {
      query = query.eq('session_type', sessionType);
    }

    const { data: sessions, error: sessionsError, count } = await query;

    if (sessionsError) {
      console.error('Error fetching test sessions:', sessionsError);
      return NextResponse.json(
        { error: sessionsError.message },
        { status: 400 }
      );
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('test_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return NextResponse.json({
      data: sessions || [],
      pagination: {
        page,
        per_page: perPage,
        total: totalCount || 0,
        total_pages: Math.ceil((totalCount || 0) / perPage),
      },
    });
  } catch (error) {
    console.error('Test sessions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/test-sessions - Create new test session
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

    const requestData: CreateTestSessionRequest = await request.json();
    const { exam_id, configuration } = requestData;

    // Validate required fields
    if (!exam_id || !configuration) {
      return NextResponse.json(
        { error: 'Missing required fields: exam_id and configuration' },
        { status: 400 }
      );
    }

    // Validate exam exists
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('id, name, display_name')
      .eq('id', exam_id)
      .eq('is_active', true)
      .single();

    if (examError || !exam) {
      return NextResponse.json({ error: 'Invalid exam ID' }, { status: 400 });
    }

    // Create test session using simple structure
    const sessionData: Partial<TestSession> = {
      user_id: user.id,
      exam_id,
      session_name:
        configuration.session_name || `${exam.display_name} Practice`,
      session_type: configuration.session_type,
      is_timed: configuration.is_timed,
      total_duration_minutes: configuration.total_duration_minutes,
      question_count: configuration.question_count,
      difficulty_levels: configuration.difficulty_levels,
      question_selection_mode: configuration.question_selection_mode,
      include_sections: configuration.selected_sections
        .filter((s) => s.is_selected)
        .map((s) => s.section_id),
      include_question_types: configuration.selected_sections.flatMap((s) =>
        s.question_types
          .filter((qt) => qt.is_selected)
          .map((qt) => qt.question_type_id)
      ),
      session_config: {
        section_weights: configuration.selected_sections
          .filter((s) => s.is_selected)
          .reduce((acc, s) => ({ ...acc, [s.section_id]: s.weight }), {}),
        custom_time_limits: configuration.custom_time_limits,
      },
      status: 'draft',
    };

    const { data: session, error: sessionError } = await supabase
      .from('test_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating test session:', sessionError);
      return NextResponse.json(
        { error: sessionError.message },
        { status: 400 }
      );
    }

    // Select questions for the session
    const selectionCriteria: QuestionSelectionCriteria = {
      exam_id,
      user_id: user.id,
      total_questions: configuration.question_count,
      include_sections: sessionData.include_sections!,
      include_question_types: sessionData.include_question_types!,
      difficulty_levels: configuration.difficulty_levels,
      question_selection_mode: configuration.question_selection_mode,
      section_weights: sessionData.session_config?.section_weights || {},
      maintain_section_balance: true,
      avoid_recent_questions: true,
      recent_questions_threshold_days: 7,
    };

    let selectedQuestions;
    try {
      selectedQuestions = await selectQuestionsForSession(
        supabase,
        selectionCriteria
      );
    } catch (error) {
      // Rollback session creation if question selection fails
      await supabase.from('test_sessions').delete().eq('id', session.id);

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to select questions';
      return NextResponse.json(
        {
          error: 'Unable to create test session',
          message: errorMessage,
          suggestions: [
            'Try selecting different sections or question types',
            'Choose different difficulty levels (1-5)',
            'Use "Mixed" or "All" question selection mode',
            'Reduce the number of questions requested',
          ],
        },
        { status: 400 }
      );
    }

    // Insert selected questions
    const sessionQuestions = selectedQuestions.questions.map((q, index) => ({
      session_id: session.id,
      question_id: q.question_id,
      sequence_number: index + 1,
      allocated_time_seconds: q.allocated_time_seconds,
    }));

    const { data: insertedQuestions, error: questionsError } = await supabase
      .from('test_session_questions')
      .insert(sessionQuestions)
      .select();

    if (questionsError) {
      // Rollback session creation if questions insertion fails
      await supabase.from('test_sessions').delete().eq('id', session.id);
      console.error('Error inserting session questions:', questionsError);
      return NextResponse.json(
        { error: 'Failed to create test session' },
        { status: 500 }
      );
    }

    const response: CreateTestSessionResponse = {
      session: session as TestSession,
      questions: insertedQuestions || [],
      estimated_duration_minutes: Math.ceil(
        selectedQuestions.estimated_total_time_seconds / 60
      ),
      warnings: selectedQuestions.selection_metadata.warnings || [],
      selection_summary: {
        requested_questions: configuration.question_count,
        actual_questions: selectedQuestions.questions.length,
        selection_mode: configuration.question_selection_mode,
        sections_used: Object.keys(
          selectedQuestions.distribution_summary.by_section
        ).length,
        question_types_used: Object.keys(
          selectedQuestions.distribution_summary.by_question_type
        ).length,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Create test session API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Enhanced Question selection algorithm with comprehensive validation
async function selectQuestionsForSession(
  supabase: any,
  criteria: QuestionSelectionCriteria
) {
  const {
    exam_id,
    user_id,
    total_questions,
    include_sections,
    include_question_types,
    difficulty_levels,
    question_selection_mode,
    section_weights,
    avoid_recent_questions,
    recent_questions_threshold_days,
  } = criteria;

  // Validation results to track issues
  const validationIssues: string[] = [];
  const warnings: string[] = [];

  // Base query for available questions
  let questionsQuery = supabase
    .from('questions')
    .select(
      `
      id,
      question_type_id,
      difficulty_level,
      expected_duration_seconds,
      question_types (
        id,
        name,
        section_id,
        time_limit_seconds,
        scoring_method,
        sections (
          id,
          name
        )
      )
    `
    )
    .eq('is_active', true)
    .in('difficulty_level', difficulty_levels);

  // Filter by sections if specified
  if (include_sections.length > 0) {
    questionsQuery = questionsQuery.in(
      'question_types.section_id',
      include_sections
    );
  }

  // Filter by question types if specified
  if (include_question_types.length > 0) {
    questionsQuery = questionsQuery.in(
      'question_type_id',
      include_question_types
    );
  }

  const { data: availableQuestions, error: questionsError } =
    await questionsQuery;

  if (questionsError) {
    throw new Error(`Failed to fetch questions: ${questionsError.message}`);
  }

  if (!availableQuestions || availableQuestions.length === 0) {
    const errorDetails = [];
    if (include_sections.length > 0) {
      errorDetails.push(`Selected sections: ${include_sections.join(', ')}`);
    }
    if (include_question_types.length > 0) {
      errorDetails.push(
        `Selected question types: ${include_question_types.length} types`
      );
    }
    errorDetails.push(`Difficulty levels: ${difficulty_levels.join(', ')}`);

    throw new Error(
      `No questions available for your selection criteria. ${errorDetails.join(
        ' | '
      )}. Please try selecting different sections, question types, or difficulty levels.`
    );
  }

  // Check if we have enough questions for the requested count
  if (availableQuestions.length < total_questions) {
    warnings.push(
      `Only ${availableQuestions.length} questions available, but ${total_questions} requested. Test will be created with ${availableQuestions.length} questions.`
    );
  }

  // Enhanced user-specific filtering with intelligent analysis
  let filteredQuestions = availableQuestions;
  let userAttemptHistory: Record<string, any> = {};
  let recentQuestionIds: Set<string> = new Set();

  // Get comprehensive user attempt history for intelligent selection
  const { data: allAttempts } = await supabase
    .from('question_attempts')
    .select(
      `
      question_id,
      final_score,
      submitted_at,
      time_spent_seconds,
      questions (
        id,
        question_type_id,
        difficulty_level,
        question_types (
          section_id
        )
      )
    `
    )
    .eq('user_id', user_id)
    .not('final_score', 'is', null)
    .order('submitted_at', { ascending: false });

  // Filter recent questions if requested
  if (avoid_recent_questions && recent_questions_threshold_days > 0) {
    const thresholdDate = new Date();
    thresholdDate.setDate(
      thresholdDate.getDate() - recent_questions_threshold_days
    );

    if (allAttempts) {
      for (const attempt of allAttempts) {
        const attemptDate = new Date(attempt.submitted_at);
        if (attemptDate > thresholdDate) {
          recentQuestionIds.add(attempt.question_id);
        }
      }
    }
  }

  // Build user performance profile
  if (allAttempts) {
    for (const attempt of allAttempts) {
      const qId = attempt.question_id;
      if (!userAttemptHistory[qId]) {
        userAttemptHistory[qId] = {
          attempts: 0,
          totalScore: 0,
          bestScore: 0,
          lastAttempted: attempt.submitted_at,
          averageTime: 0,
          totalTime: 0,
          difficulty: attempt.questions?.difficulty_level || 3,
          sectionId: attempt.questions?.question_types?.section_id,
          questionTypeId: attempt.questions?.question_type_id,
        };
      }

      const history = userAttemptHistory[qId];
      history.attempts++;
      history.totalScore += attempt.final_score || 0;
      history.bestScore = Math.max(history.bestScore, attempt.final_score || 0);
      history.totalTime += attempt.time_spent_seconds || 0;
      history.averageTime = history.totalTime / history.attempts;

      // Update last attempted if this is more recent
      if (new Date(attempt.submitted_at) > new Date(history.lastAttempted)) {
        history.lastAttempted = attempt.submitted_at;
      }
    }
  }

  // Apply intelligent question selection based on mode with validation
  if (question_selection_mode === 'new_only') {
    // Get questions user hasn't attempted, excluding recent ones if requested
    const attemptedIds = new Set(Object.keys(userAttemptHistory));
    filteredQuestions = availableQuestions.filter(
      (q: any) => !attemptedIds.has(q.id) && !recentQuestionIds.has(q.id)
    );

    if (filteredQuestions.length === 0) {
      if (attemptedIds.size > 0) {
        throw new Error(
          `No new questions available. You have already attempted all ${attemptedIds.size} available questions in your selected criteria. Please try selecting different sections, question types, or switch to "Mixed" mode to include questions you've attempted before.`
        );
      } else {
        throw new Error(
          'No new questions available for your selection criteria. Please try selecting different sections or question types.'
        );
      }
    }

    if (filteredQuestions.length < total_questions) {
      warnings.push(
        `Only ${filteredQuestions.length} new questions available (you've attempted ${attemptedIds.size} questions). Test will include ${filteredQuestions.length} questions.`
      );
    }
  } else if (question_selection_mode === 'incorrect_only') {
    // Get questions user performed poorly on
    const weakQuestionIds = new Set(
      Object.entries(userAttemptHistory)
        .filter(([_, history]: [string, any]) => {
          const avgScore = history.totalScore / history.attempts;
          // Include questions with average score < 70% OR best score < 60% (definitely need work)
          return avgScore < 0.7 || history.bestScore < 0.6;
        })
        .map(([qId, _]) => qId)
    );
    filteredQuestions = availableQuestions.filter(
      (q: any) => weakQuestionIds.has(q.id) && !recentQuestionIds.has(q.id)
    );

    // If no incorrect questions found, provide detailed feedback
    if (filteredQuestions.length === 0) {
      if (Object.keys(userAttemptHistory).length === 0) {
        throw new Error(
          'No incorrect questions available because you haven\'t attempted any questions yet. Please try "New Only" or "Mixed" mode to start practicing, then return to "Incorrect Only" mode to focus on areas that need improvement.'
        );
      } else {
        const totalAttempted = Object.keys(userAttemptHistory).length;
        const avgScore =
          Object.values(userAttemptHistory).reduce(
            (sum: number, h: any) => sum + h.totalScore / h.attempts,
            0
          ) / totalAttempted;

        throw new Error(
          `Great job! You don't have any incorrect questions to practice. You've attempted ${totalAttempted} questions with an average score of ${Math.round(
            avgScore * 100
          )}%. Try "Mixed" mode to continue practicing or select different sections to find new challenges.`
        );
      }
    }

    if (filteredQuestions.length < total_questions) {
      warnings.push(
        `Only ${filteredQuestions.length} questions need improvement. Test will include ${filteredQuestions.length} questions to focus on your weak areas.`
      );
    }
  } else if (question_selection_mode === 'mixed') {
    // Intelligent mix: 40% new, 35% weak areas, 25% reinforcement
    const attemptedIds = new Set(Object.keys(userAttemptHistory));
    const newQuestions = availableQuestions.filter(
      (q: any) => !attemptedIds.has(q.id) && !recentQuestionIds.has(q.id)
    );

    const weakQuestionIds = new Set(
      Object.entries(userAttemptHistory)
        .filter(([_, history]: [string, any]) => {
          const avgScore = history.totalScore / history.attempts;
          return avgScore < 0.7;
        })
        .map(([qId, _]) => qId)
    );
    const weakQuestions = availableQuestions.filter(
      (q: any) => weakQuestionIds.has(q.id) && !recentQuestionIds.has(q.id)
    );

    const reinforcementIds = new Set(
      Object.entries(userAttemptHistory)
        .filter(([_, history]: [string, any]) => {
          const avgScore = history.totalScore / history.attempts;
          return avgScore >= 0.7 && avgScore < 0.9; // Good but not perfect
        })
        .map(([qId, _]) => qId)
    );
    const reinforcementQuestions = availableQuestions.filter(
      (q: any) => reinforcementIds.has(q.id) && !recentQuestionIds.has(q.id)
    );

    // Calculate target counts with intelligent adjustment (will be adjusted later based on actual availability)
    let newCount = Math.ceil(total_questions * 0.4);
    let weakCount = Math.ceil(total_questions * 0.35);
    let reinforceCount = total_questions - newCount - weakCount;

    // Adjust counts based on availability
    if (newQuestions.length < newCount) {
      const deficit = newCount - newQuestions.length;
      newCount = newQuestions.length;
      weakCount = Math.min(
        weakQuestions.length,
        weakCount + Math.floor(deficit * 0.6)
      );
      reinforceCount = Math.min(
        reinforcementQuestions.length,
        reinforceCount + Math.ceil(deficit * 0.4)
      );
    }

    if (weakQuestions.length < weakCount) {
      const deficit = weakCount - weakQuestions.length;
      weakCount = weakQuestions.length;
      reinforceCount = Math.min(
        reinforcementQuestions.length,
        reinforceCount + deficit
      );
    }

    // Combine questions intelligently
    const selectedNew = newQuestions.slice(
      0,
      Math.min(newCount, newQuestions.length)
    );
    const selectedWeak = weakQuestions.slice(
      0,
      Math.min(weakCount, weakQuestions.length)
    );
    const selectedReinforce = reinforcementQuestions.slice(
      0,
      Math.min(reinforceCount, reinforcementQuestions.length)
    );

    filteredQuestions = [...selectedNew, ...selectedWeak, ...selectedReinforce];

    // Fill remaining slots with any available questions
    const usedIds = new Set(filteredQuestions.map((q: any) => q.id));
    const remainingQuestions = availableQuestions.filter(
      (q: any) => !usedIds.has(q.id) && !recentQuestionIds.has(q.id)
    );
    const needed = total_questions - filteredQuestions.length;
    if (needed > 0) {
      filteredQuestions = [
        ...filteredQuestions,
        ...remainingQuestions.slice(0, needed),
      ];
    }

    // Add warning if mixed mode couldn't get ideal distribution
    if (filteredQuestions.length < total_questions) {
      warnings.push(
        `Mixed mode could only find ${filteredQuestions.length} questions (${selectedNew.length} new, ${selectedWeak.length} to improve, ${selectedReinforce.length} for reinforcement). Consider selecting more sections or question types.`
      );
    }
  }
  // 'all' mode uses all available questions (no filtering)

  // Determine actual question count based on available questions
  const actualQuestionCount = Math.min(
    total_questions,
    filteredQuestions.length
  );

  // Final validation - ensure we have questions after filtering
  if (filteredQuestions.length === 0) {
    throw new Error(
      `No questions available after applying "${question_selection_mode}" filter. This might happen if you've recently attempted all available questions or have excellent performance. Please try a different question selection mode or adjust your criteria.`
    );
  }

  // Add warning if we don't have enough questions
  if (actualQuestionCount < total_questions) {
    warnings.push(
      `Requested ${total_questions} questions, but only ${actualQuestionCount} available. Test will be created with ${actualQuestionCount} questions.`
    );
  }

  // Calculate distribution based on section weights
  const sectionDistribution: Record<string, number> = {};

  // Safety check for section_weights
  if (!section_weights || Object.keys(section_weights).length === 0) {
    // If no weights provided, distribute evenly across included sections
    const availableSections = [
      ...new Set(
        filteredQuestions.map((q: any) => q.question_types.section_id)
      ),
    ];

    if (availableSections.length === 0) {
      throw new Error('No sections available for question selection');
    }

    const evenWeight = Math.floor(
      actualQuestionCount / availableSections.length
    );
    const remainder = actualQuestionCount % availableSections.length;

    availableSections.forEach((sectionId: any, index) => {
      sectionDistribution[sectionId] = evenWeight + (index < remainder ? 1 : 0);
    });
  } else {
    const totalWeight = Object.values(section_weights).reduce(
      (sum, weight) => sum + weight,
      0
    );

    if (totalWeight === 0) {
      // Fallback to even distribution
      const availableSections = Object.keys(section_weights);

      if (availableSections.length === 0) {
        throw new Error('No sections selected for question distribution');
      }

      const evenWeight = Math.floor(
        actualQuestionCount / availableSections.length
      );
      const remainder = actualQuestionCount % availableSections.length;

      availableSections.forEach((sectionId, index) => {
        sectionDistribution[sectionId] =
          evenWeight + (index < remainder ? 1 : 0);
      });
    } else {
      // Use floor + remainder distribution to ensure exact total
      let remainingQuestions = actualQuestionCount;
      const sectionIds = Object.keys(section_weights);

      for (let i = 0; i < sectionIds.length; i++) {
        const sectionId = sectionIds[i];
        const weight = section_weights[sectionId];

        if (i === sectionIds.length - 1) {
          // Last section gets all remaining questions
          sectionDistribution[sectionId] = remainingQuestions;
        } else {
          const baseCount = Math.floor(
            (weight / totalWeight) * actualQuestionCount
          );
          sectionDistribution[sectionId] = baseCount;
          remainingQuestions -= baseCount;
        }
      }
    }
  }

  // Select questions maintaining section distribution
  const selectedQuestions: SelectedQuestion[] = [];
  const usedQuestionIds = new Set<string>();

  // Group questions by section
  const questionsBySection = filteredQuestions.reduce((acc: any, q: any) => {
    const sectionId = q.question_types.section_id;
    if (!acc[sectionId]) acc[sectionId] = [];
    acc[sectionId].push(q);
    return acc;
  }, {} as Record<string, unknown[]>);

  // Validate section distribution and select questions
  for (const [sectionId, targetCount] of Object.entries(sectionDistribution)) {
    const sectionQuestions = questionsBySection[sectionId] || [];

    // Check if section has enough questions
    if (sectionQuestions.length === 0) {
      validationIssues.push(
        `No questions available in selected section "${sectionId}". This section will be skipped.`
      );
      continue;
    }

    if (sectionQuestions.length < targetCount) {
      warnings.push(
        `Section "${sectionId}" has only ${sectionQuestions.length} questions available, but ${targetCount} were requested. Will use all ${sectionQuestions.length} available questions.`
      );
    }

    // Questions are selected in order without randomization
    let selected = 0;
    for (const question of sectionQuestions) {
      if (selected >= targetCount || usedQuestionIds.has(question.id)) continue;

      // Get dynamic time limit based on question type or use reasonable default
      const timeLimit =
        question.question_types.time_limit_seconds ||
        question.expected_duration_seconds ||
        (question.difficulty_level <= 2
          ? 90
          : question.difficulty_level >= 4
          ? 180
          : 120);

      selectedQuestions.push({
        question_id: question.id,
        section_id: sectionId,
        question_type_id: question.question_type_id,
        difficulty_level: question.difficulty_level,
        estimated_time_seconds: question.expected_duration_seconds || timeLimit,
        allocated_time_seconds: timeLimit,
        sequence_number: selectedQuestions.length + 1,
        selection_reason: `Section weight: ${
          section_weights[sectionId] || 'auto'
        }, Mode: ${question_selection_mode}`,
      });

      usedQuestionIds.add(question.id);
      selected++;
    }
  }

  // Fill remaining slots if we haven't reached actualQuestionCount
  if (selectedQuestions.length < actualQuestionCount) {
    const remainingQuestions = filteredQuestions.filter(
      (q: any) => !usedQuestionIds.has(q.id)
    );

    // Remaining questions are selected in order without randomization

    for (const question of remainingQuestions) {
      if (selectedQuestions.length >= actualQuestionCount) break;

      // Get dynamic time limit based on question type or use reasonable default
      const timeLimit =
        question.question_types.time_limit_seconds ||
        question.expected_duration_seconds ||
        (question.difficulty_level <= 2
          ? 90
          : question.difficulty_level >= 4
          ? 180
          : 120);

      selectedQuestions.push({
        question_id: question.id,
        section_id: question.question_types.section_id,
        question_type_id: question.question_type_id,
        difficulty_level: question.difficulty_level,
        estimated_time_seconds: question.expected_duration_seconds || timeLimit,
        allocated_time_seconds: timeLimit,
        sequence_number: selectedQuestions.length + 1,
        selection_reason: 'Fill remaining slots',
      });
    }
  }

  // Ensure sequence numbers are properly set
  selectedQuestions.forEach((q, index) => {
    q.sequence_number = index + 1;
  });

  // Calculate statistics
  const distributionSummary = {
    by_section: selectedQuestions.reduce((acc, q) => {
      acc[q.section_id] = (acc[q.section_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    by_question_type: selectedQuestions.reduce((acc, q) => {
      acc[q.question_type_id] = (acc[q.question_type_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    by_difficulty: selectedQuestions.reduce((acc, q) => {
      acc[q.difficulty_level] = (acc[q.difficulty_level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
  };

  const estimatedTotalTime = selectedQuestions.reduce(
    (sum, q) => sum + q.estimated_time_seconds,
    0
  );

  // Final validation - ensure we have at least some questions
  if (selectedQuestions.length === 0) {
    throw new Error(
      'Unable to create test session. No questions could be selected with your current criteria. Please try: 1) Selecting different sections or question types, 2) Choosing different difficulty levels, 3) Using "Mixed" or "All" question selection mode.'
    );
  }

  // Minimum question threshold
  if (selectedQuestions.length < Math.min(5, actualQuestionCount * 0.5)) {
    throw new Error(
      `Only ${selectedQuestions.length} questions could be selected, which is too few for a meaningful test. Please adjust your selection criteria to include more sections, question types, or difficulty levels.`
    );
  }

  return {
    questions: selectedQuestions,
    distribution_summary: distributionSummary,
    estimated_total_time_seconds: estimatedTotalTime,
    selection_metadata: {
      total_available: availableQuestions.length,
      filtered_count: filteredQuestions.length,
      selection_strategy: question_selection_mode,
      weights_applied: section_weights,
      actual_question_count: selectedQuestions.length,
      requested_question_count: total_questions,
      warnings: warnings,
      validation_issues: validationIssues,
    },
  };
}
