// app/pte/question-types/practice/page.tsx
import { PTELayout } from '@/components/sections/pte/layout';
import { QuestionDetailEnhanced } from '@/components/exam/question-detail-enhanced';
import { createClient } from '@/supabase/server';
import { cookies } from 'next/headers';

export default async function PTEQuestionPracticePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ id?: string }> 
}) {
  const params = await searchParams;
  const questionId = params.id || '';
  
  if (!questionId) {
    return (
      <PTELayout 
        title="Practice Question" 
        description="Practice this PTE question and improve your skills"
      >
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">No Question Selected</h2>
          <p className="text-gray-500">Please select a question to practice.</p>
        </div>
      </PTELayout>
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
      <PTELayout 
        title="Practice Question" 
        description="Practice this PTE question and improve your skills"
      >
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Question Not Found</h2>
          <p className="text-gray-500">The requested question could not be found.</p>
        </div>
      </PTELayout>
    );
  }

  return (
    <PTELayout 
      title="Practice Question" 
      description="Practice this PTE question and improve your skills"
    >
      <QuestionDetailEnhanced question={question} examId="pte-academic" />
    </PTELayout>
  );
}