/**
 * useAudioRecorder Hook
 *
 * Reusable hook for audio recording functionality with phase management.
 * Used in all Speaking question types.
 *
 * Features:
 * - Phase management (idle → preparing → recording → completed)
 * - Preparation countdown timer (using react-timer-hook for optimized updates)
 * - Recording countdown timer (using react-timer-hook for optimized updates)
 * - MediaRecorder management (using react-media-recorder for reliability)
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
  const [, forceUpdate] = useState(0); // Force update mechanism

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const preparationTimerRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Playback hook for recorded audio
  const playbackControls = useAudioPlayback({
    audioUrl: recordedUrl,
  });

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

  // Start preparation phase
  const startPreparation = useCallback(() => {
    if (phase === 'completed') return; // Don't restart if already completed

    updatePhase('preparing');
    setPreparationTime(preparationSeconds);
    setError(null);
  }, [phase, preparationSeconds, updatePhase]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return;

    try {
      // Stop MediaRecorder
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      // Stop media stream
      stopMediaStream(mediaStreamRef.current);
      mediaStreamRef.current = null;

      setIsRecording(false);

      // Clear recording timer
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError('Failed to stop recording');
    }
  }, [isRecording]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (phase === 'completed' || isRecording) return;

    try {
      setError(null);

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
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });

        // Validate blob
        if (validateAudioBlob(blob)) {
          // Create URL for playback
          const url = URL.createObjectURL(blob);
          setRecordedBlob(blob);
          setRecordedUrl(url);
          updatePhase('completed');

          // Call completion callback
          onRecordingComplete?.(blob);
        } else {
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
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(maxRecordingSeconds);
      updatePhase('recording');
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
    maxRecordingSeconds,
    onRecordingComplete,
    updatePhase,
  ]);

  // Reset to initial state
  const reset = useCallback(() => {
    // Stop recording if in progress
    if (isRecording) {
      stopRecording();
    }

    // Clear timers
    if (preparationTimerRef.current) {
      window.clearInterval(preparationTimerRef.current);
      preparationTimerRef.current = null;
    }
    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

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
      if (preparationTimerRef.current) {
        window.clearInterval(preparationTimerRef.current);
        preparationTimerRef.current = null;
      }
      return;
    }

    // Start countdown
    preparationTimerRef.current = window.setInterval(() => {
      setPreparationTime((prev) => {
        const newValue = prev - 1;
        
        if (newValue <= 0) {
          // Preparation done
          if (preparationTimerRef.current) {
            window.clearInterval(preparationTimerRef.current);
            preparationTimerRef.current = null;
          }

          // Auto-start recording if enabled
          if (autoStartRecording) {
            void startRecording();
          } else {
            updatePhase('idle'); // Wait for manual start
          }

          return 0;
        }
        
        // Force component re-render
        forceUpdate((n) => n + 1);
        return newValue;
      });
    }, 1000);

    return () => {
      if (preparationTimerRef.current) {
        window.clearInterval(preparationTimerRef.current);
        preparationTimerRef.current = null;
      }
    };
  }, [phase, autoStartRecording, startRecording, updatePhase]);

  // Recording countdown timer
  useEffect(() => {
    if (!isRecording) {
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      return;
    }

    // Start countdown
    recordingTimerRef.current = window.setInterval(() => {
      setRecordingTime((prev) => {
        const newValue = prev - 1;
        
        if (newValue <= 0) {
          // Time's up - stop recording
          stopRecording();
          return 0;
        }
        
        // Force component re-render
        forceUpdate((n) => n + 1);
        return newValue;
      });
    }, 1000);

    return () => {
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    };
  }, [isRecording, stopRecording]);

  // Auto-start preparation on mount if requested
  useEffect(() => {
    if (autoStartPreparation && phase === 'idle' && preparationSeconds > 0) {
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
      if (preparationTimerRef.current) {
        window.clearInterval(preparationTimerRef.current);
      }
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
      }
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
