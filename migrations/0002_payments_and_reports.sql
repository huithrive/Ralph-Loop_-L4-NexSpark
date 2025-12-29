-- Add payments table for Stripe payment tracking
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  interview_id TEXT NOT NULL,
  payment_intent_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_interview_id ON payments(interview_id);
CREATE INDEX IF NOT EXISTS idx_payments_intent_id ON payments(payment_intent_id);

-- Add strategy reports table to store generated reports
CREATE TABLE IF NOT EXISTS strategy_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  interview_id TEXT NOT NULL,
  business_profile TEXT NOT NULL,
  gtm_strategy TEXT NOT NULL,
  html_report TEXT NOT NULL,
  paid BOOLEAN NOT NULL DEFAULT 0,
  payment_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON strategy_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_interview_id ON strategy_reports(interview_id);
CREATE INDEX IF NOT EXISTS idx_reports_paid ON strategy_reports(paid);
