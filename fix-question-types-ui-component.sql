-- Migration script to fix missing ui_component values for question types
-- This script populates the ui_component field for question types based on their names

-- IELTS Reading Question Types
UPDATE public.question_types 
SET ui_component = 'ielts-reading-mcq' 
WHERE name LIKE 'ielts-reading-%' AND ui_component IS NULL;

-- IELTS Listening Question Types
UPDATE public.question_types 
SET ui_component = 'ielts-listening-form-completion' 
WHERE name = 'ielts-listening-form-completion' AND ui_component IS NULL;

UPDATE public.question_types 
SET ui_component = 'ielts-listening-mcq' 
WHERE name = 'ielts-listening-mcq' AND ui_component IS NULL;

-- IELTS Speaking Question Types
UPDATE public.question_types 
SET ui_component = 'ielts-speaking-part-1' 
WHERE name = 'ielts-speaking-part-1' AND ui_component IS NULL;

UPDATE public.question_types 
SET ui_component = 'ielts-speaking-part-2' 
WHERE name = 'ielts-speaking-part-2' AND ui_component IS NULL;

-- IELTS Writing Question Types
UPDATE public.question_types 
SET ui_component = 'ielts-writing-task-1' 
WHERE name = 'ielts-writing-task-1' AND ui_component IS NULL;

UPDATE public.question_types 
SET ui_component = 'ielts-writing-task-2' 
WHERE name = 'ielts-writing-task-2' AND ui_component IS NULL;

-- PTE Reading Question Types
UPDATE public.question_types 
SET ui_component = 'pte-reading-mcq' 
WHERE name LIKE 'pte-reading-%' AND ui_component IS NULL;

-- PTE Listening Question Types
UPDATE public.question_types 
SET ui_component = 'pte-listening-summarize-spoken-text' 
WHERE name = 'pte-listening-summarize-spoken-text' AND ui_component IS NULL;

UPDATE public.question_types 
SET ui_component = 'pte-listening-mcq' 
WHERE name = 'pte-listening-mcq' AND ui_component IS NULL;

UPDATE public.question_types 
SET ui_component = 'pte-listening-fill-blanks' 
WHERE name = 'pte-listening-fill-blanks' AND ui_component IS NULL;

UPDATE public.question_types 
SET ui_component = 'pte-listening-highlight-correct-summary' 
WHERE name = 'pte-listening-highlight-correct-summary' AND ui_component IS NULL;

UPDATE public.question_types 
SET ui_component = 'pte-listening-select-missing-word' 
WHERE name = 'pte-listening-select-missing-word' AND ui_component IS NULL;

UPDATE public.question_types 
SET ui_component = 'pte-listening-highlight-incorrect-words' 
WHERE name = 'pte-listening-highlight-incorrect-words' AND ui_component IS NULL;

UPDATE public.question_types 
SET ui_component = 'pte-listening-write-from-dictation' 
WHERE name = 'pte-listening-write-from-dictation' AND ui_component IS NULL;

-- PTE Speaking Question Types
UPDATE public.question_types 
SET ui_component = 'pte-speaking-read-aloud' 
WHERE name = 'pte-speaking-read-aloud' AND ui_component IS NULL;

UPDATE public.question_types 
SET ui_component = 'pte-speaking-repeat-sentence' 
WHERE name = 'pte-speaking-repeat-sentence' AND ui_component IS NULL;

UPDATE public.question_types 
SET ui_component = 'pte-speaking-describe-image' 
WHERE name = 'pte-speaking-describe-image' AND ui_component IS NULL;

UPDATE public.question_types
SET ui_component = 'pte-speaking-re-tell-lecture'
WHERE name = 'pte-speaking-retell-lecture' AND ui_component IS NULL;

UPDATE public.question_types 
SET ui_component = 'pte-speaking-answer-short-question' 
WHERE name = 'pte-speaking-answer-short-question' AND ui_component IS NULL;

-- PTE Writing Question Types
UPDATE public.question_types 
SET ui_component = 'pte-writing-summarize-written-text' 
WHERE name = 'pte-writing-summarize-written-text' AND ui_component IS NULL;

UPDATE public.question_types 
SET ui_component = 'pte-writing-write-essay' 
WHERE name = 'pte-writing-write-essay' AND ui_component IS NULL;

-- Generic fallback for any remaining question types
UPDATE public.question_types 
SET ui_component = CONCAT('custom-', REPLACE(name, '_', '-'))
WHERE ui_component IS NULL AND name IS NOT NULL;

-- Verification query to check results
SELECT 
  name,
  display_name,
  ui_component,
  CASE 
    WHEN ui_component IS NULL THEN 'MISSING'
    ELSE 'CONFIGURED'
  END as status
FROM public.question_types
ORDER BY name;