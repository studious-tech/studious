'use client';

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { AudioPlayer } from '@/components/test-session/audio/AudioPlayer';
import { Textarea } from '@/components/ui/textarea';
import { getMediaUrl } from '@/lib/media-utils';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    response: { text: string };
    responseType: string;
  }) => void;
  onSubmit: (payload: {
    questionId: string;
    sessionQuestionId: string;
    response: { text: string };
    responseType: string;
  }) => void;
  currentResponse?: { text?: string };
}

export type SummarizeSpokenTextRef = {
  submit: () => void;
  getText: () => string;
};

const SummarizeSpokenText = forwardRef<SummarizeSpokenTextRef, Props>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ question, onResponse, onSubmit, currentResponse }, ref) => {
    const [text, setText] = useState<string>(currentResponse?.text || '');

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Find audio media
    const audioMedia = question.question.media.find(
      (m) => m.role === 'audio' || m.media.fileType === 'audio'
    );
    const audioUrl = audioMedia ? getMediaUrl(audioMedia.media.id) : null;

    // Calculate word count
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const isWithinRange = wordCount >= 50 && wordCount <= 70;

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }, []);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      submit: () => {
        notifyParent();
      },
      getText: () => text,
    }));

    const notifyParent = useCallback(() => {
      queueMicrotask(() => {
        onResponse({
          questionId: question.question.id,
          sessionQuestionId: question.sessionQuestionId,
          response: { text },
          responseType: 'text',
        });
      });
    }, [text, onResponse, question.question.id, question.sessionQuestionId]);

    // Debounced save on text change
    const handleTextChange = (newText: string) => {
      setText(newText);

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for auto-save
      saveTimeoutRef.current = setTimeout(() => {
        queueMicrotask(() => {
          onResponse({
            questionId: question.question.id,
            sessionQuestionId: question.sessionQuestionId,
            response: { text: newText },
            responseType: 'text',
          });
        });
      }, 1000); // 1 second debounce
    };

    return (
      <div className="min-h-[72vh] font-sans text-gray-900">
        <div className="max-w-5xl mx-auto px-8 py-6">
          {/* Instructions */}
          <div className="mb-8">
            {question.question.instructions && (
              <div className="italic text-sm text-gray-600 mb-4 leading-relaxed">
                {question.question.instructions}
              </div>
            )}
            {question.question.content && (
              <h3 className="text-lg text-gray-900 font-semibold leading-relaxed">
                {question.question.content}
              </h3>
            )}
          </div>

          {/* Audio Player */}
          {audioUrl && (
            <div className="mb-10">
              <AudioPlayer
                audioUrl={audioUrl}
                maxPlays={999}
                variant="full"
                showPlayCount={true}
                title="Audio Player"
              />
            </div>
          )}

          {/* Text Input Area */}
          {/* Text Input Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="text-sm font-semibold text-gray-800">
                Your Summary (50-70 words)
              </label>
              <div className="flex items-center gap-3">
                <span
                  className={`text-lg font-bold ${
                    isWithinRange
                      ? 'text-green-600'
                      : wordCount < 50
                      ? 'text-orange-600'
                      : 'text-red-600'
                  }`}
                >
                  {wordCount}
                </span>
                <span className="text-sm text-gray-500">
                  {isWithinRange
                    ? '✓ Within range'
                    : wordCount < 50
                    ? `Need ${50 - wordCount} more`
                    : `${wordCount - 70} over limit`}
                </span>
              </div>
            </div>

            <Textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Write your summary here. Focus on the main ideas and key points from the lecture..."
              className="min-h-[280px] text-base leading-relaxed resize-none p-5 rounded-lg border-2 border-gray-200 focus:border-blue-400"
              style={{
                fontSize: '15px',
                lineHeight: '1.8',
              }}
            />

            {/* Helpful hint */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-medium">💡 Tip:</span> Focus on main ideas
                and key points from the lecture. Write in complete sentences.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SummarizeSpokenText.displayName = 'SummarizeSpokenText';

export default SummarizeSpokenText;
