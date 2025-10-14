# Fill-in-the-Blanks Implementation Plan

## Overview
Implementation plan for three fill-in-the-blanks question types:
1. **Fill in the Blanks - Dropdown** (PTE Reading)
2. **Fill in the Blanks - Drag and Drop** (PTE Reading)
3. **Fill in the Blanks - Type In** (PTE Listening)

## Database Analysis

### Current Schema Support
The database already has excellent support for these question types:

#### `questions` table (lines 178-197 in db.sql)
```sql
- blanks_config: jsonb  -- Perfect for storing blank positions and options
- content: text         -- Will contain the passage with blank markers
- correct_answer: jsonb -- Will store correct answers for each blank
```

#### `question_options` table (lines 148-159)
```sql
- Used for dropdown options in Fill in the Blanks - Dropdown
- Each option represents a possible word/phrase for dropdowns
- display_order will determine the order in dropdowns
```

### blanks_config Structure Design

#### Type 1: Fill in the Blanks - Dropdown (PTE Reading)
```json
{
  "type": "fib_dropdown",
  "blanks": [
    {
      "id": "blank_1",
      "position": 45,           // Character position in content
      "options_ids": [1, 2, 3, 4], // IDs from question_options table
      "correct_option_id": 2
    },
    {
      "id": "blank_2",
      "position": 123,
      "options_ids": [5, 6, 7, 8],
      "correct_option_id": 7
    }
  ]
}
```

**Content format:**
```text
The sun rises in the {{blank_1}} and sets in the {{blank_2}}. People have observed this pattern for centuries.
```

**question_options entries:**
- Option 1: "north" (for blank_1)
- Option 2: "east" (for blank_1) ✓ correct
- Option 3: "south" (for blank_1)
- Option 4: "west" (for blank_1)
- Option 5: "north" (for blank_2)
- Option 6: "south" (for blank_2)
- Option 7: "west" (for blank_2) ✓ correct
- Option 8: "east" (for blank_2)

#### Type 2: Fill in the Blanks - Drag and Drop (PTE Reading)
```json
{
  "type": "fib_dragdrop",
  "blanks": [
    {
      "id": "blank_1",
      "position": 45,
      "correct_answer": "ecosystem"
    },
    {
      "id": "blank_2",
      "position": 123,
      "correct_answer": "biodiversity"
    }
  ],
  "word_bank": [
    "ecosystem",
    "biodiversity",
    "habitat",
    "species",
    "conservation",
    "resources"
  ]
}
```

**Content format:**
```text
An {{blank_1}} is a community of living organisms. {{blank_2}} refers to the variety of life forms.
```

**Note:** Word bank includes correct answers + distractors

#### Type 3: Fill in the Blanks - Type In (PTE Listening)
```json
{
  "type": "fib_typing",
  "blanks": [
    {
      "id": "blank_1",
      "position": 45,
      "correct_answer": "temperature",
      "accept_variants": ["temp"],
      "case_sensitive": false,
      "max_length": 50
    },
    {
      "id": "blank_2",
      "position": 123,
      "correct_answer": "climate",
      "accept_variants": [],
      "case_sensitive": false,
      "max_length": 50
    }
  ]
}
```

**Content format:**
```text
The {{blank_1}} has been rising globally. Scientists study {{blank_2}} patterns to understand changes.
```

### correct_answer Structure

#### For Dropdown:
```json
{
  "blank_1": "2",  // option_id
  "blank_2": "7"   // option_id
}
```

#### For Drag and Drop:
```json
{
  "blank_1": "ecosystem",
  "blank_2": "biodiversity"
}
```

#### For Type In:
```json
{
  "blank_1": "temperature",
  "blank_2": "climate"
}
```

## Database Changes Needed

### 1. Add New Question Types to `question_types` table

```sql
-- Fill in the Blanks - Dropdown (PTE Reading)
INSERT INTO question_types (
  id, section_id, name, display_name, description,
  input_type, response_type, scoring_method,
  time_limit_seconds, order_index, is_active, ui_component
) VALUES (
  'pte-reading-fib-dropdown',
  (SELECT id FROM sections WHERE name = 'pte-reading'),
  'fib-dropdown',
  'Fill in the Blanks - Dropdown',
  'Choose words from dropdown menus to fill in the gaps in a text',
  'dropdown_selection',
  'structured_data',
  'exact_match',
  120,
  40,
  true,
  'pte-reading-fib-dropdown'
);

-- Fill in the Blanks - Drag and Drop (PTE Reading)
INSERT INTO question_types (
  id, section_id, name, display_name, description,
  input_type, response_type, scoring_method,
  time_limit_seconds, order_index, is_active, ui_component
) VALUES (
  'pte-reading-fib-dragdrop',
  (SELECT id FROM sections WHERE name = 'pte-reading'),
  'fib-dragdrop',
  'Fill in the Blanks - Drag and Drop',
  'Drag words from a box to fill in the gaps in a text',
  'drag_drop',
  'structured_data',
  'exact_match',
  120,
  41,
  true,
  'pte-reading-fib-dragdrop'
);

-- Fill in the Blanks - Type In (PTE Listening)
INSERT INTO question_types (
  id, section_id, name, display_name, description,
  input_type, response_type, scoring_method,
  time_limit_seconds, order_index, is_active, ui_component
) VALUES (
  'pte-listening-fib-typing',
  (SELECT id FROM sections WHERE name = 'pte-listening'),
  'fib-typing',
  'Fill in the Blanks - Type In',
  'Listen to a recording and type the missing words in the gaps',
  'text_input',
  'structured_data',
  'fuzzy_match',
  180,
  30,
  true,
  'pte-listening-fib-typing'
);
```

## UI Components Architecture

### Component File Structure
```
src/components/test-session/question-types/pte/reading/
  ├── fib-dropdown.tsx
  └── fib-dragdrop.tsx

src/components/test-session/question-types/pte/listening/
  └── fib-typing.tsx
```

### Component Specifications

#### 1. FIB Dropdown Component (`pte-reading-fib-dropdown`)
**Features:**
- Parse content to identify blank positions using `{{blank_id}}` markers
- Render text with inline dropdown menus at blank positions
- Each dropdown populated from `blanks_config.blanks[i].options_ids`
- Real-time response tracking
- Auto-save on selection change

**Response Format:**
```json
{
  "blank_1": "2",
  "blank_2": "7"
}
```

#### 2. FIB Drag and Drop Component (`pte-reading-fib-dragdrop`)
**Features:**
- Parse content to identify blank positions
- Render draggable word bank from `blanks_config.word_bank`
- Drop zones at each blank position
- Visual feedback for drag operations
- Shuffle word bank on initial load
- Return unused words to bank
- Swap functionality between blanks

**Response Format:**
```json
{
  "blank_1": "ecosystem",
  "blank_2": "biodiversity"
}
```

#### 3. FIB Type In Component (`pte-listening-fib-typing`)
**Features:**
- Audio player with controls (play/pause)
- Parse content to identify blank positions
- Render text with input fields at blanks
- Character limit per blank from `blanks_config`
- Audio playback counter/limit
- Real-time character count
- Auto-save on input change

**Response Format:**
```json
{
  "blank_1": "temperature",
  "blank_2": "climate"
}
```

## Admin Form Enhancement

### Add Blanks Configuration Tab

Add new tab "Blanks" to `EditQuestionForm`:

```tsx
<TabsTrigger value="blanks">Blanks Configuration</TabsTrigger>
```

**Features:**
1. **Blank Type Selection**
   - Dropdown to select: dropdown | dragdrop | typing
   - Auto-detected from question type

2. **Content Editor with Blank Markers**
   - Rich text editor for content
   - Button to insert blank markers: `{{blank_N}}`
   - Visual preview showing blanks

3. **Blank Configuration Builder**
   - For each blank detected in content:
     - **Dropdown**: Select options from question_options
     - **Drag & Drop**: Enter correct answer, build word bank
     - **Typing**: Enter correct answer, variants, settings

4. **Visual Preview**
   - Show how question will appear to students
   - Test mode to verify functionality

### Form Validation
- Ensure all blanks in content have configuration
- Verify correct answers are set
- Check word bank has correct answers + distractors (drag/drop)
- Validate JSON structure before save

## Response Data Structure

### question_attempts table usage

**response_data field:**
```json
{
  "type": "fib_dropdown", // or fib_dragdrop, fib_typing
  "answers": {
    "blank_1": "east",
    "blank_2": "west"
  },
  "metadata": {
    "time_per_blank": {
      "blank_1": 5,  // seconds
      "blank_2": 8
    },
    "changes_count": {
      "blank_1": 2,  // how many times user changed answer
      "blank_2": 1
    }
  }
}
```

## Scoring Logic

### Dropdown & Drag-Drop (Exact Match)
```typescript
function scoreExactMatch(userAnswers: Record<string, string>, correctAnswers: Record<string, string>): number {
  let correct = 0;
  let total = Object.keys(correctAnswers).length;

  for (const blankId in correctAnswers) {
    if (userAnswers[blankId] === correctAnswers[blankId]) {
      correct++;
    }
  }

  return (correct / total) * 100;
}
```

### Typing (Fuzzy Match)
```typescript
function scoreFuzzyMatch(
  userAnswers: Record<string, string>,
  blanksConfig: any
): number {
  let correct = 0;
  let total = blanksConfig.blanks.length;

  blanksConfig.blanks.forEach((blank: any) => {
    const userAnswer = userAnswers[blank.id]?.toLowerCase().trim();
    const correctAnswer = blank.correct_answer.toLowerCase().trim();
    const variants = blank.accept_variants?.map((v: string) => v.toLowerCase()) || [];

    if (userAnswer === correctAnswer || variants.includes(userAnswer)) {
      correct++;
    }
  });

  return (correct / total) * 100;
}
```

## Implementation Phases

### Phase 1: Database Setup ✅
- Add three new question types
- Create sample questions for testing
- Verify blanks_config structure

### Phase 2: UI Components
- Create FIB Dropdown component
- Create FIB Drag and Drop component
- Create FIB Type In component
- Register components in question-renderer.tsx

### Phase 3: Admin Interface
- Add Blanks tab to EditQuestionForm
- Implement blank marker insertion
- Build configuration interface for each type
- Add validation logic

### Phase 4: Testing & Refinement
- Test question creation workflow
- Test question rendering in test sessions
- Test response submission
- Test scoring accuracy
- UI/UX refinements

## Technical Considerations

### 1. Content Parsing
Use consistent blank marker format: `{{blank_N}}`
- Easy to parse with regex: `/\{\{(blank_\d+)\}\}/g`
- Clear visual indicator in content editor
- Simple string replacement for rendering

### 2. State Management
- Store user responses in component state
- Auto-save on every change via onResponse callback
- Preserve state on navigation/refresh

### 3. Accessibility
- Keyboard navigation for all interactions
- Screen reader support for blanks
- Clear focus indicators
- ARIA labels for dropdowns/inputs

### 4. Mobile Responsiveness
- Touch-friendly drag and drop
- Proper input sizing for mobile
- Scrollable word banks
- Responsive layout

### 5. Performance
- Efficient re-renders (React.memo, useMemo)
- Debounced auto-save for typing
- Lazy load audio for listening questions

## Success Criteria

✅ Admin can create all three FIB question types
✅ Questions render correctly in test sessions
✅ Students can interact with all UI elements
✅ Responses save correctly to database
✅ Scoring logic produces accurate results
✅ UI matches PTE exam interface standards
✅ Mobile-friendly and accessible
✅ No performance issues with multiple blanks

## Next Steps

1. Create database migration SQL file
2. Implement three UI components
3. Update question-renderer registry
4. Enhance admin form with blanks tab
5. Add sample questions for testing
6. Complete end-to-end testing
