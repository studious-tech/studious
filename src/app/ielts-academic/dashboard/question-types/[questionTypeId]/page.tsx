import { createClient } from '@/supabase/server';
import { redirect } from 'next/navigation';
import { QuestionList } from '@/components/exam/question-list';

export default async function IELTSQuestionTypesPage({
  params
}: {
  params: Promise<{ questionTypeId: string }>;
}) {
  const { questionTypeId } = await params;
  const supabase = await createClient();

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    redirect('/auth/signin');
  }

  // Fetch question type details
  const { data: questionType, error: qtError } = await supabase
    .from('question_types')
    .select(`
      *,
      sections (
        id,
        display_name,
        exams (
          display_name
        )
      )
    `)
    .eq('id', questionTypeId)
    .single();

  if (qtError || !questionType) {
    console.error('Error fetching question type:', qtError);
    return <div className="p-6">Error loading question type</div>;
  }

  // Fetch questions for this question type
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select(`
      *,
      question_media (
        *,
        media (*)
      ),
      question_options (*)
    `)
    .eq('question_type_id', questionTypeId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (questionsError) {
    console.error('Error fetching questions:', questionsError);
    return <div className="p-6">Error loading questions</div>;
  }

  return (
    <div className="space-y-6">
      <QuestionList 
        questions={questions || []} 
        examId="ielts-academic"
        questionTypeId={questionTypeId}
      />
    </div>
  );
}