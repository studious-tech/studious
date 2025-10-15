/**
 * AudioPlayer Component
 *
 * Unified, reusable audio playback component for all Listening question types.
 * Replaces duplicated audio code across 7+ components.
 *
 * Features:
 * - Play/pause/restart controls
 * - Progress bar with time display
 * - Play count tracking and limits
 * - Three variants (full, compact, minimal)
 * - Consistent styling across all questions
 * - Accessible (ARIA labels, keyboard support)
 */

'use client';

import React from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';

export interface AudioPlayerProps {
  /** URL of audio file to play */
  audioUrl: string | null;

  /** Maximum number of plays allowed (999 = unlimited) */
  maxPlays?: number;

  /** Display variant */
  variant?: 'full' | 'compact' | 'minimal';

  /** Show play count */
  showPlayCount?: boolean;

  /** Title for the player */
  title?: string;

  /** Additional CSS class */
  className?: string;

  /** Called when audio finishes */
  onEnded?: () => void;

  /** Called when play starts */
  onPlay?: () => void;
}

export function AudioPlayer({
  audioUrl,
  maxPlays = 999,
  variant = 'full',
  showPlayCount = false,
  title = 'Audio Player',
  className = '',
  onEnded,
  onPlay,
}: AudioPlayerProps) {
  const {
    isPlaying,
    duration,
    playCount,
    isLoading,
    error,
    play,
    pause,
    restart,
    progress,
    formattedTime,
    formattedDuration,
    canPlay,
    audioRef,
  } = useAudioPlayback({
    audioUrl,
    maxPlays,
    onEnded,
    onPlay,
  });

  // Toggle play/pause
  const handleTogglePlay = async () => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  };

  // Minimal variant - just a play button
  if (variant === 'minimal') {
    return (
      <div className={className}>
        <audio ref={audioRef} src={audioUrl || undefined} preload="metadata" />
        <button
          onClick={handleTogglePlay}
          disabled={!canPlay || isLoading || !!error}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '2px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              !canPlay || error ? '#f3f4f6' : isPlaying ? '#1d4ed8' : '#2563eb',
            color: !canPlay || error ? '#9ca3af' : '#fff',
            cursor: !canPlay || error ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isPlaying ? (
            <Pause size={18} fill="currentColor" />
          ) : (
            <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />
          )}
        </button>
        {error && (
          <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  // Compact variant - inline controls
  if (variant === 'compact') {
    return (
      <div
        className={className}
        style={{ display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <audio ref={audioRef} src={audioUrl || undefined} preload="metadata" />

        {/* Play/Pause Button */}
        <button
          onClick={handleTogglePlay}
          disabled={!canPlay || isLoading || !!error}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '2px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background:
              !canPlay || error ? '#f3f4f6' : isPlaying ? '#1d4ed8' : '#2563eb',
            color: !canPlay || error ? '#9ca3af' : '#fff',
            cursor: !canPlay || error ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isPlaying ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" style={{ marginLeft: 2 }} />
          )}
        </button>

        {/* Time */}
        <div style={{ fontSize: 13, color: '#6b7280', minWidth: 90 }}>
          {formattedTime} / {formattedDuration}
        </div>

        {/* Progress Bar */}
        <div style={{ flex: 1, minWidth: 100 }}>
          <div
            style={{
              height: 6,
              backgroundColor: '#e5e7eb',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#2563eb',
                transition: 'width 0.15s linear',
              }}
            />
          </div>
        </div>

        {error && <div style={{ fontSize: 11, color: '#ef4444' }}>{error}</div>}
      </div>
    );
  }

  // Full variant - complete player with all controls
  return (
    <div className={className} style={{ maxWidth: 800, margin: '0 auto' }}>
      <audio ref={audioRef} src={audioUrl || undefined} preload="metadata" />

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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Volume2 size={16} style={{ color: '#6b7280' }} />
            <span>{title}</span>
          </div>
          {showPlayCount && (
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 400 }}>
              Plays: {playCount} {maxPlays < 999 ? `/ ${maxPlays}` : ''}
            </div>
          )}
        </div>

        {/* Middle section - Status */}
        <div
          style={{
            height: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fafafa',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {error ? (
            <div
              style={{
                textAlign: 'center',
                color: '#ef4444',
                fontSize: 14,
                padding: '0 20px',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Error</div>
              <div>{error}</div>
            </div>
          ) : isLoading ? (
            <div
              style={{ textAlign: 'center', color: '#6b7280', fontSize: 14 }}
            >
              Loading audio...
            </div>
          ) : (
            <div
              style={{ textAlign: 'center', color: '#6b7280', fontSize: 14 }}
            >
              {isPlaying
                ? 'Playing...'
                : !canPlay
                ? 'Maximum plays reached'
                : duration > 0
                ? 'Ready to play'
                : 'Loading...'}
            </div>
          )}

          {/* Large time display when playing */}
          {isPlaying && (
            <div
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: '#1f2937',
                fontFamily: 'monospace',
              }}
            >
              {formattedTime}
            </div>
          )}
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
            onClick={handleTogglePlay}
            disabled={!canPlay || isLoading || !!error}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
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
                !canPlay || error
                  ? '#f3f4f6'
                  : isPlaying
                  ? '#1d4ed8'
                  : '#2563eb',
              color: !canPlay || error ? '#9ca3af' : '#fff',
              cursor: !canPlay || error ? 'not-allowed' : 'pointer',
            }}
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />
            )}
          </button>

          {/* Restart Button */}
          <button
            onClick={restart}
            disabled={!canPlay || isLoading || !!error}
            aria-label="Restart audio"
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s',
              background: '#fff',
              color: !canPlay || error ? '#d1d5db' : '#6b7280',
              cursor: !canPlay || error ? 'not-allowed' : 'pointer',
            }}
          >
            <RotateCcw size={16} />
          </button>

          {/* Time Display */}
          <div
            style={{
              fontSize: 13,
              color: '#6b7280',
              fontFamily: 'monospace',
              minWidth: 95,
            }}
          >
            {formattedTime} / {formattedDuration}
          </div>

          {/* Progress Bar */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                height: 6,
                backgroundColor: '#e5e7eb',
                borderRadius: 3,
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Audio progress"
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#2563eb',
                  transition: 'width 0.15s linear',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
