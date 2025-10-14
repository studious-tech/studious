'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';
import { getMediaUrl } from '@/lib/media-utils';

interface Media {
  id: string;
  filename: string;
  fileType: string;
  url: string;
  dimensions?: { width: number; height: number };
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

interface PTESpeakingRetellLectureProps {
  question: TestSessionQuestion;
  onResponse: (response: ResponseData) => void;
  preparationSeconds?: number;
  speakingSeconds?: number;
}

export default function PTESpeakingRetellLecture({
  question,
  onResponse,
  preparationSeconds = 10,
  speakingSeconds = 40,
}: PTESpeakingRetellLectureProps) {
  // Phase: playing (lecture) → preparing → recording → completed
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
  const lectureAudioRef = useRef<HTMLAudioElement | null>(null);

  const questionData = question.question;
  const imageMedia = questionData.media?.find(
    (m) => m.media.fileType === 'image'
  )?.media;
  const audioMedia = questionData.media?.find(
    (m) => m.media.fileType === 'audio'
  )?.media;
  const imageUrl = imageMedia?.id ? getMediaUrl(imageMedia.id) : null;
  const lectureAudioUrl = audioMedia?.id ? getMediaUrl(audioMedia.id) : null;

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
      if (playbackAudioRef.current) {
        playbackAudioRef.current.pause();
        playbackAudioRef.current.src = '';
        playbackAudioRef.current.remove();
        playbackAudioRef.current = null;
      }
      if (lectureAudioRef.current) {
        lectureAudioRef.current.pause();
        lectureAudioRef.current.src = '';
        lectureAudioRef.current.remove();
        lectureAudioRef.current = null;
      }

      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playLectureAudio = useCallback(async () => {
    if (!lectureAudioUrl) {
      toast.error('Lecture audio not available');
      setPhase('preparing');
      return;
    }

    try {
      if (lectureAudioRef.current) {
        lectureAudioRef.current.pause();
        lectureAudioRef.current = null;
      }

      lectureAudioRef.current = new Audio(lectureAudioUrl);

      lectureAudioRef.current.onerror = (e) => {
        console.error('Error loading lecture audio:', e);
        toast.error('Failed to load lecture audio');
        setPhase('preparing');
        setPreparationTime(preparationSeconds);
      };

      lectureAudioRef.current.onended = () => {
        setPhase('preparing');
        setPreparationTime(preparationSeconds);
      };

      await lectureAudioRef.current.play();
    } catch (error) {
      console.error('Error playing lecture audio:', error);
      // If autoplay fails due to browser policy, just stay in playing phase
      // User will need to click the play button
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast.error('Click the play button to start');
      } else {
        toast.error('Failed to play lecture audio');
      }
    }
  }, [lectureAudioUrl, preparationSeconds]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    if (isCompleted || recordedAudioUrl) {
      return; // Don't allow re-recording after completion
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

        // Only save if there's actual audio data (blob size > 0)
        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);
          setRecordedAudioUrl(url);
          setIsCompleted(true);
          setPhase('completed');

          // Probe duration
          const p = new Audio(url);
          p.addEventListener('loadedmetadata', () => {
            setDurationSeconds(Math.ceil(p.duration));
            p.remove();
          });

          // Call onResponse to save the blob
          onResponse({
            questionId: questionData.id,
            sessionQuestionId: question.sessionQuestionId,
            response: blob,
            responseType: 'audio_recording',
          });
        } else {
          // No audio recorded, just mark as completed without saving
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

  // Don't auto-play due to browser autoplay policies
  // User must click play button to start lecture audio

  // Preparation countdown
  useEffect(() => {
    if (phase === 'preparing') {
      // Clear any existing timer first
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
      // Clean up timer if phase changes
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
  }, [phase, question.sessionQuestionId]);

  // Auto-start recording when phase becomes 'recording'
  useEffect(() => {
    if (phase === 'recording' && !isRecording && !isCompleted) {
      setTimeout(() => startRecording(), 100);
    }
  }, [phase, isRecording, isCompleted, startRecording]);

  // Recording countdown
  useEffect(() => {
    if (isRecording) {
      setTimeRemaining(speakingSeconds);
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
  }, [isRecording, speakingSeconds, stopRecording]);

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
    if (isRecording) {
      const elapsed = speakingSeconds - timeRemaining;
      return speakingSeconds > 0
        ? Math.min(100, (elapsed / speakingSeconds) * 100)
        : 0;
    }
    if (recordedAudioUrl && durationSeconds > 0) {
      return Math.min(100, (playPosition / durationSeconds) * 100);
    }
    return 0;
  };

  // --------- RENDER ----------
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
            `Listen to the lecture. You will have ${preparationSeconds} seconds to prepare your response, then ${speakingSeconds} seconds to retell what you heard.`}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 28, marginTop: 18 }}>
        {/* left image */}
        <div
          style={{
            flex: 1,
            maxWidth: '62%',
            background: '#fff',
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 20,
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            {questionData.title || 'Figure'}
          </div>
          <div>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Question"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            ) : (
              <div
                style={{
                  height: 360,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f8fafc',
                  borderRadius: 6,
                  border: '1px dashed rgba(0,0,0,0.06)',
                  color: '#6b6b6b',
                }}
              >
                <ImageIcon size={56} />
                <div style={{ marginTop: 8 }}>No image provided</div>
              </div>
            )}
          </div>
        </div>

        {/* right combined recording area */}
        <div style={{ width: 520, flexShrink: 0 }}>
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
                    Click the button below to play the lecture audio
                  </div>
                  <button
                    onClick={playLectureAudio}
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
                    <span>Play Lecture Audio</span>
                  </button>
                </>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    color:
                      phase === 'preparing'
                        ? '#bf4444'
                        : phase === 'recording'
                        ? '#bf4444'
                        : '#064e3b',
                    fontWeight: 700,
                  }}
                >
                  {phase === 'preparing'
                    ? `Recording begins in ${preparationTime}s`
                    : phase === 'recording'
                    ? `Recording: ${formatTime(timeRemaining)}`
                    : 'Recording complete'}
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
              {/* round record button (left) - disabled when playing/preparing/completed */}
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
                    : formatTime(playPosition)}{' '}
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
