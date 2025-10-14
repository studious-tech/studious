'use client';

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback,
  memo,
} from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  displayOrder: number;
}

interface Blank {
  id: string;
  position: number;
  options_ids: string[];
  correct_option_id: string;
}

interface BlanksConfig {
  type: string;
  blanks: Blank[];
}

interface QuestionData {
  question: {
    id: string;
    title: string | null;
    content: string | null;
    instructions: string | null;
    difficulty_level: number;
    expected_duration_seconds: number | null;
    correct_answer: unknown;
    blanks_config: BlanksConfig;
    question_type_id: string;
    questionType: {
      id: string;
      name: string;
      display_name: string;
      description: string | null;
      input_type: string;
      response_type: string;
      scoring_method: string;
      time_limit_seconds: number | null;
      ui_component: string;
      section: {
        id: string;
        name: string;
        display_name: string;
        exam: {
          id: string;
          name: string;
          display_name: string;
        };
      };
    };
    media: Array<unknown>;
    options: QuestionOption[];
  };
  sessionQuestionId: string;
  sequenceNumber: number;
}

interface Props {
  question: QuestionData;
  examId: string;
  onResponse: (payload: {
    questionId: string;
    sessionQuestionId: string;
    response: { answers: Record<string, string> };
    responseType: string;
  }) => void;
  onSubmit: (payload: {
    questionId: string;
    sessionQuestionId: string;
    response: { answers: Record<string, string> };
    responseType: string;
  }) => void;
  currentResponse?: { answers?: Record<string, string> };
}

export type FIBDropdownRef = {
  submit: () => void;
  getAnswers: () => Record<string, string>;
};

// Memoized dropdown component to prevent unnecessary re-renders
const BlankDropdown = memo(
  ({
    blankId,
    options,
    value,
    onChange,
  }: {
    blankId: string;
    options: QuestionOption[];
    value: string;
    onChange: (blankId: string, value: string) => void;
  }) => {
    const handleChange = useCallback(
      (newValue: string) => {
        onChange(blankId, newValue);
      },
      [blankId, onChange]
    );

    return (
      <span className="inline-block mx-1">
        <Select value={value || ''} onValueChange={handleChange}>
          <SelectTrigger className="inline-flex h-8 w-auto min-w-[120px] border-gray-300 bg-gray-50 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.text}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </span>
    );
  }
);

BlankDropdown.displayName = 'BlankDropdown';

const FIBDropdownInner = forwardRef<FIBDropdownRef, Props>(
  ({ question, onResponse, onSubmit }, ref) => {
    const blanksConfig = question.question.blanks_config;
    const allOptions = useMemo(
      () => question.question.options || [],
      [question.question.options]
    );
    const content = question.question.content || '';

    // Initialize answers - always start fresh
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const answersRef = React.useRef<Record<string, string>>({});

    // Parse content and create segments with blanks (memoized)
    const contentSegments = useMemo(() => {
      if (!blanksConfig?.blanks) return [{ type: 'text' as const, content }];

      const segments: Array<{
        type: 'text' | 'blank';
        content?: string;
        blankId?: string;
        options?: QuestionOption[];
      }> = [];

      let lastIndex = 0;
      const blankRegex = /\{\{(blank_\d+)\}\}/g;
      let match;

      while ((match = blankRegex.exec(content)) !== null) {
        const blankId = match[1];
        const blankStart = match.index;
        const blankEnd = blankStart + match[0].length;

        // Add text before blank
        if (blankStart > lastIndex) {
          segments.push({
            type: 'text',
            content: content.substring(lastIndex, blankStart),
          });
        }

        // Find blank config and its options
        const blankConfig = blanksConfig.blanks.find((b) => b.id === blankId);
        const blankOptions = blankConfig?.options_ids
          ? blankConfig.options_ids
              .map((optId) => allOptions.find((opt) => opt.id === optId))
              .filter((opt): opt is QuestionOption => opt !== undefined)
          : [];

        // Add blank
        segments.push({
          type: 'blank',
          blankId,
          options: blankOptions,
        });

        lastIndex = blankEnd;
      }

      // Add remaining text
      if (lastIndex < content.length) {
        segments.push({
          type: 'text',
          content: content.substring(lastIndex),
        });
      }

      return segments;
    }, [content, blanksConfig, allOptions]);

    // Handle answer change with stable callback
    const handleAnswerChange = useCallback(
      (blankId: string, value: string) => {
        // Update state
        setAnswers((prev) => {
          const newAnswers = { ...prev, [blankId]: value };
          answersRef.current = newAnswers; // Keep ref in sync
          return newAnswers;
        });

        // Notify parent after state update using queueMicrotask to escape render phase
        queueMicrotask(() => {
          const currentAnswers = answersRef.current;
          if (Object.keys(currentAnswers).length > 0) {
            onResponse({
              questionId: question.question.id,
              sessionQuestionId: question.sessionQuestionId,
              response: { answers: currentAnswers },
              responseType: 'structured_data',
            });
          }
        });
      },
      [onResponse, question.question.id, question.sessionQuestionId]
    );

    // Expose methods to parent
    useImperativeHandle(
      ref,
      () => ({
        submit: () => {
          onSubmit({
            questionId: question.question.id,
            sessionQuestionId: question.sessionQuestionId,
            response: { answers },
            responseType: 'structured_data',
          });
        },
        getAnswers: () => answers,
      }),
      [answers, onSubmit, question.question.id, question.sessionQuestionId]
    );

    return (
      <div className="w-full py-6">
        {/* Instructions */}
        {question.question.instructions && (
          <div className="max-w-5xl mx-auto px-6 mb-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-sm text-blue-900">
                {question.question.instructions}
              </p>
            </div>
          </div>
        )}

        {/* Title */}
        {question.question.title && (
          <div className="max-w-5xl mx-auto px-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {question.question.title}
            </h2>
          </div>
        )}

        {/* Content with inline dropdowns */}
        <div className="max-w-5xl mx-auto px-6 mt-8">
          <div className="bg-white p-0">
            <div className="text-lg leading-loose text-gray-900">
              {contentSegments.map((segment, index) => {
                if (segment.type === 'text') {
                  return (
                    <span key={`text-${index}`} className="whitespace-pre-wrap">
                      {segment.content}
                    </span>
                  );
                }

                if (segment.type === 'blank' && segment.options) {
                  const blankId = segment.blankId!;

                  return (
                    <BlankDropdown
                      key={`blank-${blankId}`}
                      blankId={blankId}
                      options={segment.options}
                      value={answers[blankId]}
                      onChange={handleAnswerChange}
                    />
                  );
                }

                return null;
              })}
            </div>
          </div>
        </div>

        {/* Answer counter */}
        <div className="max-w-5xl mx-auto px-6 mt-4">
          <div className="text-sm text-gray-600">
            Answered: {Object.keys(answers).length} /{' '}
            {blanksConfig?.blanks?.length || 0}
          </div>
        </div>
      </div>
    );
  }
);

FIBDropdownInner.displayName = 'FIBDropdownInner';

// Memoize the entire component to prevent re-renders when props haven't changed
const FIBDropdown = memo(FIBDropdownInner, (prevProps, nextProps) => {
  // Only re-render if question ID changes (new question loaded)
  return prevProps.question.question.id === nextProps.question.question.id;
});

FIBDropdown.displayName = 'FIBDropdown';

export default FIBDropdown;
