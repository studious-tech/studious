# PTE Describe Image Media Fix

## 🎯 **Issue Identified**
The PTE Speaking "Describe Image" component had the same media URL issues as the Repeat Sentence component:
1. **Wrong URL Source**: Component relied on `imageMedia?.url` which came from potentially null `public_url` database field
2. **Variable Naming Conflict**: `audioUrl` was used for recorded audio state, creating potential confusion
3. **Missing Utility Usage**: Not using the existing `media-utils.ts` helper functions
4. **No Dynamic URL Generation**: Not leveraging the `/api/media/[mediaId]` endpoint for proper URL generation

## ✅ **Solution Implemented**

### 1. **Added Media Utils Import**
```typescript
import { getMediaUrl } from '@/lib/media-utils';
```

### 2. **Fixed Image URL Generation & Variable Naming**
```typescript
// Before: Direct database field (potentially null)
{imageMedia?.url ? (
  <img src={imageMedia.url} alt="Question Image" />
) : (...)}

// After: Dynamic URL generation via API with clear naming
const imageUrl = imageMedia?.id ? getMediaUrl(imageMedia.id) : null;
const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null); // Clear separation

{imageUrl ? (
  <img src={imageUrl} alt="Question Image" />
) : (...)}
```

### 3. **Enhanced Error Handling & Debugging**
```typescript
// Debug logging for media detection
useEffect(() => {
  console.log('PTE Describe Image - Media Debug:', {
    totalMedia: questionData.media?.length || 0,
    media: questionData.media,
    imageMedia,
    imageUrl,
    hasImageFile: !!imageUrl
  });
}, [questionData.media, imageMedia, imageUrl]);
```

### 4. **Fixed All References**
- **Image Display**: Uses `imageUrl` instead of `imageMedia?.url`
- **Fullscreen Modal**: Uses `imageUrl` for both condition and src
- **Recording Audio**: Uses `recordedAudioUrl` and `setRecordedAudioUrl`
- **Button States**: Properly distinguish between image availability and recorded audio

## 🔧 **How It Works**

### URL Generation Flow:
1. **Component**: `getMediaUrl(imageMedia.id)` → `/api/media/${mediaId}`
2. **API Endpoint**: `/api/media/[mediaId]/route.ts`
3. **URL Generation**:
   - **Public Media** (exam-media): `supabase.storage.getPublicUrl()`
   - **Private Media**: `supabase.storage.createSignedUrl()`
4. **Response**: Direct file access URL for image display

### Benefits:
- ✅ **Dynamic URL Generation**: No dependency on potentially null database fields
- ✅ **Proper Authentication**: Handles both public and private media
- ✅ **Clear Variable Names**: No confusion between image and audio URLs
- ✅ **Error Handling**: Clear debugging and fallback states
- ✅ **Future-Proof**: Uses established media utility pattern

## 🧪 **Testing**

### Console Debugging:
Open browser Developer Tools and look for:

```javascript
// Media detection
PTE Describe Image - Media Debug: {
  totalMedia: 1,
  media: [...],
  imageMedia: { id: "m_image_123", ... },
  imageUrl: "/api/media/m_image_123",
  hasImageFile: true
}
```

### Visual Verification:
1. **Image Display**: Question image should load properly
2. **Fullscreen Mode**: Click image to open fullscreen view
3. **No Image State**: Shows placeholder when no image is attached
4. **Recording**: Audio recording should work independently of image display

## 📁 **Files Modified**

**`src/components/test-session/question-types/pte/speaking/describe-image.tsx`**:
- Added `getMediaUrl` import from `@/lib/media-utils`
- Fixed image URL generation logic: `imageUrl = getMediaUrl(imageMedia.id)`
- Renamed recording state: `recordedAudioUrl` and `setRecordedAudioUrl`
- Updated all image URL references throughout the component
- Added comprehensive debugging for media detection

## 🔄 **Variable Separation**

**Before (Potential Conflicts):**
```typescript
const [audioUrl, setAudioUrl] = useState<string | null>(null); // Recorded audio
// Various references to imageMedia?.url throughout component
```

**After (Clear Separation):**
```typescript
const imageUrl = imageMedia?.id ? getMediaUrl(imageMedia.id) : null; // Question image
const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null); // User recording
```

## 🚀 **Result**

The PTE Speaking "Describe Image" component now properly:
1. **Displays Images**: Uses dynamic URL generation instead of null database fields
2. **Handles Fullscreen**: Full-size image modal works with proper URLs
3. **Records Audio**: Recording functionality works independently with clear variable names
4. **Debugs Issues**: Comprehensive logging for troubleshooting media problems
5. **Maintains State**: Clear separation between image display and audio recording states

**Status**: ✅ **Fixed** - Both image display and audio recording should now work properly in PTE Describe Image questions.