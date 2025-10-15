/**
 * AudioRecorder Component
 *
 * Unified, reusable audio recording component for all Speaking question types.
 * Replaces duplicated recording code across 5+ components.
 *
 * Features:
 * - Phase management (preparing → recording → completed)
 * - Preparation countdown timer
 * - Recording countdown timer
 * - Record/stop controls
 * - Playback of recorded audio
 * - Progress bars
 * - Microphone permission handling
 * - Consistent styling across all questions
 * - Accessible (ARIA labels, keyboard support)
 */

'use client';

import React from 'react';
import { Play, Pause, Mic } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

export interface AudioRecorderProps {
  /** Preparation time in seconds (0 = no preparation) */
  preparationSeconds?: number;

  /** Maximum recording time in seconds */
  recordingSeconds: number;

  /** Called when recording completes with audio blob */
  onRecordingComplete: (blob: Blob) => void;

  /** Display variant */
  variant?: 'full' | 'compact';

  /** Show phase indicator text */
  showPhaseIndicator?: boolean;

  /** Title for the recorder */
  title?: string;

  /** Additional CSS class */
  className?: string;

  /** Auto-start preparation on mount */
  autoStartPreparation?: boolean;

  /** Auto-start recording after preparation */
  autoStartRecording?: boolean;
}

export function AudioRecorder({
  preparationSeconds = 0,
  recordingSeconds,
  onRecordingComplete,
  showPhaseIndicator = true,
  title = 'Audio Recorder',
  className = '',
  autoStartPreparation = true,
  autoStartRecording = true,
}: AudioRecorderProps) {
  const {
    phase,
    isRecording,
    preparationTime,
    recordingTime,
    error,
    startRecording,
    stopRecording,
    playback,
    recordedUrl,
    formattedRecordTime,
    recordingProgress,
  } = useAudioRecorder({
    maxRecordingSeconds: recordingSeconds,
    preparationSeconds,
    onRecordingComplete,
    autoStartRecording,
    autoStartPreparation,
  });

  const hasRecording = Boolean(recordedUrl);

  // Calculate elapsed time for display
  const elapsedRecordingTime = recordingSeconds - recordingTime;
  const formatElapsedTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Get status text
  const getStatusText = () => {
    if (error) return error;
    if (phase === 'preparing') return `Recording begins in ${preparationTime}s`;
    if (phase === 'recording') return `Recording: ${formattedRecordTime}`;
    if (phase === 'completed') return 'Recording complete';
    return 'Ready';
  };

  // Get status color
  const getStatusColor = () => {
    if (error) return '#ef4444';
    if (phase === 'preparing' || phase === 'recording') return '#bf4444';
    if (phase === 'completed') return '#064e3b';
    return '#6b7280';
  };

  // Progress percentage for recording or playback
  const getProgressPercent = () => {
    if (isRecording) {
      return recordingProgress;
    }
    if (playback.isPlaying) {
      return playback.progress;
    }
    return 0;
  };

  // Full variant - complete recorder with all features
  return (
    <div
      className={className}
      style={{ maxWidth: 720, margin: '0 auto', marginTop: 18 }}
    >
      <div
        style={{
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 4,
          background: '#fff',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 14px',
            fontWeight: 700,
            color: '#374151',
            borderBottom: '1px solid rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Mic size={16} style={{ color: '#6b7280' }} />
          <span>{title}</span>
        </div>

        {/* Large status area with centered message */}
        <div
          style={{
            height: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px solid rgba(0,0,0,0.04)',
            background: '#fff',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div
            style={{
              textAlign: 'center',
              color: getStatusColor(),
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {showPhaseIndicator && getStatusText()}
          </div>

          {/* Large time display during recording */}
          {isRecording && (
            <div
              style={{
                fontSize: 48,
                fontWeight: 600,
                color: '#bf4444',
                fontFamily: 'monospace',
              }}
            >
              {formattedRecordTime}
            </div>
          )}

          {/* Completed - show recorded duration */}
          {hasRecording && playback.duration > 0 && (
            <div
              style={{
                fontSize: 14,
                color: '#6b7280',
                fontFamily: 'monospace',
              }}
            >
              Duration: {playback.formattedDuration}
            </div>
          )}
        </div>

        {/* Bottom control bar */}
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
          {/* Record/Stop button (left) */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {!isRecording && phase !== 'completed' ? (
              <button
                onClick={() => {
                  if (
                    phase === 'recording' ||
                    (phase === 'idle' && preparationSeconds === 0)
                  ) {
                    void startRecording();
                  }
                }}
                disabled={phase === 'preparing'}
                aria-label="Record"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '2px solid #dc2626',
                  background: phase === 'preparing' ? '#f3f4f6' : '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: phase === 'preparing' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: phase === 'preparing' ? '#9ca3af' : '#fff',
                  }}
                />
              </button>
            ) : isRecording ? (
              <button
                onClick={stopRecording}
                aria-label="Stop recording"
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
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ width: 12, height: 12, background: '#fff' }} />
              </button>
            ) : null}
          </div>

          {/* Divider between controls */}
          <div
            style={{
              width: 1,
              alignSelf: 'stretch',
              backgroundColor: '#e5e7eb',
            }}
          />

          {/* Playback controls and progress */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flex: 1,
            }}
          >
            {/* Play button for recorded audio */}
            <button
              onClick={() => {
                if (playback.isPlaying) {
                  playback.pause();
                } else {
                  void playback.play();
                }
              }}
              disabled={!hasRecording}
              aria-label={playback.isPlaying ? 'Pause' : 'Play recorded audio'}
              style={{
                width: 34,
                height: 34,
                borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.06)',
                background: hasRecording ? '#fff' : '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: hasRecording ? 'pointer' : 'not-allowed',
              }}
            >
              {playback.isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>

            {/* Time display */}
            <div
              style={{
                minWidth: 92,
                fontSize: 13,
                color: '#374151',
                fontFamily: 'monospace',
              }}
            >
              {isRecording
                ? `${formatElapsedTime(
                    elapsedRecordingTime
                  )} / ${formatElapsedTime(recordingSeconds)}`
                : playback.isPlaying
                ? `${playback.formattedTime} / ${playback.formattedDuration}`
                : hasRecording
                ? `00:00 / ${playback.formattedDuration}`
                : '00:00 / 00:00'}
            </div>

            {/* Progress bar */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: 6,
                  background: '#e6e6e6',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
                role="progressbar"
                aria-valuenow={getProgressPercent()}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  style={{
                    width: `${getProgressPercent()}%`,
                    height: '100%',
                    background:
                      hasRecording || isRecording ? '#9fbff5' : '#d1d5db',
                    transition: 'width 150ms linear',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            marginTop: 8,
            padding: '8px 12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 4,
            color: '#991b1b',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
