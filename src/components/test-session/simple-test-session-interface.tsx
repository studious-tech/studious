'use client';

import { useState, useEffect, useRef } from 'react';
import { TestSession } from '@/types/test-session';
import { QuestionRenderer } from './question-renderer';
import { TestSessionHeader } from './test-session-header';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChevronRight, Check } from 'lucide-react';

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

export function SimpleTestSessionInterface({
  sessionId,
  session,
}: TestSessionInterfaceProps) {
  const [sessionData, setSessionData] = useState<TestSessionData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [currentResponse, setCurrentResponse] = useState<any>(null);
  const [currentResponseType, setCurrentResponseType] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [questionKey, setQuestionKey] = useState(0); // Force remount
  const [debugMode, setDebugMode] = useState(false); // Debug panel toggle

  const timeSpentRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Debug: Track component lifecycle
  useEffect(() => {
    console.log('🎬 [TestSession] Component mounted', {
      sessionId,
      sessionStatus: session.status,
    });
    return () => {
      console.log('💀 [TestSession] Component will unmount');
    };
  }, []);

  // Debug: Track question changes
  useEffect(() => {
    console.log('🔄 [TestSession] Question changed:', {
      questionIndex: currentQuestionIndex,
      questionKey,
      currentResponse,
      currentResponseType,
    });
  }, [currentQuestionIndex, questionKey]);

  // Debug: Toggle debug mode with 'D' key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        if (e.ctrlKey || e.metaKey) {
          setDebugMode((prev) => {
            const newMode = !prev;
            console.log(
              `🐛 [TestSession] Debug mode ${newMode ? 'ENABLED' : 'DISABLED'}`
            );
            toast.info(`Debug mode ${newMode ? 'enabled' : 'disabled'}`);
            return newMode;
          });
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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

        if (session.status === 'active') {
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
    timerRef.current = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
      timeSpentRef.current = timeSpentRef.current + 1;
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleQuestionResponse = (response: {
    questionId: string;
    sessionQuestionId: string;
    response: unknown;
    responseType: string;
  }) => {
    console.log('📝 [TestSession] Response received:', {
      questionId: response.questionId,
      sessionQuestionId: response.sessionQuestionId,
      response: response.response,
      responseType: response.responseType,
    });
    setCurrentResponse(response.response);
    setCurrentResponseType(response.responseType);
    console.log(
      '✅ [TestSession] Response captured, Next button should be enabled'
    );
  };

  const handleNextQuestion = async () => {
    console.log('🚀 [TestSession] Next button clicked');
    console.log('📊 [TestSession] Current state:', {
      hasSessionData: !!sessionData,
      currentResponse,
      currentResponseType,
      currentQuestionIndex,
      timeSpent: timeSpentRef.current,
    });

    if (!sessionData || !currentResponse) {
      console.error('❌ [TestSession] Cannot proceed:', {
        hasSessionData: !!sessionData,
        hasResponse: !!currentResponse,
      });
      toast.error('Please answer the question before proceeding');
      return;
    }

    setIsSaving(true);

    try {
      const currentQuestion = sessionData.questions[currentQuestionIndex];
      console.log(
        '💾 [TestSession] Saving response for question:',
        currentQuestion.question.id
      );

      // Determine if response is media (File/Blob)
      const isMediaResponse =
        currentResponse instanceof File || currentResponse instanceof Blob;

      if (isMediaResponse) {
        // Upload media first
        console.log('🎤 [TestSession] Uploading media file...');
        const formData = new FormData();
        formData.append('file', currentResponse as Blob);
        formData.append('role', 'user-response');

        const uploadResponse = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        console.log(
          '📡 [TestSession] Media upload response status:',
          uploadResponse.status
        );

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          console.error('❌ [TestSession] Media upload failed:', errorData);
          throw new Error(errorData.error || 'Failed to upload media');
        }

        const uploadData = await uploadResponse.json();
        console.log('📦 [TestSession] Media upload response:', uploadData);

        // API returns media_id field
        const mediaId = uploadData.media_id;

        if (!mediaId) {
          console.error(
            '❌ [TestSession] No media_id in response:',
            uploadData
          );
          throw new Error('Media upload succeeded but no media ID returned');
        }

        console.log(
          '✅ [TestSession] Media uploaded successfully, ID:',
          mediaId
        );

        // Save response with media ID
        console.log('💾 [TestSession] Saving media response:', {
          mediaId,
          timeSpent: timeSpentRef.current,
        });
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

        console.log(
          '📡 [TestSession] API response status:',
          saveResponse.status
        );
        const saveResult = await saveResponse.json();
        console.log('📡 [TestSession] API response body:', saveResult);

        if (!saveResponse.ok) {
          console.error('❌ [TestSession] Save failed:', saveResult);
          throw new Error(saveResult.error || 'Failed to save response');
        }

        console.log('✅ [TestSession] Media response saved successfully');
      } else {
        // Save regular response
        console.log('💾 [TestSession] Saving regular response:', {
          response: currentResponse,
          responseType: currentResponseType,
          timeSpent: timeSpentRef.current,
        });

        const saveResponse = await fetch(
          `/api/test-sessions/${sessionId}/questions/${currentQuestion.question.id}/response`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              response: currentResponse,
              responseType: currentResponseType,
              timeSpentSeconds: timeSpentRef.current || 0,
            }),
          }
        );

        console.log(
          '📡 [TestSession] API response status:',
          saveResponse.status
        );
        const saveResult = await saveResponse.json();
        console.log('📡 [TestSession] API response body:', saveResult);

        if (!saveResponse.ok) {
          console.error('❌ [TestSession] Save failed:', saveResult);
          throw new Error(saveResult.error || 'Failed to save response');
        }

        console.log('✅ [TestSession] Regular response saved successfully');
      }

      // Reset for next question
      console.log('🔄 [TestSession] Resetting state for next question');
      setCurrentResponse(null);
      setCurrentResponseType('');
      timeSpentRef.current = 0;

      // Check if this was the last question
      const isLastQuestion =
        currentQuestionIndex >= sessionData.totalQuestions - 1;
      console.log('🏁 [TestSession] Is last question?', isLastQuestion);

      if (isLastQuestion) {
        console.log(
          '🎉 [TestSession] This was the last question, finishing test'
        );
        await handleFinishTest();
      } else {
        // Move to next question and force remount
        const nextIndex = currentQuestionIndex + 1;
        const nextKey = questionKey + 1;
        console.log('➡️ [TestSession] Moving to next question:', {
          from: currentQuestionIndex,
          to: nextIndex,
          newKey: nextKey,
        });

        setCurrentQuestionIndex(nextIndex);
        setQuestionKey(nextKey);
        toast.success('Answer saved!');
      }
    } catch (error) {
      console.error('❌ [TestSession] Error saving response:', error);
      console.error('❌ [TestSession] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      toast.error(
        error instanceof Error ? error.message : 'Failed to save answer'
      );
    } finally {
      setIsSaving(false);
      console.log('🔓 [TestSession] Save operation complete, isSaving = false');
    }
  };

  const handleFinishTest = async () => {
    try {
      const completeResponse = await fetch(
        `/api/test-sessions/${sessionId}/complete`,
        {
          method: 'POST',
        }
      );

      if (!completeResponse.ok) {
        throw new Error('Failed to complete test session');
      }

      toast.success('Test completed successfully!');

      setTimeout(() => {
        window.location.href = `/${sessionData?.examId}/dashboard?tab=my-tests`;
      }, 2000);
    } catch (error) {
      console.error('Error completing test:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to complete test'
      );
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

  // Convert to format expected by QuestionRenderer
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

  const isLastQuestion = currentQuestionIndex >= sessionData.totalQuestions - 1;
  const canProceed = currentResponse !== null && !isSaving;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Debug Panel - Press Ctrl+D or Cmd+D to toggle */}
      {debugMode && (
        <div className="fixed top-20 right-4 bg-black/95 text-white p-4 rounded-lg shadow-2xl z-50 max-w-sm text-xs font-mono">
          <div className="font-bold text-green-400 mb-2">
            🐛 DEBUG MODE (Ctrl/Cmd+D to hide)
          </div>
          <div className="space-y-1">
            <div className="text-blue-300">Session ID: {sessionId}</div>
            <div className="text-yellow-300">
              Question: {currentQuestionIndex + 1}/{sessionData.totalQuestions}
            </div>
            <div className="text-purple-300">Question Key: {questionKey}</div>
            <div className="border-t border-gray-700 my-2"></div>
            <div
              className={currentResponse ? 'text-green-400' : 'text-red-400'}
            >
              Has Response: {currentResponse ? 'YES' : 'NO'}
            </div>
            {currentResponse && (
              <div className="text-gray-400 text-[10px] max-h-20 overflow-auto">
                Response: {JSON.stringify(currentResponse)}
              </div>
            )}
            <div className="text-gray-400">
              Type: {currentResponseType || 'N/A'}
            </div>
            <div className="border-t border-gray-700 my-2"></div>
            <div className={canProceed ? 'text-green-400' : 'text-red-400'}>
              Can Proceed: {canProceed ? 'YES' : 'NO'}
            </div>
            <div className={isSaving ? 'text-yellow-400' : 'text-gray-400'}>
              Saving: {isSaving ? 'YES' : 'NO'}
            </div>
            <div className="text-gray-400">
              Time Spent: {timeSpentRef.current}s
            </div>
            <div className="border-t border-gray-700 my-2"></div>
            <div className="text-gray-400 text-[10px]">
              Check browser console for detailed logs
            </div>
          </div>
        </div>
      )}

      {/* Simple Header */}
      <TestSessionHeader
        session={session}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={sessionData.totalQuestions}
        examId={examId}
        timeSpent={timeSpent}
      />

      {/* Question Area - Force remount on key change */}
      <div key={questionKey} className="flex-1 overflow-auto bg-white">
        <QuestionRenderer
          question={questionData}
          examId={examId}
          onResponse={handleQuestionResponse}
          onSubmit={handleQuestionResponse}
          currentResponse={null}
        />
      </div>

      {/* Simple Footer with Next/Finish Button */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-end">
          <Button
            onClick={handleNextQuestion}
            disabled={!canProceed}
            size="lg"
            className="min-w-[140px]"
          >
            {isSaving ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : isLastQuestion ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Finish Test
              </>
            ) : (
              <>
                Next Question
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
