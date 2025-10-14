# Fill-in-the-Blanks Quick Start Guide

## Step 1: Run Database Migration

```bash
# Navigate to project directory
cd /Users/syket/SD/client-projects/studious/studious-web

# Connect to your database and run the migration
# Option A: Using psql command line
psql -h your-host -U your-user -d your-db -f migrations/004_add_fill_in_blanks_question_types.sql

# Option B: Using Supabase dashboard
# 1. Go to SQL Editor in Supabase dashboard
# 2. Copy content from migrations/004_add_fill_in_blanks_question_types.sql
# 3. Paste and run

# Option C: Using npm run command (if you have a migration script)
npm run migrate:up
```

## Step 2: Verify Migration

Open your database and verify the new question types exist:

```sql
SELECT id, display_name, ui_component, section_id
FROM question_types
WHERE id LIKE '%fib%'
ORDER BY id;
```

Expected output:
```
pte-listening-fib-typing    | Fill in the Blanks - Type In       | pte-listening-fib-typing
pte-reading-fib-dragdrop    | Fill in the Blanks - Drag and Drop | pte-reading-fib-dragdrop
pte-reading-fib-dropdown    | Fill in the Blanks - Dropdown      | pte-reading-fib-dropdown
```

Check sample questions:
```sql
SELECT id, title, question_type_id
FROM questions
WHERE id LIKE 'sample-fib%';
```

## Step 3: Build & Run Application

```bash
# Install dependencies (if needed)
npm install

# Run development server
npm run dev

# Or build for production
npm run build
npm start
```

## Step 4: Test Admin Interface

### Test Dropdown FIB Question

1. Navigate to `/admin/content/questions/new`
2. Select question type: **Fill in the Blanks - Dropdown**
3. Add content with blank markers:
   ```
   Climate change is one of the most {{blank_1}} challenges. Rising temperatures have led to {{blank_2}} ice caps.
   ```
4. Go to **"Options"** tab:
   - Add option: "pressing" (mark as correct)
   - Add option: "trivial"
   - Add option: "ancient"
   - Add option: "local"
   - Add option: "melting" (mark as correct)
   - Add option: "growing"
   - Add option: "freezing"
   - Add option: "expanding"
5. Go to **"Blanks"** tab:
   - For blank_1: Assign first 4 options, set "pressing" as correct
   - For blank_2: Assign last 4 options, set "melting" as correct
   - Click "Show Preview" to verify
6. Go to **"Settings"** tab:
   - Set difficulty level
   - Set duration: 120 seconds
7. Click **"Create Question"**

### Test Drag & Drop FIB Question

1. Navigate to `/admin/content/questions/new`
2. Select question type: **Fill in the Blanks - Drag and Drop**
3. Add content:
   ```
   An {{blank_1}} is a community of living organisms. {{blank_2}} refers to the variety of life forms.
   ```
4. Go to **"Blanks"** tab:
   - For blank_1: Enter correct answer: "ecosystem"
   - For blank_2: Enter correct answer: "Biodiversity"
   - In word bank:
     - Type "ecosystem" and press Enter
     - Type "Biodiversity" and press Enter
     - Type "habitat" and press Enter (distractor)
     - Type "species" and press Enter (distractor)
     - Type "population" and press Enter (distractor)
   - Click "Show Preview" to verify
5. Go to **"Settings"** tab and configure
6. Click **"Create Question"**

### Test Typing FIB Question (Listening)

1. Navigate to `/admin/content/questions/new`
2. Select question type: **Fill in the Blanks - Type In**
3. Add content:
   ```
   The global {{blank_1}} has been rising. Scientists study {{blank_2}} patterns.
   ```
4. Go to **"Media"** tab:
   - Upload an audio file (MP3 format recommended)
   - Set role as "audio"
5. Go to **"Blanks"** tab:
   - For blank_1:
     - Correct answer: "temperature"
     - Add variant: "temp" (press Enter)
     - Max length: 50
     - Case sensitive: OFF
   - For blank_2:
     - Correct answer: "climate"
     - Add variant: "climatic" (press Enter)
     - Max length: 50
     - Case sensitive: OFF
   - Set max plays: 2
   - Click "Show Preview" to verify
6. Go to **"Settings"** tab and configure
7. Click **"Create Question"**

## Step 5: Test in Test Session

### Create Test Session

1. Navigate to PTE Dashboard
2. Click "Create New Test Session"
3. Configure test:
   - Select sections: Reading, Listening
   - Select question types:
     - ☑ Fill in the Blanks - Dropdown
     - ☑ Fill in the Blanks - Drag and Drop
     - ☑ Fill in the Blanks - Type In
   - Question count: 3+ (at least one of each type)
4. Click "Start Test"

### Test Dropdown FIB

1. Verify passage displays with inline dropdowns
2. Click dropdown at first blank
3. Verify 4 options appear
4. Select an option
5. Verify selection persists
6. Select options for all blanks
7. Verify "Answered: X/Y" counter updates
8. Click "Next" and come back
9. Verify selections are preserved
10. Click "Submit"

### Test Drag & Drop FIB

1. Verify passage displays with empty blanks
2. Verify word bank shows shuffled words
3. Drag a word from bank to a blank
4. Verify word appears in blank
5. Verify word disappears from bank
6. Drag word from one blank to another
7. Verify words swap correctly
8. Drag word back to bank
9. Verify word returns to bank
10. Fill all blanks
11. Verify "Filled: X/Y" counter updates
12. Click "Next" and come back
13. Verify filled blanks are preserved
14. Click "Submit"

### Test Typing FIB (Listening)

1. Verify passage displays with input fields
2. Verify audio player appears at top
3. Click play button
4. Verify audio plays
5. Verify progress bar moves
6. Verify time counter updates
7. Verify play count increments
8. Type in first blank
9. Verify character counter updates
10. Verify cannot exceed max length
11. Fill all blanks
12. Verify "Completed: X/Y" counter updates
13. Try playing audio again
14. Verify play limit enforced after max plays
15. Click "Next" and come back
16. Verify typed answers preserved
17. Click "Submit"

## Step 6: Verify Results

1. Complete test session
2. Go to results page
3. For each FIB question:
   - Verify correct answers shown
   - Verify user answers shown
   - Verify score calculated correctly
   - Verify feedback displayed

## Troubleshooting

### Question Types Not Showing

**Problem:** New FIB question types don't appear in admin dropdown

**Solution:**
```bash
# Clear cache and rebuild
npm run build
# Or restart dev server
```

**Check database:**
```sql
SELECT * FROM question_types WHERE id LIKE '%fib%';
```

### Blank Markers Not Detected

**Problem:** Blanks tab shows "No blanks detected"

**Solution:**
- Ensure using correct format: `{{blank_1}}`, `{{blank_2}}`, etc.
- Check for typos: double curly braces, lowercase "blank", underscore
- Make sure content is not empty

### Dropdown Shows No Options

**Problem:** Dropdowns appear but have no options

**Solution:**
1. Go to "Options" tab first
2. Add at least 4 options
3. Go to "Blanks" tab
4. Assign options to each blank
5. Set correct option

### Drag & Drop Not Working

**Problem:** Cannot drag words

**Solution:**
1. Check word bank has words (add words in Blanks tab)
2. Try different browser (HTML5 drag-drop support required)
3. On mobile, use touch events (touch and hold, then drag)

### Audio Not Playing

**Problem:** Audio player shows but won't play

**Solution:**
1. Verify audio file uploaded correctly
2. Check audio format (MP3 recommended)
3. Check browser console for errors
4. Verify media URL is accessible
5. Check file size (should be < 50MB)

### Responses Not Saving

**Problem:** Answers disappear after navigation

**Solution:**
1. Check browser console for errors
2. Verify API endpoints working
3. Check network tab for failed requests
4. Ensure onResponse callback is working

## Testing Checklist

Use this checklist to verify everything works:

### Admin Interface
- [ ] All 3 FIB types appear in question type dropdown
- [ ] Can create dropdown FIB question
- [ ] Can create drag-drop FIB question
- [ ] Can create typing FIB question
- [ ] Blanks tab auto-detects blank markers
- [ ] Preview shows blanks correctly
- [ ] JSON view shows correct structure
- [ ] Questions save successfully

### Test Session - Dropdown
- [ ] Question renders correctly
- [ ] Dropdowns show 4 options each
- [ ] Can select from dropdowns
- [ ] Selections persist
- [ ] Auto-save works
- [ ] Progress counter accurate
- [ ] Submit works

### Test Session - Drag & Drop
- [ ] Question renders correctly
- [ ] Word bank shows words
- [ ] Can drag from bank to blank
- [ ] Can swap between blanks
- [ ] Can return to bank
- [ ] Visual feedback works
- [ ] Auto-save works
- [ ] Progress counter accurate
- [ ] Submit works

### Test Session - Typing
- [ ] Question renders correctly
- [ ] Audio player works
- [ ] Play/pause works
- [ ] Progress bar updates
- [ ] Play count enforced
- [ ] Can type in blanks
- [ ] Character limit works
- [ ] Auto-save works (debounced)
- [ ] Progress counter accurate
- [ ] Submit works

### Scoring & Results
- [ ] Dropdown scored correctly
- [ ] Drag-drop scored correctly
- [ ] Typing scored correctly
- [ ] Variants accepted
- [ ] Results show correct answers
- [ ] Results show user answers

## Next Steps After Testing

1. **Create Real Questions**
   - Replace sample questions with real PTE content
   - Ensure proper difficulty distribution
   - Review with subject matter experts

2. **Performance Testing**
   - Test with 10+ blanks per question
   - Test with large word banks (20+ words)
   - Test on slow connections
   - Test on mobile devices

3. **User Acceptance Testing**
   - Get feedback from test users
   - Adjust UI/UX based on feedback
   - Monitor for any edge cases

4. **Production Deployment**
   - Run migration on production database
   - Deploy application
   - Monitor logs for errors
   - Set up analytics tracking

## Support

If you encounter any issues:

1. Check browser console for JavaScript errors
2. Check network tab for failed API requests
3. Check server logs for backend errors
4. Review the implementation plan: `FILL_IN_BLANKS_IMPLEMENTATION_PLAN.md`
5. Review the summary: `FILL_IN_BLANKS_IMPLEMENTATION_SUMMARY.md`

## Success! 🎉

Once all tests pass, your fill-in-the-blanks implementation is ready for production use!
