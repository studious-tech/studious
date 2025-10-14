-- PTE Reading Test Questions
-- Execute this in your Supabase SQL editor to create sample questions

-- First ensure we have the question types (run fix-pte-reading-question-types.sql first)

-- Sample Multiple Choice Single Answer Question
INSERT INTO public.questions (
    id,
    title,
    content,
    instructions,
    difficulty_level,
    expected_duration_seconds,
    question_type_id,
    created_at,
    updated_at
) VALUES (
    'pte-reading-mcq-single-1',
    'Climate Change Impact',
    '<p>Climate change is one of the most pressing issues of our time. Rising global temperatures have led to melting ice caps, rising sea levels, and extreme weather events. Scientists agree that human activities, particularly the burning of fossil fuels, are the primary cause of recent climate change.</p><p>The effects of climate change are already visible around the world. Arctic ice is melting at an unprecedented rate, causing polar bears to lose their natural habitat. Coastal cities are experiencing more frequent flooding due to rising sea levels. Additionally, extreme weather events such as hurricanes, droughts, and heatwaves are becoming more intense and frequent.</p>',
    'Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.',
    2,
    90,
    (SELECT id FROM public.question_types WHERE name = 'multiple_choice_single' AND section_id = 'pte-reading'),
    NOW(),
    NOW()
);

-- Options for Multiple Choice Single Answer
INSERT INTO public.question_options (id, question_id, text, is_correct, display_order) VALUES
('pte-mcq-s1-opt1', 'pte-reading-mcq-single-1', 'Climate change is primarily caused by natural factors', false, 1),
('pte-mcq-s1-opt2', 'pte-reading-mcq-single-1', 'Human activities, especially burning fossil fuels, are the main cause of recent climate change', true, 2),
('pte-mcq-s1-opt3', 'pte-reading-mcq-single-1', 'Climate change effects are not yet visible in the real world', false, 3),
('pte-mcq-s1-opt4', 'pte-reading-mcq-single-1', 'Arctic ice is increasing due to climate change', false, 4);

-- Sample Multiple Choice Multiple Answers Question
INSERT INTO public.questions (
    id,
    title,
    content,
    instructions,
    difficulty_level,
    expected_duration_seconds,
    question_type_id,
    created_at,
    updated_at
) VALUES (
    'pte-reading-mcq-multiple-1',
    'Renewable Energy Sources',
    '<p>Renewable energy sources are becoming increasingly important as the world seeks to reduce its dependence on fossil fuels. Solar power harnesses energy from the sun using photovoltaic cells or solar thermal systems. Wind power uses turbines to convert wind energy into electricity. Hydroelectric power generates electricity from flowing water, typically through dams.</p><p>These renewable sources offer several advantages: they produce little to no greenhouse gas emissions during operation, they are inexhaustible unlike fossil fuels, and they can provide energy security by reducing dependence on imported fuels. However, they also face challenges such as intermittency issues and higher initial installation costs.</p>',
    'Read the text and answer the multiple-choice question by selecting all correct responses. More than one response is correct.',
    3,
    120,
    (SELECT id FROM public.question_types WHERE name = 'multiple_choice_multiple' AND section_id = 'pte-reading'),
    NOW(),
    NOW()
);

-- Options for Multiple Choice Multiple Answers
INSERT INTO public.question_options (id, question_id, text, is_correct, display_order) VALUES
('pte-mcq-m1-opt1', 'pte-reading-mcq-multiple-1', 'Solar power uses photovoltaic cells to generate electricity', true, 1),
('pte-mcq-m1-opt2', 'pte-reading-mcq-multiple-1', 'Renewable energy sources produce significant greenhouse gas emissions', false, 2),
('pte-mcq-m1-opt3', 'pte-reading-mcq-multiple-1', 'Wind turbines convert wind energy into electricity', true, 3),
('pte-mcq-m1-opt4', 'pte-reading-mcq-multiple-1', 'Hydroelectric power is generated from flowing water', true, 4),
('pte-mcq-m1-opt5', 'pte-reading-mcq-multiple-1', 'Renewable energy sources are exhaustible like fossil fuels', false, 5);

-- Sample Reorder Paragraphs Question
INSERT INTO public.questions (
    id,
    title,
    content,
    instructions,
    difficulty_level,
    expected_duration_seconds,
    question_type_id,
    created_at,
    updated_at
) VALUES (
    'pte-reading-reorder-1',
    'The History of the Internet',
    '<p>The following paragraphs describe the development of the internet. They have been presented in random order. Restore the original order by dragging the text boxes to the correct positions.</p>',
    'The text boxes have been placed in a random order. Restore the original order by dragging the text boxes to the correct positions.',
    3,
    180,
    (SELECT id FROM public.question_types WHERE name = 'reorder_paragraphs' AND section_id = 'pte-reading'),
    NOW(),
    NOW()
);

-- Paragraphs for Reorder (stored as options with display_order indicating correct sequence)
INSERT INTO public.question_options (id, question_id, text, is_correct, display_order) VALUES
('pte-reorder-1-p1', 'pte-reading-reorder-1', 'In the 1960s, the U.S. Department of Defense began developing ARPANET, a network designed to allow computers to communicate with each other even if some parts of the network were damaged.', true, 1),
('pte-reorder-1-p2', 'pte-reading-reorder-1', 'The first successful message was sent over ARPANET in 1969 between UCLA and Stanford Research Institute, marking the birth of what would become the internet.', true, 2),
('pte-reorder-1-p3', 'pte-reading-reorder-1', 'Throughout the 1970s and 1980s, the network expanded to include universities and research institutions, and new protocols like TCP/IP were developed to standardize communication.', true, 3),
('pte-reorder-1-p4', 'pte-reading-reorder-1', 'In 1989, Tim Berners-Lee invented the World Wide Web while working at CERN, creating the first web browser and web server, which made the internet accessible to the general public.', true, 4),
('pte-reorder-1-p5', 'pte-reading-reorder-1', 'By the 1990s, commercial internet service providers emerged, and the internet rapidly expanded from a research tool to a global communication and commerce platform used by millions of people worldwide.', true, 5);

-- Fill in the Blanks questions are not implemented yet

-- Verify the questions were created
SELECT 
    q.id,
    q.title,
    qt.display_name as question_type,
    qt.ui_component,
    COUNT(qo.id) as option_count
FROM public.questions q
JOIN public.question_types qt ON q.question_type_id = qt.id
LEFT JOIN public.question_options qo ON q.id = qo.question_id
WHERE qt.section_id = 'pte-reading'
GROUP BY q.id, q.title, qt.display_name, qt.ui_component
ORDER BY q.created_at;