'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock } from 'lucide-react';
import { toast } from 'sonner';

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
    media: Array<{
      id: string;
      role: string;
      display_order: number;
      media: {
        id: string;
        filename: string;
        file_type: string;
        mime_type: string;
        url: string;
        duration_seconds?: number;
        dimensions?: unknown;
      };
    }>;
    options: Array<{
      id: string;
      text: string;
      is_correct: boolean;
      display_order: number;
      media_id?: string;
    }>;
  };
  sessionQuestionId: string;
  sequenceNumber: number;
}

interface PTEReadingMCQSingleProps {
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

export function PTEReadingMCQSingle({
  question,
  onResponse,
  onSubmit,
  currentResponse,
}: PTEReadingMCQSingleProps) {
  const [selectedOption, setSelectedOption] = useState<string>(
    currentResponse?.selected_options?.[0] || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);

    // Auto-save selection immediately
    onResponse({
      questionId: question.question.id,
      sessionQuestionId: question.sessionQuestionId,
      response: [optionId],
      responseType: 'selection',
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      onResponse({
        questionId: question.question.id,
        sessionQuestionId: question.sessionQuestionId,
        response: [selectedOption],
        responseType: 'selection',
      });

      await onSubmit({
        questionId: question.question.id,
        sessionQuestionId: question.sessionQuestionId,
        response: [selectedOption],
        responseType: 'selection',
      });

      toast.success('Answer submitted successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[72vh] font-sans text-gray-900">
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* left column: passage / reading text */}
          <aside className="col-span-5">
            <div className="pb-2 border-b border-transparent" />

            <div
              className="bg-transparent text-sm leading-relaxed text-gray-700 prose max-w-none"
              style={{ fontSize: '13px', lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{
                __html:
                  question.question.content ||
                  '<p>Passage content will appear here.</p>',
              }}
            />
          </aside>

          {/* right column: instruction + question + options */}
          <main className="col-span-7">
            <div className="mb-4">
              {question.question.instructions && (
                <div
                  className="italic text-sm text-gray-700"
                  style={{ fontSize: '13px', lineHeight: 1.5 }}
                >
                  {question.question.instructions}
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3
                className="text-lg text-gray-800 font-medium"
                style={{ fontSize: '15px' }}
              >
                {question.question.title ||
                  'Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.'}
              </h3>
            </div>

            <div className="space-y-3">
              {question.question.options
                .sort((a, b) => a.display_order - b.display_order)
                .map((option) => {
                  const isSelected = selectedOption === option.id;
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
                      <div className="flex-shrink-0 mt-1">
                        <input
                          id={`opt-${option.id}`}
                          type="radio"
                          name={`mcq-${question.sessionQuestionId}`}
                          checked={isSelected}
                          onChange={() => handleSelect(option.id)}
                          className="appearance-none h-4 w-4 rounded-full border border-gray-300 checked:bg-[#0071bc] checked:border-[#0071bc] focus:outline-none"
                        />
                      </div>

                      <div
                        className="text-sm text-gray-700 leading-relaxed"
                        style={{ fontSize: '14px', lineHeight: 1.7 }}
                      >
                        {option.text}
                      </div>
                    </label>
                  );
                })}
            </div>

            {/* IMPORTANT: Submission control intentionally omitted here.
                Parent layout should render global Next/Save controls and call onSubmit/onResponse.
                If you want an optional in-component submit, call handleSubmit from parent or wire a prop. */}
          </main>
        </div>
      </div>
    </div>
  );
}

export default PTEReadingMCQSingle;
