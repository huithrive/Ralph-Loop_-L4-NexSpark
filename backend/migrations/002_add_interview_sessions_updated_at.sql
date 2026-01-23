-- 002_add_interview_sessions_updated_at.sql
-- Add missing updated_at column to interview_sessions table

-- Add updated_at column to interview_sessions table
ALTER TABLE interview_sessions
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have the same updated_at as created (started_at)
UPDATE interview_sessions
SET updated_at = started_at
WHERE updated_at IS NULL;

-- Add trigger for updated_at column
CREATE TRIGGER update_interview_sessions_updated_at BEFORE UPDATE ON interview_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();