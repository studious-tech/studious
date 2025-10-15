/**
 * useAudioRecorder Hook (Optimized)
 *
 * Features:
 * - Phase management (idle → preparing → recording → completed)
 * - Reliable countdown timers using RAF (RequestAnimationFrame)
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
  phase: RecordingPhase;
  isRecording: boolean;
  preparationTime: number;
  recordingTime: number;
  recordedBlob: Blob | null;
  recordedUrl: string | null;
  error: string | null;
  hasPermission: boolean;

  // Recording Actions
  startPreparation: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  reset: () => void;

  // Playback of recorded audio
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
  formattedPrepTime: string;
  formattedRecordTime: string;
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
  const preparationStartTimeRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Playback hook for recorded audio
  const playbackControls = useAudioPlayback({
    audioUrl: recordedUrl,
  });

  // Computed
  const formattedPrepTime = formatTime(preparationTime);
  const formattedRecordTime = formatTime(recordingTime);
  const elapsedRecordingTime = recordingStopwatch.seconds;
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
    if (!mediaRecorderRef.current || !isRecording) return;

    try {
      // Stop MediaRecorder
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      // Stop media stream
      stopMediaStream(mediaStreamRef.current);
      mediaStreamRef.current = null;

      // Stop recording timer
      recordingStopwatch.pause();

      setIsRecording(false);
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError('Failed to stop recording');
    }
  }, [isRecording, recordingStopwatch]);

  // Start preparation phase
  const startPreparation = useCallback(() => {
    if (phase === 'completed') return;

    updatePhase('preparing');
    preparationStopwatch.reset();
    preparationStopwatch.start();
    setError(null);
  }, [phase, updatePhase, preparationStopwatch]);

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
          const url = URL.createObjectURL(blob);
          setRecordedBlob(blob);
          setRecordedUrl(url);
          updatePhase('completed');
          onRecordingComplete?.(blob);
        } else {
          setError('No audio recorded');
          updatePhase('completed');
        }

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
      mediaRecorder.start(100);
      setIsRecording(true);
      recordingStopwatch.reset();
      recordingStopwatch.start();
      updatePhase('recording');

      // Stop preparation timer if running
      preparationStopwatch.pause();
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
    onRecordingComplete,
    updatePhase,
    recordingStopwatch,
    preparationStopwatch,
  ]);

  // Reset to initial state
  const reset = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }

    preparationStopwatch.reset();
    recordingStopwatch.reset();

    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }

    setPhase('idle');
    setIsRecording(false);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setError(null);
    audioChunksRef.current = [];
  }, [isRecording, stopRecording, recordedUrl, preparationStopwatch, recordingStopwatch]);

  // Watch preparation timer - auto-start recording when time's up
  useEffect(() => {
    if (phase === 'preparing' && preparationStopwatch.seconds >= preparationSeconds) {
      preparationStopwatch.pause();
      
      if (autoStartRecording) {
        void startRecording();
      } else {
        updatePhase('idle');
      }
    }
  }, [
    phase,
    preparationStopwatch.seconds,
    preparationSeconds,
    autoStartRecording,
    startRecording,
    updatePhase,
    preparationStopwatch,
  ]);

  // Watch recording timer - auto-stop when time's up
  useEffect(() => {
    if (isRecording && recordingStopwatch.seconds >= maxRecordingSeconds) {
      stopRecording();
    }
  }, [isRecording, recordingStopwatch.seconds, maxRecordingSeconds, stopRecording]);

  // Auto-start preparation on mount if requested
  useEffect(() => {
    if (autoStartPreparation && phase === 'idle' && preparationSeconds > 0) {
      startPreparation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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

      stopMediaStream(mediaStreamRef.current);
      preparationStopwatch.pause();
      recordingStopwatch.pause();
    };
  }, [preparationStopwatch, recordingStopwatch]);

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
