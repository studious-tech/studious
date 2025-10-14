# Requirements Document

## Introduction

This document outlines the requirements for building an exam preparation platform backend that supports PTE and IELTS test preparation. The platform allows students to practice questions, track progress, and get AI-powered feedback. The system uses the simplified database schema with proper media management, user profiles, subscriptions, and progress tracking.

## Requirements

### Requirement 1: User Profile Management

**User Story:** As a student, I want to manage my profile so that I can set my exam goals and track my preparation.

#### Acceptance Criteria

1. WHEN a user signs up THEN the system auto-creates a profile with email and name from auth
2. WHEN a user updates their profile THEN the system saves full_name, target_exam, target_score, and preferences
3. WHEN a user uploads an avatar THEN the system stores it in the 'avatars' bucket with proper folder structure
4. WHEN a user sets target_exam THEN the system accepts 'pte-academic', 'ielts-academic', or 'ielts-general'
5. WHEN a user sets target_score THEN the system validates PTE (10-90) or IELTS (1-9) ranges

### Requirement 2: Question Practice System

**User Story:** As a student, I want to practice individual questions so that I can improve specific skills.

#### Acceptance Criteria

1. WHEN starting practice THEN the system selects unused questions first, then least recently attempted (7+ days ago)
2. WHEN selecting difficulty THEN the system chooses questions based on user's average score (±1 level from current performance)
3. WHEN viewing a question THEN the system displays content, instructions, associated media, and options (if MCQ)
4. WHEN submitting text responses THEN the system stores response_text and validates word count for writing tasks
5. WHEN recording audio THEN the system uploads to user-responses/{user_id}/{attempt_id}.webm and stores media_id
6. WHEN answering MCQ THEN the system validates selected options and calculates immediate score for rule_based questions
7. WHEN practice session fails THEN the system saves partial progress and allows resumption

### Requirement 3: Media Management

**User Story:** As a content admin, I want to manage media files so that I can create rich question content.

#### Acceptance Criteria

1. WHEN uploading exam media THEN the system stores files in 'exam-media' bucket with proper metadata
2. WHEN creating media records THEN the system generates unique IDs (m_audio_123, m_image_456) and stores file info
3. WHEN associating media with questions THEN the system creates question_media relationships with roles (primary, reference, hint)
4. WHEN serving media THEN the system provides public URLs for exam content and secure URLs for user responses
5. WHEN deleting media THEN the system removes files from storage and cleans up database references

### Requirement 4: AI Scoring and Feedback

**User Story:** As a student, I want AI feedback on my responses so that I can understand my performance and improve.

#### Acceptance Criteria

1. WHEN submitting PTE speaking responses THEN the system analyzes pronunciation, fluency, and content to return score 0-90
2. WHEN submitting IELTS speaking responses THEN the system evaluates fluency, lexical resource, grammar, and pronunciation for band score 1-9
3. WHEN submitting writing responses THEN the system checks grammar, vocabulary, coherence, and task achievement
4. WHEN AI scoring fails THEN the system sets scoring_status to 'pending' and queues for retry
5. WHEN AI analysis completes THEN the system stores detailed breakdown in ai_analysis (pronunciation: 75, fluency: 68, content: 82)
6. WHEN premium users get manual review THEN admins can override ai_score with manual_score and detailed feedback

### Requirement 5: Subscription System

**User Story:** As a student, I want subscription plans so that I can access different levels of content and features.

#### Acceptance Criteria

1. WHEN checking subscription THEN the system returns active plan with usage limits and current usage
2. WHEN attempting practice THEN the system verifies practice_questions_limit and increments practice_questions_used
3. WHEN taking mock tests THEN the system checks mock_tests_limit and increments mock_tests_used
4. WHEN subscription expires THEN the system changes status to 'expired' and restricts premium features
5. WHEN on free plan THEN the system allows 1 mock test and 20 practice questions with no AI feedback

### Requirement 6: Progress Tracking

**User Story:** As a student, I want to see my progress so that I can track improvement and identify weak areas.

#### Acceptance Criteria

1. WHEN completing questions THEN the system updates user_progress for exam, section, and question_type levels
2. WHEN calculating progress THEN the system maintains questions_attempted, questions_correct, average_score, and best_score
3. WHEN tracking streaks THEN the system updates current_streak_days and longest_streak_days based on daily activity
4. WHEN viewing progress THEN the system shows performance by question type with score trends
5. WHEN earning achievements THEN the system creates user_achievements records for milestones

### Requirement 7: Question Content Structure

**User Story:** As a student, I want questions organized by exam structure so that I can practice specific skills systematically.

#### Acceptance Criteria

1. WHEN browsing exams THEN the system shows PTE Academic, IELTS Academic, and IELTS General with their sections
2. WHEN viewing PTE Speaking THEN the system shows Read Aloud, Repeat Sentence, Describe Image, Re-tell Lecture, Answer Short Question
3. WHEN viewing IELTS Writing THEN the system shows Task 1 (describe visuals) and Task 2 (essay writing)
4. WHEN filtering by difficulty THEN the system supports levels 1-5 for progressive learning
5. WHEN accessing question types THEN the system respects time_limit_seconds for timed practice

### Requirement 8: Admin Content Management

**User Story:** As an admin, I want to manage exam content so that I can maintain and expand the question database.

#### Acceptance Criteria

1. WHEN admin creates questions THEN the system allows full CRUD operations on questions, media, and options
2. WHEN admin uploads content THEN the system stores media in exam-media bucket with proper permissions
3. WHEN admin manages question types THEN the system supports different input_type (text, audio, image, mcq) and response_type combinations
4. WHEN admin sets scoring_method THEN the system handles 'ai_auto', 'ai_manual_review', and 'rule_based' appropriately
5. WHEN admin deactivates content THEN the system hides it from students while preserving data integrity

### Requirement 9: Error Handling and Edge Cases

**User Story:** As a student, I want the system to handle errors gracefully so that I don't lose my progress or get stuck.

#### Acceptance Criteria

1. WHEN audio upload fails THEN the system retries 3 times and shows clear error message with option to re-record
2. WHEN AI scoring service is down THEN the system queues attempts for later processing and notifies user of delay
3. WHEN user exceeds time limit THEN the system auto-submits current response and continues to next question
4. WHEN subscription payment fails THEN the system provides 3-day grace period before restricting access
5. WHEN network connection drops THEN the system saves progress locally and syncs when connection resumes
6. WHEN user attempts to access premium content without subscription THEN the system shows upgrade modal with specific plan benefits
