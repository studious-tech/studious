# PTE Re-tell Lecture Implementation

## 🎯 **Implementation Summary**
Created a new PTE Speaking "Re-tell Lecture" component that combines image and audio content, allowing students to listen to a lecture while viewing supporting material, then retell it in their own words.

## ✅ **Components Created**

### 1. **Re-tell Lecture Component**
**File**: `src/components/test-session/question-types/pte/speaking/re-tell-lecture.tsx`

**Features**:
- **Dual Media Support**: Displays both image and audio content
- **Lecture Playback**: Audio control for playing the lecture
- **Image Viewer**: Supporting image with fullscreen capability
- **Recording Workflow**: User must play lecture before recording
- **Timing Controls**: 30s preparation + 60s recording (configurable)
- **Media URL Generation**: Uses `getMediaUrl()` for proper API-based URLs
- **Error Handling**: Comprehensive error messages and debugging

### 2. **Component Structure**
```
┌─────────────────────────────────────────────────────────┐
│                    Instructions                         │
└─────────────────────────────────────────────────────────┘
┌─────────────────────┐ ┌─────────────────────────────────┐
│                     │ │        Recorded Answer          │
│   Lecture Material  │ │                                 │
│                     │ │    Status: Beginning in 30s    │
│   [Image Display]   │ │                                 │
│                     │ │    [Recording Controls]        │
│   [Play Lecture]    │ │                                 │
│                     │ │                                 │
└─────────────────────┘ └─────────────────────────────────┘
```

### 3. **Component Registration**
**File**: `src/components/test-session/question-renderer.tsx`

Added to `QUESTION_COMPONENT_REGISTRY`:
```typescript
'pte-speaking-re-tell-lecture': () =>
  import('./question-types/pte/speaking/re-tell-lecture'),
```

## 🔧 **Database Integration**

### 1. **Question Type Form**
**File**: `src/components/admin/content/question-type-form.tsx`

Updated re-tell lecture definition:
```typescript
{
  id: 're-tell-lecture',
  name: 're_tell_lecture',
  display_name: 'Re-tell Lecture',
  input_type: 'multimedia',  // Updated from 'video' to support image+audio
  response_type: 'audio',
  scoring_method: 'ai_auto',
  description: 'Students listen to a lecture audio and view supporting image, then retell it in their own words',
  time_limit_seconds: 60,  // Updated from 40 to 60 seconds
}
```

### 2. **UI Component Mapping**
**File**: `add-re-tell-lecture-ui-component.sql`

SQL to map question type to UI component:
```sql
-- Handles both naming variations
UPDATE public.question_types
SET ui_component = 'pte-speaking-re-tell-lecture'
WHERE name IN ('retell_lecture', 're_tell_lecture') AND ui_component IS NULL;

UPDATE public.question_types
SET ui_component = 'pte-speaking-re-tell-lecture'
WHERE id IN ('pte-retell-lecture', 'pte-re-tell-lecture') AND ui_component IS NULL;
```

## 🎨 **User Experience**

### **Workflow**:
1. **Instructions**: User reads task instructions
2. **Study Phase**: User views supporting image and plays lecture audio
3. **Preparation**: 30-second countdown for preparation
4. **Recording**: User records their retelling (60 seconds max)
5. **Review**: User can play back their recording or re-record

### **Key Features**:
- **Required Lecture Play**: Recording is disabled until user plays the lecture
- **Visual Feedback**: Clear status indicators and timing displays
- **Fullscreen Image**: Click image to view in fullscreen mode
- **Recording Controls**: Start, stop, play, and re-record options
- **Auto-timeout**: Recording automatically stops after time limit

## 🔍 **Technical Details**

### **Media Handling**:
```typescript
// Proper URL generation using media utils
const imageUrl = imageMedia?.id ? getMediaUrl(imageMedia.id) : null;
const audioUrl = audioMedia?.id ? getMediaUrl(audioMedia.id) : null;

// Media detection
const imageMedia = questionData.media?.find(m => m.media.fileType === 'image')?.media;
const audioMedia = questionData.media?.find(m => m.media.fileType === 'audio')?.media;
```

### **State Management**:
```typescript
const [preparationTime, setPreparationTime] = useState(30);
const [isPreparationPhase, setIsPreparationPhase] = useState(true);
const [timeRemaining, setTimeRemaining] = useState(60);
const [isRecording, setIsRecording] = useState(false);
const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
const [hasPlayedLecture, setHasPlayedLecture] = useState(false);
```

### **Recording Workflow**:
1. User must play lecture first (`hasPlayedLecture = true`)
2. Preparation countdown completes (`isPreparationPhase = false`)
3. Recording enabled and managed with MediaRecorder API
4. Response submitted via `onResponse` callback

## 🧪 **Testing**

### **To Test the Component**:
1. **Create Question**: In admin panel, create a new "Re-tell Lecture" question
2. **Add Media**: Upload both an image and audio file
3. **Test Session**: Start a test session and navigate to the question
4. **Verify Workflow**: Check that image displays, audio plays, and recording works

### **Debug Information**:
Console logging provides detailed media detection:
```javascript
PTE Re-tell Lecture - Media Debug: {
  totalMedia: 2,
  imageUrl: "/api/media/m_image_123",
  audioUrl: "/api/media/m_audio_456",
  hasImageFile: true,
  hasAudioFile: true
}
```

## 📝 **Configuration Options**

The component accepts configurable timing:
```typescript
interface PTESpeakingRetellLectureProps {
  preparationSeconds?: number; // default 30
  speakingSeconds?: number;    // default 60
}
```

## 🚀 **Next Steps**

1. **Run SQL Migration**: Execute `add-re-tell-lecture-ui-component.sql` to map the UI component
2. **Test Integration**: Create a test question with image and audio media
3. **Verify Component Loading**: Ensure the component loads properly in test sessions
4. **User Testing**: Test the complete workflow from admin creation to student experience

## 📁 **Files Created/Modified**

### **New Files**:
- `src/components/test-session/question-types/pte/speaking/re-tell-lecture.tsx`
- `add-re-tell-lecture-ui-component.sql`
- `pte-re-tell-lecture-implementation.md`

### **Modified Files**:
- `src/components/test-session/question-renderer.tsx` (added component mapping)
- `src/components/admin/content/question-type-form.tsx` (updated question type definition)
- `fix-question-types-ui-component.sql` (updated UI component mapping)

## ✅ **Status**
**Complete** - The PTE Speaking "Re-tell Lecture" component is fully implemented with proper media handling, user workflow, and database integration. Ready for testing and deployment.