'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TestSession } from '@/types/test-session';
import { QuestionRenderer } from './question-renderer';
import { TestSessionHeader } from './test-session-header';
import { TestSessionNavigation } from './test-session-navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

interface TestSessionQuestion {
  sessionQuestionId: string;
  sequenceNumber: number;
  allocatedTimeSeconds: number;
  isAttempted: boolean;
  isCompleted: boolean;
  timeSpentSeconds: number;
  question: {
    id: string;
    title: string;
    content: string;
    instructions: string;
    difficultyLevel: number;
    expectedDurationSeconds: number;
    correctAnswer: unknown;
    blanksConfig: unknown;
    questionType: {
      id: string;
      name: string;
      displayName: string;
      description: string;
      inputType: string;
      responseType: string;
      scoringMethod: string;
      timeLimitSeconds: number;
      uiComponent: string;
      section: {
        id: string;
        name: string;
        displayName: string;
        exam: {
          id: string;
          name: string;
          displayName: string;
        };
      };
    };
    media: Array<{
      id: string;
      role: string;
      displayOrder: number;
      media: {
        id: string;
        filename: string;
        fileType: string;
        mimeType: string;
        url: string;
        durationSeconds?: number;
        dimensions?: unknown;
      };
    }>;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
      displayOrder: number;
      mediaId?: string;
    }>;
  };
}

interface TestSessionData {
  sessionId: string;
  examId: string;
  questions: TestSessionQuestion[];
  totalQuestions: number;
}

interface TestSessionInterfaceProps {
  sessionId: string;
  session: TestSession;
}

export function TestSessionInterface({
  sessionId,
  session,
}: TestSessionInterfaceProps) {
  const [sessionData, setSessionData] = useState<TestSessionData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const timeSpentRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch session questions
  useEffect(() => {
    const fetchSessionQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/test-sessions/${sessionId}/questions`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch questions');
        }

        const data: TestSessionData = await response.json();
        setSessionData(data);

        // If session is already started, find the current question
        if (session.status === 'active') {
          // Find first incomplete question or stay at first
          const incompleteIndex = data.questions.findIndex(
            (q) => !q.isCompleted
          );
          setCurrentQuestionIndex(incompleteIndex >= 0 ? incompleteIndex : 0);
        }
      } catch (err) {
        console.error('Error fetching session questions:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load questions'
        );
        toast.error('Failed to load test questions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionQuestions();
  }, [sessionId, session.status]);

  // Timer effect
  useEffect(() => {
    if (sessionData && sessionData.questions.length > 0 && !isPaused) {
      // Start timer
      timerRef.current = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
        timeSpentRef.current = timeSpentRef.current + 1;
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionData, isPaused]);

  const handleNextQuestion = async () => {
    if (
      sessionData &&
      currentQuestionIndex < sessionData.questions.length - 1
    ) {
      const currentQuestion = sessionData.questions[currentQuestionIndex];

      // Save current response before moving to next
      const saved = await saveCurrentResponse();
      if (saved) {
        // Clear the saved response from memory
        setResponses((prev) => {
          const newResponses = { ...prev };
          delete newResponses[currentQuestion.sessionQuestionId];
          return newResponses;
        });

        setCurrentQuestionIndex(currentQuestionIndex + 1);
        resetTimer();
        toast.success('Answer saved');
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      resetTimer();
    }
  };

  const resetTimer = () => {
    timeSpentRef.current = 0;
    setTimeSpent(0);
  };

  const saveCurrentResponse = async (): Promise<boolean> => {
    if (!sessionData) {
      console.log('No session data');
      return false;
    }

    const currentQuestion = sessionData.questions[currentQuestionIndex];
    const response = responses[currentQuestion.sessionQuestionId];

    // Skip saving if no response
    if (response === undefined || response === null) {
      console.log(
        'No response to save for question:',
        currentQuestion.question.id
      );
      return true; // Return true to allow navigation
    }

    console.log('Saving response for question:', currentQuestion.question.id);
    console.log('Response type:', typeof response, response instanceof Blob);

    setIsSaving(true);

    try {
      const responseType = currentQuestion.question.questionType.responseType;

      // Handle media upload for audio/video responses (Blob)
      if (response instanceof Blob) {
        console.log(
          'Uploading media blob, size:',
          response.size,
          'type:',
          response.type
        );

        // Upload media file first
        const formData = new FormData();
        formData.append('file', response);

        const uploadResponse = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          console.error('Media upload error:', errorData);
          throw new Error(errorData.error || 'Failed to upload media');
        }

        const uploadData = await uploadResponse.json();
        console.log('Media uploaded successfully:', uploadData);

        // API returns media_id, not mediaId
        const mediaId = uploadData.media_id || uploadData.mediaId;

        if (!mediaId) {
          console.error('No media ID in response:', uploadData);
          throw new Error('Media upload succeeded but no media ID returned');
        }

        console.log('Saving attempt with media ID:', mediaId);

        // Save the attempt with media ID
        const saveResponse = await fetch(
          `/api/test-sessions/${sessionId}/questions/${currentQuestion.question.id}/response`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              response: mediaId,
              responseType: 'media',
              timeSpentSeconds: timeSpentRef.current || 0,
            }),
          }
        );

        if (!saveResponse.ok) {
          const errorData = await saveResponse.json();
          console.error('Save response error:', errorData);
          throw new Error(errorData.error || 'Failed to save response');
        }

        const saveData = await saveResponse.json();
        console.log('Response saved successfully:', saveData);

        return true;
      } else {
        // Save regular text/selection/json response
        console.log('Saving text/selection response:', response);

        const saveResponse = await fetch(
          `/api/test-sessions/${sessionId}/questions/${currentQuestion.question.id}/response`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              response: response,
              responseType: responseType,
              timeSpentSeconds: timeSpentRef.current || 0,
            }),
          }
        );

        if (!saveResponse.ok) {
          const errorData = await saveResponse.json();
          console.error('Save error:', errorData);
          throw new Error(errorData.error || 'Failed to save response');
        }

        const saveData = await saveResponse.json();
        console.log('Response saved successfully:', saveData);

        return true;
      }
    } catch (error) {
      console.error('Error saving response:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to save answer'
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinishTest = async () => {
    if (!sessionData) return;

    setIsSaving(true);

    try {
      // Save the last response
      const saved = await saveCurrentResponse();

      if (saved) {
        // Clear all responses from memory
        setResponses({});
      }

      // Mark test session as complete
      const completeResponse = await fetch(
        `/api/test-sessions/${sessionId}/complete`,
        {
          method: 'POST',
        }
      );

      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        throw new Error(errorData.error || 'Failed to complete test session');
      }

      toast.success('Test completed successfully!');

      // Redirect to exam dashboard after a short delay
      setTimeout(() => {
        window.location.href = `/${sessionData.examId}/dashboard?tab=my-tests`;
      }, 2000);
    } catch (error) {
      console.error('Error completing test:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to complete test'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuestionResponse = useCallback(
    (response: {
      questionId: string;
      sessionQuestionId: string;
      response: unknown;
      responseType: string;
    }) => {
      // Store response in state (silent save, no toast spam)
      setResponses((prev) => {
        // Only update if value has actually changed to prevent unnecessary re-renders
        const currentValue = prev[response.sessionQuestionId];

        // Deep equality check for objects/arrays
        if (
          JSON.stringify(currentValue) === JSON.stringify(response.response)
        ) {
          return prev; // Return same reference, no re-render
        }

        return {
          ...prev,
          [response.sessionQuestionId]: response.response,
        };
      });
    },
    []
  );

  const handleQuestionSubmit = useCallback(
    async (response: {
      questionId: string;
      sessionQuestionId: string;
      response: unknown;
      responseType: string;
    }) => {
      // Store response in state
      setResponses((prev) => {
        // Only update if value has actually changed
        const currentValue = prev[response.sessionQuestionId];

        if (
          JSON.stringify(currentValue) === JSON.stringify(response.response)
        ) {
          return prev; // Return same reference, no re-render
        }

        return {
          ...prev,
          [response.sessionQuestionId]: response.response,
        };
      });
    },
    []
  );

  const handleSaveProgress = async () => {
    const saved = await saveCurrentResponse();
    if (saved) {
      toast.success('Progress saved successfully');
    }
  };

  const handleFlagQuestion = () => {
    if (!sessionData) return;

    const currentQuestion = sessionData.questions[currentQuestionIndex];
    toast.info(
      `Question ${currentQuestion.sequenceNumber + 1} flagged for review`
    );
  };

  const handlePauseSession = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      toast.info('Test session resumed');
    } else {
      toast.info('Test session paused');
    }
  };

  const handleRestartSession = () => {
    if (
      confirm(
        'Are you sure you want to restart this test session? All progress will be lost.'
      )
    ) {
      // Reset everything
      setCurrentQuestionIndex(0);
      setTimeSpent(0);
      timeSpentRef.current = 0;
      setResponses({});
      setIsPaused(false);
      toast.info('Test session restarted');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <span className="ml-3 text-lg">Loading test questions...</span>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Test
          </h2>
          <p className="text-gray-600">{error || 'Failed to load test data'}</p>
        </div>
      </div>
    );
  }

  const currentQuestion = sessionData.questions[currentQuestionIndex];
  const examId = sessionData.examId;

  // Safety check for current question
  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            No Question Available
          </h2>
          <p className="text-gray-600">
            Question {currentQuestionIndex + 1} could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  // Convert TestSessionQuestion to QuestionData format expected by QuestionRenderer
  const questionData = {
    ...currentQuestion,
    question: {
      ...currentQuestion.question,
      difficulty_level: currentQuestion.question.difficultyLevel,
      expected_duration_seconds:
        currentQuestion.question.expectedDurationSeconds,
      correct_answer: currentQuestion.question.correctAnswer,
      blanks_config: currentQuestion.question.blanksConfig,
      question_type_id: currentQuestion.question.questionType.id,
      questionType: {
        ...currentQuestion.question.questionType,
        display_name: currentQuestion.question.questionType.displayName,
        input_type: currentQuestion.question.questionType.inputType,
        response_type: currentQuestion.question.questionType.responseType,
        scoring_method: currentQuestion.question.questionType.scoringMethod,
        time_limit_seconds:
          currentQuestion.question.questionType.timeLimitSeconds,
        ui_component: currentQuestion.question.questionType.uiComponent,
        section: {
          ...currentQuestion.question.questionType.section,
          display_name:
            currentQuestion.question.questionType.section.displayName,
          exam: {
            ...currentQuestion.question.questionType.section.exam,
            display_name:
              currentQuestion.question.questionType.section.exam.displayName,
          },
        },
      },
    },
  };

  return (
    <div
      className={`test-session-interface ${examId} flex flex-col min-h-screen bg-gray-50`}
    >
      {/* Minimal Header */}
      <TestSessionHeader
        session={session}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={sessionData.totalQuestions}
        examId={examId}
        timeSpent={timeSpent}
        isPaused={isPaused}
      />

      {/* Main question area - seamless integration */}
      <div className="test-session-content flex-1 overflow-auto bg-white">
        <QuestionRenderer
          question={questionData}
          examId={examId}
          onResponse={handleQuestionResponse}
          onSubmit={handleQuestionSubmit}
          currentResponse={responses[currentQuestion.sessionQuestionId]}
        />
      </div>

      {/* Minimal Footer with Next/Finish button */}
      <TestSessionNavigation
        currentIndex={currentQuestionIndex}
        totalQuestions={sessionData.totalQuestions}
        onNext={handleNextQuestion}
        onPrevious={handlePreviousQuestion}
        examId={examId}
        canGoNext={currentQuestionIndex < sessionData.totalQuestions - 1}
        canGoPrevious={currentQuestionIndex > 0}
        isSaving={isSaving}
        onSave={handleSaveProgress}
        onFlag={handleFlagQuestion}
        onPause={handlePauseSession}
        onRestart={handleRestartSession}
        onFinish={handleFinishTest}
      />
    </div>
  );
}
