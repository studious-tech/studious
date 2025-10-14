-- Fix missing updated_at column in test_session_questions table
ALTER TABLE public.test_session_questions
ADD COLUMN updated_at timestamp without time zone DEFAULT now();

-- Add trigger to automatically update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_test_session_questions_updated_at
    BEFORE UPDATE ON public.test_session_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();