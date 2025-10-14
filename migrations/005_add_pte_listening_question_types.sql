-- Migration: Add PTE Listening question types
-- Purpose: Add 6 new listening question types for PTE Academic Listening section
-- Date: 2025-01-15
-- Author: System

-- Ensure PTE Listening section exists
INSERT INTO public.sections (id, exam_id, name, display_name, description, duration_minutes, order_index) VALUES
('pte-listening', 'pte-academic', 'listening', 'Listening', 'Listening section with various question types', 45, 4)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 1. SUMMARIZE SPOKEN TEXT
-- ========================================
INSERT INTO public.question_types (
    id, 
    section_id, 
    name, 
    display_name, 
    description, 
    input_type, 
    response_type, 
    scoring_method, 
    time_limit_seconds, 
    order_index, 
    ui_component,
    is_active,
    created_at,
    updated_at
) VALUES (
    'pte-listening-summarize-spoken-text',
    'pte-listening',
    'summarize-spoken-text',
    'Summarize Spoken Text',
    'Listen to the recording and write a 50-70 word summary of what you heard.',
    'audio',
    'text',
    'ai_auto',
    600, -- 10 minutes
    1,
    'pte-listening-summarize-spoken-text',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    input_type = EXCLUDED.input_type,
    response_type = EXCLUDED.response_type,
    scoring_method = EXCLUDED.scoring_method,
    time_limit_seconds = EXCLUDED.time_limit_seconds,
    order_index = EXCLUDED.order_index,
    ui_component = EXCLUDED.ui_component,
    updated_at = NOW();

-- ========================================
-- 2. MULTIPLE CHOICE, MULTIPLE ANSWERS
-- ========================================
INSERT INTO public.question_types (
    id, 
    section_id, 
    name, 
    display_name, 
    description, 
    input_type, 
    response_type, 
    scoring_method, 
    time_limit_seconds, 
    order_index, 
    ui_component,
    is_active,
    created_at,
    updated_at
) VALUES (
    'pte-listening-mcq-multiple',
    'pte-listening',
    'multiple-choice-multiple',
    'Multiple Choice, Multiple Answers',
    'Listen to the recording and answer the multiple-choice question. There is more than one correct response.',
    'multiple_choice',
    'selection',
    'partial_credit',
    150, -- 2.5 minutes
    2,
    'pte-listening-mcq-multiple',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    input_type = EXCLUDED.input_type,
    response_type = EXCLUDED.response_type,
    scoring_method = EXCLUDED.scoring_method,
    time_limit_seconds = EXCLUDED.time_limit_seconds,
    order_index = EXCLUDED.order_index,
    ui_component = EXCLUDED.ui_component,
    updated_at = NOW();

-- ========================================
-- 3. HIGHLIGHT CORRECT SUMMARY
-- ========================================
INSERT INTO public.question_types (
    id, 
    section_id, 
    name, 
    display_name, 
    description, 
    input_type, 
    response_type, 
    scoring_method, 
    time_limit_seconds, 
    order_index, 
    ui_component,
    is_active,
    created_at,
    updated_at
) VALUES (
    'pte-listening-highlight-summary',
    'pte-listening',
    'highlight-correct-summary',
    'Highlight Correct Summary',
    'Listen to the recording and select the summary that best matches what you heard.',
    'single_choice',
    'selection',
    'exact_match',
    120, -- 2 minutes
    3,
    'pte-listening-highlight-summary',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    input_type = EXCLUDED.input_type,
    response_type = EXCLUDED.response_type,
    scoring_method = EXCLUDED.scoring_method,
    time_limit_seconds = EXCLUDED.time_limit_seconds,
    order_index = EXCLUDED.order_index,
    ui_component = EXCLUDED.ui_component,
    updated_at = NOW();

-- ========================================
-- 4. MULTIPLE CHOICE, SINGLE ANSWER
-- ========================================
INSERT INTO public.question_types (
    id, 
    section_id, 
    name, 
    display_name, 
    description, 
    input_type, 
    response_type, 
    scoring_method, 
    time_limit_seconds, 
    order_index, 
    ui_component,
    is_active,
    created_at,
    updated_at
) VALUES (
    'pte-listening-mcq-single',
    'pte-listening',
    'multiple-choice-single',
    'Multiple Choice, Single Answer',
    'Listen to the recording and answer the multiple-choice question by selecting the correct response.',
    'single_choice',
    'selection',
    'exact_match',
    120, -- 2 minutes
    4,
    'pte-listening-mcq-single',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    input_type = EXCLUDED.input_type,
    response_type = EXCLUDED.response_type,
    scoring_method = EXCLUDED.scoring_method,
    time_limit_seconds = EXCLUDED.time_limit_seconds,
    order_index = EXCLUDED.order_index,
    ui_component = EXCLUDED.ui_component,
    updated_at = NOW();

-- ========================================
-- 5. SELECT MISSING WORD
-- ========================================
INSERT INTO public.question_types (
    id, 
    section_id, 
    name, 
    display_name, 
    description, 
    input_type, 
    response_type, 
    scoring_method, 
    time_limit_seconds, 
    order_index, 
    ui_component,
    is_active,
    created_at,
    updated_at
) VALUES (
    'pte-listening-select-missing-word',
    'pte-listening',
    'select-missing-word',
    'Select Missing Word',
    'The last word or group of words has been replaced by a beep. Select the most appropriate option to complete the recording.',
    'single_choice',
    'selection',
    'exact_match',
    90, -- 1.5 minutes
    5,
    'pte-listening-select-missing-word',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    input_type = EXCLUDED.input_type,
    response_type = EXCLUDED.response_type,
    scoring_method = EXCLUDED.scoring_method,
    time_limit_seconds = EXCLUDED.time_limit_seconds,
    order_index = EXCLUDED.order_index,
    ui_component = EXCLUDED.ui_component,
    updated_at = NOW();

-- ========================================
-- 6. WRITE FROM DICTATION
-- ========================================
INSERT INTO public.question_types (
    id, 
    section_id, 
    name, 
    display_name, 
    description, 
    input_type, 
    response_type, 
    scoring_method, 
    time_limit_seconds, 
    order_index, 
    ui_component,
    is_active,
    created_at,
    updated_at
) VALUES (
    'pte-listening-write-dictation',
    'pte-listening',
    'write-from-dictation',
    'Write from Dictation',
    'Listen to the sentence and type it exactly as you hear it.',
    'audio',
    'text',
    'exact_match',
    90, -- 1.5 minutes
    6,
    'pte-listening-write-dictation',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    input_type = EXCLUDED.input_type,
    response_type = EXCLUDED.response_type,
    scoring_method = EXCLUDED.scoring_method,
    time_limit_seconds = EXCLUDED.time_limit_seconds,
    order_index = EXCLUDED.order_index,
    ui_component = EXCLUDED.ui_component,
    updated_at = NOW();

-- ========================================
-- SAMPLE QUESTIONS
-- ========================================

-- Sample: Summarize Spoken Text
INSERT INTO public.questions (
    id,
    question_type_id,
    title,
    content,
    instructions,
    difficulty_level,
    expected_duration_seconds,
    correct_answer,
    is_active,
    created_at,
    updated_at
) VALUES 
(
    'pte-listening-sst-climate-change',
    'pte-listening-summarize-spoken-text',
    'Climate Change Lecture',
    'You will hear a lecture about climate change. Write a summary for a fellow student who was not present at the lecture. You should write 50-70 words.',
    'Listen to the recording and write a 50-70 word summary of what you heard.',
    3,
    600,
    '{"key_points": ["climate change impacts", "rising temperatures", "human activities", "renewable energy solutions"], "word_range": {"min": 50, "max": 70}}',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    instructions = EXCLUDED.instructions,
    difficulty_level = EXCLUDED.difficulty_level,
    expected_duration_seconds = EXCLUDED.expected_duration_seconds,
    correct_answer = EXCLUDED.correct_answer,
    updated_at = NOW();

-- Sample: MCQ Multiple Answers
INSERT INTO public.questions (
    id,
    question_type_id,
    title,
    content,
    instructions,
    difficulty_level,
    expected_duration_seconds,
    is_active,
    created_at,
    updated_at
) VALUES 
(
    'pte-listening-mcq-multi-renewable-energy',
    'pte-listening-mcq-multiple',
    'Renewable Energy Discussion',
    'According to the speaker, what are the benefits of renewable energy? Select all that apply.',
    'Listen to the recording and answer the multiple-choice question by selecting all the correct responses. More than one response is correct.',
    3,
    150,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    instructions = EXCLUDED.instructions,
    difficulty_level = EXCLUDED.difficulty_level,
    expected_duration_seconds = EXCLUDED.expected_duration_seconds,
    updated_at = NOW();

INSERT INTO public.question_options (
    id,
    question_id,
    option_text,
    is_correct,
    display_order
) VALUES 
(
    gen_random_uuid(),
    'pte-listening-mcq-multi-renewable-energy',
    'Reduces greenhouse gas emissions',
    true,
    1
),
(
    gen_random_uuid(),
    'pte-listening-mcq-multi-renewable-energy',
    'Decreases dependence on fossil fuels',
    true,
    2
),
(
    gen_random_uuid(),
    'pte-listening-mcq-multi-renewable-energy',
    'Increases air pollution in urban areas',
    false,
    3
),
(
    gen_random_uuid(),
    'pte-listening-mcq-multi-renewable-energy',
    'Provides sustainable long-term energy solutions',
    true,
    4
),
(
    gen_random_uuid(),
    'pte-listening-mcq-multi-renewable-energy',
    'Requires more natural resources than traditional energy',
    false,
    5
)
ON CONFLICT (id) DO NOTHING;

-- Sample: Highlight Correct Summary
INSERT INTO public.questions (
    id,
    question_type_id,
    title,
    content,
    instructions,
    difficulty_level,
    expected_duration_seconds,
    is_active,
    created_at,
    updated_at
) VALUES 
(
    'pte-listening-summary-technology',
    'pte-listening-highlight-summary',
    'Technology in Education Summary',
    'Which summary best represents what the speaker said about technology in education?',
    'Listen to the recording and select the paragraph that best relates the information.',
    3,
    120,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    instructions = EXCLUDED.instructions,
    difficulty_level = EXCLUDED.difficulty_level,
    expected_duration_seconds = EXCLUDED.expected_duration_seconds,
    updated_at = NOW();

INSERT INTO public.question_options (
    id,
    question_id,
    option_text,
    is_correct,
    display_order
) VALUES 
(
    gen_random_uuid(),
    'pte-listening-summary-technology',
    'Technology has revolutionized education by making learning more accessible and interactive. Digital tools such as tablets and online platforms enable students to learn at their own pace, while teachers can provide personalized feedback. However, challenges remain in ensuring equal access to technology across different socioeconomic groups.',
    true,
    1
),
(
    gen_random_uuid(),
    'pte-listening-summary-technology',
    'Technology in education is primarily focused on replacing traditional teaching methods entirely. All schools have adopted digital tools, eliminating the need for physical textbooks and classroom instruction. This has made education completely automated and removed the role of teachers from the learning process.',
    false,
    2
),
(
    gen_random_uuid(),
    'pte-listening-summary-technology',
    'Educational technology is only beneficial for advanced students who already have strong academic skills. It has minimal impact on student engagement and does not improve learning outcomes. Most educators prefer traditional teaching methods over digital tools.',
    false,
    3
)
ON CONFLICT (id) DO NOTHING;

-- Sample: MCQ Single Answer
INSERT INTO public.questions (
    id,
    question_type_id,
    title,
    content,
    instructions,
    difficulty_level,
    expected_duration_seconds,
    is_active,
    created_at,
    updated_at
) VALUES 
(
    'pte-listening-mcq-single-water-cycle',
    'pte-listening-mcq-single',
    'Water Cycle Process',
    'What is the main cause of water evaporation according to the speaker?',
    'Listen to the recording and answer the multiple-choice question by selecting the correct response. Only one response is correct.',
    2,
    120,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    instructions = EXCLUDED.instructions,
    difficulty_level = EXCLUDED.difficulty_level,
    expected_duration_seconds = EXCLUDED.expected_duration_seconds,
    updated_at = NOW();

INSERT INTO public.question_options (
    id,
    question_id,
    option_text,
    is_correct,
    display_order
) VALUES 
(
    gen_random_uuid(),
    'pte-listening-mcq-single-water-cycle',
    'Wind patterns across the ocean surface',
    false,
    1
),
(
    gen_random_uuid(),
    'pte-listening-mcq-single-water-cycle',
    'Solar energy heating water bodies',
    true,
    2
),
(
    gen_random_uuid(),
    'pte-listening-mcq-single-water-cycle',
    'Underground thermal activity',
    false,
    3
),
(
    gen_random_uuid(),
    'pte-listening-mcq-single-water-cycle',
    'Chemical reactions in the atmosphere',
    false,
    4
)
ON CONFLICT (id) DO NOTHING;

-- Sample: Select Missing Word
INSERT INTO public.questions (
    id,
    question_type_id,
    title,
    content,
    instructions,
    difficulty_level,
    expected_duration_seconds,
    is_active,
    created_at,
    updated_at
) VALUES 
(
    'pte-listening-missing-word-pollution',
    'pte-listening-select-missing-word',
    'Air Pollution Discussion',
    'Select the most appropriate word or phrase to complete the recording.',
    'You will hear a recording about air pollution. At the end, the last word or group of words has been replaced by a beep. Select the correct option to complete the recording.',
    3,
    90,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    instructions = EXCLUDED.instructions,
    difficulty_level = EXCLUDED.difficulty_level,
    expected_duration_seconds = EXCLUDED.expected_duration_seconds,
    updated_at = NOW();

INSERT INTO public.question_options (
    id,
    question_id,
    option_text,
    is_correct,
    display_order
) VALUES 
(
    gen_random_uuid(),
    'pte-listening-missing-word-pollution',
    'respiratory diseases',
    true,
    1
),
(
    gen_random_uuid(),
    'pte-listening-missing-word-pollution',
    'economic growth',
    false,
    2
),
(
    gen_random_uuid(),
    'pte-listening-missing-word-pollution',
    'technological advancement',
    false,
    3
),
(
    gen_random_uuid(),
    'pte-listening-missing-word-pollution',
    'population increase',
    false,
    4
)
ON CONFLICT (id) DO NOTHING;

-- Sample: Write from Dictation
INSERT INTO public.questions (
    id,
    question_type_id,
    title,
    content,
    instructions,
    difficulty_level,
    expected_duration_seconds,
    correct_answer,
    is_active,
    created_at,
    updated_at
) VALUES 
(
    'pte-listening-dictation-1',
    'pte-listening-write-dictation',
    'Sentence Dictation',
    'Type the sentence exactly as you hear it.',
    'You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.',
    2,
    90,
    '{"correct_text": "The rapid development of technology has transformed the way we communicate.", "case_sensitive": false, "allow_punctuation_variations": true}',
    true,
    NOW(),
    NOW()
),
(
    'pte-listening-dictation-2',
    'pte-listening-write-dictation',
    'Sentence Dictation',
    'Type the sentence exactly as you hear it.',
    'You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.',
    3,
    90,
    '{"correct_text": "Scientists believe that climate change will have significant impacts on global agriculture.", "case_sensitive": false, "allow_punctuation_variations": true}',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    instructions = EXCLUDED.instructions,
    difficulty_level = EXCLUDED.difficulty_level,
    expected_duration_seconds = EXCLUDED.expected_duration_seconds,
    correct_answer = EXCLUDED.correct_answer,
    updated_at = NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_pte_listening ON public.questions(question_type_id) 
WHERE question_type_id LIKE 'pte-listening%';

CREATE INDEX IF NOT EXISTS idx_question_types_section_listening ON public.question_types(section_id, order_index) 
WHERE section_id = 'pte-listening';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Successfully added 6 PTE Listening question types with sample questions';
END $$;
