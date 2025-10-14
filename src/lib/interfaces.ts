// lib/interfaces.ts
export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  target_exam: string | null;
  target_score: number | null;
  study_goal: string | null;
  timezone: string;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  exam_type: string;
  duration_minutes: number | null;
  total_score: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExamWithSections extends Exam {
  sections: (Section & {
    questionTypes: (QuestionType & {
      questions: Question[];
    })[];
  })[];
}

export interface Section {
  id: string;
  exam_id: string;
  name: string;
  display_name: string;
  description: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionType {
  id: string;
  section_id: string;
  name: string;
  display_name: string;
  description: string | null;
  input_type: 'text' | 'audio' | 'video' | 'mcq_single' | 'mcq_multiple' | 'image' | 'pdf';
  response_type: 'text' | 'audio' | 'video' | 'selection';
  scoring_method: 'ai_auto' | 'ai_manual_review' | 'rule_based';
  time_limit_seconds: number | null;
  order_index: number;
  is_active: boolean;
  scoring_config: Record<string, unknown>;
  ui_config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: string;
  original_filename: string | null;
  file_type: 'image' | 'audio' | 'video' | 'pdf';
  mime_type: string | null;
  file_size: number | null;
  storage_path: string;
  storage_bucket: string;
  public_url: string | null;
  duration_seconds: number | null;
  dimensions: { width: number; height: number } | null;
  alt_text: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  question_type_id: string;
  title: string | null;
  content: string;
  instructions: string | null;
  difficulty_level: number; // 1-5
  expected_duration_seconds: number | null;
  correct_answer: Record<string, unknown> | null;
  sample_answer: string | null;
  word_count?: number | null; // Word count for writing questions
  tags: string[];
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionMedia {
  id: string;
  question_id: string;
  media_id: string;
  media_role: 'primary' | 'reference' | 'hint';
  display_order: number;
  created_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string | null;
  option_media_id: string | null;
  is_correct: boolean;
  display_order: number;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  exam_id: string | null;
  price_monthly: number | null;
  price_yearly: number | null;
  currency: string;
  mock_tests_limit: number | null;
  practice_questions_limit: number | null;
  ai_feedback_enabled: boolean;
  manual_review_enabled: boolean;
  trial_days: number;
  is_active: boolean;
  sort_order: number;
  features: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  started_at: string;
  expires_at: string;
  is_trial: boolean;
  status: 'active' | 'expired' | 'cancelled';
  mock_tests_used: number;
  practice_questions_used: number;
  payment_provider: string | null;
  subscription_external_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TestSession {
  id: string;
  user_id: string;
  exam_id: string | null;
  session_type: 'practice' | 'mock_test' | 'section_test';
  session_name: string | null;
  started_at: string;
  completed_at: string | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  overall_score: number | null;
  section_scores: Record<string, number> | null;
  time_remaining_seconds: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface QuestionAttempt {
  id: string;
  test_session_id: string;
  question_id: string;
  user_id: string;
  response_text: string | null;
  response_media_id: string | null;
  selected_options: string[] | null;
  response_data: Record<string, unknown> | null;
  started_at: string;
  submitted_at: string | null;
  time_spent_seconds: number | null;
  ai_score: number | null;
  manual_score: number | null;
  final_score: number | null;
  scoring_status: 'pending' | 'ai_scored' | 'manually_reviewed';
  ai_feedback: string | null;
  ai_analysis: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  exam_id: string | null;
  section_id: string | null;
  question_type_id: string | null;
  questions_attempted: number;
  questions_correct: number;
  average_score: number | null;
  best_score: number | null;
  total_time_spent_minutes: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_data: Record<string, unknown>;
  earned_at: string;
}