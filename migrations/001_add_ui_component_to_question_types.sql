-- Migration: Add UI component mapping to question_types table
-- Purpose: Enable dynamic UI component selection based on question type
-- Date: 2024-01-XX
-- Author: System

-- Add ui_component column to question_types table
ALTER TABLE public.question_types 
ADD COLUMN ui_component text;

-- Add comment for documentation
COMMENT ON COLUMN public.question_types.ui_component IS 'React component name to render this question type (e.g., ielts-reading-mcq, pte-speaking-read-aloud)';

-- Create index for performance (since we'll query by this frequently)
CREATE INDEX idx_question_types_ui_component ON public.question_types(ui_component);

-- Sample data: Add some example question types with UI components
-- IELTS Reading Question Types
INSERT INTO public.question_types (id, section_id, name, display_name, description, input_type, response_type, scoring_method, time_limit_seconds, order_index, ui_component) VALUES
('ielts-reading-mcq-single', 'ielts-reading', 'multiple-choice-single', 'Multiple Choice (Single Answer)', 'Choose one correct answer from multiple options', 'selection', 'single_choice', 'exact_match', 120, 1, 'ielts-reading-mcq'),
('ielts-reading-mcq-multiple', 'ielts-reading', 'multiple-choice-multiple', 'Multiple Choice (Multiple Answers)', 'Choose multiple correct answers', 'selection', 'multiple_choice', 'partial_credit', 180, 2, 'ielts-reading-mcq-multiple'),
('ielts-reading-true-false', 'ielts-reading', 'true-false-not-given', 'True/False/Not Given', 'Determine if statements are true, false, or not given', 'selection', 'single_choice', 'exact_match', 90, 3, 'ielts-reading-true-false');

-- PTE Reading Question Types  
INSERT INTO public.question_types (id, section_id, name, display_name, description, input_type, response_type, scoring_method, time_limit_seconds, order_index, ui_component) VALUES
('pte-reading-mcq-single', 'pte-reading', 'multiple-choice-single', 'Multiple Choice (Single Answer)', 'Choose one correct answer', 'selection', 'single_choice', 'exact_match', 120, 1, 'pte-reading-mcq'),
('pte-reading-reorder', 'pte-reading', 'reorder-paragraphs', 'Re-order Paragraphs', 'Drag and drop paragraphs into correct order', 'drag_drop', 'sequence', 'sequence_match', 300, 2, 'pte-reading-reorder');

-- IELTS Speaking Question Types
INSERT INTO public.question_types (id, section_id, name, display_name, description, input_type, response_type, scoring_method, time_limit_seconds, order_index, ui_component) VALUES
('ielts-speaking-part1', 'ielts-speaking', 'interview-questions', 'Part 1: Interview', 'Answer questions about familiar topics', 'audio_recording', 'speech', 'ai_scoring', 240, 1, 'ielts-speaking-interview'),
('ielts-speaking-part2', 'ielts-speaking', 'cue-card', 'Part 2: Cue Card', 'Speak for 2 minutes on given topic', 'audio_recording', 'speech', 'ai_scoring', 180, 2, 'ielts-speaking-cue-card');

-- PTE Speaking Question Types
INSERT INTO public.question_types (id, section_id, name, display_name, description, input_type, response_type, scoring_method, time_limit_seconds, order_index, ui_component) VALUES
('pte-speaking-read-aloud', 'pte-speaking', 'read-aloud', 'Read Aloud', 'Read the text aloud clearly', 'audio_recording', 'speech', 'pronunciation_scoring', 40, 1, 'pte-speaking-read-aloud'),
('pte-speaking-repeat-sentence', 'pte-speaking', 'repeat-sentence', 'Repeat Sentence', 'Listen and repeat the sentence exactly', 'audio_recording', 'speech', 'accuracy_scoring', 15, 2, 'pte-speaking-repeat-sentence');

-- Add sections if they don't exist (assuming they might not be in the current db)
INSERT INTO public.sections (id, exam_id, name, display_name, description, duration_minutes, order_index) VALUES
('ielts-reading', 'ielts-academic', 'reading', 'Reading', 'Academic Reading section', 60, 1),
('ielts-speaking', 'ielts-academic', 'speaking', 'Speaking', 'Speaking test section', 15, 4),
('pte-reading', 'pte-academic', 'reading', 'Reading', 'Reading section', 32, 1),
('pte-speaking', 'pte-academic', 'speaking', 'Speaking', 'Speaking section', 54, 1)
ON CONFLICT (id) DO NOTHING;

-- Add exams if they don't exist
INSERT INTO public.exams (id, name, display_name, description, duration_minutes, total_score) VALUES
('ielts-academic', 'ielts-academic', 'IELTS Academic', 'International English Language Testing System - Academic', 165, 90),
('pte-academic', 'pte-academic', 'PTE Academic', 'Pearson Test of English - Academic', 200, 90)
ON CONFLICT (id) DO NOTHING;