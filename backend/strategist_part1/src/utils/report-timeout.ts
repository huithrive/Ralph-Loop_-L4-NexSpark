/**
 * Report timeout utilities
 */

import { createLogger } from './logger';

const log = createLogger({ context: '[TimeoutCheck]' });

/**
 * Check if report has exceeded generation timeout
 * @returns true if report should be marked as failed due to timeout
 */
export function isReportTimedOut(
  report: {
    status: string;
    generation_started_at: string | null;
    created_at?: string | null;
  },
  timeoutMs: number
): boolean {
  // Check reports in GENERATING or PENDING status
  if (report.status !== 'GENERATING' && report.status !== 'PENDING') {
    return false;
  }

  // Use generation_started_at if available, fallback to created_at for old reports
  const timestamp = report.generation_started_at || report.created_at;

  if (!timestamp) {
    log.warn(`Report in ${report.status} status but no timestamp available`);
    return false;
  }

  const startTime = new Date(timestamp).getTime();
  const now = Date.now();
  const elapsed = now - startTime;

  if (elapsed > timeoutMs) {
    log.info(`Report timed out`, {
      elapsed: `${Math.floor(elapsed / 60000)} minutes`,
      timeout: `${timeoutMs / 60000} minutes`,
      usedFallback: !report.generation_started_at
    });
    return true;
  }

  return false;
}
