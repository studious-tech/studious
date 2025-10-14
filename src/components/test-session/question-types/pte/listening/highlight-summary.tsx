'use client';

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
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
    const audioRef = useRef<HTMLAudioElement>(null);
    const [selectedOption, setSelectedOption] = useState<string>(
      currentResponse?.selected_options?.[0] || ''
    );
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playCount, setPlayCount] = useState(0);
    const maxPlays = 999;

    // Find audio media
    const audioMedia = question.question.media.find(
      (m) => m.role === 'audio' || m.media.fileType === 'audio'
    );

    // Audio event handlers
    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handleLoadedMetadata = () => setDuration(audio.duration);
      const handleEnded = () => {
        setIsPlaying(false);
        setPlayCount((prev) => prev + 1);
      };
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
      };
    }, []);

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

    // Play/pause handler
    const togglePlayPause = () => {
      if (!audioRef.current) return;

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        if (playCount >= maxPlays) return;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Audio play failed:', error);
          });
        }
      }
    };

    const restartAudio = () => {
      if (!audioRef.current) return;
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    };

    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          {audioMedia && (
            <div className="mb-10">
              <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <div
                  style={{
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: 8,
                    backgroundColor: '#fff',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid rgba(0,0,0,0.08)',
                      fontWeight: 700,
                      fontSize: 14,
                      color: '#1f2937',
                      backgroundColor: '#f9fafb',
                    }}
                  >
                    Audio Player
                  </div>

                  <div
                    style={{
                      height: 150,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <div
                      style={{
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: 14,
                      }}
                    >
                      {isPlaying
                        ? 'Playing...'
                        : playCount >= maxPlays
                        ? 'Maximum plays reached'
                        : 'Ready to play'}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 16px',
                      borderTop: '1px solid rgba(0,0,0,0.08)',
                      backgroundColor: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <button
                      onClick={togglePlayPause}
                      disabled={playCount >= maxPlays}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        border: '2px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s',
                        background:
                          playCount >= maxPlays
                            ? '#f3f4f6'
                            : isPlaying
                            ? '#1d4ed8'
                            : '#2563eb',
                        color: playCount >= maxPlays ? '#9ca3af' : '#fff',
                        cursor:
                          playCount >= maxPlays ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isPlaying ? (
                        <Pause size={18} fill="currentColor" />
                      ) : (
                        <Play
                          size={18}
                          fill="currentColor"
                          style={{ marginLeft: 2 }}
                        />
                      )}
                    </button>

                    <button
                      onClick={restartAudio}
                      disabled={playCount >= maxPlays}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        border: '1px solid rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        background: playCount >= maxPlays ? '#f3f4f6' : '#fff',
                        color: playCount >= maxPlays ? '#9ca3af' : '#6b7280',
                        cursor:
                          playCount >= maxPlays ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <RotateCcw size={16} />
                    </button>

                    <div
                      style={{
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Volume2 size={20} />
                    </div>

                    <div
                      style={{
                        flex: 1,
                        height: 4,
                        backgroundColor: '#e5e7eb',
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          width: `${
                            duration > 0 ? (currentTime / duration) * 100 : 0
                          }%`,
                          backgroundColor: '#2563eb',
                          transition: 'width 0.1s linear',
                        }}
                      />
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        color: '#6b7280',
                        minWidth: 80,
                        textAlign: 'right',
                      }}
                    >
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        color: '#6b7280',
                        paddingLeft: 12,
                        borderLeft: '1px solid rgba(0,0,0,0.08)',
                      }}
                    >
                      Plays: {playCount} {maxPlays < 999 ? `/ ${maxPlays}` : ''}
                    </div>
                  </div>

                  <audio
                    ref={audioRef}
                    src={getMediaUrl(audioMedia.media.id) || ''}
                    preload="metadata"
                  />
                </div>
              </div>
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
