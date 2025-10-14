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
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
  ({ question, onResponse, onSubmit, currentResponse }, ref) => {
    const blanksConfig = question.question.blanks_config;
    const content = question.question.content || '';
    const audioRef = useRef<HTMLAudioElement>(null);

    // Find audio media
    const audioMedia = question.question.media.find(
      (m) => m.role === 'audio' || m.media.fileType === 'audio'
    );

    // Initialize answers - always start fresh
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup on unmount - clear timeout
    useEffect(() => {
      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }, []);

    // Audio state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playCount, setPlayCount] = useState(0);
    const maxPlays = blanksConfig?.max_plays || 999; // Unlimited by default

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

    // Play/pause handler
    const togglePlayPause = () => {
      if (!audioRef.current) return;

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        if (playCount >= maxPlays) {
          return; // Max plays reached
        }
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Audio play failed:', error);
          });
        }
      }
    };

    // Restart audio
    const restartAudio = () => {
      if (!audioRef.current) return;
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    };

    // Format time
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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

          {/* Audio Player - exact copy from describe-image recorder box */}
          {audioMedia && (
            <div
              style={{
                marginBottom: 32,
                maxWidth: 800,
                margin: '0 auto 32px auto',
              }}
            >
              <div
                style={{
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 4,
                  background: '#fff',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '12px 14px',
                    fontWeight: 700,
                    color: '#374151',
                  }}
                >
                  Audio Player
                </div>

                {/* large empty area with centered status */}
                <div
                  style={{
                    height: 150,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderTop: '1px solid rgba(0,0,0,0.04)',
                    background: '#fff',
                  }}
                >
                  <div
                    style={{
                      textAlign: 'center',
                      color: isPlaying ? '#2563eb' : '#6b7280',
                      fontWeight: 700,
                    }}
                  >
                    {isPlaying
                      ? `Playing: ${formatTime(currentTime)} / ${formatTime(
                          duration
                        )}`
                      : playCount >= maxPlays
                      ? 'Maximum plays reached'
                      : 'Ready to play'}
                  </div>
                </div>

                {/* bottom control bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    background: '#f8f9fa',
                    borderTop: '1px solid rgba(0,0,0,0.08)',
                  }}
                >
                  {/* Play/Pause button (left) */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                      onClick={togglePlayPause}
                      disabled={playCount >= maxPlays}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        border: '2px solid #2563eb',
                        background:
                          playCount >= maxPlays
                            ? '#f3f4f6'
                            : isPlaying
                            ? '#1d4ed8'
                            : '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor:
                          playCount >= maxPlays ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" style={{ color: '#fff' }} />
                      ) : (
                        <Play
                          className="h-4 w-4 ml-0.5"
                          style={{ color: '#fff' }}
                        />
                      )}
                    </button>
                  </div>

                  {/* Restart button */}
                  <button
                    onClick={restartAudio}
                    disabled={playCount >= maxPlays}
                    aria-label="Restart"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: '2px solid #6b7280',
                      background: playCount >= maxPlays ? '#f3f4f6' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: playCount >= maxPlays ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <RotateCcw
                      className="h-4 w-4"
                      style={{ color: '#6b7280' }}
                    />
                  </button>

                  {/* volume icon + progress */}
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <Volume2 className="h-5 w-5" style={{ color: '#6b7280' }} />
                    <div style={{ flex: 1 }}>
                      <Progress
                        value={(currentTime / duration) * 100 || 0}
                        className="h-2"
                      />
                    </div>
                  </div>

                  {/* time display */}
                  <div
                    style={{
                      fontSize: 13,
                      color: '#6b7280',
                      fontFamily: 'monospace',
                      minWidth: 80,
                      textAlign: 'right',
                    }}
                  >
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>

                  {/* play count */}
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
