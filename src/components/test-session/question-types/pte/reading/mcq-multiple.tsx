'use client';

import * as React from 'react';
import { useState, forwardRef, useImperativeHandle } from 'react';
import { toast } from 'sonner';

interface QuestionData {
  question: {
    id: string;
    title: string | null;
    content: string | null;
    instructions: string | null;
    difficulty_level: number;
    expected_duration_seconds: number | null;
    questionType: { display_name: string };
    media: Array<any>;
    options: Array<{
      id: string;
      text: string;
      display_order: number;
      media_id?: string;
    }>;
  };
  sessionQuestionId: string;
  sequenceNumber: number;
}

interface PTEReadingMCQMultipleProps {
  question: QuestionData;
  examId: string;
  onResponse: (response: {
    questionId: string;
    sessionQuestionId: string;
    response: unknown;
    responseType: string;
  }) => void;
  onSubmit: (response: {
    questionId: string;
    sessionQuestionId: string;
    response: unknown;
    responseType: string;
  }) => void;
  currentResponse?: any;
}

// exposed ref shape
export type PTEReadingMCQMultipleRef = {
  submit: () => Promise<void>;
  getSelection: () => string[] | null;
};

const PTEReadingMCQMultiple = forwardRef<
  PTEReadingMCQMultipleRef,
  PTEReadingMCQMultipleProps
>(({ question, onResponse, onSubmit, currentResponse }, ref) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    currentResponse?.selected_options || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (optionId: string) => {
    const newSelection = selectedOptions.includes(optionId)
      ? selectedOptions.filter((id) => id !== optionId)
      : [...selectedOptions, optionId];

    setSelectedOptions(newSelection);

    // Auto-save selection immediately
    onResponse({
      questionId: question.question.id,
      sessionQuestionId: question.sessionQuestionId,
      response: newSelection,
      responseType: 'selection',
    });
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0) {
      toast.error('Please select at least one option');
      return;
    }

    setIsSubmitting(true);
    try {
      // preserve original flow: onResponse then onSubmit
      onResponse({
        questionId: question.question.id,
        sessionQuestionId: question.sessionQuestionId,
        response: selectedOptions,
        responseType: 'selection',
      });

      await onSubmit({
        questionId: question.question.id,
        sessionQuestionId: question.sessionQuestionId,
        response: selectedOptions,
        responseType: 'selection',
      });

      toast.success('Answer submitted successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      submit: handleSubmit,
      getSelection: () =>
        selectedOptions.length > 0 ? [...selectedOptions] : null,
    }),
    [selectedOptions, isSubmitting]
  );

  return (
    <div className="min-h-[72vh] font-sans text-gray-900">
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* Left: passage */}
          <aside className="col-span-5">
            <div className="pb-2 border-b border-transparent" />
            <div
              className="bg-transparent text-sm leading-relaxed text-gray-700 prose max-w-none"
              style={{ fontSize: '13px', lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{
                __html:
                  question.question.content ??
                  '<p>Passage content will appear here.</p>',
              }}
            />
          </aside>

          {/* Right: instructions + prompt + options */}
          <main className="col-span-7">
            {/* Instructions (italic) */}
            {question.question.instructions && (
              <div className="mb-4">
                <div
                  className="italic text-sm text-gray-700"
                  style={{ fontSize: '13px', lineHeight: 1.5 }}
                >
                  {question.question.instructions}
                </div>
              </div>
            )}

            {/* Question title/prompt */}
            <div className="mb-6">
              <h3
                className="text-lg text-gray-800 font-medium"
                style={{ fontSize: '15px' }}
              >
                {question.question.title ??
                  'Read the text and answer the multiple-choice question by selecting all correct responses. More than one response may be correct.'}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {question.question.options
                .slice()
                .sort((a, b) => a.display_order - b.display_order)
                .map((option) => {
                  const isSelected = selectedOptions.includes(option.id);
                  return (
                    <label
                      key={option.id}
                      htmlFor={`opt-${option.id}`}
                      className={`flex items-start gap-4 p-4 rounded-sm cursor-pointer select-none transition-colors duration-150
                        ${
                          isSelected
                            ? 'bg-white border border-[#cfe8ff]'
                            : 'bg-transparent border border-transparent hover:bg-gray-50'
                        }
                      `}
                    >
                      {/* Styled checkbox that visually appears circular to match screenshot */}
                      <div className="flex-shrink-0 mt-1">
                        <input
                          id={`opt-${option.id}`}
                          type="checkbox"
                          name={`mcq-multi-${question.sessionQuestionId}`}
                          checked={isSelected}
                          onChange={() => handleSelect(option.id)}
                          className="h-4 w-4 rounded-full border border-gray-300 checked:bg-[#0071bc] checked:border-[#0071bc] focus:outline-none"
                          aria-checked={isSelected}
                          aria-labelledby={`label-${option.id}`}
                        />
                      </div>

                      <div
                        id={`label-${option.id}`}
                        className="text-sm text-gray-700 leading-relaxed"
                        style={{ fontSize: '14px', lineHeight: 1.7 }}
                      >
                        {option.text}
                      </div>
                    </label>
                  );
                })}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
});

PTEReadingMCQMultiple.displayName = 'PTEReadingMCQMultiple';

export default PTEReadingMCQMultiple;
