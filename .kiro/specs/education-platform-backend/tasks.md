# Implementation Plan

- [x] 1. Build user profile API

  - Create `/api/profile/route.ts` with GET and PUT handlers
  - Fetch and update user_profiles table with basic validation
  - _Requirements: 1.1, 1.2_

- [x] 2. Create exam structure API

  - Build `/api/exams/route.ts` to return exams with sections and question types
  - Use simple Supabase query with joins
  - _Requirements: 2.1, 2.2_

- [x] 3. Build questions API

  - [x] 3.1 Create questions listing endpoint

    - Build `/api/questions/route.ts` with filtering by question_type_id
    - Include media and options using Supabase joins
    - _Requirements: 2.2, 2.3_

  - [x] 3.2 Create individual question endpoint
    - Build `/api/questions/[id]/route.ts` for specific questions
    - Return question with all media and options
    - _Requirements: 2.3_

- [x] 4. Implement question attempts

  - [x] 4.1 Create attempt submission endpoint

    - Build `/api/attempts/route.ts` POST handler
    - Store text responses and selected options in question_attempts table
    - _Requirements: 2.4, 2.6_

  - [x] 4.2 Add basic file upload for audio responses
    - Create `/api/media/upload/route.ts` for audio files
    - Upload to user-responses bucket and link to attempts
    - _Requirements: 2.5_

- [x] 5. Add subscription checking

  - Create `/api/subscription/route.ts` to check user limits
  - Block access when practice_questions_limit exceeded
  - _Requirements: 3.1, 3.3_

- [x] 6. Basic progress tracking

  - Update user_progress table after each attempt
  - Calculate simple averages and best scores
  - _Requirements: 6.1, 6.2_

- [x] 7. Simple admin endpoints

  - [x] 7.1 Create admin question management

    - Build `/api/admin/questions/route.ts` with CRUD operations
    - Check user role = 'admin' before allowing access
    - _Requirements: 8.1_

  - [x] 7.2 Add admin media upload
    - Create `/api/admin/media/route.ts` for exam content
    - Upload to exam-media bucket with proper permissions
    - _Requirements: 8.2_

- [x] 8. Extended API endpoints

  - [x] 8.1 Authentication & User Management

    - Create `/api/auth/user/route.ts` for current user info
    - Create `/api/profile/avatar/route.ts` for avatar uploads
    - _Requirements: 1.1, 1.3_

  - [x] 8.2 Enhanced Exam Structure

    - Create `/api/exams/[examId]/route.ts` for specific exam details
    - Create `/api/sections/[sectionId]/question-types/route.ts`
    - _Requirements: 7.1, 7.2_

  - [x] 8.3 Smart Question Selection

    - Create `/api/questions/practice/route.ts` for personalized practice
    - Implement difficulty matching and recent question avoidance
    - _Requirements: 2.1, 2.2_

  - [x] 8.4 Enhanced Attempts & Media

    - Create `/api/attempts/[attemptId]/route.ts` for attempt details
    - Create `/api/media/[mediaId]/route.ts` with access control
    - _Requirements: 2.4, 3.4_

  - [x] 8.5 Subscription & Progress Enhancement

    - Create `/api/subscription/plans/route.ts` for available plans
    - Create `/api/progress/dashboard/route.ts` for dashboard stats
    - _Requirements: 5.1, 6.4_

  - [x] 8.6 Admin Management

    - Create `/api/admin/dashboard/route.ts` for admin overview
    - Create `/api/admin/users/route.ts` for user management
    - _Requirements: 8.1, 8.4_

  - [x] 8.7 Health & Monitoring
    - Create `/api/health/route.ts` for service health checks
    - Create `/api/stats/route.ts` for public platform statistics
    - _Requirements: 9.1_
