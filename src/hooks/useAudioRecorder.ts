/**
 * useAudioRecorder Hook
 *
 * Reusable hook for audio recording functionality with phase management.
 * Used in all Speaking question types.
 *
 * Features:
 * - Phase management (idle → preparing → recording → completed)
 * - High-precision preparation countdown timer (RAF-based)
 * - High-precision recording countdown timer (RAF-based)
 * - MediaRecorder management
 * - Playback of recorded audio
 * - Auto cleanup
 * - Error handling
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  formatTime,
  requestMicrophonePermission,
  stopMediaStream,
  validateAudioBlob,
  getSupportedMimeType,
} from '@/lib/audio-utils';
import { useAudioPlayback } from './useAudioPlayback';

export type RecordingPhase = 'idle' | 'preparing' | 'recording' | 'completed';

export interface UseAudioRecorderOptions {
  /** Maximum recording time in seconds */
  maxRecordingSeconds: number;

  /** Preparation time before recording starts (optional) */
  preparationSeconds?: number;

  /** Called when recording is complete with the audio blob */
  onRecordingComplete?: (blob: Blob) => void;

  /** Called when phase changes */
  onPhaseChange?: (phase: RecordingPhase) => void;

  /** Auto-start recording after preparation phase */
  autoStartRecording?: boolean;

  /** Auto-start preparation on mount */
  autoStartPreparation?: boolean;
}

export interface UseAudioRecorderReturn {
  // State
  /** Current phase of recording */
  phase: RecordingPhase;

  /** Whether actively recording */
  isRecording: boolean;

  /** Remaining preparation time in seconds */
  preparationTime: number;

  /** Remaining recording time in seconds */
  recordingTime: number;

  /** Recorded audio blob */
  recordedBlob: Blob | null;

  /** URL for recorded audio (for playback) */
  recordedUrl: string | null;

  /** Error message if any */
  error: string | null;

  /** Whether we have microphone permission */
  hasPermission: boolean;

  // Recording Actions
  /** Start preparation phase */
  startPreparation: () => void;

  /** Start recording (skips preparation) */
  startRecording: () => Promise<void>;

  /** Stop recording */
  stopRecording: () => void;

  /** Reset everything to initial state */
  reset: () => void;

  // Playback of recorded audio (uses useAudioPlayback)
  playback: {
    isPlaying: boolean;
    play: () => Promise<void>;
    pause: () => void;
    restart: () => void;
    currentTime: number;
    duration: number;
    progress: number;
    formattedTime: string;
    formattedDuration: string;
  };

  // Computed
  /** Formatted preparation time (MM:SS) */
  formattedPrepTime: string;

  /** Formatted recording time (MM:SS) */
  formattedRecordTime: string;

  /** Progress percentage during recording (0-100) */
  recordingProgress: number;
}

export function useAudioRecorder(
  options: UseAudioRecorderOptions
): UseAudioRecorderReturn {
  const {
    maxRecordingSeconds,
    preparationSeconds = 0,
    onRecordingComplete,
    onPhaseChange,
    autoStartRecording = true,
    autoStartPreparation = false,
  } = options;

  // State
  const [phase, setPhase] = useState<RecordingPhase>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [preparationTime, setPreparationTime] = useState(preparationSeconds);
  const [recordingTime, setRecordingTime] = useState(maxRecordingSeconds);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const preparationDeadlineRef = useRef<number | null>(null);
  const preparationFrameRef = useRef<number | null>(null);
  const recordingDeadlineRef = useRef<number | null>(null);
  const recordingFrameRef = useRef<number | null>(null);

  // Playback hook for recorded audio
  const playbackControls = useAudioPlayback({
    audioUrl: recordedUrl,
  });

  // Create hidden audio element for playback
  useEffect(() => {
    if (!playbackControls.audioRef.current && typeof window !== 'undefined') {
      const audio = document.createElement('audio');
      audio.preload = 'auto';
      if (recordedUrl) {
        audio.src = recordedUrl;
      }
      (
        playbackControls.audioRef as React.MutableRefObject<HTMLAudioElement>
      ).current = audio;
    } else if (playbackControls.audioRef.current && recordedUrl) {
      playbackControls.audioRef.current.src = recordedUrl;
    }
  }, [recordedUrl, playbackControls.audioRef]);

  // Computed
  const formattedPrepTime = formatTime(preparationTime);
  const formattedRecordTime = formatTime(recordingTime);
  const elapsedRecordingTime = maxRecordingSeconds - recordingTime;
  const recordingProgress =
    maxRecordingSeconds > 0
      ? Math.min(100, (elapsedRecordingTime / maxRecordingSeconds) * 100)
      : 0;

  // Update phase and notify
  const updatePhase = useCallback(
    (newPhase: RecordingPhase) => {
      setPhase(newPhase);
      onPhaseChange?.(newPhase);
    },
    [onPhaseChange]
  );

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current) return;

    try {
      // Stop MediaRecorder
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      // Stop media stream
      stopMediaStream(mediaStreamRef.current);
      mediaStreamRef.current = null;

      setIsRecording(false);

      // Clear recording countdown animation
      if (recordingFrameRef.current !== null) {
        window.cancelAnimationFrame(recordingFrameRef.current);
        recordingFrameRef.current = null;
      }
      recordingDeadlineRef.current = null;
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError('Failed to stop recording');
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (phase === 'completed' || isRecording || recordedBlob) return;

    try {
      setError(null);

      if (recordingFrameRef.current !== null) {
        window.cancelAnimationFrame(recordingFrameRef.current);
        recordingFrameRef.current = null;
      }
      recordingDeadlineRef.current = null;

      // Request microphone permission
      const stream = await requestMicrophonePermission();
      mediaStreamRef.current = stream;
      setHasPermission(true);

      // Get supported MIME type
      const mimeType = getSupportedMimeType();

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size, 'bytes');
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        console.log(
          'MediaRecorder stopped. Chunks collected:',
          audioChunksRef.current.length
        );

        if (audioChunksRef.current.length === 0) {
          console.error('No audio chunks collected');
          setError('No audio data recorded');
          updatePhase('completed');
          stopMediaStream(mediaStreamRef.current);
          mediaStreamRef.current = null;
          return;
        }

        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log('Created blob:', { size: blob.size, type: blob.type });

        // Validate blob
        if (validateAudioBlob(blob)) {
          // Create URL for playback
          const url = URL.createObjectURL(blob);
          console.log('Created URL for playback:', url);
          setRecordedBlob(blob);
          setRecordedUrl(url);
          updatePhase('completed');

          // Call completion callback
          onRecordingComplete?.(blob);
        } else {
          console.error('Audio blob validation failed');
          setError('No audio recorded');
          updatePhase('completed');
        }

        // Cleanup stream
        stopMediaStream(mediaStreamRef.current);
        mediaStreamRef.current = null;
      };

      // Handle errors
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed');
        stopMediaStream(mediaStreamRef.current);
        mediaStreamRef.current = null;
      };

      // Start recording
      console.log('Starting MediaRecorder with mimeType:', mimeType);
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(maxRecordingSeconds);
      recordingDeadlineRef.current =
        performance.now() + maxRecordingSeconds * 1000;
      updatePhase('recording');
      console.log(
        'Recording started, deadline set for',
        maxRecordingSeconds,
        'seconds'
      );
    } catch (err) {
      console.error('Error starting recording:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to start recording');
      }
      setIsRecording(false);
    }
  }, [
    phase,
    isRecording,
    recordedBlob,
    maxRecordingSeconds,
    onRecordingComplete,
    updatePhase,
  ]);

  // Start preparation phase
  const startPreparation = useCallback(() => {
    console.log(
      'startPreparation called, phase:',
      phase,
      'recordedBlob:',
      !!recordedBlob
    );
    if (phase === 'completed' || recordedBlob) {
      console.log('Blocked: already completed or has recording');
      return; // Don't restart automatically once we have a recording
    }

    // Cancel any existing countdown
    if (preparationFrameRef.current !== null) {
      window.cancelAnimationFrame(preparationFrameRef.current);
      preparationFrameRef.current = null;
    }
    preparationDeadlineRef.current = null;

    setError(null);

    if (preparationSeconds <= 0) {
      setPreparationTime(0);
      if (autoStartRecording) {
        console.log('No preparation time, starting recording immediately');
        void startRecording();
      } else {
        updatePhase('idle');
      }
      return;
    }

    console.log(
      'Starting preparation phase, setting timer for',
      preparationSeconds,
      'seconds'
    );
    setPreparationTime(preparationSeconds);
    updatePhase('preparing');
    preparationDeadlineRef.current =
      performance.now() + preparationSeconds * 1000;
  }, [
    phase,
    recordedBlob,
    preparationSeconds,
    autoStartRecording,
    startRecording,
    updatePhase,
  ]);

  // Reset to initial state
  const reset = useCallback(() => {
    // Stop recording if in progress
    if (isRecording) {
      stopRecording();
    }

    // Clear countdown animations
    if (preparationFrameRef.current !== null) {
      window.cancelAnimationFrame(preparationFrameRef.current);
      preparationFrameRef.current = null;
    }
    if (recordingFrameRef.current !== null) {
      window.cancelAnimationFrame(recordingFrameRef.current);
      recordingFrameRef.current = null;
    }
    preparationDeadlineRef.current = null;
    recordingDeadlineRef.current = null;

    // Revoke URL
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }

    // Reset state
    setPhase('idle');
    setIsRecording(false);
    setPreparationTime(preparationSeconds);
    setRecordingTime(maxRecordingSeconds);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setError(null);
    audioChunksRef.current = [];
  }, [
    isRecording,
    stopRecording,
    recordedUrl,
    preparationSeconds,
    maxRecordingSeconds,
  ]);

  // Preparation countdown timer
  useEffect(() => {
    if (phase !== 'preparing') {
      if (preparationFrameRef.current !== null) {
        window.cancelAnimationFrame(preparationFrameRef.current);
        preparationFrameRef.current = null;
      }
      preparationDeadlineRef.current = null;
      return;
    }

    if (recordedBlob) {
      // Already have a completed recording; do not auto restart
      console.log(
        'Preparation effect: Already has recording, moving to completed'
      );
      updatePhase('completed');
      return;
    }

    console.log('Preparation effect: Starting countdown');

    if (preparationSeconds <= 0) {
      setPreparationTime(0);
      if (autoStartRecording) {
        void startRecording();
      } else {
        updatePhase('idle');
      }
      return;
    }

    if (preparationDeadlineRef.current === null) {
      preparationDeadlineRef.current =
        performance.now() + preparationSeconds * 1000;
      setPreparationTime(preparationSeconds);
    }

    const tick = () => {
      const deadline = preparationDeadlineRef.current;
      if (!deadline) {
        return;
      }

      const remainingMs = deadline - performance.now();
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

      setPreparationTime(remainingSeconds);

      if (remainingSeconds <= 0) {
        preparationFrameRef.current = null;
        preparationDeadlineRef.current = null;

        if (autoStartRecording) {
          void startRecording();
        } else {
          updatePhase('idle');
        }
        return;
      }

      preparationFrameRef.current = window.requestAnimationFrame(tick);
    };

    preparationFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (preparationFrameRef.current !== null) {
        window.cancelAnimationFrame(preparationFrameRef.current);
        preparationFrameRef.current = null;
      }
    };
  }, [
    phase,
    recordedBlob,
    preparationSeconds,
    autoStartRecording,
    startRecording,
    updatePhase,
  ]);

  // Recording countdown timer
  useEffect(() => {
    if (!isRecording) {
      if (recordingFrameRef.current !== null) {
        window.cancelAnimationFrame(recordingFrameRef.current);
        recordingFrameRef.current = null;
      }
      recordingDeadlineRef.current = null;
      return;
    }

    if (maxRecordingSeconds <= 0) {
      setRecordingTime(0);
      stopRecording();
      return;
    }

    if (recordingDeadlineRef.current === null) {
      recordingDeadlineRef.current =
        performance.now() + maxRecordingSeconds * 1000;
      setRecordingTime(maxRecordingSeconds);
    }

    const tick = () => {
      const deadline = recordingDeadlineRef.current;
      if (!deadline) {
        return;
      }

      const remainingMs = deadline - performance.now();
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

      setRecordingTime(remainingSeconds);

      if (remainingSeconds <= 0) {
        recordingFrameRef.current = null;
        recordingDeadlineRef.current = null;
        stopRecording();
        return;
      }

      recordingFrameRef.current = window.requestAnimationFrame(tick);
    };

    recordingFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (recordingFrameRef.current !== null) {
        window.cancelAnimationFrame(recordingFrameRef.current);
        recordingFrameRef.current = null;
      }
    };
  }, [isRecording, maxRecordingSeconds, stopRecording]);

  // Auto-start preparation on mount if requested
  useEffect(() => {
    console.log(
      'Auto-start effect, autoStartPreparation:',
      autoStartPreparation,
      'phase:',
      phase,
      'preparationSeconds:',
      preparationSeconds,
      'recordedBlob:',
      !!recordedBlob
    );
    if (
      autoStartPreparation &&
      phase === 'idle' &&
      preparationSeconds > 0 &&
      !recordedBlob
    ) {
      console.log('Auto-starting preparation');
      startPreparation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop recording
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        try {
          mediaRecorderRef.current.stop();
        } catch (err) {
          console.error('Error stopping media recorder on cleanup:', err);
        }
      }

      // Stop media stream
      stopMediaStream(mediaStreamRef.current);

      // Clear timers
      if (preparationFrameRef.current !== null) {
        window.cancelAnimationFrame(preparationFrameRef.current);
        preparationFrameRef.current = null;
      }
      if (recordingFrameRef.current !== null) {
        window.cancelAnimationFrame(recordingFrameRef.current);
        recordingFrameRef.current = null;
      }
      preparationDeadlineRef.current = null;
      recordingDeadlineRef.current = null;
    };
  }, []);

  // Cleanup recorded URL when it changes
  useEffect(() => {
    const urlToCleanup = recordedUrl;
    return () => {
      if (urlToCleanup) {
        URL.revokeObjectURL(urlToCleanup);
      }
    };
  }, [recordedUrl]);

  return {
    // State
    phase,
    isRecording,
    preparationTime,
    recordingTime,
    recordedBlob,
    recordedUrl,
    error,
    hasPermission,

    // Actions
    startPreparation,
    startRecording,
    stopRecording,
    reset,

    // Playback controls
    playback: {
      isPlaying: playbackControls.isPlaying,
      play: playbackControls.play,
      pause: playbackControls.pause,
      restart: playbackControls.restart,
      currentTime: playbackControls.currentTime,
      duration: playbackControls.duration,
      progress: playbackControls.progress,
      formattedTime: playbackControls.formattedTime,
      formattedDuration: playbackControls.formattedDuration,
    },

    // Computed
    formattedPrepTime,
    formattedRecordTime,
    recordingProgress,
  };
}
