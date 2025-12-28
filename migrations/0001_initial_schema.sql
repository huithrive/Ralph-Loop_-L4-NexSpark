-- Initial schema for NexSpark interview system
-- Creates tables for interviews and responses with version tracking

-- Users table (basic info)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'brand' or 'agency'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Interviews table (one record per interview session)
CREATE TABLE IF NOT EXISTS interviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  version TEXT NOT NULL, -- e.g., 'v1.0', 'v2.0', 'v3.0'
  current_question INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 10,
  completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Interview responses table (one record per question answer)
CREATE TABLE IF NOT EXISTS interview_responses (
  id TEXT PRIMARY KEY,
  interview_id TEXT NOT NULL,
  question_id TEXT NOT NULL, -- e.g., 'q1', 'q2', etc.
  question_number INTEGER NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
);

-- Interview analysis table (GPT-4 generated analysis)
CREATE TABLE IF NOT EXISTS interview_analysis (
  id TEXT PRIMARY KEY,
  interview_id TEXT NOT NULL,
  brand_profile TEXT, -- JSON string
  recommendations TEXT, -- JSON string
  next_steps TEXT, -- JSON string
  full_analysis TEXT, -- Complete analysis text
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_interviews_user_created ON interviews(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interviews_user_completed ON interviews(user_id, completed, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_responses_interview ON interview_responses(interview_id, question_number);
CREATE INDEX IF NOT EXISTS idx_analysis_interview ON interview_analysis(interview_id);

-- View for interview history (with response count)
CREATE VIEW IF NOT EXISTS interview_history AS
SELECT 
  i.id,
  i.user_id,
  i.version,
  i.current_question,
  i.total_questions,
  i.completed,
  i.created_at,
  i.updated_at,
  i.completed_at,
  COUNT(DISTINCT r.id) as response_count,
  CASE 
    WHEN ia.id IS NOT NULL THEN 1 
    ELSE 0 
  END as has_analysis
FROM interviews i
LEFT JOIN interview_responses r ON i.id = r.interview_id
LEFT JOIN interview_analysis ia ON i.id = ia.interview_id
GROUP BY i.id, i.user_id, i.version, i.current_question, i.total_questions, 
         i.completed, i.created_at, i.updated_at, i.completed_at, ia.id;
