# Test Session Flow Analysis & Debug

## Current Flow (How it Should Work)

### 1. **User Starts Test**

```
TestSessionPage loads
  → Fetches session from /api/test-sessions/[sessionId]
  → Passes to SimpleTestSessionInterface
```

### 2. **SimpleTestSessionInterface Initializes**

```
useEffect(() => fetch questions)
  → GET /api/test-sessions/[sessionId]/questions
  → Sets sessionData with all questions
  → Finds first incomplete question
  → Sets currentQuestionIndex
```

### 3. **Question Renders**

```
<div key={questionKey}>  ← Forces clean remount
  <QuestionRenderer
    question={currentQuestion}
    onResponse={handleQuestionResponse}  ← Captures response
    currentResponse={null}  ← Always null for fresh state
  />
</div>
```

### 4. **User Answers Question**

```
MCQSingle component:
  handleSelect(optionId)
    → setSelectedOption(optionId)  // Local state
    → onResponse({  // Calls parent immediately
        questionId,
        sessionQuestionId,
        response: [optionId],
        responseType: 'selection'
      })
```

### 5. **Response Captured in Parent**

```
handleQuestionResponse = (response) => {
  setCurrentResponse(response.response);  // Sets [optionId]
  setCurrentResponseType(response.responseType);  // Sets 'selection'
}

// Next button enabled:
canProceed = currentResponse !== null && !isSaving  // TRUE
```

### 6. **User Clicks Next**

```
handleNextQuestion()
  1. Check currentResponse !== null  ✓
  2. POST to /api/test-sessions/[sessionId]/questions/[questionId]/response
     Body: {
       response: currentResponse,  // [optionId]
       responseType: currentResponseType,  // 'selection'
       timeSpentSeconds: timeSpentRef.current
     }
  3. API creates/updates question_attempts record
  4. Reset state:
     - setCurrentResponse(null)
     - setCurrentResponseType('')
     - timeSpentRef.current = 0
  5. Move to next:
     - setCurrentQuestionIndex(prev => prev + 1)
     - setQuestionKey(prev => prev + 1)  ← Forces remount
  6. toast.success('Answer saved!')
```

### 7. **Next Question Loads**

```
Component remounts with new key
  → New question rendered
  → currentResponse = null (fresh state)
  → Next button disabled until answered
  → Repeat cycle
```

---

## Potential Issues & Fixes

### Issue 1: Response Not Being Captured

**Symptom:** Next button stays disabled even after selecting an answer

**Debug Steps:**

```typescript
// Add console.log in handleQuestionResponse
const handleQuestionResponse = (response: {
  questionId: string;
  sessionQuestionId: string;
  response: unknown;
  responseType: string;
}) => {
  console.log('📝 Response received:', response);
  console.log('📝 Setting currentResponse to:', response.response);
  setCurrentResponse(response.response);
  setCurrentResponseType(response.responseType);
};
```

**Possible Causes:**

- Question component not calling onResponse
- Response is undefined/null
- Component remounting before response captured

---

### Issue 2: API Save Failing Silently

**Symptom:** Next button works, but response not saved to DB

**Debug Steps:**

```typescript
const handleNextQuestion = async () => {
  console.log('🚀 Saving response:', {
    currentResponse,
    currentResponseType,
    timeSpent: timeSpentRef.current,
  });

  // ... rest of save logic

  const saveResponse = await fetch(/* ... */);
  const result = await saveResponse.json();
  console.log('✅ Save result:', result);
};
```

**Possible Causes:**

- API endpoint not found
- Authentication failure
- Invalid request body
- Database constraint violation

---

### Issue 3: Component Not Remounting

**Symptom:** Previous question's answer visible on next question

**Debug Steps:**

```typescript
useEffect(() => {
  console.log('🔄 Component mounted with key:', questionKey);
  console.log('🔄 Current question index:', currentQuestionIndex);
  return () => {
    console.log('💀 Component unmounting');
  };
}, [questionKey, currentQuestionIndex]);
```

**Possible Causes:**

- Key not incrementing
- React optimization preventing remount
- State not cleared properly

---

### Issue 4: Timer Not Resetting

**Symptom:** Time spent accumulates across questions

**Current Code:**

```typescript
timeSpentRef.current = 0; // Reset after save
```

**Possible Issue:**

- Timer continues running from unmounted component
- timeSpentRef persists across remounts

**Fix:**

```typescript
// Reset timer in useEffect on question change
useEffect(() => {
  timeSpentRef.current = 0; // Reset when question changes
}, [currentQuestionIndex]);
```

---

## Recommended Debugging Additions

### 1. Add Debug Mode Toggle

```typescript
const [debugMode, setDebugMode] = useState(false);

// Press 'D' key to toggle debug mode
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'd' || e.key === 'D') {
      setDebugMode((prev) => !prev);
      toast.info(`Debug mode ${!debugMode ? 'enabled' : 'disabled'}`);
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [debugMode]);

// Show debug info
{
  debugMode && (
    <div className="fixed top-20 right-4 bg-black/90 text-white p-4 rounded text-xs z-50">
      <div>
        <strong>Debug Info:</strong>
      </div>
      <div>
        Question: {currentQuestionIndex + 1}/{sessionData.totalQuestions}
      </div>
      <div>Question Key: {questionKey}</div>
      <div>Current Response: {JSON.stringify(currentResponse)}</div>
      <div>Response Type: {currentResponseType}</div>
      <div>Can Proceed: {canProceed ? 'YES' : 'NO'}</div>
      <div>Time Spent: {timeSpentRef.current}s</div>
    </div>
  );
}
```

### 2. Add API Call Logging

```typescript
// In handleNextQuestion, add detailed logging
try {
  console.group('💾 Saving Response');
  console.log('Session ID:', sessionId);
  console.log('Question ID:', currentQuestion.question.id);
  console.log('Response:', currentResponse);
  console.log('Response Type:', currentResponseType);
  console.log('Time Spent:', timeSpentRef.current);

  const url = `/api/test-sessions/${sessionId}/questions/${currentQuestion.question.id}/response`;
  console.log('API URL:', url);

  const saveResponse = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      response: currentResponse,
      responseType: currentResponseType,
      timeSpentSeconds: timeSpentRef.current || 0,
    }),
  });

  console.log('Response Status:', saveResponse.status);
  const result = await saveResponse.json();
  console.log('Response Body:', result);

  if (!saveResponse.ok) {
    console.error('❌ Save failed:', result);
    throw new Error(result.error || 'Failed to save response');
  }

  console.log('✅ Save successful!');
  console.groupEnd();
} catch (error) {
  console.error('❌ Error in save process:', error);
  console.groupEnd();
  throw error;
}
```

### 3. Add Network Request Monitoring

Open browser DevTools → Network tab → Filter by "Fetch/XHR"
Look for:

- `/api/test-sessions/[id]/questions` - Should succeed once
- `/api/test-sessions/[id]/questions/[qid]/response` - Should succeed on each Next click

---

## Expected Database State After Each Question

### question_attempts table:

```sql
SELECT
  qa.id,
  qa.question_id,
  qa.response_text,
  qa.selected_options,
  qa.response_media_id,
  qa.time_spent_seconds,
  qa.submitted_at
FROM question_attempts qa
WHERE qa.test_session_id = '[session-id]'
ORDER BY qa.created_at;
```

Should show:

- 1 row per answered question
- Correct response_text OR selected_options OR response_media_id
- time_spent_seconds > 0
- submitted_at timestamp

### test_session_questions table:

```sql
SELECT
  tsq.id,
  tsq.question_id,
  tsq.sequence_number,
  tsq.is_attempted,
  tsq.is_completed,
  tsq.question_attempt_id
FROM test_session_questions tsq
WHERE tsq.session_id = '[session-id]'
ORDER BY tsq.sequence_number;
```

Should show:

- is_attempted = TRUE after answering
- question_attempt_id linked to attempt
- is_completed updates appropriately

---

## Common Issues & Solutions

### Issue: "Please answer the question" error when Next is clicked

**Cause:** `currentResponse` is null
**Fix:** Check if question component is calling `onResponse` correctly

### Issue: "Failed to save response" error

**Cause:** API endpoint error
**Fix:** Check API logs, verify authentication, check database constraints

### Issue: Answer from previous question appears

**Cause:** Component not remounting properly
**Fix:** Verify `questionKey` is incrementing, check React DevTools

### Issue: Timer keeps running after moving to next question

**Cause:** Timer not cleared properly
**Fix:** Clear interval in cleanup function

---

## Testing Checklist

### Manual Test Steps:

1. ✅ Start a test session
2. ✅ Answer first question (select/type/record)
3. ✅ Verify Next button becomes enabled
4. ✅ Click Next
5. ✅ Verify "Answer saved!" toast appears
6. ✅ Verify second question loads cleanly
7. ✅ Verify first question's answer is NOT visible
8. ✅ Check browser DevTools Network tab for API calls
9. ✅ Check browser Console for any errors
10. ✅ Complete all questions
11. ✅ Verify "Test completed successfully!" toast
12. ✅ Verify redirect to dashboard

### Database Verification:

```sql
-- Check if attempts were saved
SELECT COUNT(*) FROM question_attempts
WHERE test_session_id = '[session-id]';
-- Should equal number of questions answered

-- Check session status
SELECT status, completed_at
FROM test_sessions
WHERE id = '[session-id]';
-- Should be 'completed' with timestamp
```

---

## Next Steps

1. **Add debug logging** to identify where the flow breaks
2. **Test with different question types** (MCQ, Text, Audio)
3. **Monitor browser console** for errors
4. **Check API logs** in terminal
5. **Verify database records** after each question
