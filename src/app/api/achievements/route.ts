import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: achievements, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching achievements:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Add achievement metadata for display
    const achievementsWithMeta = achievements.map((achievement) => ({
      ...achievement,
      ...getAchievementMetadata(
        achievement.achievement_type,
        achievement.achievement_data
      ),
    }));

    return NextResponse.json(achievementsWithMeta);
  } catch (error) {
    console.error('Achievements GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getAchievementMetadata(type: string, data: Record<string, unknown>) {
  const metadata: {
    title: string;
    description: string;
    icon: string;
    category: string;
  } = {
    title: '',
    description: '',
    icon: '🏆',
    category: 'general',
  };

  switch (type) {
    case 'first_question':
      metadata.title = 'First Steps';
      metadata.description = 'Completed your first question';
      metadata.icon = '🎯';
      metadata.category = 'milestone';
      break;

    case 'questions_10':
      metadata.title = 'Getting Started';
      metadata.description = 'Completed 10 questions';
      metadata.icon = '📚';
      metadata.category = 'milestone';
      break;

    case 'questions_50':
      metadata.title = 'Dedicated Learner';
      metadata.description = 'Completed 50 questions';
      metadata.icon = '📖';
      metadata.category = 'milestone';
      break;

    case 'questions_100':
      metadata.title = 'Century Club';
      metadata.description = 'Completed 100 questions';
      metadata.icon = '💯';
      metadata.category = 'milestone';
      break;

    case 'questions_500':
      metadata.title = 'Practice Master';
      metadata.description = 'Completed 500 questions';
      metadata.icon = '🎓';
      metadata.category = 'milestone';
      break;

    case 'questions_1000':
      metadata.title = 'Question Conqueror';
      metadata.description = 'Completed 1000 questions';
      metadata.icon = '👑';
      metadata.category = 'milestone';
      break;

    case 'streak_3':
      metadata.title = 'Consistent';
      metadata.description = '3-day practice streak';
      metadata.icon = '🔥';
      metadata.category = 'streak';
      break;

    case 'streak_7':
      metadata.title = 'Weekly Warrior';
      metadata.description = '7-day practice streak';
      metadata.icon = '🔥';
      metadata.category = 'streak';
      break;

    case 'streak_14':
      metadata.title = 'Two Week Champion';
      metadata.description = '14-day practice streak';
      metadata.icon = '🔥';
      metadata.category = 'streak';
      break;

    case 'streak_30':
      metadata.title = 'Monthly Master';
      metadata.description = '30-day practice streak';
      metadata.icon = '🔥';
      metadata.category = 'streak';
      break;

    case 'streak_100':
      metadata.title = 'Streak Legend';
      metadata.description = '100-day practice streak';
      metadata.icon = '🔥';
      metadata.category = 'streak';
      break;

    case 'high_accuracy_80':
      metadata.title = 'Accurate Achiever';
      metadata.description = `${
        data?.accuracy || 80
      }% accuracy (10+ questions)`;
      metadata.icon = '🎯';
      metadata.category = 'performance';
      break;

    case 'high_accuracy_90':
      metadata.title = 'Precision Pro';
      metadata.description = `${
        data?.accuracy || 90
      }% accuracy (10+ questions)`;
      metadata.icon = '🎯';
      metadata.category = 'performance';
      break;

    case 'high_score_70':
      metadata.title = 'Good Score';
      metadata.description = `Scored ${data?.score || 70}+ points`;
      metadata.icon = '⭐';
      metadata.category = 'performance';
      break;

    case 'high_score_80':
      metadata.title = 'Excellent Score';
      metadata.description = `Scored ${data?.score || 80}+ points`;
      metadata.icon = '⭐';
      metadata.category = 'performance';
      break;

    default:
      metadata.title = type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      metadata.description = 'Achievement unlocked';
      break;
  }

  return metadata;
}
