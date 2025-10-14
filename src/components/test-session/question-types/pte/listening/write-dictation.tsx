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
    const audioRef = useRef<HTMLAudioElement>(null);
    const [text, setText] = useState<string>(currentResponse?.text || '');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playCount, setPlayCount] = useState(0);
    const maxPlays = 1; // Only one play for dictation

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Find audio media
    const audioMedia = question.question.media.find(
      (m) => m.role === 'audio' || m.media.fileType === 'audio'
    );

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }, []);

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
      setCurrentTime(0);
    };

    // Format time display
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
              <div className="text-sm text-gray-700 leading-relaxed">
                {question.question.content}
              </div>
            )}
          </div>

          {/* Audio Player */}
          {audioMedia && (
            <div className="mb-10">
              <div
                style={{
                  maxWidth: 800,
                  margin: '0 auto',
                }}
              >
                <div
                  style={{
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: 8,
                    backgroundColor: '#fff',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  {/* Header */}
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

                  {/* Middle section - Status */}
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
                        ? 'Audio played - you will hear the sentence only once'
                        : 'Click play to hear the sentence'}
                    </div>
                  </div>

                  {/* Bottom bar - Controls */}
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
                    {/* Play/Pause Button */}
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

                    {/* Restart Button */}
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

                    {/* Volume Icon */}
                    <div
                      style={{
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Volume2 size={20} />
                    </div>

                    {/* Progress Bar */}
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

                    {/* Time Display */}
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

                    {/* Play Count */}
                    <div
                      style={{
                        fontSize: 13,
                        color: playCount >= maxPlays ? '#ef4444' : '#6b7280',
                        paddingLeft: 12,
                        borderLeft: '1px solid rgba(0,0,0,0.08)',
                        fontWeight: playCount >= maxPlays ? 600 : 400,
                      }}
                    >
                      {playCount >= maxPlays ? 'Played' : 'Not played yet'}
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
