# Design Document

## Overview

Simple, practical design for an exam preparation platform. Built with Next.js 15 + Supabase, focusing on core functionality first. No over-engineering - just what you need to get students practicing PTE and IELTS questions.

## Architecture

### Simple Stack

- **Frontend**: Next.js 15 with App Router
- **Database**: Supabase PostgreSQL (your existing schema)
- **Auth**: Supabase Auth (already working)
- **Storage**: Supabase Storage (3 buckets: avatars, exam-media, user-responses)
- **AI Scoring**: External API (integrate later)

### Core Flow

```
Student → Practice Questions → Submit Answers → Get AI Feedback → Track Progress
Admin → Upload Questions/Media → Manage Content
```

## API Routes (Keep It Simple)

```
src/app/api/
├── profile/route.ts                   # GET/PUT user profile
├── exams/route.ts                     # GET all exams with sections
├── questions/
│   ├── route.ts                       # GET questions (with filters)
│   └── [id]/route.ts                  # GET specific question with media
├── attempts/route.ts                  # POST submit attempt
├── media/upload/route.ts              # POST upload files
├── subscription/route.ts              # GET user subscription status
└── admin/
    ├── questions/route.ts             # Admin CRUD for questions
    └── media/route.ts                 # Admin media management
```

## Implementation Approach

### 1. Start with Direct API Handlers

No service layers initially - handle everything directly in API routes:

```typescript
// src/app/api/profile/route.ts
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from('user_profiles')
    .update(body)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
```

### 2. Simple Question Selection

Start with basic random selection, improve later:

```typescript
// src/app/api/questions/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const questionTypeId = searchParams.get('question_type_id');

  const supabase = await createClient();

  let query = supabase
    .from('questions')
    .select(
      `
      *,
      question_media(*, media(*)),
      question_options(*)
    `
    )
    .eq('is_active', true);

  if (questionTypeId) {
    query = query.eq('question_type_id', questionTypeId);
  }

  const { data: questions } = await query.limit(10);

  return NextResponse.json(questions);
}
```

### 3. Basic Attempt Submission

```typescript
// src/app/api/attempts/route.ts
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Check subscription limits first
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('*, subscription_plans(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!subscription) {
    return NextResponse.json(
      { error: 'No active subscription' },
      { status: 403 }
    );
  }

  // Create attempt record
  const { data: attempt, error } = await supabase
    .from('question_attempts')
    .insert({
      user_id: user.id,
      question_id: body.question_id,
      response_text: body.response_text,
      selected_options: body.selected_options,
      time_spent_seconds: body.time_spent_seconds,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // TODO: Queue for AI scoring

  return NextResponse.json(attempt);
}
```

## Data Models (Essential Only)

### Request/Response Types

```typescript
// Profile
interface ProfileUpdateRequest {
  full_name?: string;
  target_exam?: 'pte-academic' | 'ielts-academic' | 'ielts-general';
  target_score?: number;
}

// Question Practice
interface QuestionResponse {
  id: string;
  question_type_id: string;
  content: string;
  instructions: string | null;
  difficulty_level: number;
  time_limit_seconds: number | null;
  media: Array<{
    id: string;
    file_type: string;
    public_url: string;
    media_role: string;
  }>;
  options?: Array<{
    id: string;
    option_text: string;
    display_order: number;
  }>;
}

// Attempt Submission
interface AttemptRequest {
  question_id: string;
  response_text?: string;
  selected_options?: string[];
  time_spent_seconds: number;
}
```

## File Upload Strategy

### Simple Upload Handler

```typescript
// src/app/api/media/upload/route.ts
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Determine bucket based on file type
  const bucket = file.type.startsWith('image/')
    ? 'exam-media'
    : 'user-responses';
  const fileName = `${user.id}/${Date.now()}-${file.name}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  // Create media record
  const { data: media, error: mediaError } = await supabase
    .from('media')
    .insert({
      id: `m_${Date.now()}`,
      original_filename: file.name,
      file_type: file.type.startsWith('image/') ? 'image' : 'audio',
      mime_type: file.type,
      file_size: file.size,
      storage_path: uploadData.path,
      storage_bucket: bucket,
      created_by: user.id,
    })
    .select()
    .single();

  if (mediaError) {
    return NextResponse.json({ error: mediaError.message }, { status: 400 });
  }

  return NextResponse.json(media);
}
```

## AI Integration (Placeholder)

### Simple AI Scoring

```typescript
// src/lib/ai/scoring.ts
export async function scoreAttempt(attemptId: string) {
  // For now, return mock scores
  // Later: integrate with actual AI service

  const mockScore = Math.floor(Math.random() * 90) + 10; // 10-90 for PTE
  const mockFeedback = 'Good pronunciation, work on fluency.';

  const supabase = await createClient();

  const { error } = await supabase
    .from('question_attempts')
    .update({
      ai_score: mockScore,
      ai_feedback: mockFeedback,
      scoring_status: 'ai_scored',
      final_score: mockScore,
    })
    .eq('id', attemptId);

  return { score: mockScore, feedback: mockFeedback };
}
```

## Error Handling (Keep Simple)

### Basic Error Responses

```typescript
// Just use standard HTTP status codes
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

if (usageLimitExceeded) {
  return NextResponse.json({ error: 'Usage limit exceeded' }, { status: 403 });
}

if (validationError) {
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
}
```

## Testing Strategy

### Start Simple

1. **Manual Testing**: Test each API endpoint with Postman/curl
2. **Basic Unit Tests**: Test critical functions only
3. **Integration Tests**: Add later when needed

### Test Data

Use your existing sample data from the schema:

- PTE/IELTS exams and sections
- Sample questions for each question type
- Test user accounts (student + admin)

## Performance Considerations

### Start Simple, Optimize Later

1. **Database**: Use Supabase's built-in connection pooling
2. **Caching**: Add Redis later if needed
3. **File Storage**: Supabase Storage handles CDN automatically
4. **AI Scoring**: Queue processing (implement when AI is integrated)

## Deployment Strategy

### MVP Deployment

1. Deploy to Vercel (integrates perfectly with Next.js + Supabase)
2. Use environment variables for API keys
3. Set up basic monitoring with Vercel Analytics

This design focuses on getting a working system quickly, then iterating based on real usage patterns.
