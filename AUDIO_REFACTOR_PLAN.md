# 🎯 Audio Component Refactoring Plan

## Problem Statement

Currently, **every question type component has its own duplicated audio code**. This creates:

- 🔴 **Code duplication**: ~500-800 lines of similar audio code per component
- 🔴 **Maintenance nightmare**: Bugs need fixing in 12+ different files
- 🔴 **Inconsistent UX**: Different timings, different UI implementations
- 🔴 **Hard to extend**: Adding features (volume control, speed, waveform) requires touching every file

## Current Audio Implementations Audit

### Speaking Components (5 total) - RECORDING + PLAYBACK

All located in `src/components/test-session/question-types/pte/speaking/`

1. **read-aloud.tsx** (592 lines)

   - Phase: `preparing → recording → completed`
   - Prep: 35s, Recording: 40s
   - Shows text passage, records audio, plays back recording
   - Uses MediaRecorder API, manual timer management
   - ~300 lines of audio logic

2. **repeat-sentence.tsx** (651 lines)

   - Phase: `playing → preparing → recording → completed`
   - **Plays question audio first**, then 3s prep, 15s recording
   - Two audio systems: one for question playback, one for recording
   - ~350 lines of audio logic

3. **describe-image.tsx** (588 lines)

   - Phase: `preparing → recording → completed`
   - Shows image, 25s prep, 40s recording
   - Similar recording logic to read-aloud
   - ~280 lines of audio logic

4. **re-tell-lecture.tsx** (609 lines)

   - Phase: `playing → preparing → recording → completed`
   - **Plays lecture audio first**, 10s prep, 40s recording
   - Most complex: lecture playback + recording playback
   - ~380 lines of audio logic

5. **answer-short-question.tsx**
   - Similar to repeat-sentence
   - Plays question, immediate recording (no prep), short time
   - ~300 lines of audio logic

### Listening Components (7 total) - PLAYBACK ONLY

All located in `src/components/test-session/question-types/pte/listening/`

1. **summarize-spoken-text.tsx**

   - Audio playback with unlimited replays
   - Progress bar, play/pause, restart
   - ~150 lines audio logic + textarea for answer

2. **select-missing-word.tsx**

   - Audio playback, unlimited replays
   - MCQ selection after listening
   - ~120 lines audio logic

3. **mcq-single.tsx**

   - Audio + MCQ
   - ~100 lines audio logic

4. **mcq-multiple.tsx**

   - Audio + MCQ (multiple answers)
   - ~100 lines audio logic

5. **fib-typing.tsx**

   - Audio + fill-in-blanks text input
   - ~100 lines audio logic

6. **highlight-summary.tsx**

   - Audio + text highlighting
   - ~100 lines audio logic

7. **write-dictation.tsx**
   - Audio playback, unlimited replays
   - Text input for dictation
   - ~120 lines audio logic

## Common Patterns Identified

### All Speaking Components Share:

- MediaRecorder API setup and cleanup
- Audio chunking (ondataavailable)
- Blob creation and URL management
- Recording timer countdown
- Playback of recorded audio
- Phase management (prep → record → complete)
- Progress bar calculation
- Play/pause controls for recorded audio
- Format time helper (MM:SS)
- Cleanup on unmount (stop streams, clear timers)

### All Listening Components Share:

- HTMLAudioElement for playback
- Play/pause toggle
- Progress tracking (currentTime, duration)
- Play count tracking
- Event listeners (timeupdate, ended, loadedmetadata)
- Progress bar rendering
- Restart functionality
- Format time helper (MM:SS)

## 🎨 Proposed Architecture

### 1. Core Hooks Layer (`src/hooks/`)

#### `useAudioPlayback.ts` - For Listening Questions

```typescript
interface UseAudioPlaybackOptions {
  audioUrl: string | null;
  maxPlays?: number; // 999 = unlimited
  onPlayCountExceeded?: () => void;
  onEnded?: () => void;
}

interface UseAudioPlaybackReturn {
  // State
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  restart: () => void;
  seek: (time: number) => void;

  // Computed
  progress: number; // 0-100
  formattedTime: string; // "01:23"
  formattedDuration: string; // "02:45"
  canPlay: boolean; // false if max plays exceeded

  // Ref for advanced usage
  audioRef: RefObject<HTMLAudioElement>;
}
```

#### `useAudioRecorder.ts` - For Speaking Questions

```typescript
interface UseAudioRecorderOptions {
  maxRecordingSeconds: number;
  preparationSeconds?: number;
  onRecordingComplete?: (blob: Blob) => void;
  onPhaseChange?: (phase: RecordingPhase) => void;
  autoStartRecording?: boolean; // After prep phase
}

type RecordingPhase = 'idle' | 'preparing' | 'recording' | 'completed';

interface UseAudioRecorderReturn {
  // State
  phase: RecordingPhase;
  isRecording: boolean;
  preparationTime: number;
  recordingTime: number;
  recordedBlob: Blob | null;
  recordedUrl: string | null;
  error: string | null;

  // Recording Actions
  startPreparation: () => void;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  reset: () => void;

  // Playback of recorded audio (uses useAudioPlayback internally)
  playbackControls: {
    isPlaying: boolean;
    play: () => Promise<void>;
    pause: () => void;
    currentTime: number;
    duration: number;
    progress: number;
  };

  // Computed
  formattedPrepTime: string;
  formattedRecordTime: string;
  progressPercent: number; // For progress bar during recording
}
```

#### `useQuestionAudio.ts` - For Question Audio Playback (Speaking)

Used in repeat-sentence, re-tell-lecture, answer-short-question where we play question audio first, then record.

```typescript
interface UseQuestionAudioOptions {
  audioUrl: string | null;
  onEnded?: () => void; // Auto-transition to next phase
  autoPlay?: boolean;
}

// Returns same as useAudioPlayback but optimized for question audio
```

### 2. Component Layer (`src/components/test-session/audio/`)

#### `AudioPlayer.tsx` - Unified Playback Component

```typescript
interface AudioPlayerProps {
  audioUrl: string | null;
  maxPlays?: number;
  variant?: 'compact' | 'full' | 'minimal';
  showPlayCount?: boolean;
  showWaveform?: boolean;
  title?: string;
  className?: string;
}

// Variants:
// - compact: Small play button + time (for simple MCQ)
// - full: Large player with progress bar, restart, volume (default)
// - minimal: Just play/pause button (for question audio in speaking)
```

#### `AudioRecorder.tsx` - Unified Recording Component

```typescript
interface AudioRecorderProps {
  preparationSeconds?: number;
  recordingSeconds: number;
  onRecordingComplete: (blob: Blob) => void;
  variant?: 'full' | 'compact';
  showPhaseIndicator?: boolean;
  showWaveform?: boolean;
  title?: string;
  className?: string;
}

// Features:
// - Phase indicator (Preparing... / Recording... / Complete)
// - Timer countdown for both prep and recording
// - Record button (disabled during prep)
// - Stop button during recording
// - Play recorded audio after completion
// - Progress bar showing recording/playback progress
// - Reset button (optional)
```

#### `QuestionAudioPlayer.tsx` - Specialized for Question Audio

For speaking questions that play audio first (repeat-sentence, re-tell-lecture).

```typescript
interface QuestionAudioPlayerProps {
  audioUrl: string | null;
  onEnded: () => void; // Triggers next phase (preparation)
  autoPlay?: boolean;
  variant?: 'inline' | 'modal';
}

// Optimized for:
// - Single play (usually)
// - Clear "listening" state
// - Auto-transition to next phase
```

### 3. Utility Layer (`src/lib/audio-utils.ts`)

```typescript
// Time formatting
export function formatTime(seconds: number): string;
export function formatTimeDetailed(seconds: number): string; // "1m 23s"

// Audio analysis
export function getAudioDuration(blob: Blob): Promise<number>;
export function validateAudioBlob(blob: Blob): boolean;

// Media permissions
export function checkMicrophonePermission(): Promise<boolean>;
export function requestMicrophonePermission(): Promise<MediaStream>;

// Audio conversion
export function convertWebmToMp3(blob: Blob): Promise<Blob>; // Future
```

## 📋 Implementation Plan (8 Steps)

### Phase 1: Foundation (Steps 1-3)

**Goal**: Build core hooks and utilities

1. ✅ **Document current implementations** (This document)

   - Create detailed audit
   - Identify all patterns and edge cases
   - Define requirements for new system

2. **Create utility functions** (`src/lib/audio-utils.ts`)

   - Time formatting
   - Audio validation
   - Permission checks
   - Duration extraction
   - Test utilities thoroughly

3. **Build core hooks**
   - `useAudioPlayback.ts` - Start here (simpler)
   - `useAudioRecorder.ts` - More complex
   - `useQuestionAudio.ts` - Wrapper around playback
   - Write comprehensive tests for each hook

### Phase 2: Components (Steps 4-5)

**Goal**: Build reusable UI components

4. **Create AudioPlayer component**

   - Start with 'full' variant
   - Add 'compact' and 'minimal' variants
   - Style to match existing design
   - Add accessibility (ARIA labels, keyboard controls)
   - Test with all listening question types

5. **Create AudioRecorder component**
   - Build phase management UI
   - Add timer displays
   - Implement recording controls
   - Add playback of recorded audio
   - Test with all speaking question types

### Phase 3: Migration (Steps 6-7)

**Goal**: Replace old code with new system

6. **Refactor Speaking components** (5 files)

   - Start with simplest: `read-aloud.tsx`
   - Then: `describe-image.tsx`
   - Then: `repeat-sentence.tsx` (has question audio)
   - Then: `re-tell-lecture.tsx` (most complex)
   - Finally: `answer-short-question.tsx`
   - Test each one before moving to next

7. **Refactor Listening components** (7 files)
   - All are similar, can do in parallel
   - `mcq-single.tsx` (simplest - start here)
   - `mcq-multiple.tsx`
   - `select-missing-word.tsx`
   - `fib-typing.tsx`
   - `highlight-summary.tsx`
   - `summarize-spoken-text.tsx`
   - `write-dictation.tsx`

### Phase 4: Polish (Step 8)

**Goal**: Testing, documentation, enhancements

8. **Final polish**
   - End-to-end testing all question types
   - Performance optimization
   - Add waveform visualization (optional)
   - Add volume control
   - Add playback speed control (0.5x, 1x, 1.5x, 2x)
   - Create usage documentation
   - Add Storybook stories (optional)

## 🎁 Benefits After Refactoring

### Developer Experience

- ✅ **~2500 lines of code reduced** (from duplicated audio logic)
- ✅ **Single source of truth** for audio functionality
- ✅ **Bug fixes in one place** propagate to all components
- ✅ **Easy to add features** (volume, speed, waveform) once
- ✅ **Testable hooks** with unit tests
- ✅ **Consistent patterns** across all question types

### User Experience

- ✅ **Consistent UI** across all audio interactions
- ✅ **Better performance** (optimized hooks, no re-renders)
- ✅ **Smoother animations** with proper state management
- ✅ **Better accessibility** (keyboard controls, ARIA)
- ✅ **More features** (volume, speed, better progress bars)
- ✅ **Fewer bugs** (battle-tested, single implementation)

### Maintainability

- ✅ **Easier onboarding** for new developers
- ✅ **Clearer separation of concerns** (hooks vs UI)
- ✅ **Better TypeScript types** and safety
- ✅ **Easier to extend** with new question types
- ✅ **Self-documenting code** with clear interfaces

## 📊 Code Reduction Estimate

| Component Type     | Before (lines)    | After (lines)   | Savings                        |
| ------------------ | ----------------- | --------------- | ------------------------------ |
| Speaking (5x)      | ~1,800 (360/each) | ~800 (160/each) | **-1,000 lines**               |
| Listening (7x)     | ~850 (120/each)   | ~350 (50/each)  | **-500 lines**                 |
| **New Hooks**      | 0                 | +400            | +400                           |
| **New Components** | 0                 | +600            | +600                           |
| **NET TOTAL**      | **2,650 lines**   | **2,150 lines** | **-500 lines (19% reduction)** |

_Plus significantly better organization, testability, and maintainability._

## 🚀 Next Steps

1. **Get approval** for this refactoring approach
2. **Start Phase 1** - Create utility functions and hooks
3. **Prototype** AudioPlayer with one listening component
4. **Iterate** based on feedback
5. **Complete migration** systematically
6. **Delete old code** and celebrate! 🎉

## 📝 Notes for Implementation

### Critical Considerations

- **Don't break existing functionality** - test each step
- **Browser compatibility** - test MediaRecorder in Safari, Firefox, Chrome
- **Mobile considerations** - touch interactions, autoplay policies
- **Performance** - avoid re-renders, optimize timer intervals
- **Memory leaks** - proper cleanup of audio elements, streams, timers
- **Error handling** - microphone permissions, network failures

### Testing Strategy

- **Unit tests** for hooks (Jest)
- **Component tests** for UI (React Testing Library)
- **E2E tests** for full question flows (Playwright/Cypress)
- **Manual testing** on different browsers and devices

### Backward Compatibility

During migration, we can:

1. Keep old components temporarily
2. Add new components alongside
3. Switch via feature flag
4. Remove old code after validation

This allows gradual rollout without breaking production.

---

**Created**: 2025-10-15
**Author**: AI Assistant (Copilot)
**Status**: Ready for Implementation
**Priority**: HIGH - Technical debt reduction
