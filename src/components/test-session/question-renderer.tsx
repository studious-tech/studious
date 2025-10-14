'use client';

import * as React from 'react';
import { useState, useEffect, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle } from 'lucide-react';

// Component registry for dynamic imports - only include components that exist
const QUESTION_COMPONENT_REGISTRY: Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  () => Promise<{ default: React.ComponentType<any> }>
> = {
  // Generic Components (always available)
  'generic-mcq': () => import('./question-types/generic/mcq-question'),
  'generic-text-response': () =>
    import('./question-types/generic/text-response-question'),
  'generic-speaking': () =>
    import('./question-types/generic/speaking-question'),

  // IELTS Reading Components
  'ielts-reading-mcq': () =>
    import('./question-types/ielts/reading/multiple-choice'),

  // IELTS Speaking Components
  'ielts-speaking-part-1': () =>
    import('./question-types/ielts/speaking/part-1'),
  'ielts-speaking-part-2': () =>
    import('./question-types/ielts/speaking/part-2'),

  // IELTS Writing Components
  'ielts-writing-task-1': () => import('./question-types/ielts/writing/task-1'),
  'ielts-writing-task-2': () => import('./question-types/ielts/writing/task-2'),

  // IELTS Listening Components
  'ielts-listening-form-completion': () =>
    import('./question-types/ielts/listening/form-completion'),

  // PTE Reading Components
  'pte-reading-mcq-single': () =>
    import('./question-types/pte/reading/mcq-single'),
  'pte-reading-mcq-multiple': () =>
    import('./question-types/pte/reading/mcq-multiple'),
  'pte-reading-reorder-paragraphs': () =>
    import('./question-types/pte/reading/reorder-paragraphs'),
  'pte-reading-fib-dropdown': () =>
    import('./question-types/pte/reading/fib-dropdown'),
  'pte-reading-fib-dragdrop': () =>
    import('./question-types/pte/reading/fib-dragdrop'),

  // PTE Speaking Components
  'pte-speaking-read-aloud': () =>
    import('./question-types/pte/speaking/read-aloud'),
  'pte-speaking-repeat-sentence': () =>
    import('./question-types/pte/speaking/repeat-sentence'),
  'pte-speaking-describe-image': () =>
    import('./question-types/pte/speaking/describe-image'),
  'pte-speaking-answer-short-question': () =>
    import('./question-types/pte/speaking/answer-short-question'),
  'pte-speaking-re-tell-lecture': () =>
    import('./question-types/pte/speaking/re-tell-lecture'),

  // PTE Writing Components
  'pte-writing-summarize-written-text': () =>
    import('./question-types/pte/writing/summarize-written-text'),
  'pte-writing-write-essay': () =>
    import('./question-types/pte/writing/write-essay'),

  // PTE Listening Components
  'pte-listening-fib-typing': () =>
    import('./question-types/pte/listening/fib-typing'),
  'pte-listening-summarize-spoken-text': () =>
    import('./question-types/pte/listening/summarize-spoken-text'),
  'pte-listening-mcq-multiple': () =>
    import('./question-types/pte/listening/mcq-multiple'),
  'pte-listening-highlight-summary': () =>
    import('./question-types/pte/listening/highlight-summary'),
  'pte-listening-mcq-single': () =>
    import('./question-types/pte/listening/mcq-single'),
  'pte-listening-select-missing-word': () =>
    import('./question-types/pte/listening/select-missing-word'),
  'pte-listening-write-dictation': () =>
    import('./question-types/pte/listening/write-dictation'),
};

interface QuestionData {
  question: {
    id: string;
    title: string | null;
    content: string | null;
    instructions: string | null;
    difficulty_level: number;
    expected_duration_seconds: number | null;
    correct_answer: unknown;
    blanks_config: unknown;
    question_type_id: string;
    questionType: {
      id: string;
      name: string;
      displayName: string;
      description: string | null;
      inputType: string;
      responseType: string;
      scoringMethod: string;
      timeLimitSeconds: number | null;
      uiComponent: string | null;
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
  sessionQuestionId: string;
  sequenceNumber: number;
}

interface ResponseData {
  questionId: string;
  sessionQuestionId: string;
  response: unknown;
  responseType: string;
}

interface QuestionRendererProps {
  question: QuestionData;
  examId: string;
  onResponse: (response: ResponseData) => void;
  onSubmit: (response: ResponseData) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentResponse?: any;
}

export function QuestionRenderer({
  question,
  examId,
  onResponse,
  onSubmit,
  currentResponse,
}: QuestionRendererProps) {
  const [QuestionComponent, setQuestionComponent] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const uiComponent = question.question.questionType.uiComponent;

  useEffect(() => {
    const loadQuestionComponent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Determine which component to use
        let componentLoader;

        if (uiComponent && QUESTION_COMPONENT_REGISTRY[uiComponent]) {
          // Use specific component if available and registered
          componentLoader = QUESTION_COMPONENT_REGISTRY[uiComponent];
        } else if (!uiComponent) {
          // Use generic component based on input/response types when uiComponent is null
          const inputType = question.question.questionType.inputType;
          const responseType = question.question.questionType.responseType;

          // Map to generic components based on input/response types
          if (
            inputType === 'single_choice' ||
            inputType === 'multiple_choice'
          ) {
            componentLoader = QUESTION_COMPONENT_REGISTRY['generic-mcq'];
          } else if (responseType === 'text' || responseType === 'long_text') {
            componentLoader =
              QUESTION_COMPONENT_REGISTRY['generic-text-response'];
          } else if (
            responseType === 'audio_recording' ||
            responseType === 'spoken_response'
          ) {
            componentLoader = QUESTION_COMPONENT_REGISTRY['generic-speaking'];
          } else {
            // Use fallback component for completely unsupported question types
            componentLoader = () =>
              import('./question-types/fallback-question');
          }
        } else {
          // Use fallback component for unsupported UI components
          componentLoader = () => import('./question-types/fallback-question');
        }

        // Dynamically import the component
        const { default: LoadedComponent } = await componentLoader();
        setQuestionComponent(() => LoadedComponent);
      } catch (err) {
        console.error('Error loading question component:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load question component'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (question.question.questionType) {
      loadQuestionComponent();
    } else {
      setError('Question type missing required fields');
      setIsLoading(false);
    }
  }, [uiComponent, question.question.questionType]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
        <span className="ml-3">Loading question...</span>
      </div>
    );
  }

  if (error || !QuestionComponent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Component Error
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-sm text-gray-500">
            <p>UI Component: {uiComponent || 'Not set'}</p>
            <p>Question Type: {question.question.questionType?.displayName}</p>
            <p>Exam: {examId}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
          <span className="ml-3">Rendering question...</span>
        </div>
      }
    >
      <QuestionComponent
        question={question}
        examId={examId}
        onResponse={onResponse}
        onSubmit={onSubmit}
        currentResponse={currentResponse}
      />
    </Suspense>
  );
}
