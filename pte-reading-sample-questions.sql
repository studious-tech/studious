-- PTE Reading Sample Questions
-- Execute this in your Supabase SQL editor after running fix-pte-reading-question-types.sql

-- ============================================================================
-- MULTIPLE CHOICE SINGLE ANSWER QUESTIONS (3 questions)
-- ============================================================================

-- Question 1: Climate Change
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
    'pte-reading-single-1',
    'Climate Change and Global Warming',
    '<p>Climate change refers to long-term shifts in global temperatures and weather patterns. While climate variations are natural, scientific evidence shows that human activities have been the main driver of climate change since the 1800s. The burning of fossil fuels like coal, oil, and gas produces greenhouse gases that trap heat in Earth''s atmosphere.</p><p>The consequences of climate change include rising sea levels, more frequent extreme weather events, and shifts in precipitation patterns. These changes pose significant risks to ecosystems, agriculture, and human settlements worldwide.</p>',
    'Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.',
    2,
    90,
    (SELECT id FROM public.question_types WHERE name = 'multiple_choice_single' AND section_id = 'pte-reading'),
    NOW(),
    NOW()
);

INSERT INTO public.question_options (question_id, option_text, is_correct, display_order) VALUES
('pte-reading-single-1', 'Climate change is entirely caused by natural factors', false, 1),
('pte-reading-single-1', 'Human activities have been the main driver of climate change since the 1800s', true, 2),
('pte-reading-single-1', 'Climate change only affects weather patterns, not sea levels', false, 3),
('pte-reading-single-1', 'Fossil fuels help reduce greenhouse gases in the atmosphere', false, 4);

-- Question 2: Artificial Intelligence
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
    'pte-reading-single-2',
    'Artificial Intelligence in Healthcare',
    '<p>Artificial Intelligence (AI) is revolutionizing healthcare by enabling faster and more accurate diagnoses. Machine learning algorithms can analyze medical images, such as X-rays and MRIs, to detect diseases that might be missed by human doctors. AI systems can process vast amounts of medical data in seconds, identifying patterns that would take humans hours or days to recognize.</p><p>However, the integration of AI in healthcare also raises concerns about data privacy, the need for human oversight, and the potential for algorithmic bias. Despite these challenges, AI continues to show promise in improving patient outcomes and reducing healthcare costs.</p>',
    'Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.',
    3,
    90,
    (SELECT id FROM public.question_types WHERE name = 'multiple_choice_single' AND section_id = 'pte-reading'),
    NOW(),
    NOW()
);

INSERT INTO public.question_options (question_id, option_text, is_correct, display_order) VALUES
('pte-reading-single-2', 'AI in healthcare only helps with administrative tasks', false, 1),
('pte-reading-single-2', 'Machine learning algorithms can analyze medical images to detect diseases', true, 2),
('pte-reading-single-2', 'AI systems are slower than humans at processing medical data', false, 3),
('pte-reading-single-2', 'There are no concerns about using AI in healthcare', false, 4);

-- Question 3: Ocean Pollution
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
    'pte-reading-single-3',
    'Ocean Plastic Pollution',
    '<p>Ocean plastic pollution has become one of the most pressing environmental issues of our time. Every year, millions of tons of plastic waste enter the oceans, harming marine life and ecosystems. Sea turtles mistake plastic bags for jellyfish, while seabirds feed plastic fragments to their chicks, often with fatal consequences.</p><p>The Great Pacific Garbage Patch, a massive collection of floating plastic debris, demonstrates the scale of this problem. Scientists estimate that by 2050, there could be more plastic than fish in the ocean by weight if current trends continue.</p>',
    'Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.',
    2,
    90,
    (SELECT id FROM public.question_types WHERE name = 'multiple_choice_single' AND section_id = 'pte-reading'),
    NOW(),
    NOW()
);

INSERT INTO public.question_options (question_id, option_text, is_correct, display_order) VALUES
('pte-reading-single-3', 'Ocean plastic pollution only affects large marine animals', false, 1),
('pte-reading-single-3', 'The Great Pacific Garbage Patch is a small, localized problem', false, 2),
('pte-reading-single-3', 'By 2050, there could be more plastic than fish in the ocean by weight', true, 3),
('pte-reading-single-3', 'Sea turtles are not affected by plastic pollution', false, 4);

-- ============================================================================
-- MULTIPLE CHOICE MULTIPLE ANSWERS QUESTIONS (3 questions)
-- ============================================================================

-- Question 1: Renewable Energy
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
    'pte-reading-multiple-1',
    'Renewable Energy Technologies',
    '<p>Renewable energy sources are becoming increasingly important as the world seeks to reduce carbon emissions and combat climate change. Solar power harnesses energy from the sun using photovoltaic panels or solar thermal systems. Wind energy uses turbines to convert wind movement into electricity. Hydroelectric power generates electricity from flowing water through dams or river systems.</p><p>These renewable sources offer several advantages: they produce minimal greenhouse gas emissions during operation, they are inexhaustible unlike fossil fuels, they can reduce dependence on energy imports, and they create jobs in manufacturing and installation. However, they also face challenges such as intermittency and higher initial costs.</p>',
    'Read the text and answer the multiple-choice question by selecting all correct responses. More than one response is correct.',
    3,
    120,
    (SELECT id FROM public.question_types WHERE name = 'multiple_choice_multiple' AND section_id = 'pte-reading'),
    NOW(),
    NOW()
);

INSERT INTO public.question_options (question_id, option_text, is_correct, display_order) VALUES
('pte-reading-multiple-1', 'Solar power uses photovoltaic panels to generate electricity', true, 1),
('pte-reading-multiple-1', 'Renewable energy sources produce significant greenhouse gas emissions', false, 2),
('pte-reading-multiple-1', 'Wind turbines convert wind movement into electricity', true, 3),
('pte-reading-multiple-1', 'Hydroelectric power uses flowing water to generate electricity', true, 4),
('pte-reading-multiple-1', 'Renewable energy sources are exhaustible like fossil fuels', false, 5);

-- Question 2: Urban Planning
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
    'pte-reading-multiple-2',
    'Sustainable Urban Development',
    '<p>Sustainable urban development focuses on creating cities that meet present needs without compromising future generations. Key principles include promoting public transportation to reduce car dependency, creating green spaces and parks to improve air quality and provide recreation, implementing efficient waste management systems, and designing energy-efficient buildings.</p><p>Smart city technologies also play a crucial role, including traffic management systems that optimize flow and reduce congestion, smart grids that efficiently distribute electricity, and digital platforms that improve citizen services. Water conservation through rainwater harvesting and recycling systems is another essential component.</p>',
    'Read the text and answer the multiple-choice question by selecting all correct responses. More than one response is correct.',
    3,
    120,
    (SELECT id FROM public.question_types WHERE name = 'multiple_choice_multiple' AND section_id = 'pte-reading'),
    NOW(),
    NOW()
);

INSERT INTO public.question_options (question_id, option_text, is_correct, display_order) VALUES
('pte-reading-multiple-2', 'Public transportation helps reduce car dependency', true, 1),
('pte-reading-multiple-2', 'Green spaces have no impact on air quality', false, 2),
('pte-reading-multiple-2', 'Smart grids efficiently distribute electricity', true, 3),
('pte-reading-multiple-2', 'Water conservation is not important in urban planning', false, 4),
('pte-reading-multiple-2', 'Traffic management systems can optimize flow and reduce congestion', true, 5);

-- Question 3: Digital Learning
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
    'pte-reading-multiple-3',
    'Digital Learning and Education Technology',
    '<p>Digital learning has transformed education by making it more accessible and flexible. Online courses allow students to learn at their own pace and access materials from anywhere with an internet connection. Interactive multimedia content, including videos, simulations, and virtual reality, enhances engagement and understanding.</p><p>Educational technology also enables personalized learning through adaptive algorithms that adjust content difficulty based on student performance. Collaborative tools facilitate group projects and peer interaction in virtual environments. However, challenges include the digital divide, where not all students have equal access to technology, and the need for digital literacy skills among both students and teachers.</p>',
    'Read the text and answer the multiple-choice question by selecting all correct responses. More than one response is correct.',
    3,
    120,
    (SELECT id FROM public.question_types WHERE name = 'multiple_choice_multiple' AND section_id = 'pte-reading'),
    NOW(),
    NOW()
);

INSERT INTO public.question_options (question_id, option_text, is_correct, display_order) VALUES
('pte-reading-multiple-3', 'Online courses allow students to learn at their own pace', true, 1),
('pte-reading-multiple-3', 'Interactive multimedia content reduces student engagement', false, 2),
('pte-reading-multiple-3', 'Adaptive algorithms can adjust content difficulty based on performance', true, 3),
('pte-reading-multiple-3', 'All students have equal access to digital learning technology', false, 4),
('pte-reading-multiple-3', 'Collaborative tools facilitate group projects in virtual environments', true, 5);

-- ============================================================================
-- REORDER PARAGRAPHS QUESTIONS (3 questions)
-- ============================================================================

-- Question 1: Evolution of Communication
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
    'The Evolution of Human Communication',
    '<p>The following paragraphs describe the evolution of human communication. They have been presented in random order. Restore the original order by dragging the text boxes to the correct positions.</p>',
    'The text boxes have been placed in a random order. Restore the original order by dragging the text boxes to the correct positions.',
    3,
    180,
    (SELECT id FROM public.question_types WHERE name = 'reorder_paragraphs' AND section_id = 'pte-reading'),
    NOW(),
    NOW()
);

INSERT INTO public.question_options (question_id, option_text, is_correct, display_order) VALUES
('pte-reading-reorder-1', 'Early humans developed the first forms of communication through gestures, facial expressions, and basic vocalizations to coordinate hunting and survival activities.', true, 1),
('pte-reading-reorder-1', 'The development of spoken language around 50,000 years ago marked a revolutionary leap, allowing humans to share complex ideas, stories, and cultural knowledge across generations.', true, 2),
('pte-reading-reorder-1', 'Writing systems emerged around 5,000 years ago in ancient civilizations, enabling the permanent recording of information and the development of literature, laws, and historical records.', true, 3),
('pte-reading-reorder-1', 'The invention of the printing press in the 15th century democratized access to information, leading to increased literacy rates and the rapid spread of ideas during the Renaissance and Enlightenment.', true, 4),
('pte-reading-reorder-1', 'Today, digital communication technologies including the internet, social media, and mobile devices have created a globally connected world where information travels instantly across continents.', true, 5);

-- Question 2: Scientific Method
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
    'pte-reading-reorder-2',
    'The Development of the Scientific Method',
    '<p>The following paragraphs describe the development of the scientific method. They have been presented in random order. Restore the original order by dragging the text boxes to the correct positions.</p>',
    'The text boxes have been placed in a random order. Restore the original order by dragging the text boxes to the correct positions.',
    3,
    180,
    (SELECT id FROM public.question_types WHERE name = 'reorder_paragraphs' AND section_id = 'pte-reading'),
    NOW(),
    NOW()
);

INSERT INTO public.question_options (question_id, option_text, is_correct, display_order) VALUES
('pte-reading-reorder-2', 'Ancient Greek philosophers like Aristotle laid the groundwork for systematic observation and logical reasoning, though their methods often relied more on philosophical argument than empirical testing.', true, 1),
('pte-reading-reorder-2', 'During the Islamic Golden Age (8th-13th centuries), scholars like Al-Hazen emphasized the importance of experimentation and mathematical proof, developing early versions of the experimental method.', true, 2),
('pte-reading-reorder-2', 'The Scientific Revolution of the 16th and 17th centuries saw figures like Galileo and Newton establish the modern scientific method, combining observation, hypothesis formation, and controlled experimentation.', true, 3),
('pte-reading-reorder-2', 'Francis Bacon formalized the inductive method in the early 17th century, advocating for systematic data collection and the gradual building of knowledge through repeated observations and experiments.', true, 4),
('pte-reading-reorder-2', 'Modern science continues to refine these methods, incorporating statistical analysis, peer review, and collaborative research to ensure the reliability and validity of scientific discoveries.', true, 5);

-- Question 3: Urbanization Process
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
    'pte-reading-reorder-3',
    'The Process of Global Urbanization',
    '<p>The following paragraphs describe the process of global urbanization. They have been presented in random order. Restore the original order by dragging the text boxes to the correct positions.</p>',
    'The text boxes have been placed in a random order. Restore the original order by dragging the text boxes to the correct positions.',
    3,
    180,
    (SELECT id FROM public.question_types WHERE name = 'reorder_paragraphs' AND section_id = 'pte-reading'),
    NOW(),
    NOW()
);

INSERT INTO public.question_options (question_id, option_text, is_correct, display_order) VALUES
('pte-reading-reorder-3', 'Before the Industrial Revolution, most of the world''s population lived in rural areas, with only about 3% living in cities, primarily engaged in agriculture and small-scale crafts.', true, 1),
('pte-reading-reorder-3', 'The Industrial Revolution of the 18th and 19th centuries triggered massive migration from rural to urban areas as people sought employment in factories and manufacturing centers.', true, 2),
('pte-reading-reorder-3', 'By 1900, urbanization had accelerated in developed countries, with cities growing rapidly to accommodate industrial workers, leading to the development of modern urban infrastructure.', true, 3),
('pte-reading-reorder-3', 'The 20th century saw urbanization spread globally, with developing countries experiencing rapid city growth as people moved from rural areas seeking better economic opportunities and services.', true, 4),
('pte-reading-reorder-3', 'Today, more than half of the world''s population lives in urban areas, and this proportion is expected to reach 68% by 2050, creating both opportunities and challenges for sustainable development.', true, 5);

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Verify all questions were created successfully
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
  AND q.id LIKE 'pte-reading-%'
GROUP BY q.id, q.title, qt.display_name, qt.ui_component
ORDER BY qt.display_name, q.created_at;