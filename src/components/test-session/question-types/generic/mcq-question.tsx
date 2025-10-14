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
import { Label } from '@/components/ui/label';
import {
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Image,
  Volume2,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

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

interface MCQQuestionProps {
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

export function MCQQuestion({
  question,
  examId,
  onResponse,
  onSubmit,
  currentResponse,
}: MCQQuestionProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    currentResponse?.selected_options || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle single choice selection
  const handleSingleSelect = (optionId: string) => {
    const newSelection = [optionId];
    setSelectedOptions(newSelection);

    // Auto-save the response
    onResponse({
      questionId: question.question.id,
      sessionQuestionId: question.sessionQuestionId,
      response: newSelection,
      responseType: 'selection',
    });
  };

  // Handle multiple choice selection
  const handleMultiSelect = (optionId: string) => {
    const isSelected = selectedOptions.includes(optionId);
    let newSelection: string[];

    if (isSelected) {
      newSelection = selectedOptions.filter((id) => id !== optionId);
    } else {
      newSelection = [...selectedOptions, optionId];
    }

    setSelectedOptions(newSelection);

    // Auto-save the response
    onResponse({
      questionId: question.question.id,
      sessionQuestionId: question.sessionQuestionId,
      response: newSelection,
      responseType: 'selection',
    });
  };

  // Submit the final answer
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        questionId: question.question.id,
        sessionQuestionId: question.sessionQuestionId,
        response: selectedOptions,
        responseType: 'selection',
      });
      toast.success('Answer submitted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if this is a multiple choice question
  const isMultipleChoice =
    question.question.questionType.input_type === 'multiple_choice';
  const isSingleChoice =
    question.question.questionType.input_type === 'single_choice';

  // Render question media
  const renderMedia = (media: QuestionData['question']['media'][0]) => {
    const { mime_type, url, filename } = media.media;

    if (mime_type?.startsWith('image/')) {
      return (
        <div key={media.id} className="mt-4">
          <div className="text-sm text-muted-foreground mb-2 flex items-center">
            <Image className="h-4 w-4 mr-2" />
            {filename}
          </div>
          <img
            src={url}
            alt={filename}
            className="max-w-full h-auto rounded-lg border"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-image.svg';
            }}
          />
        </div>
      );
    } else if (mime_type?.startsWith('audio/')) {
      return (
        <div key={media.id} className="mt-4">
          <div className="text-sm text-muted-foreground mb-2 flex items-center">
            <Volume2 className="h-4 w-4 mr-2" />
            {filename}
          </div>
          <audio controls className="w-full">
            <source src={url} type={mime_type} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    } else if (mime_type?.startsWith('video/')) {
      return (
        <div key={media.id} className="mt-4">
          <div className="text-sm text-muted-foreground mb-2 flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            {filename}
          </div>
          <video controls className="w-full max-w-2xl rounded-lg border">
            <source src={url} type={mime_type} />
            Your browser does not support the video element.
          </video>
        </div>
      );
    } else {
      return (
        <div key={media.id} className="mt-4">
          <div className="text-sm text-muted-foreground mb-2 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            {filename}
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-muted rounded-md text-sm font-medium hover:bg-muted/80"
          >
            <FileText className="h-4 w-4 mr-2" />
            Download File
          </a>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Question Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                {question.question.title ||
                  `Question ${question.sequenceNumber + 1}`}
              </CardTitle>
              {question.question.instructions && (
                <CardDescription className="mt-2">
                  {question.question.instructions}
                </CardDescription>
              )}
            </div>
            <Badge variant="outline">
              {question.question.questionType.display_name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {question.question.content && (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: question.question.content }}
            />
          )}

          {/* Render question media */}
          {question.question.media
            .filter((m) => m.role === 'question_content')
            .sort((a, b) => a.display_order - b.display_order)
            .map(renderMedia)}
        </CardContent>
      </Card>

      {/* Answer Options */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isMultipleChoice ? 'Select All That Apply' : 'Select One Answer'}
          </CardTitle>
          <CardDescription>
            {isMultipleChoice
              ? 'Choose all correct answers'
              : 'Choose the best answer'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {question.question.options
              .sort((a, b) => a.display_order - b.display_order)
              .map((option) => {
                const isSelected = selectedOptions.includes(option.id);

                return (
                  <div
                    key={option.id}
                    className={`
                      flex items-start space-x-3 p-4 border rounded-lg transition-colors
                      ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    {isSingleChoice ? (
                      <div
                        className={`
                          flex h-5 w-5 items-center justify-center rounded-full border mt-0.5 cursor-pointer
                          ${
                            isSelected
                              ? 'border-primary bg-primary'
                              : 'border-gray-300 hover:border-gray-400'
                          }
                        `}
                        onClick={() => handleSingleSelect(option.id)}
                      >
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                    ) : (
                      <div
                        className={`
                          flex h-5 w-5 items-center justify-center rounded border mt-0.5 cursor-pointer
                          ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-gray-300 hover:border-gray-400'
                          }
                        `}
                        onClick={() => handleMultiSelect(option.id)}
                      >
                        {isSelected && <CheckCircle className="h-3 w-3" />}
                      </div>
                    )}

                    <div className="flex-1 space-y-2">
                      <Label
                        htmlFor={option.id}
                        className="text-base font-normal cursor-pointer"
                      >
                        {option.text}
                      </Label>

                      {/* Render option media if present */}
                      {question.question.media
                        .filter(
                          (m) =>
                            m.role === 'option_media' &&
                            m.media.id === option.media_id
                        )
                        .map(renderMedia)}
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={selectedOptions.length === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Answer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default MCQQuestion;
