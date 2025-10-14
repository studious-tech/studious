-- Migration: Add PTE Reading question types (Multiple Choice and Reorder Paragraphs)
-- Purpose: Add Multiple Choice and Reorder Paragraphs question types for PTE Academic Reading section
-- Date: 2024-12-30
-- Author: System

-- Ensure PTE Reading section exists
INSERT INTO public.sections (id, exam_id, name, display_name, description, duration_minutes, order_index) VALUES
('pte-reading', 'pte-academic', 'reading', 'Reading', 'Reading section with multiple choice and reorder paragraph tasks', 32, 1)
ON CONFLICT (id) DO NOTHING;

-- Add PTE Reading Multiple Choice (Single Answer) question type
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
    'pte-reading-mcq-single',
    'pte-reading',
    'multiple-choice-single',
    'Multiple Choice (Single Answer)',
    'Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.',
    'single_choice',
    'selection',
    'exact_match',
    120, -- 2 minutes
    1,
    'pte-reading-mcq-single',
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

-- Add PTE Reading Multiple Choice (Multiple Answers) question type
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
    'pte-reading-mcq-multiple',
    'pte-reading',
    'multiple-choice-multiple',
    'Multiple Choice (Multiple Answers)',
    'Read the text and answer the multiple-choice question by selecting all correct responses. More than one response is correct.',
    'multiple_choice',
    'selection',
    'partial_credit',
    150, -- 2.5 minutes
    2,
    'pte-reading-mcq-multiple',
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

-- Add PTE Reading Reorder Paragraphs question type
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
    'pte-reading-reorder-paragraphs',
    'pte-reading',
    'reorder-paragraphs',
    'Re-order Paragraphs',
    'The text boxes have been placed in a random order. Restore the original order by dragging the text boxes to the correct positions.',
    'drag_drop',
    'sequence',
    'sequence_match',
    150, -- 2.5 minutes
    3,
    'pte-reading-reorder-paragraphs',
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

-- Add sample Multiple Choice (Single Answer) questions
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
    'pte-reading-mcq-single-climate-change',
    'pte-reading-mcq-single',
    'Climate Change Impact',
    'Climate change is one of the most pressing issues of our time. Rising global temperatures have led to melting ice caps, rising sea levels, and more frequent extreme weather events. Scientists agree that human activities, particularly the burning of fossil fuels, are the primary cause of recent climate change. The effects are already visible in many parts of the world, from drought-stricken regions to areas experiencing unprecedented flooding.',
    'Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.',
    3,
    120,
    true,
    NOW(),
    NOW()
),
(
    'pte-reading-mcq-single-technology-education',
    'pte-reading-mcq-single',
    'Technology in Education',
    'The integration of technology in education has transformed the way students learn and teachers instruct. Digital tools such as interactive whiteboards, tablets, and online learning platforms have made education more engaging and accessible. However, this technological shift also presents challenges, including the digital divide between students who have access to technology and those who do not. Additionally, teachers must adapt their teaching methods and acquire new skills to effectively use these technologies.',
    'Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.',
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

-- Add sample Multiple Choice (Multiple Answers) questions
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
    'pte-reading-mcq-multiple-renewable-energy',
    'pte-reading-mcq-multiple',
    'Renewable Energy Sources',
    'Renewable energy sources are becoming increasingly important as the world seeks to reduce its dependence on fossil fuels. Solar power harnesses energy from the sun using photovoltaic cells, while wind power uses turbines to convert wind energy into electricity. Hydroelectric power generates electricity from flowing water, and geothermal energy taps into the Earth''s internal heat. Each of these renewable sources has its own advantages and limitations, but all contribute to reducing greenhouse gas emissions and promoting environmental sustainability.',
    'Read the text and answer the multiple-choice question by selecting all correct responses. More than one response is correct.',
    4,
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

-- Add sample Reorder Paragraphs questions
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
    'pte-reading-reorder-water-cycle',
    'pte-reading-reorder-paragraphs',
    'The Water Cycle Process',
    'The water cycle is a continuous process that circulates water throughout the Earth''s atmosphere, land, and oceans. Understanding this process is crucial for comprehending weather patterns and environmental systems.',
    'The text boxes below have been placed in a random order. Restore the original order by dragging the text boxes to the correct positions.',
    3,
    150,
    true,
    NOW(),
    NOW()
),
(
    'pte-reading-reorder-photosynthesis',
    'pte-reading-reorder-paragraphs',
    'Photosynthesis Process',
    'Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen. This process is essential for life on Earth as it produces the oxygen we breathe and forms the base of most food chains.',
    'The text boxes below have been placed in a random order. Restore the original order by dragging the text boxes to the correct positions.',
    4,
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

-- Add question options for Multiple Choice (Single Answer) - Climate Change
INSERT INTO public.question_options (
    id,
    question_id,
    option_text,
    is_correct,
    display_order
) VALUES 
(
    gen_random_uuid(),
    'pte-reading-mcq-single-climate-change',
    'Natural climate variations are the primary cause of recent climate change',
    false,
    1
),
(
    gen_random_uuid(),
    'pte-reading-mcq-single-climate-change',
    'Human activities, particularly burning fossil fuels, are the main cause of recent climate change',
    true,
    2
),
(
    gen_random_uuid(),
    'pte-reading-mcq-single-climate-change',
    'Solar radiation changes are responsible for current climate change',
    false,
    3
),
(
    gen_random_uuid(),
    'pte-reading-mcq-single-climate-change',
    'Volcanic activity is the leading cause of global warming',
    false,
    4
)
ON CONFLICT (id) DO NOTHING;

-- Add question options for Multiple Choice (Single Answer) - Technology Education
INSERT INTO public.question_options (
    id,
    question_id,
    option_text,
    is_correct,
    display_order
) VALUES 
(
    gen_random_uuid(),
    'pte-reading-mcq-single-technology-education',
    'Technology has only positive effects on education',
    false,
    1
),
(
    gen_random_uuid(),
    'pte-reading-mcq-single-technology-education',
    'Technology integration presents both opportunities and challenges in education',
    true,
    2
),
(
    gen_random_uuid(),
    'pte-reading-mcq-single-technology-education',
    'Teachers do not need to adapt their methods when using technology',
    false,
    3
),
(
    gen_random_uuid(),
    'pte-reading-mcq-single-technology-education',
    'All students have equal access to educational technology',
    false,
    4
)
ON CONFLICT (id) DO NOTHING;

-- Add question options for Multiple Choice (Multiple Answers) - Renewable Energy
INSERT INTO public.question_options (
    id,
    question_id,
    option_text,
    is_correct,
    display_order
) VALUES 
(
    gen_random_uuid(),
    'pte-reading-mcq-multiple-renewable-energy',
    'Solar power uses photovoltaic cells to harness energy from the sun',
    true,
    1
),
(
    gen_random_uuid(),
    'pte-reading-mcq-multiple-renewable-energy',
    'Wind power converts wind energy into electricity using turbines',
    true,
    2
),
(
    gen_random_uuid(),
    'pte-reading-mcq-multiple-renewable-energy',
    'Renewable energy sources increase greenhouse gas emissions',
    false,
    3
),
(
    gen_random_uuid(),
    'pte-reading-mcq-multiple-renewable-energy',
    'Geothermal energy taps into the Earth''s internal heat',
    true,
    4
),
(
    gen_random_uuid(),
    'pte-reading-mcq-multiple-renewable-energy',
    'Hydroelectric power generates electricity from flowing water',
    true,
    5
)
ON CONFLICT (id) DO NOTHING;

-- Add question options for Reorder Paragraphs - Water Cycle
INSERT INTO public.question_options (
    id,
    question_id,
    option_text,
    is_correct,
    display_order
) VALUES 
(
    gen_random_uuid(),
    'pte-reading-reorder-water-cycle',
    'Water evaporates from oceans, lakes, and rivers due to solar energy, forming water vapor that rises into the atmosphere.',
    false,
    1
),
(
    gen_random_uuid(),
    'pte-reading-reorder-water-cycle',
    'As water vapor rises higher into the atmosphere, it cools and condenses around tiny particles to form clouds.',
    false,
    2
),
(
    gen_random_uuid(),
    'pte-reading-reorder-water-cycle',
    'When clouds become saturated with water droplets, precipitation occurs in the form of rain, snow, or hail.',
    false,
    3
),
(
    gen_random_uuid(),
    'pte-reading-reorder-water-cycle',
    'The precipitated water flows back to oceans and other water bodies through rivers and streams, completing the cycle.',
    false,
    4
)
ON CONFLICT (id) DO NOTHING;

-- Add question options for Reorder Paragraphs - Photosynthesis
INSERT INTO public.question_options (
    id,
    question_id,
    option_text,
    is_correct,
    display_order
) VALUES 
(
    gen_random_uuid(),
    'pte-reading-reorder-photosynthesis',
    'Plants absorb sunlight through their leaves using chlorophyll, a green pigment that captures light energy.',
    false,
    1
),
(
    gen_random_uuid(),
    'pte-reading-reorder-photosynthesis',
    'Carbon dioxide from the air enters the plant through small pores called stomata, primarily located on the underside of leaves.',
    false,
    2
),
(
    gen_random_uuid(),
    'pte-reading-reorder-photosynthesis',
    'Water absorbed by the roots travels up through the stem to the leaves, providing the necessary raw material for the process.',
    false,
    3
),
(
    gen_random_uuid(),
    'pte-reading-reorder-photosynthesis',
    'Using the captured light energy, plants combine carbon dioxide and water to produce glucose (sugar) and release oxygen as a byproduct.',
    false,
    4
)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON public.question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_question_options_display_order ON public.question_options(display_order);
CREATE INDEX IF NOT EXISTS idx_questions_question_type_id_active ON public.questions(question_type_id, is_active);