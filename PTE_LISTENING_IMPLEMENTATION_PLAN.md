# PTE Listening Question Types Implementation Plan

## Overview

Adding 6 new PTE Listening question types to the existing test session system.

## System Architecture Understanding

### 1. Database Schema (Postgres + Supabase)

- **Tables**: `question_types`, `questions`, `question_options`, `question_media`, `media`
- **Key Fields**:
  - `question_types.ui_component` - maps to React component name
  - `question_types.input_type` - describes input (audio, text, selection)
  - `question_types.response_type` - describes expected response
  - `question_types.scoring_method` - how to score the response
  - `questions.blanks_config` - JSONB for complex question configs (like FIB)
  - `questions.correct_answer` - JSONB for auto-scoring

### 2. Migration Pattern

- SQL files in `/migrations/` folder
- Use `ON CONFLICT ... DO UPDATE` for idempotency
- Include sample questions with `question_options` entries
- Set proper `ui_component` field for dynamic loading

### 3. Component Architecture

- Location: `/src/components/test-session/question-types/pte/listening/`
- Pattern: Export default function with specific props interface
- Props: `{ question, examId, onResponse, onSubmit, currentResponse }`
- Response format: `{ questionId, sessionQuestionId, response, responseType }`

### 4. Component Registry

- File: `/src/components/test-session/question-renderer.tsx`
- Add entries to `QUESTION_COMPONENT_REGISTRY` object
- Dynamic import pattern: `() => import('./path/to/component')`

### 5. Audio Player Pattern (from fib-typing.tsx)

```tsx
- Use getMediaUrl(audioMedia.media.id) for proper API routing
- Audio state: isPlaying, currentTime, duration, playCount
- Event listeners: play, pause, ended, timeupdate, loadedmetadata
- Play count limits via blanks_config?.max_plays || 999
- Promise-based play() with error handling
```

### 6. Response Saving Pattern

```tsx
- Call onResponse immediately on user action (auto-save)
- onSubmit called by parent on Next/Finish button click
- Use queueMicrotask to escape render phase if needed
- Response types: 'selection' (MCQ), 'text' (written), 'audio' (speaking)
```

## New Question Types to Implement

### 1. Summarize Spoken Text

- **UI Component**: `pte-listening-summarize-spoken-text`
- **Input**: Audio recording
- **Response**: Long text (50-70 words)
- **Features**:
  - Audio player (like fib-typing)
  - Textarea with word counter (50-70 words)
  - Real-time word count validation
  - Character limit enforcement

### 2. Multiple Choice, Multiple Answers

- **UI Component**: `pte-listening-mcq-multiple`
- **Input**: Audio recording
- **Response**: Multiple selections (checkboxes)
- **Features**:
  - Audio player at top
  - Checkbox options (not radio)
  - Allow multiple selections
  - Visual feedback for selected items

### 3. Highlight Correct Summary

- **UI Component**: `pte-listening-highlight-summary`
- **Input**: Audio recording
- **Response**: Single selection (radio)
- **Features**:
  - Audio player
  - Radio button options with longer text (summaries)
  - Single selection only
  - Summary texts can be multiple sentences

### 4. Multiple Choice, Single Answer

- **UI Component**: `pte-listening-mcq-single`
- **Input**: Audio recording
- **Response**: Single selection (radio)
- **Features**:
  - Audio player
  - Radio button options
  - Single selection
  - Similar to reading MCQ but with audio

### 5. Select Missing Word

- **UI Component**: `pte-listening-select-missing-word`
- **Input**: Audio with beep at end
- **Response**: Single selection
- **Features**:
  - Audio player (recording has beep replacing last word)
  - Radio options with word/phrase choices
  - Options may contain multiple words
  - Single selection

### 6. Write from Dictation

- **UI Component**: `pte-listening-write-dictation`
- **Input**: Short audio sentence
- **Response**: Text input
- **Features**:
  - Audio player
  - Single text input (sentence)
  - No word limit but expect short sentence
  - Case-insensitive matching recommended

## Implementation Steps

### Step 1: Create Migration File

File: `/migrations/005_add_pte_listening_question_types.sql`

```sql
-- Add 6 new question types
-- Add sample questions for each type
-- Add question_options where needed
-- Set proper ui_component values
```

### Step 2: Create UI Components (6 files)

Base all on existing patterns from fib-typing.tsx and mcq-single.tsx

**Common Elements**:

- Audio player (copy from fib-typing, use getMediaUrl)
- Two-column layout (left: instructions, right: response area)
- Immediate auto-save on user interaction
- Proper TypeScript interfaces

### Step 3: Register Components

Update `question-renderer.tsx` to add all 6 components to registry.

### Step 4: Test Integration

- Run migration in Supabase
- Create test session with new question types
- Verify audio playback
- Verify response saving
- Check in database that responses are saved correctly

## Code Patterns to Follow

### Audio Player Component Structure

```tsx
const audioRef = useRef<HTMLAudioElement>(null);
const [isPlaying, setIsPlaying] = useState(false);
const [playCount, setPlayCount] = useState(0);
const maxPlays = 999; // or from config

const audioMedia = question.question.media.find(
  (m) => m.role === 'audio' || m.media.fileType === 'audio'
);

<audio
  ref={audioRef}
  src={getMediaUrl(audioMedia.media.id) || ''}
  preload="metadata"
/>;
```

### Response Handler Pattern

```tsx
const handleOptionSelect = (optionId: string) => {
  setSelectedOption(optionId);

  queueMicrotask(() => {
    onResponse({
      questionId: question.question.id,
      sessionQuestionId: question.sessionQuestionId,
      response: [optionId], // or appropriate format
      responseType: 'selection',
    });
  });
};
```

### Word Counter Pattern (for Summarize Spoken Text)

```tsx
const [text, setText] = useState('');
const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
const isValid = wordCount >= 50 && wordCount <= 70;
```

## File Structure

```
/migrations/
  005_add_pte_listening_question_types.sql

/src/components/test-session/question-types/pte/listening/
  fib-typing.tsx (existing)
  summarize-spoken-text.tsx (new)
  mcq-multiple.tsx (new)
  highlight-summary.tsx (new)
  mcq-single.tsx (new)
  select-missing-word.tsx (new)
  write-dictation.tsx (new)

/src/components/test-session/
  question-renderer.tsx (update registry)
```

## Next Actions

1. Create migration file with all 6 question types
2. Build each UI component following established patterns
3. Register components in question-renderer
4. Test in actual test session environment
5. Verify database saves are working correctly

## Notes

- All components should use `getMediaUrl()` for audio sources
- Follow the clean, minimal styling from existing PTE components
- No borders on content areas (as per recent FIB updates)
- Single column layout for audio + response (like fib-typing)
- Use queueMicrotask for parent callbacks to avoid render phase errors
