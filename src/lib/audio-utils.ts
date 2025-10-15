/**
 * Audio Utilities
 *
 * Shared utility functions for audio playback, recording, and formatting.
 * Used across all question types with audio functionality.
 */

/**
 * Format seconds to MM:SS format
 * @param seconds - Time in seconds
 * @returns Formatted string like "01:23" or "00:05"
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) {
    return '00:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format seconds to detailed format like "1m 23s" or "45s"
 * @param seconds - Time in seconds
 * @returns Formatted string
 */
export function formatTimeDetailed(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) {
    return '0s';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  if (mins === 0) {
    return `${secs}s`;
  }

  if (secs === 0) {
    return `${mins}m`;
  }

  return `${mins}m ${secs}s`;
}

/**
 * Get duration of an audio blob
 * @param blob - Audio blob to analyze
 * @returns Promise resolving to duration in seconds
 */
export async function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    });

    audio.addEventListener('error', (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    });

    // Trigger metadata load
    audio.load();
  });
}

/**
 * Validate that a blob is a valid audio file with content
 * @param blob - Blob to validate
 * @returns true if valid audio blob
 */
export function validateAudioBlob(blob: Blob | null): boolean {
  if (!blob) return false;
  if (blob.size === 0) return false;
  if (!blob.type.startsWith('audio/')) return false;
  return true;
}

/**
 * Check if microphone permission is granted
 * @returns Promise resolving to true if permission granted
 */
export async function checkMicrophonePermission(): Promise<boolean> {
  try {
    // Check if browser supports permissions API
    if (!navigator.permissions) {
      // Fallback: try to get media stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    }

    const result = await navigator.permissions.query({
      name: 'microphone' as PermissionName,
    });
    return result.state === 'granted';
  } catch (error) {
    console.error('Error checking microphone permission:', error);
    return false;
  }
}

/**
 * Request microphone permission and return stream
 * @returns Promise resolving to MediaStream
 * @throws Error if permission denied or not available
 */
export async function requestMicrophonePermission(): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    return stream;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        throw new Error(
          'Microphone permission denied. Please allow microphone access in your browser settings.'
        );
      }
      if (error.name === 'NotFoundError') {
        throw new Error(
          'No microphone found. Please connect a microphone and try again.'
        );
      }
      throw new Error(`Microphone error: ${error.message}`);
    }
    throw new Error('Unknown microphone error');
  }
}

/**
 * Stop all tracks in a media stream and clean up
 * @param stream - MediaStream to stop
 */
export function stopMediaStream(stream: MediaStream | null): void {
  if (!stream) return;

  stream.getTracks().forEach((track) => {
    track.stop();
  });
}

/**
 * Calculate progress percentage from current time and duration
 * @param currentTime - Current playback time in seconds
 * @param duration - Total duration in seconds
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(
  currentTime: number,
  duration: number
): number {
  if (!duration || !isFinite(duration) || duration <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (currentTime / duration) * 100));
}

/**
 * Create a silent audio blob for testing or placeholder purposes
 * @param durationMs - Duration in milliseconds
 * @returns Promise resolving to silent audio blob
 */
export async function createSilentAudioBlob(
  durationMs: number = 1000
): Promise<Blob> {
  // Create audio context
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const audioContext = new AudioContextClass();

  // Create buffer with silence
  const sampleRate = audioContext.sampleRate;
  const numSamples = (durationMs / 1000) * sampleRate;
  const buffer = audioContext.createBuffer(1, numSamples, sampleRate);

  // Fill with silence (zeros)
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < numSamples; i++) {
    channelData[i] = 0;
  }

  // Convert buffer to blob
  // Note: This is simplified - production code would use proper encoding
  return new Blob([], { type: 'audio/webm' });
}

/**
 * Audio recording options for MediaRecorder
 */
export const AUDIO_RECORDING_OPTIONS = {
  mimeType: 'audio/webm',
  audioBitsPerSecond: 128000, // 128 kbps
} as const;

/**
 * Get supported MIME type for audio recording
 * Falls back to 'audio/webm' if MediaRecorder not supported
 */
export function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];

  if (typeof MediaRecorder === 'undefined') {
    return 'audio/webm';
  }

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return 'audio/webm';
}

/**
 * Check if audio recording is supported in the browser
 */
export function isRecordingSupported(): boolean {
  return !!(navigator.mediaDevices && typeof MediaRecorder !== 'undefined');
}

/**
 * Download audio blob as file
 * @param blob - Audio blob to download
 * @param filename - Filename for download
 */
export function downloadAudioBlob(
  blob: Blob,
  filename: string = 'recording.webm'
): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
