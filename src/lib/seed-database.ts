// Database seeding utility
import { createClient } from '@/supabase/server';
import { getMockData } from './dummy-data';

export async function seedDatabase() {
  const supabase = await createClient();
  const mockData = getMockData();

  try {
    console.log('🌱 Starting database seeding...');

    // Check if data already exists
    const { data: existingExams } = await supabase
      .from('exams')
      .select('id')
      .limit(1);

    if (existingExams && existingExams.length > 0) {
      console.log('📊 Database already contains data. Skipping seed.');
      return { success: true, message: 'Database already seeded' };
    }

    // Seed exams
    console.log('📚 Seeding exams...');
    const { error: examError } = await supabase.from('exams').insert(
      mockData.exams.map((exam) => ({
        id: exam.id,
        name: exam.name,
        display_name: exam.display_name,
        description: exam.description,
        duration_minutes: exam.duration_minutes,
        total_score: exam.total_score,
        is_active: exam.is_active,
      }))
    );

    if (examError) {
      console.error('Error seeding exams:', examError);
      throw examError;
    }

    // Seed sections
    console.log('📖 Seeding sections...');
    const sections = mockData.exams.flatMap((exam) =>
      exam.sections.map((section) => ({
        id: section.id,
        exam_id: exam.id,
        name: section.name,
        display_name: section.display_name,
        description: section.description,
        duration_minutes: section.duration_minutes,
        order_index: section.order_index,
        is_active: true,
      }))
    );

    const { error: sectionError } = await supabase
      .from('sections')
      .insert(sections);

    if (sectionError) {
      console.error('Error seeding sections:', sectionError);
      throw sectionError;
    }

    // Seed question types
    console.log('❓ Seeding question types...');
    const questionTypes = mockData.exams.flatMap((exam) =>
      exam.sections.flatMap((section) =>
        section.question_types.map((qt) => ({
          id: qt.id,
          section_id: section.id,
          name: qt.name,
          display_name: qt.display_name,
          description: qt.description,
          input_type: qt.input_type,
          response_type: qt.response_type,
          scoring_method: qt.scoring_method,
          time_limit_seconds: qt.time_limit_seconds,
          order_index: qt.order_index,
          is_active: true,
        }))
      )
    );

    const { error: questionTypeError } = await supabase
      .from('question_types')
      .insert(questionTypes);

    if (questionTypeError) {
      console.error('Error seeding question types:', questionTypeError);
      throw questionTypeError;
    }

    // Seed questions
    console.log('💭 Seeding questions...');
    const { error: questionError } = await supabase.from('questions').insert(
      mockData.questions.map((q) => ({
        id: q.id,
        question_type_id: q.question_type_id,
        title: q.title,
        content: q.content,
        instructions: q.instructions,
        difficulty_level: q.difficulty_level,
        expected_duration_seconds: q.expected_duration_seconds,
        tags: q.tags,
        is_active: q.is_active,
      }))
    );

    if (questionError) {
      console.error('Error seeding questions:', questionError);
      throw questionError;
    }

    // Seed subscription plans
    console.log('💳 Seeding subscription plans...');
    const { error: planError } = await supabase
      .from('subscription_plans')
      .insert(
        mockData.subscriptionPlans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          display_name: plan.display_name,
          description: plan.description,
          exam_id: plan.exam_id,
          price_monthly: plan.price_monthly,
          price_yearly: plan.price_yearly,
          currency: plan.currency,
          mock_tests_limit: plan.mock_tests_limit,
          practice_questions_limit: plan.practice_questions_limit,
          ai_feedback_enabled: plan.ai_feedback_enabled,
          manual_review_enabled: plan.manual_review_enabled,
          trial_days: plan.trial_days,
          is_active: plan.is_active,
          sort_order: plan.sort_order,
        }))
      );

    if (planError) {
      console.error('Error seeding subscription plans:', planError);
      throw planError;
    }

    console.log('✅ Database seeding completed successfully!');
    return {
      success: true,
      message: 'Database seeded successfully',
      stats: {
        exams: mockData.exams.length,
        sections: sections.length,
        questionTypes: questionTypes.length,
        questions: mockData.questions.length,
        subscriptionPlans: mockData.subscriptionPlans.length,
      },
    };
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    return {
      success: false,
      message: 'Database seeding failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Helper function to check if database needs seeding
export async function checkDatabaseStatus() {
  const supabase = await createClient();

  try {
    const [exams, questions, plans] = await Promise.all([
      supabase.from('exams').select('id', { count: 'exact', head: true }),
      supabase.from('questions').select('id', { count: 'exact', head: true }),
      supabase
        .from('subscription_plans')
        .select('id', { count: 'exact', head: true }),
    ]);

    return {
      exams: exams.count || 0,
      questions: questions.count || 0,
      subscriptionPlans: plans.count || 0,
      needsSeeding: (exams.count || 0) === 0,
    };
  } catch (error) {
    console.error('Error checking database status:', error);
    return {
      exams: 0,
      questions: 0,
      subscriptionPlans: 0,
      needsSeeding: true,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
