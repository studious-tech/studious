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
import { Input } from '@/components/ui/input';
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

export type WriteDictationRef = {
  submit: () => void;
  getText: () => string;
};

const WriteDictation = forwardRef<WriteDictationRef, Props>(
  ({ question, onResponse, currentResponse }, ref) => {
    const [text, setText] = useState<string>(currentResponse?.text || '');

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Find audio media
    const audioMedia = question.question.media.find(
      (m) => m.role === 'audio' || m.media.fileType === 'audio'
    );
    const audioUrl = audioMedia ? getMediaUrl(audioMedia.media.id) : null;

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
              <div className="text-sm text-gray-700 leading-relaxed">
                {question.question.content}
              </div>
            )}
          </div>

          {/* Audio Player */}
          {audioUrl && (
            <div className="mb-10">
              <AudioPlayer
                audioUrl={audioUrl}
                maxPlays={1}
                variant="full"
                showPlayCount={true}
                title="Audio Player"
              />
            </div>
          )}

          {/* Text Input */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="text-sm font-semibold text-gray-800">
                Type the sentence exactly as you hear it:
              </label>
            </div>

            <Input
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Type the sentence here..."
              className="text-base p-5 h-14 rounded-lg border-2 border-gray-200 focus:border-blue-400"
              style={{
                fontSize: '15px',
              }}
            />

            {/* Helpful hint */}
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">⚠️ Important:</span> You can only
                play the audio once. Listen carefully and type exactly what you
                hear!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

WriteDictation.displayName = 'PTEListeningWriteDictation';

export default WriteDictation;
