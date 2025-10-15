# Audio Recorder Fixes

## Issues Identified

1. **No audio playback after recording**: The `useAudioPlayback` hook expects an audio element via `audioRef`, but it wasn't being created/managed
2. **Recorder auto-restarts after completion**: The preparation phase was restarting even after a recording was completed
3. **Recording not capturing data**: Potential issues with MediaRecorder data collection

## Fixes Applied

### 1. Audio Element Creation for Playback

**File**: `src/hooks/useAudioRecorder.ts`

Added an effect to create and manage the audio element for playback:

```typescript
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
```

### 2. Prevent Recording Restart

**File**: `src/hooks/useAudioRecorder.ts`

Added `recordedBlob` check to `startRecording` to prevent starting a new recording when one already exists:

```typescript
const startRecording = useCallback(async () => {
  if (phase === 'completed' || isRecording || recordedBlob) return;
  // ... rest of the function
}, [
  phase,
  isRecording,
  recordedBlob,
  maxRecordingSeconds,
  onRecordingComplete,
  updatePhase,
]);
```

### 3. Enhanced Logging for Debugging

**File**: `src/hooks/useAudioRecorder.ts`

Added comprehensive console logging to track:

- MediaRecorder start/stop events
- Data chunk collection
- Blob creation and validation
- Phase transitions
- Auto-start behavior

### 4. Guard Against Auto-restart

**File**: `src/hooks/useAudioRecorder.ts`

Enhanced the `startPreparation` function with better guards:

```typescript
const startPreparation = useCallback(() => {
  console.log(
    'startPreparation called, phase:',
    phase,
    'recordedBlob:',
    !!recordedBlob
  );
  if (phase === 'completed' || recordedBlob) {
    console.log('Blocked: already completed or has recording');
    return;
  }
  // ... rest of the function
}, [
  phase,
  recordedBlob,
  preparationSeconds,
  autoStartRecording,
  startRecording,
  updatePhase,
]);
```

## Testing Steps

1. Open the speaking question (Read Aloud)
2. Wait for preparation countdown
3. Recording should start automatically after preparation
4. Recording should show countdown timer
5. After recording completes:
   - Status should show "Recording complete"
   - Duration should be displayed
   - Play button should be enabled
   - Clicking play should play the recorded audio
6. After completion, preparation should NOT restart
7. Check browser console for logs to verify:
   - MediaRecorder started
   - Data chunks collected
   - Blob created with size > 0
   - URL created for playback

## Console Logs to Monitor

- `Starting MediaRecorder with mimeType:` - Confirms recording start
- `Data available: X bytes` - Confirms data is being collected
- `MediaRecorder stopped. Chunks collected: X` - Confirms data collection
- `Created blob: { size: X, type: Y }` - Confirms blob creation
- `Created URL for playback:` - Confirms playback URL
- `startPreparation called` - Track when preparation is called
- `Blocked: already completed or has recording` - Confirms guards are working

## Known Issues

If the issue persists:

1. Check microphone permissions in browser
2. Verify MediaRecorder is supported in the browser
3. Check for browser console errors
4. Verify the audio chunks are being collected (console log shows count > 0)
5. Verify blob size is > 0
6. Check if the audio URL is valid

## Next Steps if Issues Persist

1. Add UI indicator showing recording state more clearly
2. Add a manual "Record Again" button after completion
3. Consider adding a recording level indicator
4. Add better error messages for common issues
5. Test across different browsers
