import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface QuestionAttempt {
  questionId: string;
  sessionQuestionId: string;
  testSessionId: string;
  response: any;
  responseType: string;
  timeSpentSeconds: number;
}

interface UseQuestionAttemptReturn {
  saveAttempt: (attempt: QuestionAttempt) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useQuestionAttempt(): UseQuestionAttemptReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveAttempt = useCallback(async (attempt: QuestionAttempt): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/test-sessions/${attempt.testSessionId}/questions/${attempt.questionId}/response`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            response: attempt.response,
            responseType: attempt.responseType,
            timeSpentSeconds: attempt.timeSpentSeconds,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save attempt');
      }

      // Silent save - no toast messages for auto-save
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save attempt';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error saving question attempt:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    saveAttempt,
    isLoading,
    error,
  };
}