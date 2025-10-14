-- Add UI component mapping for Re-tell Lecture question type
-- This handles both naming variations that might exist

-- Update for the existing retell_lecture name pattern
UPDATE public.question_types
SET ui_component = 'pte-speaking-re-tell-lecture'
WHERE name = 'retell_lecture' AND ui_component IS NULL;

-- Update for the new re_tell_lecture name pattern
UPDATE public.question_types
SET ui_component = 'pte-speaking-re-tell-lecture'
WHERE name = 're_tell_lecture' AND ui_component IS NULL;

-- Update by ID pattern for existing pte-retell-lecture
UPDATE public.question_types
SET ui_component = 'pte-speaking-re-tell-lecture'
WHERE id = 'pte-retell-lecture' AND ui_component IS NULL;

-- Update by ID pattern for new pte-re-tell-lecture
UPDATE public.question_types
SET ui_component = 'pte-speaking-re-tell-lecture'
WHERE id = 'pte-re-tell-lecture' AND ui_component IS NULL;

-- Verification query to check the update
SELECT
  id,
  name,
  display_name,
  ui_component
FROM public.question_types
WHERE name IN ('retell_lecture', 're_tell_lecture')
   OR id IN ('pte-retell-lecture', 'pte-re-tell-lecture')
   OR display_name LIKE '%Re-tell Lecture%'
ORDER BY id;