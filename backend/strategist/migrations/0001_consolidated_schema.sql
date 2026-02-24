-- Consolidated Schema for NexSpark Interview System
-- Created: 2026-01-24
-- Purpose: Complete database schema with all features
--
-- Features:
-- - User authentication (email, Google, Apple, Microsoft)
-- - Interview versioning system
-- - Preview-first workflow
-- - Report generation with version history
-- - Payment tracking
-- - Audit logging

-- ============================================
-- Users & Authentication
-- ============================================

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  picture TEXT,
  type TEXT NOT NULL DEFAULT 'brand',
  email_verified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auth_providers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_user_id TEXT,
  password_hash TEXT,
  email TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT 0,
  verified BOOLEAN DEFAULT 0,
  last_used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(provider, provider_user_id),
  UNIQUE(provider, email)
);

CREATE INDEX idx_auth_providers_user ON auth_providers(user_id);
CREATE INDEX idx_auth_providers_provider ON auth_providers(provider);
CREATE INDEX idx_auth_providers_email ON auth_providers(email);
CREATE INDEX idx_auth_providers_provider_user ON auth_providers(provider, provider_user_id);

-- ============================================
-- Interviews
-- ============================================

CREATE TABLE interviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,

  -- Status tracking
  -- Values: PREVIEW | CREATED | PAID | IN_PROGRESS | COMPLETED
  status TEXT NOT NULL DEFAULT 'CREATED',

  -- Versioning
  version INTEGER DEFAULT 1,
  is_latest BOOLEAN DEFAULT 1,

  -- Payment
  paid BOOLEAN DEFAULT 0,
  payment_id TEXT,

  -- Progress
  current_question INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 6,

  -- Preview workflow
  preview_url TEXT,

  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_interviews_user_latest ON interviews(user_id, is_latest, created_at DESC);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_payment ON interviews(payment_id);

-- ============================================
-- Interview Responses
-- ============================================

CREATE TABLE interview_responses (
  id TEXT PRIMARY KEY,
  interview_id TEXT NOT NULL,

  -- Question data
  question_number INTEGER NOT NULL,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer TEXT NOT NULL,

  -- Versioning
  version INTEGER DEFAULT 1,
  is_latest BOOLEAN DEFAULT 1,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
);

CREATE INDEX idx_responses_interview ON interview_responses(interview_id, version);
CREATE INDEX idx_responses_latest ON interview_responses(interview_id, is_latest);
CREATE UNIQUE INDEX idx_responses_unique ON interview_responses(interview_id, question_number, version);

-- ============================================
-- Reports
-- ============================================

CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  interview_id TEXT NOT NULL,
  user_id TEXT NOT NULL,

  -- Status tracking
  -- Values: PREVIEW | PENDING | GENERATING | COMPLETED | FAILED
  status TEXT NOT NULL DEFAULT 'PENDING',
  progress INTEGER DEFAULT 0,
  error TEXT,

  -- Versioning
  version INTEGER DEFAULT 1,
  is_latest BOOLEAN DEFAULT 1,

  -- Generation Data
  business_profile TEXT,
  research_data TEXT,
  gtm_strategy TEXT,
  html_report TEXT,

  -- Preview workflow
  -- Stores JSON: { competitors: [...], roadmap: {...}, benchmarks: {...} }
  preview_data TEXT,

  -- Metadata
  report_format TEXT DEFAULT 'legacy',
  recommended_channel TEXT,
  brand_name TEXT,

  -- Flags
  needs_regeneration BOOLEAN DEFAULT 0,

  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  generation_started_at DATETIME,
  generation_completed_at DATETIME,

  FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_reports_interview ON reports(interview_id, is_latest);
CREATE INDEX idx_reports_user_latest ON reports(user_id, is_latest, created_at DESC);
CREATE INDEX idx_reports_status ON reports(status);

-- ============================================
-- Payments
-- ============================================

CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  interview_id TEXT NOT NULL,
  payment_intent_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_interview_id ON payments(interview_id);
CREATE INDEX idx_payments_intent_id ON payments(payment_intent_id);

-- ============================================
-- Audit Log
-- ============================================

CREATE TABLE generation_events (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  from_state TEXT,
  to_state TEXT,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

CREATE INDEX idx_events_report ON generation_events(report_id, created_at DESC);
CREATE INDEX idx_events_type ON generation_events(event_type, created_at DESC);