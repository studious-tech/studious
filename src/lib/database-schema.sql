-- ===============================================
-- SIMPLIFIED EXAM PLATFORM SCHEMA (CORRECTED)
-- ===============================================
-- Proper media management + removes actual over-engineering
-- ===============================================

-- ===============================================
-- STORAGE
-- ===============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('exam-media', 'exam-media', true),
('user-responses', 'user-responses', false);

-- Simple storage policies
CREATE POLICY "Public can view avatars and exam media" ON storage.objects
  FOR SELECT USING (bucket_id IN ('avatars', 'exam-media'));

CREATE POLICY "Users can upload avatars and responses" ON storage.objects
  FOR INSERT WITH CHECK (
    (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]) OR
    (bucket_id = 'user-responses' AND auth.uid()::text = (storage.foldername(name))[1])
  );

-- ===============================================
-- USER MANAGEMENT
-- ===============================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  target_exam TEXT, -- 'pte-academic', 'ielts-academic'
  target_score NUMERIC,
  role TEXT DEFAULT 'student', -- 'student', 'admin'
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ===============================================
-- EXAM STRUCTURE
-- ===============================================

CREATE TABLE exams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  total_score INTEGER DEFAULT 90,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE sections (
  id TEXT PRIMARY KEY,
  exam_id TEXT REFERENCES exams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(exam_id, order_index)
);

CREATE TABLE question_types (
  id TEXT PRIMARY KEY,
  section_id TEXT REFERENCES sections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  input_type TEXT NOT NULL, -- 'text', 'audio', 'image', 'mcq_single', 'mcq_multiple'
  response_type TEXT NOT NULL, -- 'text', 'audio', 'selection'
  scoring_method TEXT NOT NULL, -- 'ai_auto', 'ai_manual_review', 'rule_based'
  time_limit_seconds INTEGER,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(section_id, order_index)
);

-- Public read access
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read exam structure" ON exams FOR SELECT USING (true);
CREATE POLICY "Everyone can read sections" ON sections FOR SELECT USING (true);
CREATE POLICY "Everyone can read question types" ON question_types FOR SELECT USING (true);

-- ===============================================
-- MEDIA MANAGEMENT (PROPER)
-- ===============================================

CREATE TABLE media (
  id TEXT PRIMARY KEY, -- 'm_audio_123', 'm_image_456'
  original_filename TEXT,
  file_type TEXT NOT NULL, -- 'image', 'audio', 'video', 'pdf'
  mime_type TEXT,
  file_size INTEGER,
  storage_path TEXT NOT NULL, -- Supabase Storage path
  storage_bucket TEXT DEFAULT 'exam-media',
  public_url TEXT,
  duration_seconds INTEGER, -- for audio/video
  dimensions JSONB, -- {width: 800, height: 600}
  alt_text TEXT, -- for accessibility
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Media access
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Media is publicly readable" ON media FOR SELECT USING (true);

CREATE INDEX idx_media_type ON media(file_type);
CREATE INDEX idx_media_bucket ON media(storage_bucket, storage_path);

-- ===============================================
-- QUESTIONS & CONTENT
-- ===============================================

CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  question_type_id TEXT REFERENCES question_types(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT, -- Main question text/prompt
  instructions TEXT,
  difficulty_level INTEGER DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5),
  expected_duration_seconds INTEGER,
  correct_answer JSONB, -- For auto-scoring
  sample_answer TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Question Media Relationship (ESSENTIAL for file management)
CREATE TABLE question_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
  media_id TEXT REFERENCES media(id) ON DELETE CASCADE,
  media_role TEXT NOT NULL, -- 'primary', 'reference', 'hint'
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(question_id, media_id, media_role)
);

-- Question Options (for MCQ)
CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT,
  option_media_id TEXT REFERENCES media(id),
  is_correct BOOLEAN DEFAULT false,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(question_id, display_order)
);

-- Public read access
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Everyone can read question media" ON question_media FOR SELECT USING (true);
CREATE POLICY "Everyone can read question options" ON question_options FOR SELECT USING (true);

CREATE INDEX idx_questions_type ON questions(question_type_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level);

-- ===============================================
-- SUBSCRIPTIONS
-- ===============================================

CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  exam_id TEXT REFERENCES exams(id), -- NULL for platform-wide
  price_monthly NUMERIC,
  price_yearly NUMERIC,
  currency TEXT DEFAULT 'USD',
  
  -- Limits
  mock_tests_limit INTEGER, -- NULL = unlimited
  practice_questions_limit INTEGER,
  ai_feedback_enabled BOOLEAN DEFAULT true,
  manual_review_enabled BOOLEAN DEFAULT false,
  
  trial_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES subscription_plans(id),
  started_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP NOT NULL,
  is_trial BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  
  -- Usage tracking
  mock_tests_used INTEGER DEFAULT 0,
  practice_questions_used INTEGER DEFAULT 0,
  
  -- Payment info
  payment_provider TEXT,
  subscription_external_id TEXT,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read plans" ON subscription_plans FOR SELECT USING (true);
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_user_subscriptions ON user_subscriptions(user_id, status, expires_at);

-- ===============================================
-- QUESTION ATTEMPTS
-- ===============================================

CREATE TABLE question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
  
  -- User response
  response_text TEXT,
  response_media_id TEXT REFERENCES media(id),
  selected_options UUID[], -- For MCQ
  response_data JSONB, -- For complex responses
  
  -- Timing
  started_at TIMESTAMP DEFAULT now(),
  submitted_at TIMESTAMP,
  time_spent_seconds INTEGER,
  
  -- Scoring
  ai_score NUMERIC,
  manual_score NUMERIC,
  final_score NUMERIC,
  scoring_status TEXT DEFAULT 'pending', -- 'pending', 'ai_scored', 'manually_reviewed'
  
  -- AI feedback
  ai_feedback TEXT,
  ai_analysis JSONB, -- Detailed AI breakdown
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- RLS
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own attempts" ON question_attempts
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_attempts_user ON question_attempts(user_id, created_at DESC);
CREATE INDEX idx_attempts_question ON question_attempts(question_id);
CREATE INDEX idx_attempts_scoring ON question_attempts(scoring_status, created_at);

-- ===============================================
-- PROGRESS TRACKING
-- ===============================================

CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id TEXT REFERENCES exams(id),
  section_id TEXT REFERENCES sections(id),
  question_type_id TEXT REFERENCES question_types(id),
  
  -- Stats
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  average_score NUMERIC,
  best_score NUMERIC,
  total_time_spent_minutes INTEGER DEFAULT 0,
  
  -- Streaks
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  
  last_activity_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(user_id, exam_id, section_id, question_type_id)
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB,
  earned_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, achievement_type)
);

-- RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_progress_user_exam ON user_progress(user_id, exam_id);
CREATE INDEX idx_achievements_user ON user_achievements(user_id);

-- ===============================================
-- SAMPLE DATA
-- ===============================================

-- Sample Exams
INSERT INTO exams VALUES 
('pte-academic', 'PTE', 'PTE Academic', 'Pearson Test of English Academic', 200, 90, true, now(), now()),
('ielts-academic', 'IELTS', 'IELTS Academic', 'International English Language Testing System Academic', 165, 9, true, now(), now()),
('ielts-general', 'IELTS', 'IELTS General Training', 'IELTS General Training', 165, 9, true, now(), now());

-- Sample Sections
INSERT INTO sections VALUES 
-- PTE Sections
('pte-speaking', 'pte-academic', 'speaking', 'Speaking', 'Speaking tasks', 77, 1, true, now(), now()),
('pte-writing', 'pte-academic', 'writing', 'Writing', 'Writing tasks', 32, 2, true, now(), now()),
('pte-reading', 'pte-academic', 'reading', 'Reading', 'Reading tasks', 32, 3, true, now(), now()),
('pte-listening', 'pte-academic', 'listening', 'Listening', 'Listening tasks', 45, 4, true, now(), now()),

-- IELTS Academic Sections
('ielts-writing', 'ielts-academic', 'writing', 'Writing', 'Academic writing', 60, 1, true, now(), now()),
('ielts-reading', 'ielts-academic', 'reading', 'Reading', 'Academic reading', 60, 2, true, now(), now()),
('ielts-listening', 'ielts-academic', 'listening', 'Listening', 'Listening comprehension', 40, 3, true, now(), now()),
('ielts-speaking', 'ielts-academic', 'speaking', 'Speaking', 'Speaking interview', 15, 4, true, now(), now());

-- Sample Question Types
INSERT INTO question_types VALUES 
-- PTE Speaking
('pte-read-aloud', 'pte-speaking', 'read_aloud', 'Read Aloud', 'Read the text aloud clearly and naturally', 'text', 'audio', 'ai_auto', 40, 1, true, now(), now()),
('pte-repeat-sentence', 'pte-speaking', 'repeat_sentence', 'Repeat Sentence', 'Listen carefully and repeat exactly what you hear', 'audio', 'audio', 'ai_auto', 15, 2, true, now(), now()),
('pte-describe-image', 'pte-speaking', 'describe_image', 'Describe Image', 'Look at the image and describe what you see in detail', 'image', 'audio', 'ai_auto', 40, 3, true, now(), now()),
('pte-retell-lecture', 'pte-speaking', 'retell_lecture', 'Re-tell Lecture', 'Listen to the lecture and summarize the key points', 'audio', 'audio', 'ai_auto', 40, 4, true, now(), now()),
('pte-answer-short-question', 'pte-speaking', 'answer_short_question', 'Answer Short Question', 'Answer the question in a few words or a short phrase', 'audio', 'audio', 'ai_auto', 10, 5, true, now(), now()),

-- PTE Writing
('pte-summarize-written-text', 'pte-writing', 'summarize_written_text', 'Summarize Written Text', 'Read the passage and summarize it in one sentence (5-75 words)', 'text', 'text', 'ai_auto', 600, 1, true, now(), now()),
('pte-write-essay', 'pte-writing', 'write_essay', 'Write Essay', 'Write a 200-300 word essay on the given topic', 'text', 'text', 'ai_manual_review', 1200, 2, true, now(), now()),

-- IELTS Writing
('ielts-task1', 'ielts-writing', 'task1', 'Writing Task 1', 'Describe the visual information in at least 150 words', 'image', 'text', 'ai_manual_review', 1200, 1, true, now(), now()),
('ielts-task2', 'ielts-writing', 'task2', 'Writing Task 2', 'Write an essay of at least 250 words', 'text', 'text', 'ai_manual_review', 2400, 2, true, now(), now()),

-- IELTS Speaking
('ielts-part1', 'ielts-speaking', 'part1', 'Part 1 - Introduction', 'Answer general questions about yourself and familiar topics', 'text', 'audio', 'ai_manual_review', NULL, 1, true, now(), now()),
('ielts-part2', 'ielts-speaking', 'part2', 'Part 2 - Cue Card', 'Speak about the topic on the cue card for 1-2 minutes', 'text', 'audio', 'ai_manual_review', 120, 2, true, now(), now()),
('ielts-part3', 'ielts-speaking', 'part3', 'Part 3 - Discussion', 'Discuss abstract topics related to Part 2', 'text', 'audio', 'ai_manual_review', NULL, 3, true, now(), now());

-- Sample Subscription Plans
INSERT INTO subscription_plans VALUES 
('pte-free', 'pte_free', 'PTE Free', 'Limited PTE practice', 'pte-academic', 0, 0, 'USD', 1, 20, false, false, 0, true, 1, now(), now()),
('pte-basic', 'pte_basic', 'PTE Basic', 'Essential PTE prep', 'pte-academic', 29.99, 299.99, 'USD', 5, 200, true, false, 7, true, 2, now(), now()),
('pte-premium', 'pte_premium', 'PTE Premium', 'Complete PTE prep', 'pte-academic', 49.99, 499.99, 'USD', NULL, NULL, true, true, 7, true, 3, now(), now()),
('ielts-free', 'ielts_free', 'IELTS Free', 'Limited IELTS practice', 'ielts-academic', 0, 0, 'USD', 1, 20, false, false, 0, true, 1, now(), now()),
('ielts-basic', 'ielts_basic', 'IELTS Basic', 'Essential IELTS prep', 'ielts-academic', 29.99, 299.99, 'USD', 5, 200, true, false, 7, true, 2, now(), now()),
('ielts-premium', 'ielts_premium', 'IELTS Premium', 'Complete IELTS prep', 'ielts-academic', 49.99, 499.99, 'USD', NULL, NULL, true, true, 7, true, 3, now(), now());

-- Add admin storage policy (after user_profiles exists)
CREATE POLICY "Admins can upload exam media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'exam-media' AND 
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Admin can manage content
CREATE POLICY "Admins can manage exams" ON exams 
  FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage sections" ON sections 
  FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage question types" ON question_types 
  FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage questions" ON questions 
  FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage media" ON media 
  FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage question media" ON question_media 
  FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage question options" ON question_options 
  FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- ===============================================
-- TEST SESSION FUNCTIONALITY
-- ===============================================

-- Test Sessions (user-created practice sessions)
CREATE TABLE test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id TEXT REFERENCES exams(id) ON DELETE CASCADE,
  
  -- Basic Configuration
  session_name TEXT,
  session_type TEXT NOT NULL DEFAULT 'practice', -- 'practice', 'mock_test', 'focused_practice'
  
  -- Test Settings
  is_timed BOOLEAN DEFAULT true,
  total_duration_minutes INTEGER, -- NULL for untimed
  question_count INTEGER NOT NULL,
  difficulty_levels INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
  
  -- Question Selection
  question_selection_mode TEXT NOT NULL DEFAULT 'mixed', -- 'new_only', 'incorrect_only', 'mixed', 'all'
  include_sections TEXT[], -- section IDs to include
  include_question_types TEXT[], -- question type IDs to include
  
  -- Session configuration (JSONB for flexibility)
  session_config JSONB DEFAULT '{}', -- weights, time limits, etc.
  
  -- Session Status
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'completed', 'abandoned'
  
  -- Session Lifecycle
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  total_time_spent_seconds INTEGER DEFAULT 0,
  
  -- Results (calculated in application)
  total_score NUMERIC,
  max_possible_score NUMERIC,
  percentage_score NUMERIC,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Questions selected for each test session
CREATE TABLE test_session_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES test_sessions(id) ON DELETE CASCADE,
  question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Question metadata
  sequence_number INTEGER NOT NULL, -- Order in the session
  allocated_time_seconds INTEGER, -- Time allocated for this question
  
  -- Progress tracking
  is_attempted BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  time_spent_seconds INTEGER DEFAULT 0,
  
  -- Link to attempt when answered
  question_attempt_id UUID REFERENCES question_attempts(id),
  
  created_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(session_id, sequence_number),
  UNIQUE(session_id, question_id)
);

-- Test Session Templates for common configurations
CREATE TABLE test_session_templates (
  id TEXT PRIMARY KEY,
  exam_id TEXT REFERENCES exams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  template_config JSONB NOT NULL, -- Configuration as JSON
  created_at TIMESTAMP DEFAULT now()
);

-- Add session reference to existing question_attempts table
ALTER TABLE question_attempts 
ADD COLUMN test_session_id UUID REFERENCES test_sessions(id),
ADD COLUMN session_question_id UUID REFERENCES test_session_questions(id);

-- Indexes for performance
CREATE INDEX idx_test_sessions_user ON test_sessions(user_id, status, created_at DESC);
CREATE INDEX idx_test_sessions_exam ON test_sessions(exam_id, status);
CREATE INDEX idx_session_questions_session ON test_session_questions(session_id, sequence_number);
CREATE INDEX idx_question_attempts_session ON question_attempts(test_session_id) WHERE test_session_id IS NOT NULL;

-- RLS Policies
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_session_templates ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can manage own test sessions" ON test_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own session questions" ON test_session_questions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM test_sessions 
    WHERE test_sessions.id = test_session_questions.session_id 
    AND test_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Everyone can read public templates" ON test_session_templates
  FOR SELECT USING (is_public = true);

-- Admin policies
CREATE POLICY "Admins can manage all test sessions" ON test_sessions 
  FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage all session questions" ON test_session_questions 
  FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage templates" ON test_session_templates 
  FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Sample templates
INSERT INTO test_session_templates (id, exam_id, name, description, template_config) VALUES
('pte-full-mock', 'pte-academic', 'Full PTE Mock Test', 'Complete PTE Academic practice test', 
 '{"is_timed": true, "total_duration_minutes": 180, "question_count": 20, "session_type": "mock_test", "include_sections": ["pte-speaking", "pte-writing", "pte-reading", "pte-listening"], "question_selection_mode": "mixed"}'),

('pte-speaking-focus', 'pte-academic', 'PTE Speaking Focus', 'Focus on speaking questions only', 
 '{"is_timed": true, "total_duration_minutes": 45, "question_count": 10, "session_type": "focused_practice", "include_sections": ["pte-speaking"], "question_selection_mode": "mixed"}'),

('ielts-full-mock', 'ielts-academic', 'Full IELTS Mock Test', 'Complete IELTS Academic practice test', 
 '{"is_timed": true, "total_duration_minutes": 165, "question_count": 25, "session_type": "mock_test", "include_sections": ["ielts-writing", "ielts-reading", "ielts-listening", "ielts-speaking"], "question_selection_mode": "mixed"}'),

('ielts-writing-focus', 'ielts-academic', 'IELTS Writing Focus', 'Focus on writing tasks', 
 '{"is_timed": true, "total_duration_minutes": 60, "question_count": 8, "session_type": "focused_practice", "include_sections": ["ielts-writing"], "question_selection_mode": "mixed"}');

-- ===============================================
-- ENHANCED SCHEMA COMPLETE
-- ===============================================
-- ✅ Proper media management with IDs
-- ✅ No over-engineered functions  
-- ✅ Essential RLS policies only
-- ✅ Clean structure
-- ✅ Admin capabilities
-- ✅ Test session functionality
-- ✅ Works with existing structure
-- ===============================================