-- Fix UI component mappings for question types
-- This ensures proper UI component loading in the test session interface

-- Update PTE Speaking question types
UPDATE public.question_types
SET ui_component = 'pte-speaking-read-aloud'
WHERE name = 'read_aloud' AND section_id IN (
  SELECT id FROM public.sections
  WHERE exam_id = 'pte-academic' AND name = 'speaking'
);

UPDATE public.question_types
SET ui_component = 'pte-speaking-repeat-sentence'
WHERE name = 'repeat_sentence' AND section_id IN (
  SELECT id FROM public.sections
  WHERE exam_id = 'pte-academic' AND name = 'speaking'
);

UPDATE public.question_types
SET ui_component = 'pte-speaking-describe-image'
WHERE name = 'describe_image' AND section_id IN (
  SELECT id FROM public.sections
  WHERE exam_id = 'pte-academic' AND name = 'speaking'
);

UPDATE public.question_types
SET ui_component = 'pte-speaking-answer-short-question'
WHERE name = 'answer_short_question' AND section_id IN (
  SELECT id FROM public.sections
  WHERE exam_id = 'pte-academic' AND name = 'speaking'
);

-- Update PTE Reading question types
UPDATE public.question_types
SET ui_component = 'pte-reading-mcq'
WHERE name = 'multiple_choice' AND section_id IN (
  SELECT id FROM public.sections
  WHERE exam_id = 'pte-academic' AND name = 'reading'
);

-- Update PTE Writing question types
UPDATE public.question_types
SET ui_component = 'pte-writing-summarize-written-text'
WHERE name = 'summarize_written_text' AND section_id IN (
  SELECT id FROM public.sections
  WHERE exam_id = 'pte-academic' AND name = 'writing'
);

-- Update IELTS Reading question types
UPDATE public.question_types
SET ui_component = 'ielts-reading-mcq'
WHERE name = 'multiple_choice' AND section_id IN (
  SELECT id FROM public.sections
  WHERE exam_id = 'ielts-academic' AND name = 'reading'
);

-- Update IELTS Speaking question types
UPDATE public.question_types
SET ui_component = 'ielts-speaking-part-1'
WHERE name = 'part_1' AND section_id IN (
  SELECT id FROM public.sections
  WHERE exam_id = 'ielts-academic' AND name = 'speaking'
);

UPDATE public.question_types
SET ui_component = 'ielts-speaking-part-2'
WHERE name = 'part_2' AND section_id IN (
  SELECT id FROM public.sections
  WHERE exam_id = 'ielts-academic' AND name = 'speaking'
);

-- Update IELTS Writing question types
UPDATE public.question_types
SET ui_component = 'ielts-writing-task-1'
WHERE name = 'task_1' AND section_id IN (
  SELECT id FROM public.sections
  WHERE exam_id = 'ielts-academic' AND name = 'writing'
);

UPDATE public.question_types
SET ui_component = 'ielts-writing-task-2'
WHERE name = 'task_2' AND section_id IN (
  SELECT id FROM public.sections
  WHERE exam_id = 'ielts-academic' AND name = 'writing'
);

-- Update IELTS Listening question types
UPDATE public.question_types
SET ui_component = 'ielts-listening-form-completion'
WHERE name = 'form_completion' AND section_id IN (
  SELECT id FROM public.sections
  WHERE exam_id = 'ielts-academic' AND name = 'listening'
);

-- Fallback to generic components for unmapped question types
UPDATE public.question_types
SET ui_component = 'generic-mcq'
WHERE ui_component IS NULL
AND (input_type = 'single_choice' OR input_type = 'multiple_choice');

UPDATE public.question_types
SET ui_component = 'generic-text-response'
WHERE ui_component IS NULL
AND (response_type = 'text' OR response_type = 'long_text');

UPDATE public.question_types
SET ui_component = 'generic-speaking'
WHERE ui_component IS NULL
AND response_type = 'audio';

-- Display results
SELECT
  q.name as question_type_name,
  q.ui_component,
  s.name as section_name,
  e.name as exam_name
FROM public.question_types q
JOIN public.sections s ON q.section_id = s.id
JOIN public.exams e ON s.exam_id = e.id
ORDER BY e.name, s.name, q.name;