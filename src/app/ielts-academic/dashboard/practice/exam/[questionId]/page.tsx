'use client';

import { useState, useEffect } from 'react';
import { ExamLayout } from '@/components/exam/exam-layout';
import { createClient } from '@/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function IELTSExamAttemptPage({ 
  params 
}: { 
  params: Promise<{ questionId: string }> 
}) {
  const router = useRouter();
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [totalQuestions] = useState(10); // In a real app, this would come from the exam data

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params;
      setQuestionId(unwrappedParams.questionId);
    };
    
    unwrapParams();
  }, [params]);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!questionId) {
        if (questionId === undefined) return; // Still loading
        setError('No question ID provided');
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        
        const { data, error } = await supabase
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

        if (error) throw error;
        if (!data) throw new Error('Question not found');

        setQuestion(data);
      } catch (err) {
        console.error('Error fetching question:', err);
        setError('Failed to load question');
        toast.error('Failed to load question');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]);

  const handleExit = () => {
    toast.info('Exiting exam');
    router.push('/ielts-academic/dashboard');
  };

  const handleNext = () => {
    toast.success('Response submitted');
    // In a real app, you would save the response and navigate to the next question
    if (currentPosition < totalQuestions - 1) {
      setCurrentPosition(prev => prev + 1);
      toast.info('Navigating to next question');
    } else {
      toast.success('Exam completed!');
      router.push('/ielts-academic/dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentPosition > 0) {
      setCurrentPosition(prev => prev - 1);
      toast.info('Navigating to previous question');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm max-w-md">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Error Loading Question</h3>
          <p className="mt-2 text-sm text-gray-500">
            {error || 'The requested question could not be found.'}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => router.push('/ielts-academic/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ExamLayout
      question={question}
      examId="ielts-academic"
      onExit={handleExit}
      onNext={handleNext}
      onPrevious={handlePrevious}
      currentPosition={currentPosition}
      totalQuestions={totalQuestions}
    />
  );
}