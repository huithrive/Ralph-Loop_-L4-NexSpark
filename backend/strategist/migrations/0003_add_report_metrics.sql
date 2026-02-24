-- Migration: Add report generation metrics tracking
-- Purpose: Track API costs, performance, and quality metrics for admin monitoring

-- Cost metrics (Full Report)
ALTER TABLE reports ADD COLUMN total_input_tokens INTEGER DEFAULT 0;
ALTER TABLE reports ADD COLUMN total_output_tokens INTEGER DEFAULT 0;
ALTER TABLE reports ADD COLUMN total_cost_cents INTEGER DEFAULT 0;
ALTER TABLE reports ADD COLUMN model_id TEXT;

-- Cost metrics (Preview)
ALTER TABLE reports ADD COLUMN preview_input_tokens INTEGER DEFAULT 0;
ALTER TABLE reports ADD COLUMN preview_output_tokens INTEGER DEFAULT 0;
ALTER TABLE reports ADD COLUMN preview_cost_cents INTEGER DEFAULT 0;
ALTER TABLE reports ADD COLUMN preview_generated_at DATETIME;

-- Performance metrics
ALTER TABLE reports ADD COLUMN generation_time_seconds REAL;
ALTER TABLE reports ADD COLUMN step_metrics TEXT; -- JSON

-- Quality/Debug metrics
ALTER TABLE reports ADD COLUMN competitors_analyzed_count INTEGER DEFAULT 0;
ALTER TABLE reports ADD COLUMN api_retry_count INTEGER DEFAULT 0;
ALTER TABLE reports ADD COLUMN preview_generated BOOLEAN DEFAULT 0;

-- Create indexes for admin queries
CREATE INDEX idx_reports_cost ON reports(total_cost_cents, created_at);
CREATE INDEX idx_reports_model ON reports(model_id);
CREATE INDEX idx_reports_user_cost ON reports(user_id, total_cost_cents);

-- User-level cost aggregation view
CREATE VIEW user_api_costs AS
SELECT
  r.user_id,
  u.email,
  COUNT(DISTINCT r.id) as total_reports,
  SUM(r.preview_input_tokens + r.preview_output_tokens + r.total_input_tokens + r.total_output_tokens) as total_tokens,
  SUM(r.preview_cost_cents + r.total_cost_cents) as total_cost_cents,
  SUM(CASE WHEN r.preview_generated = 1 THEN 1 ELSE 0 END) as reports_with_preview,
  MIN(r.created_at) as first_report_date,
  MAX(r.created_at) as last_report_date
FROM reports r
JOIN users u ON r.user_id = u.id
WHERE r.status = 'READY'
GROUP BY r.user_id, u.email;
