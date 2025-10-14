// ===============================================
// TEST SESSION TYPE DEFINITIONS
// ===============================================

export type SessionType = 'practice' | 'mock_test' | 'focused_practice';
export type SessionStatus = 'draft' | 'active' | 'completed' | 'abandoned';
export type QuestionSelectionMode =
  | 'new_only'
  | 'incorrect_only'
  | 'mixed'
  | 'all';
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

// Test Session Template
export interface TestSessionTemplate {
  id: string;
  exam_id: string;
  name: string;
  description: string | null;
  default_config: SessionConfiguration;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Core Session Configuration
export interface SessionConfiguration {
  is_timed: boolean;
  total_duration_minutes: number | null;
  question_count: number;
  session_type: SessionType;
  difficulty_levels: DifficultyLevel[];
  question_selection_mode: QuestionSelectionMode;
  include_sections: string[];
  include_question_types: string[];
  section_weights: Record<string, number>;
  custom_time_limits?: Record<string, number>;
}

// Test Session Entity
export interface TestSession {
  id: string;
  user_id: string;
  exam_id: string;

  // Configuration
  session_name: string | null;
  session_type: SessionType;
  is_timed: boolean;
  total_duration_minutes: number | null;
  question_count: number;
  difficulty_levels: DifficultyLevel[];

  // Question Selection
  question_selection_mode: QuestionSelectionMode;
  include_sections: string[];
  include_question_types: string[];

  // Advanced Configuration (stored in session_config JSONB)
  session_config: Record<string, any> | null;

  // Status & Lifecycle
  status: SessionStatus;
  started_at: string | null;
  completed_at: string | null;
  total_time_spent_seconds: number;

  // Results
  total_score: number | null;
  max_possible_score: number | null;
  percentage_score: number | null;

  created_at: string;
  updated_at: string;
}

// Test Session Question
export interface TestSessionQuestion {
  id: string;
  session_id: string;
  question_id: string;

  // Metadata
  sequence_number: number;
  allocated_time_seconds: number | null;
  section_id: string | null;
  question_type_id: string | null;

  // Progress
  is_attempted: boolean;
  is_completed: boolean;
  time_spent_seconds: number;

  // Results
  user_response_id: string | null;
  score_achieved: number | null;
  max_possible_score: number | null;

  created_at: string;
  updated_at: string;
}

// User Test Session Statistics
export interface UserTestSessionStats {
  id: string;
  user_id: string;
  exam_id: string;

  // Overall Statistics
  total_sessions_created: number;
  total_sessions_completed: number;
  total_questions_attempted: number;
  total_time_spent_minutes: number;

  // Performance Statistics
  average_session_score: number | null;
  best_session_score: number | null;
  improvement_trend: number | null;

  // Study Patterns
  preferred_session_types: string[];
  preferred_sections: string[];
  preferred_question_types: string[];

  // Streaks
  current_streak_days: number;
  longest_streak_days: number;
  last_session_date: string | null;

  created_at: string;
  updated_at: string;
}

// ===============================================
// FORM DATA TYPES
// ===============================================

// Test Configuration Form Data
export interface TestConfigurationForm {
  // Basic Settings
  session_name: string;
  session_type: SessionType;
  is_timed: boolean;
  total_duration_minutes: number | null;
  question_count: number;

  // Question Selection
  question_selection_mode: QuestionSelectionMode;
  difficulty_levels: DifficultyLevel[];

  // Section and Question Type Selection
  selected_sections: SectionSelection[];

  // Advanced Options
  custom_time_limits: Record<string, number>;
}

// Section Selection with nested question types
export interface SectionSelection {
  section_id: string;
  section_name: string;
  is_selected: boolean;
  question_types: QuestionTypeSelection[];
  estimated_time_minutes: number;
  weight: number; // 0-1, how much of the test this section should comprise
}

// Question Type Selection
export interface QuestionTypeSelection {
  question_type_id: string;
  question_type_name: string;
  is_selected: boolean;
  available_count: number; // How many questions available
  difficulty_distribution: Record<DifficultyLevel, number>;
  estimated_time_per_question: number;
}

// ===============================================
// API RESPONSE TYPES
// ===============================================

// Test Session Creation Request
export interface CreateTestSessionRequest {
  exam_id: string;
  configuration: TestConfigurationForm;
}

// Test Session Creation Response
export interface CreateTestSessionResponse {
  session: TestSession;
  questions: TestSessionQuestion[];
  estimated_duration_minutes: number;
  warnings?: string[];
  selection_summary?: {
    requested_questions: number;
    actual_questions: number;
    selection_mode: QuestionSelectionMode;
    sections_used: number;
    question_types_used: number;
  };
}

// Available Questions Response (for configuration)
export interface AvailableQuestionsResponse {
  exam: {
    id: string;
    name: string;
    display_name: string;
  };
  sections: SectionWithQuestionTypes[];
  total_questions: number;
  question_distribution: Record<string, number>;
}

// Section with nested question types and counts
export interface SectionWithQuestionTypes {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  duration_minutes: number | null;
  order_index: number;
  question_types: QuestionTypeWithStats[];
  total_questions: number;
}

// Question type with availability stats
export interface QuestionTypeWithStats {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  input_type: string;
  response_type: string;
  time_limit_seconds: number | null;
  order_index: number;

  // Statistics
  total_questions: number;
  difficulty_distribution: Record<DifficultyLevel, number>;
  average_completion_time_seconds: number;

  // User-specific stats (if authenticated)
  user_stats?: {
    attempted: number;
    correct: number;
    average_score: number;
    last_attempted: string | null;
  };
}

// ===============================================
// QUESTION SELECTION ALGORITHM TYPES
// ===============================================

// Question Selection Criteria
export interface QuestionSelectionCriteria {
  exam_id: string;
  user_id: string;
  total_questions: number;

  // Filtering
  include_sections: string[];
  include_question_types: string[];
  difficulty_levels: DifficultyLevel[];
  question_selection_mode: QuestionSelectionMode;

  // Distribution
  section_weights: Record<string, number>;
  maintain_section_balance: boolean;

  // Preferences
  avoid_recent_questions: boolean;
  recent_questions_threshold_days: number;
}

// Question Selection Result
export interface QuestionSelectionResult {
  questions: SelectedQuestion[];
  distribution_summary: {
    by_section: Record<string, number>;
    by_question_type: Record<string, number>;
    by_difficulty: Record<DifficultyLevel, number>;
  };
  estimated_total_time_seconds: number;
  selection_metadata: {
    total_available: number;
    filtered_count: number;
    selection_strategy: string;
    weights_applied: Record<string, number>;
  };
}

// Selected Question with metadata
export interface SelectedQuestion {
  question_id: string;
  section_id: string;
  question_type_id: string;
  difficulty_level: DifficultyLevel;
  estimated_time_seconds: number;
  allocated_time_seconds: number;
  sequence_number: number;
  selection_reason: string; // For debugging/analytics
}

// ===============================================
// SESSION EXECUTION TYPES
// ===============================================

// Active Session State
export interface ActiveTestSession {
  session: TestSession;
  questions: TestSessionQuestion[];
  current_question_index: number;
  remaining_time_seconds: number | null; // null for untimed
  is_paused: boolean;

  // Progress
  questions_completed: number;
  questions_attempted: number;
  current_score: number;
  max_possible_score: number;

  // Timing
  session_start_time: Date;
  current_question_start_time: Date | null;
  time_extensions: Record<string, number>; // question_id -> extra_seconds
}

// Session Progress Update
export interface SessionProgressUpdate {
  session_id: string;
  question_id: string;
  time_spent_seconds: number;
  is_completed: boolean;
  score_achieved?: number;
  max_possible_score?: number;
}

// Session Completion Summary
export interface SessionCompletionSummary {
  session: TestSession;
  results: {
    total_score: number;
    max_possible_score: number;
    percentage_score: number;
    time_efficiency: number; // percentage of allocated time used
  };
  section_breakdown: SectionResult[];
  question_type_breakdown: QuestionTypeResult[];
  recommendations: string[];
}

// Section Performance Result
export interface SectionResult {
  section_id: string;
  section_name: string;
  questions_attempted: number;
  total_questions: number;
  score_achieved: number;
  max_possible_score: number;
  percentage_score: number;
  average_time_per_question: number;
  strengths: string[];
  areas_for_improvement: string[];
}

// Question Type Performance Result
export interface QuestionTypeResult {
  question_type_id: string;
  question_type_name: string;
  questions_attempted: number;
  score_achieved: number;
  max_possible_score: number;
  percentage_score: number;
  average_time_per_question: number;
  accuracy_trend: 'improving' | 'declining' | 'stable';
}

// ===============================================
// UTILITY TYPES
// ===============================================

// Database JSON fields
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// API Error Response
export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// Sort Options
export type SortOrder = 'asc' | 'desc';

export interface SortOption {
  field: string;
  order: SortOrder;
}

// Filter Options for test sessions
export interface TestSessionFilters {
  exam_id?: string;
  status?: SessionStatus[];
  session_type?: SessionType[];
  date_from?: string;
  date_to?: string;
  min_score?: number;
  max_score?: number;
}
