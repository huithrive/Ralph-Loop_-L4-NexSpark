-- Migration: Add report format selection support
-- Created: 2026-01-19
-- Purpose: Enable dual-system support for legacy and v2 report formats
--
-- Column descriptions:
-- - report_format: 'legacy' (6-month GTM strategy) or 'v2' (4-week SEM execution plan)
-- - recommended_channel: For v2 format - 'Meta' or 'Google' as recommended primary channel

-- Add report_format column to report_generations table
ALTER TABLE report_generations ADD COLUMN report_format TEXT DEFAULT 'legacy';

-- Add report_format column to strategy_reports table
ALTER TABLE strategy_reports ADD COLUMN report_format TEXT DEFAULT 'legacy';

-- Add recommended_channel column for Sakura reports
ALTER TABLE strategy_reports ADD COLUMN recommended_channel TEXT;

-- Create indexes for efficient querying by format
CREATE INDEX IF NOT EXISTS idx_generations_format ON report_generations(report_format);
CREATE INDEX IF NOT EXISTS idx_reports_format ON strategy_reports(report_format);
