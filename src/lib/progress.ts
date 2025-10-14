import { createClient } from '@/supabase/server';

interface ProgressUpdateData {
  userId: string;
  questionId: string;
  timeSpentSeconds?: number;
  isCorrect?: boolean;
  score?: number;
}

export async function updateUserProgress({
  userId,
  questionId,
  timeSpentSeconds = 0,
  isCorrect = false,
  score,
}: ProgressUpdateData) {
  const supabase = await createClient();

  try {
    // Get question details with hierarchy
    const { data: questionDetails, error: questionError } = await supabase
      .from('questions')
      .select(
        `
        id,
        question_type_id,
        question_types (
          id,
          section_id,
          sections (
            id,
            exam_id
          )
        )
      `
      )
      .eq('id', questionId)
      .single();

    if (questionError || !questionDetails?.question_types) {
      console.error('Error fetching question details:', questionError);
      return;
    }

    // Handle the nested structure from Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questionType = questionDetails.question_types as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const section = questionType.sections as any;

    const examId = section.exam_id;
    const sectionId = questionType.section_id;
    const questionTypeId = questionDetails.question_type_id;
    const timeMinutes = Math.round(timeSpentSeconds / 60);

    // Get current progress
    const { data: currentProgress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('exam_id', examId)
      .eq('section_id', sectionId)
      .eq('question_type_id', questionTypeId)
      .single();

    // Calculate new values
    const questionsAttempted = (currentProgress?.questions_attempted || 0) + 1;
    const questionsCorrect =
      (currentProgress?.questions_correct || 0) + (isCorrect ? 1 : 0);
    const totalTimeSpent =
      (currentProgress?.total_time_spent_minutes || 0) + timeMinutes;

    // Calculate new average score
    let newAverageScore = currentProgress?.average_score || null;
    if (score !== undefined) {
      if (newAverageScore === null) {
        newAverageScore = score;
      } else {
        // Weighted average: (old_avg * old_count + new_score) / new_count
        const oldCount = currentProgress?.questions_attempted || 0;
        newAverageScore =
          (newAverageScore * oldCount + score) / questionsAttempted;
      }
    }

    // Calculate new best score
    let newBestScore = currentProgress?.best_score || null;
    if (score !== undefined) {
      newBestScore =
        newBestScore === null ? score : Math.max(newBestScore, score);
    }

    // Update streak logic
    const today = new Date().toDateString();
    const lastActivity = currentProgress?.last_activity_at
      ? new Date(currentProgress.last_activity_at).toDateString()
      : null;

    let currentStreak = currentProgress?.current_streak_days || 0;
    let longestStreak = currentProgress?.longest_streak_days || 0;

    if (lastActivity !== today) {
      // New day activity
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastActivity === yesterdayStr) {
        // Consecutive day - increment streak
        currentStreak += 1;
      } else if (lastActivity !== null) {
        // Gap in activity - reset streak
        currentStreak = 1;
      } else {
        // First activity
        currentStreak = 1;
      }

      longestStreak = Math.max(longestStreak, currentStreak);
    }

    // Upsert progress record
    const { error: upsertError } = await supabase.from('user_progress').upsert(
      {
        user_id: userId,
        exam_id: examId,
        section_id: sectionId,
        question_type_id: questionTypeId,
        questions_attempted: questionsAttempted,
        questions_correct: questionsCorrect,
        average_score: newAverageScore,
        best_score: newBestScore,
        total_time_spent_minutes: totalTimeSpent,
        current_streak_days: currentStreak,
        longest_streak_days: longestStreak,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,exam_id,section_id,question_type_id',
        ignoreDuplicates: false,
      }
    );

    if (upsertError) {
      console.error('Error upserting progress:', upsertError);
      return;
    }

    // Check for achievements
    await checkAndAwardAchievements(userId, {
      questionsAttempted,
      questionsCorrect,
      currentStreak,
      longestStreak,
      averageScore: newAverageScore,
      bestScore: newBestScore,
    });

    return {
      questionsAttempted,
      questionsCorrect,
      averageScore: newAverageScore,
      bestScore: newBestScore,
      currentStreak,
      longestStreak,
    };
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
}

interface AchievementCheckData {
  questionsAttempted: number;
  questionsCorrect: number;
  currentStreak: number;
  longestStreak: number;
  averageScore: number | null;
  bestScore: number | null;
}

async function checkAndAwardAchievements(
  userId: string,
  data: AchievementCheckData
) {
  const supabase = await createClient();

  const achievements = [];

  // First question achievement
  if (data.questionsAttempted === 1) {
    achievements.push({
      achievement_type: 'first_question',
      achievement_data: { timestamp: new Date().toISOString() },
    });
  }

  // Question milestones
  const questionMilestones = [10, 50, 100, 500, 1000];
  for (const milestone of questionMilestones) {
    if (data.questionsAttempted === milestone) {
      achievements.push({
        achievement_type: `questions_${milestone}`,
        achievement_data: { count: milestone },
      });
    }
  }

  // Streak achievements
  const streakMilestones = [3, 7, 14, 30, 100];
  for (const milestone of streakMilestones) {
    if (data.currentStreak === milestone) {
      achievements.push({
        achievement_type: `streak_${milestone}`,
        achievement_data: { days: milestone },
      });
    }
  }

  // Accuracy achievements
  if (data.questionsAttempted >= 10 && data.averageScore !== null) {
    const accuracy = (data.questionsCorrect / data.questionsAttempted) * 100;
    if (accuracy >= 90) {
      achievements.push({
        achievement_type: 'high_accuracy_90',
        achievement_data: { accuracy: Math.round(accuracy) },
      });
    } else if (accuracy >= 80) {
      achievements.push({
        achievement_type: 'high_accuracy_80',
        achievement_data: { accuracy: Math.round(accuracy) },
      });
    }
  }

  // Score achievements (for PTE/IELTS)
  if (data.bestScore !== null) {
    if (data.bestScore >= 80) {
      achievements.push({
        achievement_type: 'high_score_80',
        achievement_data: { score: data.bestScore },
      });
    } else if (data.bestScore >= 70) {
      achievements.push({
        achievement_type: 'high_score_70',
        achievement_data: { score: data.bestScore },
      });
    }
  }

  // Insert achievements (ignore duplicates)
  for (const achievement of achievements) {
    try {
      await supabase.from('user_achievements').insert({
        user_id: userId,
        ...achievement,
      });
    } catch {
      // Ignore duplicate key errors
      console.log('Achievement already exists:', achievement.achievement_type);
    }
  }
}
