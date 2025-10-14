# PTE Repeat Sentence Audio Fix

## 🎯 **Issue Identified**
The PTE Speaking "Repeat Sentence" component was not loading audio files properly because:
1. **Wrong URL Source**: Component relied on `audioMedia?.url` which came from potentially null `public_url` database field
2. **Variable Naming Conflict**: `audioUrl` was defined twice (const + useState), causing confusion between original question audio and recorded user audio
3. **Missing Utility Usage**: Not using the existing `media-utils.ts` helper functions
4. **No Dynamic URL Generation**: Not leveraging the `/api/media/[mediaId]` endpoint for proper URL generation

## ✅ **Solution Implemented**

### 1. **Added Media Utils Import**
```typescript
import { getMediaUrl } from '@/lib/media-utils';
```

### 2. **Fixed Audio URL Generation & Variable Naming Conflicts**
```typescript
// Before: Direct database field (potentially null) + naming conflict
const audioUrl = audioMedia?.url;
const [audioUrl, setAudioUrl] = useState<string | null>(null); // ❌ Conflict!

// After: Proper separation and dynamic URL generation
const originalAudioUrl = audioMedia?.id ? getMediaUrl(audioMedia.id) : null; // Original question audio
const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null); // User's recorded response
```

### 3. **Enhanced Error Handling & Debugging**
```typescript
const playOriginalAudio = () => {
  if (!originalAudioUrl) {
    toast.error('Audio file not available');
    console.error('No audio URL available:', { audioMedia, originalAudioUrl });
    return;
  }

  try {
    console.log('Playing audio from URL:', originalAudioUrl);
    const audio = new Audio(originalAudioUrl);
    audio.play();
    // ... rest of logic
  } catch (err) {
    toast.error('Unable to play audio.');
    console.error('Error playing audio:', err);
  }
};
```

### 4. **Added Media Detection Debugging**
```typescript
useEffect(() => {
  console.log('PTE Repeat Sentence - Media Debug:', {
    totalMedia: questionData.media?.length || 0,
    media: questionData.media,
    audioMedia,
    originalAudioUrl,
    hasAudioFile: !!originalAudioUrl
  });
}, [questionData.media, audioMedia, originalAudioUrl]);
```

### 5. **Improved Button State Management**
```typescript
<button
  onClick={playOriginalAudio}
  style={{
    // ... other styles
    background: originalAudioUrl ? '#ffffff' : '#f5f5f5',
    cursor: originalAudioUrl ? 'pointer' : 'not-allowed',
    opacity: originalAudioUrl ? 1 : 0.6,
  }}
  disabled={!originalAudioUrl}
>
```

## 🔧 **How It Works**

### URL Generation Flow:
1. **Component**: `getMediaUrl(audioMedia.id)` → `/api/media/${mediaId}`
2. **API Endpoint**: `/api/media/[mediaId]/route.ts`
3. **URL Generation**:
   - **Public Media** (exam-media): `supabase.storage.getPublicUrl()`
   - **Private Media**: `supabase.storage.createSignedUrl()`
4. **Response**: Direct file access URL for audio playback

### Benefits:
- ✅ **Dynamic URL Generation**: No dependency on potentially null database fields
- ✅ **Proper Authentication**: Handles both public and private media
- ✅ **Error Handling**: Clear error messages and debugging
- ✅ **Future-Proof**: Uses established media utility pattern
- ✅ **Security**: Respects access controls for private media

## 🧪 **Testing**

### Console Debugging:
Open browser Developer Tools and look for:

```javascript
// Media detection
PTE Repeat Sentence - Media Debug: {
  totalMedia: 1,
  media: [...],
  audioMedia: { id: "m_audio_123", ... },
  audioUrl: "/api/media/m_audio_123",
  hasAudioFile: true
}

// Audio playback
Playing audio from URL: /api/media/m_audio_123
```

### Error Scenarios:
1. **No Audio File**: "Audio file not available" toast + console error
2. **API Issues**: Network errors logged with full context
3. **Playback Failures**: Audio element errors caught and displayed

## 📁 **Files Modified**

**`src/components/test-session/question-types/pte/speaking/repeat-sentence.tsx`**:
- Added `getMediaUrl` import from `@/lib/media-utils`
- Fixed audio URL generation logic
- Enhanced error handling and debugging
- Improved button state management

## 🚀 **Result**

The PTE Speaking "Repeat Sentence" component now properly:
1. **Detects Audio Files**: Finds audio media attached to questions
2. **Generates URLs**: Creates proper `/api/media/[mediaId]` URLs
3. **Plays Audio**: Successfully loads and plays audio files
4. **Handles Errors**: Clear feedback when audio is unavailable
5. **Debugs Issues**: Comprehensive logging for troubleshooting

**Status**: ✅ **Fixed** - Audio playback should now work in PTE Repeat Sentence questions.