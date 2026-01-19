-- Report Generation System Schema
-- Supports: resume functionality, state tracking, report storage

-- Report generations table (state machine for generation progress)
CREATE TABLE IF NOT EXISTS report_generations (
  id TEXT PRIMARY KEY,
  interview_id TEXT NOT NULL,
  user_id TEXT NOT NULL,

  -- State machine
  current_state TEXT NOT NULL DEFAULT 'NOT_STARTED',
  -- States: NOT_STARTED | ANALYZING | PROFILE_REVIEW | RESEARCHING | PREVIEW_READY | PAYMENT_REQUIRED | GENERATING_STRATEGY | COMPLETE | FAILED
  progress_percent INTEGER DEFAULT 0,

  -- Step data (JSON strings)
  step_1_analysis TEXT,               -- Business profile extraction
  step_2_research TEXT,               -- Competitor research data
  step_3_payment_intent TEXT,         -- Stripe payment intent ID
  step_4_strategy TEXT,               -- GTM strategy data

  -- Payment tracking
  paid BOOLEAN DEFAULT 0,
  payment_id TEXT,
  report_id TEXT,                     -- Links to strategy_reports when complete

  -- Error tracking
  failed_at_step INTEGER,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timestamps
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,

  FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (report_id) REFERENCES strategy_reports(id)
);

CREATE INDEX IF NOT EXISTS idx_generations_user ON report_generations(user_id, last_updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_interview ON report_generations(interview_id);
CREATE INDEX IF NOT EXISTS idx_generations_state ON report_generations(current_state);
CREATE INDEX IF NOT EXISTS idx_generations_incomplete ON report_generations(user_id, current_state) WHERE current_state != 'COMPLETE';

-- Update strategy_reports table to support versioning and brand name
ALTER TABLE strategy_reports ADD COLUMN brand_name TEXT;
ALTER TABLE strategy_reports ADD COLUMN generation_id TEXT REFERENCES report_generations(id);
ALTER TABLE strategy_reports ADD COLUMN version INTEGER DEFAULT 1;
ALTER TABLE strategy_reports ADD COLUMN is_latest BOOLEAN DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_reports_user_latest ON strategy_reports(user_id, is_latest, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_interview_version ON strategy_reports(interview_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_reports_generation ON strategy_reports(generation_id);

-- Generation events table (audit log)
CREATE TABLE IF NOT EXISTS generation_events (
  id TEXT PRIMARY KEY,
  generation_id TEXT NOT NULL,
  event_type TEXT NOT NULL,           -- STATE_CHANGE | ERROR | API_CALL | RESUME | PAYMENT
  from_state TEXT,
  to_state TEXT,
  details TEXT,                       -- JSON with event-specific details
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (generation_id) REFERENCES report_generations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_events_generation ON generation_events(generation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON generation_events(event_type, created_at DESC);
