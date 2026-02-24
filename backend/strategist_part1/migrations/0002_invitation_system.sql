-- Invitation System Migration
-- Created: 2026-01-25
-- Purpose: Add invitation-based registration system with admin API key authentication

-- ============================================
-- Invitation Codes Table
-- ============================================

CREATE TABLE invitation_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 1,
  current_uses INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  assigned_email TEXT,
  expires_at DATETIME,
  created_by TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invitation_code ON invitation_codes(code);
CREATE INDEX idx_invitation_active ON invitation_codes(is_active, expires_at);
CREATE INDEX idx_invitation_assigned ON invitation_codes(assigned_email);

-- ============================================
-- Invitation Usage Tracking
-- ============================================

CREATE TABLE invitation_usage (
  id TEXT PRIMARY KEY,
  invitation_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  registration_method TEXT NOT NULL, -- 'google' or 'email'
  email TEXT NOT NULL,
  used_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (invitation_id) REFERENCES invitation_codes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_usage_invitation ON invitation_usage(invitation_id);
CREATE INDEX idx_usage_user ON invitation_usage(user_id);
CREATE INDEX idx_usage_date ON invitation_usage(used_at DESC);

-- ============================================
-- Alter Users Table
-- ============================================

-- Add invitation tracking columns to users table
ALTER TABLE users ADD COLUMN invitation_code TEXT;
ALTER TABLE users ADD COLUMN registered_via TEXT DEFAULT 'legacy';

CREATE INDEX idx_users_registered_via ON users(registered_via);
