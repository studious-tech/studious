'use client';

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { AudioPlayer } from '@/components/test-session/audio/AudioPlayer';
import { Input } from '@/components/ui/input';
import { getMediaUrl } from '@/lib/media-utils';

interface Blank {
  id: string;
  position: number;
  correct_answer: string;
  accept_variants?: string[];
  case_sensitive?: boolean;
  max_length?: number;
}

interface BlanksConfig {
  type: string;
  blanks: Blank[];
  max_plays?: number;
}

interface MediaItem {
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
  };
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
    media: MediaItem[];
    options: Array<any>;
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

export type FIBTypingRef = {
  submit: () => void;
  getAnswers: () => Record<string, string>;
};

const FIBTyping = forwardRef<FIBTypingRef, Props>(
  ({ question, onResponse, onSubmit }, ref) => {
    const blanksConfig = question.question.blanks_config;
    const content = question.question.content || '';

    // Find audio media
    const audioMedia = question.question.media.find(
      (m) => m.role === 'audio' || m.media.fileType === 'audio'
    );
    const audioUrl = audioMedia ? getMediaUrl(audioMedia.media.id) : null;

    // Initialize answers - always start fresh
    const [answers, setAnswers] = useState<Record<string, string>>({});

    // Ref for debouncing saves
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup on unmount - clear timeout
    useEffect(() => {
      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }, []);

    // Get blank config by ID
    const getBlankConfig = useCallback(
      (blankId: string): Blank | undefined => {
        return blanksConfig?.blanks?.find((b) => b.id === blankId);
      },
      [blanksConfig]
    );

    // Parse content and create segments with blanks
    const contentSegments = useMemo(() => {
      if (!blanksConfig?.blanks) return [{ type: 'text', content }];

      const segments: Array<{
        type: 'text' | 'blank';
        content?: string;
        blankId?: string;
        blankConfig?: Blank;
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

        // Find blank config
        const blankConfig = getBlankConfig(blankId);

        // Add blank
        segments.push({
          type: 'blank',
          blankId,
          blankConfig,
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
    }, [content, blanksConfig, getBlankConfig]);

    // Debounced save function
    const saveResponseDebounced = useCallback(
      (newAnswers: Record<string, string>) => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
          onResponse({
            questionId: question.question.id,
            sessionQuestionId: question.sessionQuestionId,
            response: { answers: newAnswers },
            responseType: 'structured_data',
          });
        }, 1000); // 1 second debounce for typing
      },
      [onResponse, question.question.id, question.sessionQuestionId]
    );

    // Handle answer change - update state and debounced save
    const handleAnswerChange = useCallback(
      (blankId: string, value: string) => {
        setAnswers((prevAnswers) => {
          const newAnswers = { ...prevAnswers, [blankId]: value };
          saveResponseDebounced(newAnswers);
          return newAnswers;
        });
      },
      [saveResponseDebounced]
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
        {/* Single column container - full width */}
        <div className="max-w-full mx-auto px-8">
          {/* Instructions */}
          {question.question.instructions && (
            <div className="mb-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-sm text-blue-900">
                  {question.question.instructions}
                </p>
              </div>
            </div>
          )}

          {/* Title */}
          {question.question.title && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {question.question.title}
              </h2>
            </div>
          )}

          {/* Audio Player */}
          {audioUrl && (
            <div
              style={{
                marginBottom: 32,
                maxWidth: 800,
                margin: '0 auto 32px auto',
              }}
            >
              <AudioPlayer
                audioUrl={audioUrl}
                maxPlays={blanksConfig?.max_plays || 999}
                variant="full"
                showPlayCount={true}
                title="Audio Player"
              />
            </div>
          )}

          {/* Content with input fields */}
          <div className="mt-8">
            <div className="bg-white p-0">
              <div
                className="text-lg leading-relaxed text-gray-900"
                style={{ lineHeight: '2.5' }}
              >
                {contentSegments.map((segment, index) => {
                  if (segment.type === 'text') {
                    return (
                      <span
                        key={`text-${index}`}
                        className="whitespace-pre-wrap"
                      >
                        {segment.content}
                      </span>
                    );
                  }

                  if (
                    segment.type === 'blank' &&
                    'blankConfig' in segment &&
                    segment.blankConfig
                  ) {
                    const blankId = segment.blankId!;
                    const blankConfig = segment.blankConfig;
                    const value = answers[blankId] || '';
                    const maxLength = blankConfig.max_length || 50;

                    return (
                      <span
                        key={`blank-${index}`}
                        className="inline-block mx-2 align-middle"
                      >
                        <Input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            handleAnswerChange(blankId, e.target.value)
                          }
                          maxLength={maxLength}
                          className="w-40 h-9 text-center border border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white px-2 text-base"
                        />
                      </span>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

FIBTyping.displayName = 'FIBTyping';

export default FIBTyping;
