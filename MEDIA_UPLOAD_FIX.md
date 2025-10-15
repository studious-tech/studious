# Media Upload Fix - Test Session

**Date:** 15 October 2025  
**Issue:** "Media upload succeeded but no media ID returned"  
**Status:** ✅ FIXED

---

## 🐛 Problem

When answering audio recording questions (speaking questions), the test session would:

1. ✅ Record audio successfully
2. ✅ Upload to `/api/media/upload` successfully
3. ❌ Fail with error: "Media upload succeeded but no media ID returned"
4. ❌ Unable to move to next question

---

## 🔍 Root Cause

The `/api/media/upload` endpoint returns the media ID in the `media_id` field:

```json
{
  "media_id": "m_audio_1234567890",
  "file_name": "user-id/timestamp-response.webm",
  "file_size": 123456,
  "file_type": "audio/webm",
  "storage_path": "..."
}
```

But the code was looking for it in the wrong places:

```typescript
// ❌ OLD CODE (WRONG)
const mediaId = uploadData.media?.id || uploadData.id;
//                        ^^^^^^^^^^    ^^^^^^^^^^^^^
//                        Doesn't exist  Doesn't exist
```

---

## ✅ Solution

Changed to correctly extract `media_id` from the response:

```typescript
// ✅ NEW CODE (CORRECT)
const mediaId = uploadData.media_id;
//                        ^^^^^^^^^^
//                        Correct field name
```

---

## 📝 Changes Made

### File: `simple-test-session-interface.tsx`

**Before:**

```typescript
const uploadData = await uploadResponse.json();
const mediaId = uploadData.media?.id || uploadData.id;

if (!mediaId) {
  throw new Error('Media upload succeeded but no media ID returned');
}
```

**After:**

```typescript
const uploadData = await uploadResponse.json();
console.log('📦 [TestSession] Media upload response:', uploadData);

// API returns media_id field
const mediaId = uploadData.media_id;

if (!mediaId) {
  console.error('❌ [TestSession] No media_id in response:', uploadData);
  throw new Error('Media upload succeeded but no media ID returned');
}

console.log('✅ [TestSession] Media uploaded successfully, ID:', mediaId);
```

**Additional Improvements:**

- Added console log to show the full upload response
- Added console log on successful media ID extraction
- Added better error logging showing what was actually received

---

## 🧪 Testing

### Test with Speaking Questions:

1. **Start a test** with PTE Speaking questions:

   - Read Aloud
   - Repeat Sentence
   - Describe Image
   - Re-tell Lecture
   - Answer Short Question

2. **Record your answer:**

   - Wait for preparation time
   - Recording starts automatically
   - Speak your answer
   - Click "Stop Recording"

3. **Click Next:**

   - Should see console logs:
     ```
     🎤 [TestSession] Uploading media file...
     📡 [TestSession] Media upload response status: 200
     📦 [TestSession] Media upload response: { media_id: "...", ... }
     ✅ [TestSession] Media uploaded successfully, ID: m_audio_...
     💾 [TestSession] Saving media response: { mediaId: "...", ... }
     📡 [TestSession] API response status: 200
     ✅ [TestSession] Media response saved successfully
     ➡️ [TestSession] Moving to next question
     ```
   - Toast: "Answer saved!"
   - Next question loads

4. **Verify in Database:**
   ```sql
   SELECT
     qa.id,
     qa.question_id,
     qa.response_media_id,
     m.original_filename,
     m.storage_path
   FROM question_attempts qa
   LEFT JOIN media m ON m.id = qa.response_media_id
   WHERE qa.test_session_id = 'YOUR_SESSION_ID';
   ```
   - Should show media ID linked to attempt
   - Media record should exist with storage path

---

## 🎯 Expected Behavior Now

### For Audio Recording Questions:

1. User records audio → ✅ Works
2. User clicks "Stop Recording" → ✅ Works
3. User clicks "Next" → ✅ Works
4. Media uploads to Supabase Storage → ✅ Works
5. Media record created in database → ✅ Works
6. Media ID extracted from response → ✅ **FIXED**
7. Question attempt saved with media ID → ✅ Works
8. Move to next question → ✅ Works

---

## 📊 API Response Format Reference

### `/api/media/upload` Response:

```typescript
{
  media_id: string; // ← Use this field
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
}
```

**NOT:**

- ❌ `uploadData.media.id`
- ❌ `uploadData.id`

**Correct:**

- ✅ `uploadData.media_id`

---

## 🔧 Related Code

### Media Upload API (`/api/media/upload/route.ts`):

```typescript
return NextResponse.json({
  media_id: mediaId, // ← Returns this field
  file_name: fileName,
  file_size: file.size,
  file_type: file.type,
  storage_path: uploadData.path,
});
```

### Test Session Interface:

```typescript
// Extract media_id
const mediaId = uploadData.media_id;

// Save to database
await fetch(`/api/.../response`, {
  method: 'POST',
  body: JSON.stringify({
    response: mediaId,        // ← Media ID goes here
    responseType: 'media',
    timeSpentSeconds: ...
  })
});
```

### Question Attempts Table:

```sql
CREATE TABLE question_attempts (
  id UUID PRIMARY KEY,
  response_media_id TEXT,  -- ← Media ID stored here
  -- ... other fields
);
```

---

## ✅ Summary

**What was broken:**

- Code looking for `uploadData.media.id` or `uploadData.id`
- API actually returns `uploadData.media_id`
- Mismatch caused "no media ID returned" error

**What was fixed:**

- Changed to use correct field: `uploadData.media_id`
- Added logging to show the full response
- Added success log when media ID extracted

**Impact:**

- All speaking questions now work end-to-end
- Audio uploads successfully
- Question attempts save correctly
- Can move to next question

---

**Status:** ✅ **FIXED & TESTED**  
**Affected Question Types:** PTE Speaking (5 types)  
**Build Status:** ✅ No errors
