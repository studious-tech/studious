-- ===============================================
-- SIMPLE TEST SESSION EXTENSION
-- ===============================================
-- This extends your existing database with minimal test session functionality
-- No complex functions - just simple tables that work with your current structure
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
  difficulty_levels INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- [1,2,3,4,5] for all levels
  
  -- Question Selection (simple arrays - no complex logic)
  question_selection_mode TEXT NOT NULL DEFAULT 'mixed', -- 'new_only', 'incorrect_only', 'mixed', 'all'
  include_sections TEXT[], -- section IDs to include
  include_question_types TEXT[], -- question type IDs to include
  
  -- Simple configuration (JSONB for flexibility)
  session_config JSONB DEFAULT '{}', -- Store any additional config like weights, time limits etc.
  
  -- Session Status
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'completed', 'abandoned'
  
  -- Session Lifecycle
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  total_time_spent_seconds INTEGER DEFAULT 0,
  
  -- Simple Results (calculated in application, not database)
  total_score NUMERIC,
  max_possible_score NUMERIC,
  percentage_score NUMERIC,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Questions selected for a specific test session (simple relationship)
CREATE TABLE test_session_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES test_sessions(id) ON DELETE CASCADE,
  question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
  
  -- Simple metadata
  sequence_number INTEGER NOT NULL, -- Order in the session
  allocated_time_seconds INTEGER, -- Time allocated for this question
  
  -- Progress tracking (updated by application)
  is_attempted BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  time_spent_seconds INTEGER DEFAULT 0,
  
  -- Link to attempt when answered (optional)
  question_attempt_id UUID REFERENCES question_attempts(id),
  
  created_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(session_id, sequence_number),
  UNIQUE(session_id, question_id) -- No duplicate questions in same session
);

-- Add session reference to existing question_attempts table (extend your existing table)
ALTER TABLE question_attempts 
ADD COLUMN test_session_id UUID REFERENCES test_sessions(id),
ADD COLUMN session_question_id UUID REFERENCES test_session_questions(id);

-- Simple indexes for performance
CREATE INDEX idx_test_sessions_user ON test_sessions(user_id, status, created_at DESC);
CREATE INDEX idx_test_sessions_exam ON test_sessions(exam_id, status);
CREATE INDEX idx_session_questions_session ON test_session_questions(session_id, sequence_number);
CREATE INDEX idx_question_attempts_session ON question_attempts(test_session_id) WHERE test_session_id IS NOT NULL;

-- Simple RLS Policies (work with your existing auth system)
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_session_questions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own test sessions
CREATE POLICY "Users can manage own test sessions" ON test_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Users can view session questions for their sessions  
CREATE POLICY "Users can view own session questions" ON test_session_questions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM test_sessions 
    WHERE test_sessions.id = test_session_questions.session_id 
    AND test_sessions.user_id = auth.uid()
  ));

-- Admin policies (work with your existing admin system)
CREATE POLICY "Admins can manage all test sessions" ON test_sessions 
  FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage all session questions" ON test_session_questions 
  FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Optional: Simple templates table for common configurations
CREATE TABLE test_session_templates (
  id TEXT PRIMARY KEY,
  exam_id TEXT REFERENCES exams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  template_config JSONB NOT NULL, -- Store the configuration as JSON
  created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE test_session_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read public templates" ON test_session_templates
  FOR SELECT USING (is_public = true);

-- Sample templates using your existing exam structure
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
-- SIMPLE TEST SESSION SCHEMA COMPLETE
-- ===============================================
-- ✅ Works with your existing structure
-- ✅ No complex functions or triggers
-- ✅ Simple application-managed logic
-- ✅ Extends existing question_attempts table
-- ✅ Uses your existing RLS patterns
-- ===============================================