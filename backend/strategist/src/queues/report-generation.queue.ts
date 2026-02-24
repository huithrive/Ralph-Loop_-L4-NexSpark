/**
 * Queue consumer for GTM Agent report generation
 * Routes all messages to the GTM Agent handler
 */

import { handleGTMAgentGeneration } from './gtm-agent-generation.queue';
import { createLogger } from '../utils/logger';

export interface ReportGenerationMessage {
  type?: 'gtm-agent';
  reportId: string;
  interviewId: string;
  userId: string;
}

/**
 * Process report generation queue messages
 * Routes all messages to GTM Agent handler
 */
export async function handleReportGeneration(
  batch: MessageBatch<ReportGenerationMessage>,
  env: any
): Promise<void> {
  const log = createLogger({ context: '[ReportQueue]' });
  log.info('Processing report generation tasks', { count: batch.messages.length });

  for (const message of batch.messages) {
    await handleGTMAgentGeneration(message, env);
  }
}
