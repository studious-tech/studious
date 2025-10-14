# Run PTE Reading Migration

## Step 1: Execute Database Migration

Copy and paste the contents of `add-pte-reading-question-types.sql` into your Supabase SQL editor and execute it.

This will:

1. Create PTE Reading section if it doesn't exist
2. Add 3 new question types:
   - `pte-reading-mcq-single` (Single Answer Multiple Choice)
   - `pte-reading-mcq-multiple` (Multiple Answer Multiple Choice)
   - `pte-reading-reorder-paragraphs` (Reorder Paragraphs)
3. Add sample questions with options/paragraphs

## Step 2: Test Admin Dashboard

1. Go to `/admin/content/questions`
2. Click "Create Question"
3. You should now see the enhanced question form with:
   - Question type selection dropdown (grouped by exam/section)
   - PTE Reading question types available
   - Dynamic form that adapts based on selected question type

## Step 3: Test Question Creation

### For Multiple Choice (Single Answer):

1. Select "PTE Academic - Reading > Multiple Choice (Single Answer)"
2. Fill in basic info
3. Go to "Answer Options" tab
4. Add 4 options, mark one as correct
5. Save question

### For Multiple Choice (Multiple Answers):

1. Select "PTE Academic - Reading > Multiple Choice (Multiple Answers)"
2. Fill in basic info
3. Go to "Answer Options" tab
4. Add 4-5 options, mark 2-3 as correct
5. Save question

### For Reorder Paragraphs:

1. Select "PTE Academic - Reading > Re-order Paragraphs"
2. Fill in reading passage content
3. Go to "Paragraphs" tab
4. Add 4-5 paragraphs with drag-and-drop ordering
5. Save question

## Step 4: Test Session Interface

1. Create a test session with PTE Reading questions
2. Start the test session
3. Verify:
   - Multiple choice shows radio buttons (single) or checkboxes (multiple)
   - Reorder paragraphs shows draggable paragraph boxes
   - Auto-save works for both question types
   - Submit functionality works

## Features Now Available

✅ **Admin Dashboard**

- Enhanced question creation form
- Question type selection with grouping
- Dynamic form fields based on question type
- Drag-and-drop paragraph/option management
- Real-time validation
- Media upload and selection

✅ **Test Session Interface**

- Multiple choice with single/multiple selection
- Reorder paragraphs with drag-and-drop
- Auto-save functionality
- Visual feedback and instructions
- Responsive design

✅ **Database Integration**

- Proper question type definitions
- Sample questions with options/paragraphs
- Response storage in appropriate fields

The implementation is now complete and ready for testing!
