'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { toast } from 'sonner';
import { getMediaUrl } from '@/lib/media-utils';

interface Media {
  id: string;
  filename: string;
  fileType: string;
  url: string;
  durationSeconds?: number;
}

interface QuestionData {
  id: string;
  title?: string;
  content?: string;
  instructions?: string;
  difficultyLevel: number;
  expectedDurationSeconds?: number;
  questionType: {
    displayName: string;
  };
  media: Array<{
    id: string;
    role: string;
    media: Media;
  }>;
}

interface TestSessionQuestion {
  question: QuestionData;
  sessionQuestionId: string;
  sequenceNumber: number;
}

interface ResponseData {
  questionId: string;
  sessionQuestionId: string;
  response: Blob;
  responseType: string;
}

interface PTESpeakingAnswerShortQuestionProps {
  question: TestSessionQuestion;
  onResponse: (response: ResponseData) => void;
  preparationSeconds?: number;
  speakingSeconds?: number;
}

export default function PTESpeakingAnswerShortQuestion({
  question,
  onResponse,
  preparationSeconds = 3,
  speakingSeconds = 10,
}: PTESpeakingAnswerShortQuestionProps) {
  // Phase: playing → preparing → recording → completed
  const [phase, setPhase] = useState<
    'playing' | 'preparing' | 'recording' | 'completed'
  >('playing');
  const [preparationTime, setPreparationTime] =
    useState<number>(preparationSeconds);
  const [timeRemaining, setTimeRemaining] = useState<number>(speakingSeconds);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playPosition, setPlayPosition] = useState<number>(0);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const preparationTimerRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const questionAudioRef = useRef<HTMLAudioElement | null>(null);

  const questionData = question.question;
  const audioMedia = questionData.media?.find(
    (m) => m.media.fileType === 'audio'
  )?.media;
  const questionAudioUrl = audioMedia?.id ? getMediaUrl(audioMedia.id) : null;

  // Simple cleanup on unmount - just stop everything
  useEffect(() => {
    return () => {
      // Stop recording if in progress
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        try {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream
            ?.getTracks()
            .forEach((track) => track.stop());
        } catch (error) {
          console.error('Error stopping media recorder:', error);
        }
      }

      // Clear timers
      if (preparationTimerRef.current) {
        clearInterval(preparationTimerRef.current);
        preparationTimerRef.current = null;
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      // Stop and remove audio elements completely
      if (questionAudioRef.current) {
        questionAudioRef.current.pause();
        questionAudioRef.current.src = '';
        questionAudioRef.current.remove();
        questionAudioRef.current = null;
      }
      if (playbackAudioRef.current) {
        playbackAudioRef.current.pause();
        playbackAudioRef.current.src = '';
        playbackAudioRef.current.remove();
        playbackAudioRef.current = null;
      }

      // Cancel TTS
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      // Revoke blob URL
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadVoices = useCallback((): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      let voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }

      // Voices may not be loaded yet, wait for them
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      };

      // Fallback timeout in case onvoiceschanged never fires
      setTimeout(() => {
        voices = window.speechSynthesis.getVoices();
        resolve(voices);
      }, 1000);
    });
  }, []);

  const playQuestionAudio = useCallback(async () => {
    try {
      // Prefer audio file if available
      if (questionAudioUrl) {
        if (questionAudioRef.current) {
          questionAudioRef.current.pause();
          questionAudioRef.current = null;
        }

        questionAudioRef.current = new Audio(questionAudioUrl);

        questionAudioRef.current.onerror = (e) => {
          console.error('Error loading question audio:', e);
          toast.error('Failed to load question audio');
          setPhase('preparing');
          setPreparationTime(preparationSeconds);
        };

        questionAudioRef.current.onended = () => {
          setPhase('preparing');
          setPreparationTime(preparationSeconds);
        };

        await questionAudioRef.current.play();
        return;
      }

      // Fallback to TTS if no audio file but content exists
      if (
        questionData.content &&
        typeof window !== 'undefined' &&
        'speechSynthesis' in window
      ) {
        const utterance = new SpeechSynthesisUtterance(questionData.content);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Load voices and select an English voice
        const voices = await loadVoices();
        if (voices.length > 0) {
          const englishVoice =
            voices.find((v) => v.lang.startsWith('en')) || voices[0];
          if (englishVoice) {
            utterance.voice = englishVoice;
          }
        }

        utterance.onend = () => {
          setPhase('preparing');
          setPreparationTime(preparationSeconds);
        };

        utterance.onerror = (e) => {
          console.error('TTS error:', e);
          toast.error('Failed to speak question text');
          setPhase('preparing');
          setPreparationTime(preparationSeconds);
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        return;
      }

      // No audio or text available
      console.warn('No question audio or content available');
      toast.error('No question audio available');
      setPhase('preparing');
      setPreparationTime(preparationSeconds);
    } catch (error) {
      console.error('Error playing question:', error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast.error('Click the play button to start');
      } else {
        toast.error('Failed to play question');
      }
    }
  }, [questionAudioUrl, questionData.content, preparationSeconds, loadVoices]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    if (isCompleted || recordedAudioUrl) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);
          setRecordedAudioUrl(url);
          setIsCompleted(true);
          setPhase('completed');

          const p = new Audio(url);
          p.addEventListener('loadedmetadata', () => {
            setDurationSeconds(Math.ceil(p.duration));
            p.remove();
          });

          onResponse({
            questionId: questionData.id,
            sessionQuestionId: question.sessionQuestionId,
            response: blob,
            responseType: 'audio_recording',
          });
        } else {
          setIsCompleted(true);
          setPhase('completed');
        }

        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPlaying(false);
      setPlayPosition(0);
    } catch (err) {
      console.error(err);
      toast.error('Microphone access failed — check permissions.');
    }
  }, [
    isCompleted,
    recordedAudioUrl,
    onResponse,
    questionData.id,
    question.sessionQuestionId,
  ]);

  // Preparation countdown
  useEffect(() => {
    // Don't restart if already completed
    if (isCompleted) {
      return;
    }

    if (phase === 'preparing') {
      if (preparationTimerRef.current) {
        window.clearInterval(preparationTimerRef.current);
        preparationTimerRef.current = null;
      }

      preparationTimerRef.current = window.setInterval(() => {
        setPreparationTime((prev) => {
          if (prev <= 1) {
            setPhase('recording');
            if (preparationTimerRef.current) {
              window.clearInterval(preparationTimerRef.current);
              preparationTimerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (preparationTimerRef.current) {
        window.clearInterval(preparationTimerRef.current);
        preparationTimerRef.current = null;
      }
    }
    return () => {
      if (preparationTimerRef.current) {
        window.clearInterval(preparationTimerRef.current);
        preparationTimerRef.current = null;
      }
    };
  }, [phase, question.sessionQuestionId, isCompleted]);

  // Auto-start recording when phase becomes 'recording'
  useEffect(() => {
    if (phase === 'recording' && !isRecording && !isCompleted) {
      setTimeout(() => startRecording(), 100);
    }
  }, [phase, isRecording, isCompleted, startRecording]);

  // Recording countdown
  useEffect(() => {
    if (isRecording && !isCompleted) {
      setTimeRemaining(speakingSeconds);

      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      recordingTimerRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
    return () => {
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    };
  }, [isRecording, isCompleted, speakingSeconds, stopRecording]);

  // Audio element listeners
  useEffect(() => {
    const a = playbackAudioRef.current;
    if (!a) return;
    const timeHandler = () => setPlayPosition(Math.floor(a.currentTime));
    const endHandler = () => setIsPlaying(false);
    a.addEventListener('timeupdate', timeHandler);
    a.addEventListener('ended', endHandler);
    return () => {
      a.removeEventListener('timeupdate', timeHandler);
      a.removeEventListener('ended', endHandler);
    };
  }, [recordedAudioUrl]);

  const togglePlay = () => {
    if (!recordedAudioUrl) return;
    if (!playbackAudioRef.current) {
      playbackAudioRef.current = new Audio(recordedAudioUrl);
      playbackAudioRef.current.addEventListener('timeupdate', () => {
        setPlayPosition(Math.floor(playbackAudioRef.current?.currentTime || 0));
      });
      playbackAudioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      playbackAudioRef.current.addEventListener('loadedmetadata', () => {
        setDurationSeconds(Math.ceil(playbackAudioRef.current?.duration || 0));
      });
    }

    if (isPlaying) {
      playbackAudioRef.current?.pause();
      setIsPlaying(false);
    } else {
      playbackAudioRef.current.play();
      setIsPlaying(true);
    }
  };

  const progressPercent = () => {
    if (isCompleted && !isPlaying) {
      return 0;
    }

    if (isRecording) {
      const elapsed = speakingSeconds - timeRemaining;
      return speakingSeconds > 0
        ? Math.min(100, (elapsed / speakingSeconds) * 100)
        : 0;
    }

    if (recordedAudioUrl && durationSeconds > 0 && isPlaying) {
      return Math.min(100, (playPosition / durationSeconds) * 100);
    }

    return 0;
  };

  return (
    <div
      style={{
        width: '100%',
        padding: 20,
        fontFamily: 'Arial, sans-serif',
        color: '#071029',
        boxSizing: 'border-box',
      }}
    >
      {/* instruction */}
      <div
        style={{
          maxWidth: '80%',
          paddingLeft: 6,
          marginTop: 32,
          marginBottom: 24,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 15,
            fontStyle: 'italic',
            lineHeight: 1.12,
          }}
        >
          {questionData.instructions ||
            'You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.'}
        </p>
      </div>

      {/* Centered Audio Recorder Box */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
        <div style={{ width: '100%', maxWidth: 800 }}>
          {/* Main large recorder box */}
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
              Audio Recorder
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
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {phase === 'playing' ? (
                <>
                  <div
                    style={{
                      textAlign: 'center',
                      color: '#6b7280',
                      fontWeight: 700,
                    }}
                  >
                    Click the button to hear the question
                  </div>
                  <button
                    onClick={playQuestionAudio}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px 24px',
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = '#1d4ed8')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = '#2563eb')
                    }
                  >
                    <Play className="h-5 w-5" />
                    <span>Play Question</span>
                  </button>
                </>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    color:
                      phase === 'preparing'
                        ? '#bf4444'
                        : isRecording
                        ? '#bf4444'
                        : isCompleted || phase === 'completed'
                        ? '#064e3b'
                        : '#6b7280',
                    fontWeight: 700,
                  }}
                >
                  {phase === 'preparing'
                    ? `Recording begins in ${preparationTime}s`
                    : isRecording
                    ? `Recording: ${formatTime(timeRemaining)}`
                    : isCompleted || phase === 'completed'
                    ? 'Recording complete'
                    : 'Ready'}
                </div>
              )}
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
              {/* round record button (left) */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {!isRecording && !isCompleted ? (
                  <button
                    onClick={() => {
                      if (phase === 'recording') startRecording();
                    }}
                    disabled={phase !== 'recording' || isCompleted}
                    aria-label="Record"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: '2px solid #dc2626',
                      background: phase !== 'recording' ? '#f3f4f6' : '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: phase !== 'recording' ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: phase !== 'recording' ? '#9ca3af' : '#fff',
                      }}
                    />
                  </button>
                ) : isRecording ? (
                  <button
                    onClick={stopRecording}
                    aria-label="Stop"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: '2px solid #b91c1c',
                      background: '#b91c1c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{ width: 12, height: 12, background: '#fff' }}
                    />
                  </button>
                ) : null}
              </div>

              {/* play, time, progress */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flex: 1,
                }}
              >
                <button
                  onClick={togglePlay}
                  disabled={!recordedAudioUrl}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 6,
                    border: '1px solid rgba(0,0,0,0.06)',
                    background: recordedAudioUrl ? '#fff' : '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: recordedAudioUrl ? 'pointer' : 'not-allowed',
                  }}
                  aria-label="Play"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </button>

                <div style={{ minWidth: 92, fontSize: 13, color: '#374151' }}>
                  {isRecording
                    ? formatTime(speakingSeconds - timeRemaining)
                    : isPlaying
                    ? formatTime(playPosition)
                    : formatTime(0)}{' '}
                  /{' '}
                  {isRecording
                    ? formatTime(speakingSeconds)
                    : formatTime(durationSeconds)}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      height: 6,
                      background: '#e6e6e6',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${progressPercent()}%`,
                        height: '100%',
                        background:
                          recordedAudioUrl || isRecording
                            ? '#9fbff5'
                            : '#d1d5db',
                        transition: 'width 150ms linear',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
