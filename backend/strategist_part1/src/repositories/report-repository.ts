/**
 * Report repository - manages report operations
 * Note: Errors propagate to route layer for centralized handling
 */

import { generateId } from './base-repository';
import { createLogger } from '../utils/logger';

const log = createLogger({ context: '[ReportRepo]' });

/**
 * Create new report (starts generation process)
 */
export async function createReport(
  db: D1Database,
  data: {
    interviewId: string;
    userId: string;
    reportFormat?: string;
    brandName?: string;
  }
) {
  const reportId = generateId('rep_');

  // Get next version for this interview
  const versionResult = await db.prepare(`
    SELECT MAX(version) as max_version
    FROM reports
    WHERE interview_id = ?
  `).bind(data.interviewId).first();

  const version = (versionResult?.max_version || 0) + 1;

  // Mark old reports as not latest
  await db.prepare(`
    UPDATE reports
    SET is_latest = 0
    WHERE interview_id = ?
  `).bind(data.interviewId).run();

  // Create new report
  await db.prepare(`
    INSERT INTO reports (
      id, interview_id, user_id, status, progress,
      version, is_latest, report_format, brand_name, generation_started_at
    )
    VALUES (?, ?, ?, 'PENDING', 0, ?, 1, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    reportId,
    data.interviewId,
    data.userId,
    version,
    data.reportFormat || 'legacy',
    data.brandName || null
  ).run();

  log.info('Created report', { reportId, version, format: data.reportFormat });

  return { success: true, reportId, version };
}

/**
 * Update report progress and data
 */
export async function updateReport(
  db: D1Database,
  reportId: string,
  updates: {
    status?: string;
    progress?: number;
    businessProfile?: any;
    researchData?: any;
    gtmStrategy?: any;
    htmlReport?: string;
    error?: string;
  }
) {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);

    // Update timestamps based on status
    if (updates.status === 'GENERATING' && !fields.includes('generation_started_at')) {
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
  if (updates.businessProfile !== undefined) {
    fields.push('business_profile = ?');
    values.push(JSON.stringify(updates.businessProfile));
  }
  if (updates.researchData !== undefined) {
    fields.push('research_data = ?');
    values.push(JSON.stringify(updates.researchData));
  }
  if (updates.gtmStrategy !== undefined) {
    fields.push('gtm_strategy = ?');
    values.push(JSON.stringify(updates.gtmStrategy));
  }
  if (updates.htmlReport !== undefined) {
    fields.push('html_report = ?');
    values.push(updates.htmlReport);
  }
  if (updates.error !== undefined) {
    fields.push('error = ?');
    values.push(updates.error);
  }

  if (fields.length === 0) {
    return { success: true };
  }

  const query = `
    UPDATE reports
    SET ${fields.join(', ')}
    WHERE id = ?
  `;

  await db.prepare(query).bind(...values, reportId).run();

  return { success: true };
}

/**
 * Get report by ID
 */
export async function getReport(db: D1Database, reportId: string) {
  return await db.prepare(`
    SELECT * FROM reports WHERE id = ?
  `).bind(reportId).first();
}

/**
 * Get latest report for interview
 */
export async function getLatestReport(db: D1Database, interviewId: string) {
  return await db.prepare(`
    SELECT * FROM reports
    WHERE interview_id = ? AND is_latest = 1
    LIMIT 1
  `).bind(interviewId).first();
}

/**
 * Mark report for regeneration
 */
export async function markReportForRegeneration(db: D1Database, reportId: string) {
  await db.prepare(`
    UPDATE reports
    SET needs_regeneration = 1
    WHERE id = ?
  `).bind(reportId).run();

  return { success: true };
}

/**
 * Delete report
 */
export async function deleteReport(db: D1Database, reportId: string) {
  await db.prepare(`
    DELETE FROM reports WHERE id = ?
  `).bind(reportId).run();

  return { success: true };
}

/**
 * Log generation event
 * Note: This is an exception - we catch errors here because logging
 * failure should not break report generation
 */
export async function logGenerationEvent(
  db: D1Database,
  reportId: string,
  eventType: string,
  fromState: string | null,
  toState: string | null,
  details: any = {}
) {
  try {
    const eventId = generateId('evt_');

    await db.prepare(`
      INSERT INTO generation_events (
        id, report_id, event_type, from_state, to_state, details
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      eventId,
      reportId,
      eventType,
      fromState,
      toState,
      JSON.stringify(details)
    ).run();

    return { success: true };
  } catch (error) {
    log.error('Error logging event', error);
    // Don't throw - logging failure shouldn't break generation
    return { success: false };
  }
}

/**
 * Save preview data to report
 * Stores preview JSON (competitors, roadmap, benchmarks) to reports.preview_data
 */
export async function savePreviewData(
  db: D1Database,
  reportId: string,
  previewData: {
    competitors?: any[];
    roadmap?: any;
    benchmarks?: any;
  }
) {
  await db.prepare(`
    UPDATE reports
    SET preview_data = ?, progress = 100
    WHERE id = ?
  `).bind(
    JSON.stringify(previewData),
    reportId
  ).run();

  log.info('Saved preview data to report', { reportId });

  return { success: true };
}

/**
 * Mark preview as generated
 * Sets preview_generated flag and timestamp
 */
export async function markPreviewGenerated(
  db: D1Database,
  reportId: string
): Promise<{ success: boolean }> {
  await db.prepare(`
    UPDATE reports
    SET preview_generated = 1,
        preview_generated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(reportId).run();

  log.info('Marked preview as generated', { reportId });
  return { success: true };
}
