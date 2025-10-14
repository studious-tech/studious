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
import { Input } from '@/components/ui/input';
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

interface TextResponseQuestionProps {
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

export function TextResponseQuestion({
  question,
  examId,
  onResponse,
  onSubmit,
  currentResponse,
}: TextResponseQuestionProps) {
  const [textResponse, setTextResponse] = useState<string>(
    currentResponse?.text || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle text response changes
  const handleTextChange = (value: string) => {
    setTextResponse(value);

    // Auto-save the response
    onResponse({
      questionId: question.question.id,
      sessionQuestionId: question.sessionQuestionId,
      response: { text: value },
      responseType: 'text',
    });
  };

  // Submit the final answer
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        questionId: question.question.id,
        sessionQuestionId: question.sessionQuestionId,
        response: { text: textResponse },
        responseType: 'text',
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

      {/* Text Response */}
      <Card>
        <CardHeader>
          <CardTitle>Your Answer</CardTitle>
          <CardDescription>
            Type your response in the text area below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={textResponse}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Type your answer here..."
              rows={12}
              className="min-h-[200px]"
            />

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {textResponse.length} characters
              </div>
              <div className="flex items-center gap-2">
                {question.question.expected_duration_seconds && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {Math.floor(
                        question.question.expected_duration_seconds / 60
                      )}
                      m {question.question.expected_duration_seconds % 60}s
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Press Ctrl+Enter to save your response
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={textResponse.trim() === '' || isSubmitting}
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

export default TextResponseQuestion;
