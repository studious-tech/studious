'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface AudioRecorderProps {
  topText: string;
  onRecordComplete: (blob: Blob) => void;
  preparationSeconds?: number;
  recordingSeconds?: number;
  externalPrepCountdown?: number | null; // External countdown value (null means not in prep phase)
  shouldStartPreparation?: boolean; // flag to control when to start prep countdown
  onStartPreparation?: () => void; // callback when preparation starts
  onPreparationComplete?: () => void; // callback when preparation completes and recording should start
  questionAudioUrl?: string; // URL for the question audio to be played first
  onQuestionAudioComplete?: () => void; // callback when question audio finishes
}

export default function AudioRecorder({
  topText,
  onRecordComplete,
  preparationSeconds = 0,
  recordingSeconds = 40,
  externalPrepCountdown,
  shouldStartPreparation = true, // by default, start immediately if preparationSeconds > 0
  onStartPreparation,
  onPreparationComplete,
  questionAudioUrl,
  onQuestionAudioComplete,
}: AudioRecorderProps) {
  const [preparationTime, setPreparationTime] = useState<number>(preparationSeconds);
  const [isPreparationPhase, setIsPreparationPhase] = useState<boolean>(
    preparationSeconds > 0 && shouldStartPreparation && externalPrepCountdown === undefined
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(recordingSeconds);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPlayingQuestion, setIsPlayingQuestion] = useState<boolean>(false); // New state for question audio
  const [playPosition, setPlayPosition] = useState<number>(0);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const preparationTimerRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const questionAudioRef = useRef<HTMLAudioElement | null>(null); // Reference for question audio

  // Handle external prep countdown
  useEffect(() => {
    if (externalPrepCountdown !== undefined && externalPrepCountdown !== null) {
      // Use external countdown value
      setPreparationTime(externalPrepCountdown);
      setIsPreparationPhase(externalPrepCountdown > 0);
      
      if (externalPrepCountdown <= 0 && isPreparationPhase) {
        // External countdown reached 0, preparation is complete
        setIsPreparationPhase(false);
        if (onPreparationComplete) {
          onPreparationComplete();
        }
        setIsRecording(true); // Start recording
      }
    } else if (externalPrepCountdown === null && isPreparationPhase) {
      // External countdown is null, but we were in prep phase, so stop prep
      setIsPreparationPhase(false);
    }
  }, [externalPrepCountdown, isPreparationPhase, onPreparationComplete]);

  // Internal prep countdown (when not using external countdown)
  useEffect(() => {
    if (!externalPrepCountdown && isPreparationPhase && preparationTime > 0) {
      if (preparationTime === preparationSeconds && onStartPreparation) {
        onStartPreparation();
      }
      
      preparationTimerRef.current = window.setInterval(() => {
        setPreparationTime((prev) => {
          if (prev <= 1) {
            setIsPreparationPhase(false);
            if (preparationTimerRef.current) {
              window.clearInterval(preparationTimerRef.current);
              preparationTimerRef.current = null;
            }
            if (onPreparationComplete) {
              onPreparationComplete();
            }
            setIsRecording(true); // Start recording automatically after prep countdown
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (preparationTimerRef.current) {
        window.clearInterval(preparationTimerRef.current);
        preparationTimerRef.current = null;
      }
    };
  }, [isPreparationPhase, preparationTime, preparationSeconds, externalPrepCountdown, onStartPreparation, onPreparationComplete]);

  // Play the question audio
  const playQuestionAudio = () => {
    if (!questionAudioUrl) {
      toast.error('No question audio available');
      return;
    }

    try {
      setIsPlayingQuestion(true);
      const audio = new Audio(questionAudioUrl);
      questionAudioRef.current = audio;
      
      audio.onended = () => {
        setIsPlayingQuestion(false);
        if (onQuestionAudioComplete) {
          onQuestionAudioComplete();
        }
      };
      
      audio.onerror = (e) => {
        console.error('Error playing question audio', e);
        setIsPlayingQuestion(false);
        toast.error('Failed to play question audio.');
      };
      
      audio.play();
    } catch (err) {
      console.error('Error playing question audio', err);
      setIsPlayingQuestion(false);
      toast.error('Failed to play question audio.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Recording countdown
  useEffect(() => {
    if (isRecording) {
      setTimeRemaining(recordingSeconds);
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
  }, [isRecording, recordingSeconds, stopRecording]);

  // audio element listeners
  useEffect(() => {
    const a = audioRef.current;
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

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);

        // probe duration
        const p = new Audio(url);
        p.addEventListener('loadedmetadata', () => {
          setDurationSeconds(Math.ceil(p.duration));
          p.remove();
        });

        onRecordComplete(blob);

        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPlaying(false);
      setPlayPosition(0);
      setDurationSeconds(0);
      setRecordedAudioUrl(null);
    } catch (err) {
      console.error(err);
      toast.error('Microphone access failed — check permissions.');
    }
  };

  const resetRecording = () => {
    if (isRecording) stopRecording();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (questionAudioRef.current) {
      questionAudioRef.current.pause();
      questionAudioRef.current = null;
    }
    setRecordedAudioUrl(null);
    setIsPlayingQuestion(false);
    if (preparationSeconds > 0 && !externalPrepCountdown) {
      setIsPreparationPhase(true);
      setPreparationTime(preparationSeconds);
    }
    setTimeRemaining(recordingSeconds);
    setPlayPosition(0);
    setDurationSeconds(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!recordedAudioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(recordedAudioUrl);
      audioRef.current.volume = volume;
      audioRef.current.addEventListener('timeupdate', () => {
        setPlayPosition(Math.floor(audioRef.current?.currentTime || 0));
      });
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDurationSeconds(Math.ceil(audioRef.current?.duration || 0));
      });
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current?.src !== recordedAudioUrl)
        audioRef.current.src = recordedAudioUrl;
      audioRef.current.volume = volume;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const progressPercent = () => {
    if (isRecording) {
      const elapsed = recordingSeconds - timeRemaining;
      return recordingSeconds > 0
        ? Math.min(100, (elapsed / recordingSeconds) * 100)
        : 0;
    }
    if (recordedAudioUrl && durationSeconds > 0) {
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
      {/* Main large recorder box */}
      <div
        style={{
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 4,
          background: '#fff',
          overflow: 'hidden',
        }}
      >
        {/* Top text */}
        <div
          style={{
            padding: '12px 14px',
            fontWeight: 700,
            color: '#374151',
          }}
        >
          {topText}
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
              color: isPlayingQuestion
                ? '#1d4ed8' // Different color for question audio playback
                : isPreparationPhase
                ? '#bf4444'
                : isRecording
                ? '#bf4444'
                : recordedAudioUrl
                ? '#064e3b'
                : '#6b7280',
              fontWeight: 700,
            }}
          >
            {isPlayingQuestion
              ? 'Playing Lecture Audio...'
              : isPreparationPhase
              ? `Recording in ${preparationTime}`
              : isRecording
              ? `Recording: ${formatTime(timeRemaining)}`
              : recordedAudioUrl
              ? 'Recording complete'
              : 'Ready'}
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
          {/* round record button (left) */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isPlayingQuestion ? (
              <button
                disabled
                aria-label="Playing"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '2px solid #9ca3af',
                  background: '#d1d5db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'default',
                }}
              >
                <div
                  style={{ width: 12, height: 12, background: '#fff' }}
                />
              </button>
            ) : !isRecording ? (
              <button
                onClick={() => {
                  if (questionAudioUrl && !isPreparationPhase && !recordedAudioUrl) {
                    // If there's a question audio URL and we're not in prep phase, play the question audio
                    playQuestionAudio();
                  } else if (!isPreparationPhase) {
                    startRecording();
                  } else {
                    toast('Recording available after preparation.');
                  }
                }}
                aria-label="Record"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: questionAudioUrl && !isPreparationPhase && !recordedAudioUrl ? '2px solid #1d4ed8' : '2px solid #dc2626',
                  background: questionAudioUrl && !isPreparationPhase && !recordedAudioUrl 
                    ? '#1d4ed8' 
                    : isPreparationPhase ? '#f3f4f6' : '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isPreparationPhase ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {questionAudioUrl && !isPreparationPhase && !recordedAudioUrl ? (
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: '8px solid white',
                      borderTop: '5px solid transparent',
                      borderBottom: '5px solid transparent',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: questionAudioUrl && !isPreparationPhase && !recordedAudioUrl ? 0 : 10,
                      height: questionAudioUrl && !isPreparationPhase && !recordedAudioUrl ? 0 : 10,
                      borderRadius: '50%',
                      background: isPreparationPhase ? '#9ca3af' : '#fff',
                    }}
                  />
                )}
              </button>
            ) : (
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
            )}
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
              ▶
            </button>

            <div style={{ minWidth: 92, fontSize: 13, color: '#374151' }}>
              {isPlayingQuestion
                ? 'Playing...'
                : isRecording
                ? formatTime(recordingSeconds - timeRemaining)
                : formatTime(playPosition)}{' '}
              /{' '}
              {isPlayingQuestion
                ? ''
                : isRecording
                ? formatTime(recordingSeconds)
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
                    width: isPlayingQuestion ? '0%' : `${progressPercent()}%`,
                    height: '100%',
                    background:
                      recordedAudioUrl || isRecording
                        ? '#9fbff5'
                        : isPlayingQuestion
                        ? '#60a5fa' // Blue for question audio
                        : '#d1d5db',
                    transition: 'width 150ms linear',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* small volume/status box - appears only while playing */}
      {isPlaying && (
        <div
          style={{
            marginTop: 10,
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <div
            style={{
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.08)',
              padding: 10,
              borderRadius: 4,
              width: 260,
            }}
          >
            <div style={{ fontSize: 13, marginBottom: 6 }}>
              <strong>Status:</strong> Playing
            </div>

            <div
              style={{
                fontSize: 13,
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ minWidth: 46 }}>Volume</div>
              <input
                aria-label="Volume"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                style={{ flex: 1 }}
              />
            </div>

            <div
              style={{ height: 8, background: '#eaeef2', borderRadius: 2 }}
            >
              <div
                style={{
                  width: `${progressPercent()}%`,
                  height: '100%',
                  background: '#3b82f6',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}