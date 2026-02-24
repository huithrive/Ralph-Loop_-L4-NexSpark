/**
 * Agent Report Repository
 * Database operations for agent_reports table
 */

import { generateId } from './base-repository';
import { createLogger } from '../utils/logger';
import type { AgentReportRecord, ThinkingLogEntry } from '../types/gtm-agent-types';

const log = createLogger({ context: '[AgentReportRepo]' });

/**
 * Create new agent report
 */
export async function createAgentReport(
  db: D1Database,
  data: {
    interviewId: string;
    userId: string;
    brandName?: string;
  }
): Promise<{ reportId: string }> {
  try {
    const reportId = generateId('agrep_');

    await db
      .prepare(
        `
      INSERT INTO agent_reports (
        id, interview_id, user_id, status, progress, brand_name, generation_started_at
      )
      VALUES (?, ?, ?, 'PENDING', 0, ?, CURRENT_TIMESTAMP)
    `
      )
      .bind(reportId, data.interviewId, data.userId, data.brandName || null)
      .run();

    log.info('Created agent report', { reportId, interviewId: data.interviewId });

    return { reportId };
  } catch (error) {
    log.error('Error creating agent report', error);
    throw error;
  }
}

/**
 * Update agent report
 */
export async function updateAgentReport(
  db: D1Database,
  reportId: string,
  updates: {
    status?: string;
    progress?: number;
    gtmReport?: object;
    htmlReport?: string;
    error?: string;
    webSearchesCount?: number;
    rapidApiCallsCount?: number;
    toolResults?: object[];
    totalInputTokens?: number;
    totalOutputTokens?: number;
    totalCostCents?: number;
    modelId?: string;
    generationTimeSeconds?: number;
  }
): Promise<{ success: boolean }> {
  try {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);

      if (updates.status === 'GENERATING') {
        fields.push('generation_started_at = CURRENT_TIMESTAMP');
      }
      if (updates.status === 'READY') {
        fields.push('generation_completed_at = CURRENT_TIMESTAMP');
      }
    }
    if (updates.progress !== undefined) {
      fields.push('progress = ?');
      values.push(updates.progress);
    }
    if (updates.gtmReport !== undefined) {
      fields.push('gtm_report = ?');
      values.push(JSON.stringify(updates.gtmReport));
    }
    if (updates.htmlReport !== undefined) {
      fields.push('html_report = ?');
      values.push(updates.htmlReport);
    }
    if (updates.error !== undefined) {
      fields.push('error = ?');
      values.push(updates.error);
    }
    if (updates.webSearchesCount !== undefined) {
      fields.push('web_searches_count = ?');
      values.push(updates.webSearchesCount);
    }
    if (updates.rapidApiCallsCount !== undefined) {
      fields.push('rapidapi_calls_count = ?');
      values.push(updates.rapidApiCallsCount);
    }
    if (updates.toolResults !== undefined) {
      fields.push('tool_results = ?');
      values.push(JSON.stringify(updates.toolResults));
    }
    if (updates.totalInputTokens !== undefined) {
      fields.push('total_input_tokens = ?');
      values.push(updates.totalInputTokens);
    }
    if (updates.totalOutputTokens !== undefined) {
      fields.push('total_output_tokens = ?');
      values.push(updates.totalOutputTokens);
    }
    if (updates.totalCostCents !== undefined) {
      fields.push('total_cost_cents = ?');
      values.push(updates.totalCostCents);
    }
    if (updates.modelId !== undefined) {
      fields.push('model_id = ?');
      values.push(updates.modelId);
    }
    if (updates.generationTimeSeconds !== undefined) {
      fields.push('generation_time_seconds = ?');
      values.push(updates.generationTimeSeconds);
    }

    if (fields.length === 0) {
      return { success: true };
    }

    const query = `
      UPDATE agent_reports
      SET ${fields.join(', ')}
      WHERE id = ?
    `;

    await db.prepare(query).bind(...values, reportId).run();

    log.debug('Updated agent report', { reportId, fields: fields.length });
    return { success: true };
  } catch (error) {
    log.error('Error updating agent report', error);
    throw error;
  }
}

/**
 * Get agent report by ID
 */
export async function getAgentReport(
  db: D1Database,
  reportId: string
): Promise<AgentReportRecord | null> {
  try {
    const result = await db
      .prepare(
        `
      SELECT * FROM agent_reports WHERE id = ?
    `
      )
      .bind(reportId)
      .first();

    return result as AgentReportRecord | null;
  } catch (error) {
    log.error('Error getting agent report', error);
    return null;
  }
}

/**
 * Get latest agent report for interview
 */
export async function getLatestAgentReport(
  db: D1Database,
  interviewId: string
): Promise<AgentReportRecord | null> {
  try {
    const result = await db
      .prepare(
        `
      SELECT * FROM agent_reports
      WHERE interview_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `
      )
      .bind(interviewId)
      .first();

    return result as AgentReportRecord | null;
  } catch (error) {
    log.error('Error getting latest agent report', error);
    return null;
  }
}

/**
 * Get all agent reports for user
 */
export async function getUserAgentReports(
  db: D1Database,
  userId: string,
  limit = 20,
  offset = 0
): Promise<AgentReportRecord[]> {
  try {
    const results = await db
      .prepare(
        `
      SELECT * FROM agent_reports
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `
      )
      .bind(userId, limit, offset)
      .all();

    return (results.results || []) as AgentReportRecord[];
  } catch (error) {
    log.error('Error getting user agent reports', error);
    return [];
  }
}

/**
 * Append entry to thinking log
 */
export async function appendThinkingLog(
  db: D1Database,
  reportId: string,
  entry: ThinkingLogEntry
): Promise<void> {
  try {
    const report = await getAgentReport(db, reportId);
    if (!report) {
      throw new Error(`Report not found: ${reportId}`);
    }

    const existingLog: ThinkingLogEntry[] = report.thinking_log
      ? JSON.parse(report.thinking_log)
      : [];
    existingLog.push(entry);

    await db
      .prepare('UPDATE agent_reports SET thinking_log = ? WHERE id = ?')
      .bind(JSON.stringify(existingLog), reportId)
      .run();

    log.debug('Appended thinking log entry', { reportId, type: entry.type });
  } catch (error) {
    log.error('Error appending thinking log', error);
    throw error;
  }
}

/**
 * Get thinking log for report
 */
export async function getThinkingLog(
  db: D1Database,
  reportId: string
): Promise<ThinkingLogEntry[]> {
  try {
    const report = await getAgentReport(db, reportId);
    if (!report || !report.thinking_log) {
      return [];
    }

    return JSON.parse(report.thinking_log) as ThinkingLogEntry[];
  } catch (error) {
    log.error('Error getting thinking log', error);
    return [];
  }
}

/**
 * Delete agent report
 */
export async function deleteAgentReport(
  db: D1Database,
  reportId: string
): Promise<{ success: boolean }> {
  try {
    await db
      .prepare(
        `
      DELETE FROM agent_reports WHERE id = ?
    `
      )
      .bind(reportId)
      .run();

    log.info('Deleted agent report', { reportId });
    return { success: true };
  } catch (error) {
    log.error('Error deleting agent report', error);
    throw error;
  }
}
