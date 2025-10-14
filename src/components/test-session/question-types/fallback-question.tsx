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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  AlertTriangle,
  FileText,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  Image,
  Volume2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
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

interface FallbackQuestionProps {
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

export function FallbackQuestion({
  question,
  examId,
  onResponse,
  onSubmit,
  currentResponse,
}: FallbackQuestionProps) {
  const router = useRouter();
  const [responseText, setResponseText] = useState<string>(
    currentResponse?.text || ''
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    currentResponse?.selected_options || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questionData = question.question;

  // Handle text response changes
  const handleTextChange = (value: string) => {
    setResponseText(value);

    // Auto-save the response
    onResponse({
      questionId: questionData.id,
      sessionQuestionId: question.sessionQuestionId,
      response: { text: value },
      responseType: 'text',
    });
  };

  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
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
      questionId: questionData.id,
      sessionQuestionId: question.sessionQuestionId,
      response: newSelection,
      responseType: 'selection',
    });
  };

  // Submit the final answer
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let response: any;
      let responseType: string;

      if (
        questionData.questionType.inputType === 'text' ||
        questionData.questionType.inputType === 'long_text'
      ) {
        response = { text: responseText };
        responseType = 'text';
      } else if (
        questionData.questionType.inputType === 'single_choice' ||
        questionData.questionType.inputType === 'multiple_choice'
      ) {
        response = selectedOptions;
        responseType = 'selection';
      } else {
        // Default fallback
        response = responseText ? { text: responseText } : selectedOptions;
        responseType = responseText ? 'text' : 'selection';
      }

      await onSubmit({
        questionId: questionData.id,
        sessionQuestionId: question.sessionQuestionId,
        response,
        responseType,
      });

      toast.success('Answer submitted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render question media
  const renderMedia = (media: QuestionData['question']['media'][0]) => {
    const { mimeType, url, filename } = media.media;

    if (mimeType?.startsWith('image/')) {
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
    } else if (mimeType?.startsWith('audio/')) {
      return (
        <div key={media.id} className="mt-4">
          <div className="text-sm text-muted-foreground mb-2 flex items-center">
            <Volume2 className="h-4 w-4 mr-2" />
            {filename}
          </div>
          <audio controls className="w-full">
            <source src={url} type={mimeType} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    } else if (mimeType?.startsWith('video/')) {
      return (
        <div key={media.id} className="mt-4">
          <div className="text-sm text-muted-foreground mb-2 flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            {filename}
          </div>
          <video controls className="w-full max-w-2xl rounded-lg border">
            <source src={url} type={mimeType} />
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

  // Determine question type characteristics
  const isTextQuestion =
    questionData.questionType.inputType === 'text' ||
    questionData.questionType.inputType === 'long_text';

  const isMultipleChoice =
    questionData.questionType.inputType === 'multiple_choice' ||
    questionData.questionType.inputType === 'single_choice';

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Question Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                {questionData.title ||
                  `Question ${question.sequenceNumber + 1}`}
              </CardTitle>
              {questionData.instructions && (
                <CardDescription className="mt-2">
                  {questionData.instructions}
                </CardDescription>
              )}
            </div>
            <Badge variant="outline">
              {questionData.questionType.displayName}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {questionData.content && (
            <div
              className="prose max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: questionData.content }}
            />
          )}

          {/* Render question media */}
          {questionData.media
            .filter((m) => m.role === 'question_content')
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map(renderMedia)}
        </CardContent>
      </Card>

      {/* Response Area */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isTextQuestion
              ? 'Your Answer'
              : isMultipleChoice
              ? 'Select Your Answer'
              : 'Provide Your Response'}
          </CardTitle>
          <CardDescription>
            {isTextQuestion
              ? 'Type your response in the text area below'
              : isMultipleChoice
              ? 'Choose the correct answer(s)'
              : 'Provide your response based on the instructions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTextQuestion ? (
            <div className="space-y-4">
              <Textarea
                value={responseText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Type your answer here..."
                rows={6}
                className="min-h-[120px]"
              />
              <p className="text-sm text-muted-foreground">
                Press Ctrl+Enter to save your response
              </p>
            </div>
          ) : isMultipleChoice ? (
            <div className="space-y-4">
              {questionData.options
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((option) => {
                  const isSelected = selectedOptions.includes(option.id);

                  return (
                    <div
                      key={option.id}
                      className={`
                        flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50
                        ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200'
                        }
                      `}
                    >
                      <Checkbox
                        id={option.id}
                        checked={isSelected}
                        onCheckedChange={() => handleOptionSelect(option.id)}
                      />
                      <Label
                        htmlFor={option.id}
                        className="flex-1 text-base font-normal cursor-pointer"
                      >
                        <div className="space-y-2">
                          <span>{option.text}</span>
                          {/* Render option media if present */}
                          {questionData.media
                            .filter(
                              (m) =>
                                m.role === 'option_media' &&
                                m.media.id === option.mediaId
                            )
                            .map(renderMedia)}
                        </div>
                      </Label>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                value={responseText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Type your response here..."
                rows={4}
                className="min-h-[80px]"
              />

              {/* Display options if available but not a formal multiple choice */}
              {questionData.options && questionData.options.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Suggested Points:</h4>
                  <ul className="space-y-2">
                    {questionData.options
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((option) => (
                        <li key={option.id} className="flex items-start">
                          <div className="h-2 w-2 rounded-full bg-muted mt-2 mr-2"></div>
                          <span className="text-muted-foreground">
                            {option.text}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={
            (isTextQuestion && responseText.trim() === '') ||
            (isMultipleChoice && selectedOptions.length === 0) ||
            isSubmitting
          }
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

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Question Type Not Fully Supported
          </CardTitle>
          <CardDescription>
            This question type is not yet fully implemented in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">Question Type Details</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>
                    <strong>Name:</strong> {questionData.questionType.name}
                  </li>
                  <li>
                    <strong>Display Name:</strong>{' '}
                    {questionData.questionType.displayName}
                  </li>
                  <li>
                    <strong>Input Type:</strong>{' '}
                    {questionData.questionType.inputType}
                  </li>
                  <li>
                    <strong>Response Type:</strong>{' '}
                    {questionData.questionType.responseType}
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-1">System Information</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>
                    <strong>UI Component:</strong>{' '}
                    {questionData.questionType.uiComponent || 'Not set'}
                  </li>
                  <li>
                    <strong>Scoring Method:</strong>{' '}
                    {questionData.questionType.scoringMethod}
                  </li>
                  <li>
                    <strong>Exam:</strong>{' '}
                    {questionData.questionType.section.exam.displayName}
                  </li>
                  <li>
                    <strong>Section:</strong>{' '}
                    {questionData.questionType.section.displayName}
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">
                    Limited Functionality
                  </h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    This question type is not yet fully implemented in the
                    system. You can still provide a basic response, but advanced
                    features may not be available.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FallbackQuestion;
