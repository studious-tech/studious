-- Fix existing PTE Reading question types
-- Execute this in your Supabase SQL editor

-- First, let's see what we have and fix the existing ones
-- Update the existing Re-order Paragraphs question type to have correct settings
UPDATE public.question_types 
SET 
    input_type = 'drag_drop',
    response_type = 'sequence',
    ui_component = 'pte-reading-reorder-paragraphs',
    description = 'The text boxes have been placed in a random order. Restore the original order by dragging the text boxes to the correct positions.',
    updated_at = NOW()
WHERE name = 'reorder_paragraphs' 
AND section_id = 'pte-reading';

-- Update Multiple Choice (Single Answer) to have correct settings
UPDATE public.question_types 
SET 
    input_type = 'single_choice',
    response_type = 'selection',
    ui_component = 'pte-reading-mcq-single',
    description = 'Read the text and answer the multiple-choice question by selecting the correct response. Only one response is correct.',
    updated_at = NOW()
WHERE name = 'multiple_choice_single' 
AND section_id = 'pte-reading';

-- Update Multiple Choice (Multiple Answers) to have correct settings  
UPDATE public.question_types 
SET 
    input_type = 'multiple_choice',
    response_type = 'selection', 
    ui_component = 'pte-reading-mcq-multiple',
    description = 'Read the text and answer the multiple-choice question by selecting all correct responses. More than one response is correct.',
    updated_at = NOW()
WHERE name = 'multiple_choice_multiple' 
AND section_id = 'pte-reading';

-- Reading: Fill in the Blanks is not implemented yet, so we skip it

-- Ensure PTE Reading section exists with correct details
INSERT INTO public.sections (id, exam_id, name, display_name, description, duration_minutes, order_index) VALUES
('pte-reading', 'pte-academic', 'reading', 'Reading', 'Reading section with multiple choice and reorder paragraph tasks', 32, 1)
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    duration_minutes = EXCLUDED.duration_minutes;

-- Ensure PTE Academic exam exists
INSERT INTO public.exams (id, name, display_name, description, duration_minutes, total_score) VALUES
('pte-academic', 'pte-academic', 'PTE Academic', 'Pearson Test of English - Academic', 200, 90)
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description;

-- Verify the updates
SELECT 
    id,
    name,
    display_name,
    input_type,
    response_type,
    ui_component,
    order_index,
    description
FROM public.question_types 
WHERE section_id = 'pte-reading'
ORDER BY order_index;