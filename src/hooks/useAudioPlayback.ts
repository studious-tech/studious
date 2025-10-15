/**
 * useAudioPlayback Hook
 *
 * Reusable hook for audio playback functionality.
 * Used in all Listening question types.
 *
 * Features:
 * - Play/pause/stop controls
 * - Progress tracking
 * - Play count limiting
 * - Duration detection
 * - Error handling
 * - Auto cleanup
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { formatTime, calculateProgress } from '@/lib/audio-utils';

export interface UseAudioPlaybackOptions {
  /** URL of the audio file to play */
  audioUrl: string | null;

  /** Maximum number of plays allowed (999 = unlimited) */
  maxPlays?: number;

  /** Called when play count exceeds maxPlays */
  onPlayCountExceeded?: () => void;

  /** Called when audio finishes playing */
  onEnded?: () => void;

  /** Called when audio starts playing */
  onPlay?: () => void;

  /** Called when audio is paused */
  onPause?: () => void;

  /** Auto-play on mount (use cautiously - browser policies) */
  autoPlay?: boolean;
}

export interface UseAudioPlaybackReturn {
  // State
  /** Whether audio is currently playing */
  isPlaying: boolean;

  /** Current playback time in seconds */
  currentTime: number;

  /** Total duration in seconds (0 if not loaded) */
  duration: number;

  /** Number of times audio has been played to completion */
  playCount: number;

  /** Whether audio is loading/buffering */
  isLoading: boolean;

  /** Error message if any */
  error: string | null;

  // Actions
  /** Start or resume playback */
  play: () => Promise<void>;

  /** Pause playback */
  pause: () => void;

  /** Stop playback and reset to beginning */
  stop: () => void;

  /** Restart from beginning */
  restart: () => void;

  /** Seek to specific time */
  seek: (time: number) => void;

  // Computed
  /** Progress percentage (0-100) */
  progress: number;

  /** Formatted current time (MM:SS) */
  formattedTime: string;

  /** Formatted duration (MM:SS) */
  formattedDuration: string;

  /** Whether play is allowed (not exceeded max plays) */
  canPlay: boolean;

  /** Ref to audio element for advanced usage */
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export function useAudioPlayback(
  options: UseAudioPlaybackOptions
): UseAudioPlaybackReturn {
  const {
    audioUrl,
    maxPlays = 999,
    onPlayCountExceeded,
    onEnded,
    onPlay,
    onPause,
    autoPlay = false,
  } = options;

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasAutoPlayed = useRef(false);

  // Computed
  const progress = calculateProgress(currentTime, duration);
  const formattedTime = formatTime(currentTime);
  const formattedDuration = formatTime(duration);
  const canPlay = playCount < maxPlays;

  // Play audio
  const play = useCallback(async () => {
    if (!audioRef.current || !audioUrl) {
      setError('No audio available');
      return;
    }

    // Check play limit
    if (!canPlay) {
      onPlayCountExceeded?.();
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      await audioRef.current.play();
      setIsPlaying(true);
      setIsLoading(false);
      onPlay?.();
    } catch (err) {
      console.error('Audio play error:', err);
      setIsLoading(false);

      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Autoplay blocked. Please click play button.');
        } else if (err.name === 'NotSupportedError') {
          setError('Audio format not supported');
        } else {
          setError('Failed to play audio');
        }
      }
    }
  }, [audioUrl, canPlay, onPlayCountExceeded, onPlay]);

  // Pause audio
  const pause = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    setIsPlaying(false);
    onPause?.();
  }, [onPause]);

  // Stop and reset to beginning
  const stop = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    onPause?.();
  }, [onPause]);

  // Restart from beginning
  const restart = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    void play();
  }, [play]);

  // Seek to time
  const seek = useCallback(
    (time: number) => {
      if (!audioRef.current) return;

      const clampedTime = Math.max(0, Math.min(time, duration));
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    },
    [duration]
  );

  // Setup audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setPlayCount((prev) => prev + 1);
      onEnded?.();
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setError('Failed to load audio');
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    // Load audio
    audio.load();

    // Cleanup
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioUrl, onEnded, onPlay, onPause]);

  // Auto-play if requested
  useEffect(() => {
    if (autoPlay && !hasAutoPlayed.current && audioUrl && audioRef.current) {
      hasAutoPlayed.current = true;
      void play();
    }
  }, [autoPlay, audioUrl, play]);

  // Cleanup on unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  // Reset state when URL changes
  useEffect(() => {
    setCurrentTime(0);
    setPlayCount(0);
    setError(null);
    setIsPlaying(false);
    hasAutoPlayed.current = false;
  }, [audioUrl]);

  return {
    // State
    isPlaying,
    currentTime,
    duration,
    playCount,
    isLoading,
    error,

    // Actions
    play,
    pause,
    stop,
    restart,
    seek,

    // Computed
    progress,
    formattedTime,
    formattedDuration,
    canPlay,
    audioRef,
  };
}
