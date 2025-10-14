# Audio Upload Testing Guide

## 🔧 Fixes Applied

### 1. **Fixed Admin Store Upload Function**
- ✅ Now uses `/api/admin/media` endpoint instead of direct Supabase calls
- ✅ Proper file type validation for MP3 (`audio/mpeg`)
- ✅ Consistent storage bucket (`exam-media`)
- ✅ Better error handling with specific error messages

### 2. **Enhanced Question Form Error Handling**
- ✅ Added detailed console logging for debugging
- ✅ Specific success/error messages per file
- ✅ File details logging (name, type, size)

## 🧪 Testing Steps

### Step 1: Verify File Types
The system now supports these audio formats:
- **MP3** (`audio/mpeg`) ✅
- **WAV** (`audio/wav`) ✅
- **WebM** (`audio/webm`) ✅
- **OGG** (`audio/ogg`) ✅

### Step 2: Test Upload Process
1. **Navigate to Admin Panel**:
   ```
   /admin/content/exams/[examId]/sections/[sectionId]/question-types/[questionTypeId]
   ```

2. **Create/Edit Question**:
   - Click "Add Question" or edit existing question
   - Scroll to "Upload Media" section
   - Click "Audio" upload option

3. **Upload MP3 File**:
   - Select MP3 file (max 50MB)
   - **IMPORTANT**: Open browser Developer Tools (F12) and go to Console tab
   - Watch for detailed logging during upload

### Step 3: Check Browser Console (ENHANCED DEBUGGING)
Look for these detailed logs:

**File Detection:**
```javascript
Upload attempt details: {
  fileName: "audio-file.mp3",
  fileType: "audio/mpeg",
  fileSize: 1048576,
  fileSizeInMB: "1.00",
  lastModified: "2023-XX-XXTXX:XX:XX.XXXZ"
}
```

**Validation Status:**
```javascript
File type validation passed, proceeding with upload...
Sending request to /api/admin/media...
```

**Response Status:**
```javascript
Response received: {
  status: 200,
  statusText: "OK",
  ok: true
}

Upload successful: {
  id: "m_audio_1234567890",
  public_url: "https://xxx.supabase.co/storage/v1/object/public/exam-media/..."
}
```

**Success Toast:**
```javascript
[filename] uploaded successfully
```

### Step 4: If Upload Fails - Check Error Details
The enhanced debugging will show exactly where the failure occurs:

**MIME Type Issues:**
```javascript
File type validation failed: {
  detectedType: "application/octet-stream",  // Example problematic type
  allowedTypes: ["audio/mpeg", "audio/mp3", ...],
  isAudio: false,
  fileName: "file.mp3",
  fileExtension: "mp3"
}
```

**API Errors:**
```javascript
API response error: {
  error: "File type audio/xyz not allowed",
  // or other specific error message
}
```

### Step 5: Verify Database Entry
Check that media entry was created:
```sql
SELECT * FROM public.media
WHERE file_type = 'audio'
ORDER BY created_at DESC
LIMIT 5;
```

## 🔍 Troubleshooting

### Common Issues & Solutions

1. **"File type not allowed"**
   - **Cause**: Unsupported audio format
   - **Solution**: Use MP3, WAV, WebM, or OGG

2. **"File size exceeds 50MB limit"**
   - **Cause**: File too large
   - **Solution**: Compress audio or use smaller file

3. **"Admin access required"**
   - **Cause**: User doesn't have admin role
   - **Solution**: Check `user_profiles.role = 'admin'`

4. **Storage/bucket errors**
   - **Cause**: Supabase storage bucket issues
   - **Solution**: Verify `exam-media` bucket exists and has proper permissions

5. **API timeout**
   - **Cause**: Large file upload timeout
   - **Solution**: Check Vercel/hosting timeout limits

### Advanced Debugging

If upload still fails, check:

1. **Network Tab**: Look for failed API calls to `/api/admin/media`
2. **Supabase Dashboard**: Check storage bucket permissions
3. **Server Logs**: Look for backend errors
4. **Database**: Verify admin user role

## 📁 File Structure Changes

```
src/stores/admin.ts
├─ uploadMedia() - Now uses admin API ✅
└─ Better error handling ✅

src/components/admin/content/question-form.tsx
├─ Enhanced error logging ✅
└─ Detailed success messages ✅

src/app/api/admin/media/route.ts
└─ Already supports audio/mpeg ✅
```

## 🚀 Next Steps

1. Test with actual MP3 file
2. Verify file appears in media gallery
3. Check that audio can be attached to questions
4. Test playback in question interfaces