import { QuestionDetailEnhanced } from '@/components/exam/question-detail-enhanced';
import { createClient } from '@/supabase/server';
import { cookies } from 'next/headers';

export default async function IELTSPracticeQuestionPage({ 
  params 
}: { 
  params: Promise<{ questionId: string }> 
}) {
  const { questionId } = await params;
  
  if (!questionId) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">No Question Selected</h2>
          <p className="text-gray-500">Please select a question to practice.</p>
        </div>
      </div>
    );
  }

  // Fetch the question
  const cookieStore = cookies();
  const supabase = await createClient();
  
  const { data: question, error } = await supabase
    .from('questions')
    .select(`
      *,
      question_types (
        *,
        sections (
          *,
          exams (*)
        )
      ),
      question_media (
        *,
        media (*)
      ),
      question_options (*)
    `)
    .eq('id', questionId)
    .eq('is_active', true)
    .single();

  if (error || !question) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Question Not Found</h2>
          <p className="text-gray-500">The requested question could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <QuestionDetailEnhanced question={question} examId="ielts-academic" />
    </div>
  );
}