import { QuestionTypeDetail } from '@/components/dashboard/question-type-detail';
import { createClient } from '@/supabase/server';

export default async function QuestionTypePage({ 
  params 
}: { 
  params: Promise<{ questionTypeId: string }>;
}) {
  const { questionTypeId } = await params;
  const supabase = await createClient();

  // Fetch the question type with questions
  const { data: questionType, error } = await supabase
    .from('question_types')
    .select(`
      *,
      questions (
        id,
        title,
        content,
        difficulty_level,
        expected_duration_seconds,
        is_active,
        created_at,
        updated_at
      ),
      sections (
        *,
        exams (*)
      )
    `)
    .eq('id', questionTypeId)
    .eq('is_active', true)
    .single();

  if (error || !questionType) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Question Type Not Found</h2>
          <p className="text-gray-500">The requested question type could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <QuestionTypeDetail questionType={questionType} examId="pte-academic" />
    </div>
  );
}