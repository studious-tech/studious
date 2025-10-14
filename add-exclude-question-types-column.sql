-- Add exclude_question_types column to test_sessions table
-- This column is referenced in the TypeScript interface but missing from the database schema

ALTER TABLE test_sessions
ADD COLUMN exclude_question_types TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add a comment to document the column
COMMENT ON COLUMN test_sessions.exclude_question_types IS 'Array of question type IDs to exclude from the test session';

-- Verification query to check the update
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'test_sessions'
  AND column_name IN ('include_question_types', 'exclude_question_types')
ORDER BY column_name;