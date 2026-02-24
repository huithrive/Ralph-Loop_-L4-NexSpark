-- Agent Reports Thinking Log
-- Created: 2026-01-30
-- Purpose: Add thinking_log column to store real-time AI research process
--
-- Stores timestamped tool calls and results for:
-- - Real-time WebSocket delivery during generation
-- - Persistence for resume capability
-- - Historical analysis of AI research patterns

-- ============================================
-- Add thinking_log column
-- ============================================

ALTER TABLE agent_reports ADD COLUMN thinking_log TEXT;

-- Thinking log structure (JSON array of entries):
-- [
--   {
--     "timestamp": "2026-01-30T12:34:56.789Z",
--     "type": "tool_start" | "tool_result" | "progress" | "thinking",
--     "toolName": "web_search" | "fetch_traffic_data",
--     "input": { "query": "..." } | { "domain": "..." },
--     "output": { "resultCount": 5 } | { "visits": "1.2M" },
--     "message": "...",
--     "progress": 45
--   }
-- ]
