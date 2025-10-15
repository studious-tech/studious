'use client';

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import { AudioPlayer } from '@/components/test-session/audio/AudioPlayer';
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

interface QuestionOption {
  id: string;
  text: string;
  is_correct: boolean;
  display_order: number;
  media_id?: string;
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
    response: string[];
    responseType: string;
  }) => void;
  onSubmit: (payload: {
    questionId: string;
    sessionQuestionId: string;
    response: string[];
    responseType: string;
  }) => void;
  currentResponse?: { selected_options?: string[] };
}

export type MCQSingleRef = {
  submit: () => void;
  getSelectedOption: () => string;
};

const MCQSingle = forwardRef<MCQSingleRef, Props>(
  ({ question, onResponse, currentResponse }, ref) => {
    const [selectedOption, setSelectedOption] = useState<string>(
      currentResponse?.selected_options?.[0] || ''
    );

    // Find audio media
    const audioMedia = question.question.media.find(
      (m) => m.role === 'audio' || m.media.fileType === 'audio'
    );
    const audioUrl = audioMedia ? getMediaUrl(audioMedia.media.id) : null;

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      submit: () => {
        notifyParent();
      },
      getSelectedOption: () => selectedOption,
    }));

    const notifyParent = useCallback(() => {
      queueMicrotask(() => {
        onResponse({
          questionId: question.question.id,
          sessionQuestionId: question.sessionQuestionId,
          response: [selectedOption],
          responseType: 'selection',
        });
      });
    }, [
      selectedOption,
      onResponse,
      question.question.id,
      question.sessionQuestionId,
    ]);

    // Handle option selection
    const handleSelect = (optionId: string) => {
      setSelectedOption(optionId);

      // Auto-save
      queueMicrotask(() => {
        onResponse({
          questionId: question.question.id,
          sessionQuestionId: question.sessionQuestionId,
          response: [optionId],
          responseType: 'selection',
        });
      });
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

          {/* Options */}
          <div className="space-y-4">
            {question.question.options
              .sort((a, b) => a.display_order - b.display_order)
              .map((option) => {
                const isSelected = selectedOption === option.id;
                return (
                  <label
                    key={option.id}
                    htmlFor={`opt-${option.id}`}
                    className={`flex items-start gap-4 p-5 rounded-lg cursor-pointer select-none transition-all duration-200 border-2
                      ${
                        isSelected
                          ? 'bg-blue-50 border-blue-300 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <input
                        id={`opt-${option.id}`}
                        type="radio"
                        name={`mcq-${question.sessionQuestionId}`}
                        checked={isSelected}
                        onChange={() => handleSelect(option.id)}
                        className="appearance-none h-5 w-5 rounded-full border-2 border-gray-300 checked:bg-blue-600 checked:border-blue-600 checked:ring-2 checked:ring-blue-200 focus:outline-none cursor-pointer"
                      />
                    </div>

                    <div
                      className="flex-1 text-gray-800 leading-relaxed"
                      style={{ fontSize: '15px', lineHeight: 1.6 }}
                    >
                      {option.text}
                    </div>
                  </label>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
);

MCQSingle.displayName = 'PTEListeningHighlightSummary';

export default MCQSingle;
