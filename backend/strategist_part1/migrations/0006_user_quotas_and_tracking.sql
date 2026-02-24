-- User Quotas and Usage Tracking Migration
-- Purpose: Add quota limits and usage tracking for beta release
-- Requires: Schema must have 'users' table with 'id' and 'interviews' table with 'user_id'

-- Add quota configuration fields (SQLite doesn't support IF NOT EXISTS for ALTER TABLE)
-- We'll handle this by checking if column exists in application layer if needed
-- For now, these will only run once during migration
ALTER TABLE users ADD COLUMN max_interviews INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN max_reports INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN plan_type TEXT DEFAULT 'beta';
ALTER TABLE users ADD COLUMN interviews_created INTEGER DEFAULT 0;

-- Create index for quota queries (idempotent with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_users_plan_type ON users(plan_type);

-- Update existing users to set interviews_created based on current data
-- Only count completed or in-progress interviews
-- Only update rows where interviews_created is still 0 (hasn't been set yet)
UPDATE users SET interviews_created = (
  SELECT COUNT(*) FROM interviews
  WHERE interviews.user_id = users.id
    AND interviews.status IN ('COMPLETED', 'IN_PROGRESS')
)
WHERE interviews_created = 0;
