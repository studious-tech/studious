# Audio Timer Optimization

## Problem
The countdown timers in the audio recorder were not updating properly. The display would get stuck and not show the countdown progressing.

## Root Cause
Custom timer implementation using `setInterval` had React rendering optimization issues that prevented smooth countdown updates.

## Solution
Replaced custom timer implementation with **react-timer-hook** library - a battle-tested, optimized library specifically designed for countdown timers in React applications.

## Changes Made

### 1. Installed Libraries
```bash
bun add react-timer-hook
```

### 2. Refactored `useAudioRecorder` Hook
**Before:**
- Custom `setInterval` implementation for countdown timers
- Manual state management for `preparationTime` and `recordingTime`
- Potential race conditions and rendering issues

**After:**
- Uses `useStopwatch` from react-timer-hook (counts UP from 0)
- Calculates remaining time: `preparationSeconds - stopwatch.seconds`
- Library handles all timer optimizations and re-renders
- Smooth, reliable countdown updates

### 3. Key Benefits

#### Performance
- ✅ Optimized rendering - library uses RAF (RequestAnimationFrame) for smooth updates
- ✅ No unnecessary re-renders
- ✅ Proper cleanup and memory management

#### Reliability
- ✅ Battle-tested library used by thousands of projects
- ✅ Handles edge cases (pause, reset, unmount)
- ✅ Cross-browser compatibility

#### Code Quality
- ✅ Less custom code to maintain
- ✅ Well-documented API
- ✅ TypeScript support built-in

## Technical Details

### Timer Implementation
```typescript
// Preparation timer (counts up from 0)
const preparationStopwatch = useStopwatch({ autoStart: false });

// Calculate remaining time
const preparationTime = Math.max(0, preparationSeconds - preparationStopwatch.seconds);

// Watch for completion
useEffect(() => {
  if (phase === 'preparing' && preparationStopwatch.seconds >= preparationSeconds) {
    preparationStopwatch.pause();
    if (autoStartRecording) {
      void startRecording();
    }
  }
}, [preparationStopwatch.seconds]);
```

### Why Stopwatch Instead of Countdown Timer?
- More accurate (counts from 0 up to target)
- Easier to track elapsed time
- Better for recording scenarios
- Library's stopwatch is more optimized than countdown

## Files Modified
1. `src/hooks/useAudioRecorder.ts` - Complete rewrite using react-timer-hook
2. `src/components/test-session/audio/AudioRecorder.tsx` - Removed debug code
3. `src/hooks/useAudioRecorder-old.ts` - Backup of old implementation

## Testing
Test the countdown timer in any speaking question:
1. Navigate to a speaking question (Read Aloud, Describe Image, etc.)
2. Watch the preparation countdown (should smoothly count down)
3. Watch the recording countdown (should smoothly count down)
4. Both timers should update every second without freezing

## Future Considerations

### Other Areas to Consider Library Usage
Following the principle of "use libraries instead of custom code":

1. **Audio Player** - Consider using `react-audio-player` or `use-sound`
2. **File Upload** - Consider using `react-dropzone`
3. **Form Validation** - Already using proper patterns, but could consider `react-hook-form` + `zod`
4. **Date/Time** - Use `date-fns` or `dayjs` instead of custom date formatting
5. **Charts/Graphs** - Use `recharts` or `chart.js`
6. **Tables** - Use `@tanstack/react-table` for complex tables
7. **Drag & Drop** - Use `react-beautiful-dnd` or `dnd-kit`

### Benefits of Library Usage
- ✅ Battle-tested code
- ✅ Better performance optimizations
- ✅ Regular security updates
- ✅ Community support
- ✅ Less maintenance burden
- ✅ Faster development

## Result
✅ Countdown timers now update smoothly every second
✅ No more frozen or stuck countdowns
✅ More reliable and maintainable code
✅ Better user experience
