# Test Session Debugging Guide

## 🐛 How to Debug Test Sessions

### Quick Start

1. **Start your test session** normally
2. **Press `Ctrl+D` (Windows/Linux) or `Cmd+D` (Mac)** to enable debug mode
3. **A debug panel appears** in the top-right corner showing real-time state
4. **Open Browser Console** (F12 → Console tab) for detailed logs
5. **Open Network Tab** (F12 → Network tab) to monitor API calls

---

## 📊 Debug Panel Information

When debug mode is enabled, you'll see:

```
🐛 DEBUG MODE (Ctrl/Cmd+D to hide)
Session ID: abc-123-xyz               ← Current test session
Question: 3/10                         ← Current position
Question Key: 2                        ← Forces remount (should increment)

Has Response: YES                      ← Green = answered, Red = not answered
Response: ["option-id-123"]           ← The actual response data
Type: selection                        ← Response type (selection/text/media)

Can Proceed: YES                       ← Green = Next enabled, Red = disabled
Saving: NO                             ← Shows when saving to DB
Time Spent: 45s                        ← Time on current question

Check browser console for detailed logs
```

---

## 🔍 Console Log Analysis

### When You Answer a Question:

```
📝 [TestSession] Response received: {
  questionId: "q-123",
  sessionQuestionId: "sq-456",
  response: ["option-id"],
  responseType: "selection"
}
✅ [TestSession] Response captured, Next button should be enabled
```

**What to check:**

- ✅ Does the response look correct?
- ✅ Is the responseType correct? (selection/text/media)
- ✅ Did you see the success message?

---

### When You Click Next:

```
🚀 [TestSession] Next button clicked
📊 [TestSession] Current state: {
  hasSessionData: true,
  currentResponse: ["option-id"],
  currentResponseType: "selection",
  currentQuestionIndex: 0,
  timeSpent: 45
}
💾 [TestSession] Saving response for question: q-123
💾 [TestSession] Saving regular response: {
  response: ["option-id"],
  responseType: "selection",
  timeSpent: 45
}
📡 [TestSession] API response status: 200
📡 [TestSession] API response body: {
  success: true,
  attemptId: "attempt-789",
  isNew: true,
  message: "Attempt saved successfully"
}
✅ [TestSession] Regular response saved successfully
🔄 [TestSession] Resetting state for next question
🏁 [TestSession] Is last question? false
➡️ [TestSession] Moving to next question: {
  from: 0,
  to: 1,
  newKey: 1
}
```

**What to check:**

- ✅ Status: 200 (success) or 400/500 (error)
- ✅ Success: true in response
- ✅ attemptId returned from API
- ✅ Question index increments
- ✅ Question key increments (forces remount)

---

## ❌ Common Errors & Solutions

### Error 1: "Please answer the question before proceeding"

**Log Output:**

```
❌ [TestSession] Cannot proceed: {
  hasSessionData: true,
  hasResponse: false  ← Problem: response not captured
}
```

**Causes:**

1. Question component didn't call `onResponse`
2. Response is null/undefined
3. Component remounted before response captured

**Solution:**

- Check if your question component calls `onResponse` when user makes a selection
- Verify the response data is not null
- Check React DevTools to see component state

---

### Error 2: "Failed to save response"

**Log Output:**

```
📡 [TestSession] API response status: 400
📡 [TestSession] API response body: {
  error: "Missing required fields: response, responseType"
}
❌ [TestSession] Save failed: { error: "..." }
```

**Causes:**

1. API endpoint error
2. Invalid request body
3. Authentication failure
4. Database constraint violation

**Solution:**

- Check Network tab for the exact error
- Verify you're logged in
- Check API logs in terminal
- Verify database schema

---

### Error 3: Previous answer appears on next question

**Log Output:**

```
🔄 [TestSession] Question changed: {
  questionIndex: 1,
  questionKey: 0,  ← Problem: key didn't increment
  currentResponse: ["old-answer"],
  currentResponseType: "selection"
}
```

**Causes:**

1. `questionKey` not incrementing
2. React not remounting component
3. State not cleared properly

**Solution:**

- Verify `setQuestionKey(prev => prev + 1)` is being called
- Check if `key={questionKey}` is on the correct div
- Verify state reset logic runs

---

### Error 4: Time accumulates across questions

**Log Output:**

```
💾 [TestSession] Saving response: {
  timeSpent: 120  ← Should be ~45 for one question
}
```

**Causes:**

1. `timeSpentRef.current` not reset
2. Timer continues from previous question

**Solution:**

- Verify `timeSpentRef.current = 0` runs after save
- Check timer cleanup in useEffect

---

## 🧪 Manual Testing Checklist

### Basic Flow Test:

1. ☐ Start a test with 3-5 questions
2. ☐ Enable debug mode (Ctrl/Cmd+D)
3. ☐ Open browser console (F12)
4. ☐ Open Network tab

### For Each Question:

5. ☐ Read the question
6. ☐ Select/type/record an answer
7. ☐ Check debug panel: "Has Response" should turn GREEN
8. ☐ Check console for "Response received" log
9. ☐ Verify Next button is ENABLED (not grayed out)
10. ☐ Click Next
11. ☐ Check console for save logs
12. ☐ Check Network tab for API call (should be 200)
13. ☐ Verify toast: "Answer saved!"
14. ☐ Verify new question loads
15. ☐ Verify previous answer is NOT visible
16. ☐ Check debug panel: "Question Key" incremented

### Final Question:

17. ☐ Answer last question
18. ☐ Click "Finish Test"
19. ☐ Verify toast: "Test completed successfully!"
20. ☐ Verify redirect to dashboard

---

## 📡 Network Tab Analysis

### Expected API Calls:

1. **Load Session Questions:**

```
GET /api/test-sessions/{sessionId}/questions
Status: 200
Response: {
  sessionId: "...",
  examId: "...",
  questions: [...],
  totalQuestions: 10
}
```

2. **Save Each Answer:**

```
POST /api/test-sessions/{sessionId}/questions/{questionId}/response
Status: 200
Request: {
  response: [...],
  responseType: "selection",
  timeSpentSeconds: 45
}
Response: {
  success: true,
  attemptId: "...",
  isNew: true,
  message: "Attempt saved successfully"
}
```

3. **Complete Test:**

```
POST /api/test-sessions/{sessionId}/complete
Status: 200
Response: {
  success: true,
  message: "Test completed"
}
```

---

## 🗄️ Database Verification

### After Answering Questions:

```sql
-- Check attempts were saved
SELECT
  qa.id,
  qa.question_id,
  qa.response_text,
  qa.selected_options,
  qa.time_spent_seconds,
  qa.submitted_at
FROM question_attempts qa
WHERE qa.test_session_id = 'YOUR_SESSION_ID'
ORDER BY qa.created_at;
```

**Expected:**

- 1 row per answered question
- Correct response data in appropriate column
- Timestamps present

### After Completing Test:

```sql
-- Check session status
SELECT
  id,
  status,
  completed_at,
  total_time_spent_seconds
FROM test_sessions
WHERE id = 'YOUR_SESSION_ID';
```

**Expected:**

- status = 'completed'
- completed_at has timestamp
- total_time_spent_seconds > 0

---

## 🔧 Developer Tools Setup

### Chrome/Edge DevTools:

1. Press `F12` or `Ctrl+Shift+I` (Cmd+Option+I on Mac)
2. **Console tab**: View all logs
3. **Network tab**: Monitor API calls
   - Filter by "Fetch/XHR"
   - Click on a request to see details
4. **Application tab**: Check localStorage (for any stored data)

### Firefox DevTools:

1. Press `F12` or `Ctrl+Shift+I` (Cmd+Option+I on Mac)
2. Same tabs available
3. Network → XHR for API calls

### Safari DevTools:

1. Enable: Safari → Settings → Advanced → Show Develop menu
2. Press `Cmd+Option+I`
3. Use Network tab for API monitoring

---

## 📝 Reporting Issues

When reporting a bug, include:

1. **Console Logs**: Copy all logs from the console
2. **Debug Panel Screenshot**: Show the debug panel state
3. **Network Tab**: Screenshot or copy of failed API calls
4. **Steps to Reproduce**:
   - Question number where error occurred
   - Question type (MCQ, text, audio, etc.)
   - Exact steps taken
5. **Expected vs Actual**: What should happen vs what happened

---

## 🎯 Quick Fixes

### Next button stays disabled:

```bash
# Check console for:
"Response received" log?        → NO: Question component issue
"Has Response: YES" in debug?   → NO: Response not captured
Try reloading the page
```

### Error saving to database:

```bash
# Check Network tab:
Status 401? → Log in again
Status 400? → Check request body in Network tab
Status 500? → Check server logs
```

### Component not remounting:

```bash
# Check console:
"Question Key" incrementing?    → NO: setQuestionKey not called
"Moving to next question" log?  → NO: Navigation logic issue
```

---

## 🚀 Performance Tips

- **Clear console** regularly (not during testing) to reduce memory
- **Filter Network tab** to "XHR" to see only API calls
- **Disable debug mode** when not actively debugging (Ctrl/Cmd+D)
- **Close other browser tabs** for better performance

---

## 📞 Support

If you continue having issues after following this guide:

1. Export console logs: Right-click in console → Save as...
2. Take screenshot of debug panel
3. Note your browser and version
4. Share the session ID
5. Contact the development team with all information

---

**Debug Mode Shortcuts:**

- `Ctrl+D` / `Cmd+D`: Toggle debug panel
- `F12`: Open DevTools
- `Ctrl+Shift+C`: Inspect element
- `Ctrl+R` / `Cmd+R`: Reload page (if stuck)
