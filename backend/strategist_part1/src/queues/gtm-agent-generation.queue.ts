/**
 * Queue handler for GTM Agent report generation
 * Handles long-running AI agent tasks with tool use
 */

import { getInterview } from '../services/database';
import {
  getAgentReport,
  updateAgentReport,
} from '../repositories/agent-report-repository';
import {
  generateGTMAgentReport,
  extractBusinessProfile,
} from '../services/gtm-agent/gtm-report-agent';
import { createLogger } from '../utils/logger';
import type { WebSocketMessage } from '../types/gtm-agent-types';
import type { ReportGenerationMessage } from './report-generation.queue';

/**
 * Handle GTM agent report generation from queue
 */
export async function handleGTMAgentGeneration(
  message: Message<ReportGenerationMessage>,
  env: any
): Promise<void> {
  const { reportId, interviewId, userId } = message.body;
  const log = createLogger({ context: '[GTMAgentQueue]', reportId });

  log.info('=== GTM AGENT WORKER STARTED ===', { reportId, interviewId });
  const startTime = Date.now();

  try {
    // Get interview data
    const interview = await getInterview(env.DB, interviewId);
    if (!interview) {
      throw new Error(`Interview ${interviewId} not found`);
    }

    // Setup WebSocket broadcast function
    const wsBroadcast = async (wsMessage: WebSocketMessage) => {
      try {
        const doId = env.REPORT_COORDINATOR.idFromName(reportId);
        const doStub = env.REPORT_COORDINATOR.get(doId);
        await doStub.fetch(
          new Request('http://do/broadcast', {
            method: 'POST',
            body: JSON.stringify(wsMessage),
          })
        );
      } catch (error) {
        log.warn('WebSocket broadcast failed', { reportId, error });
      }
    };

    // Update progress: Extraction starting
    await updateAgentReport(env.DB, reportId, {
      progress: 1,
    });

    await wsBroadcast({
      type: 'thinking_log',
      data: {
        timestamp: new Date().toISOString(),
        type: 'progress',
        message: 'Extracting business profile from interview responses...',
        progress: 1,
      },
    });

    // Extract business profile from interview using AI
    log.info('Extracting business profile', { reportId });
    const businessProfile = await extractBusinessProfile(interview, env.ANTHROPIC_API_KEY);

    // Update progress: Extraction complete
    await updateAgentReport(env.DB, reportId, {
      progress: 5,
    });

    await wsBroadcast({
      type: 'thinking_log',
      data: {
        timestamp: new Date().toISOString(),
        type: 'progress',
        message: `Business profile extracted: ${businessProfile.brandName}`,
        progress: 5,
      },
    });

    log.info('Business profile extracted', { reportId, brandName: businessProfile.brandName });

    // Generate report using agent
    const { report, htmlReport, metrics } = await generateGTMAgentReport(
      {
        claudeApiKey: env.ANTHROPIC_API_KEY,
        rapidApiKey: env.RAPIDAPI_KEY,
        rapidApiHost: env.RAPIDAPI_HOST,
      },
      reportId,
      interviewId,
      userId,
      businessProfile,
      [], // competitors
      '', // websiteContent
      env.DB,
      wsBroadcast
    );

    // Save completed report
    await updateAgentReport(env.DB, reportId, {
      status: 'READY',
      progress: 100,
      gtmReport: report,
      htmlReport,
      webSearchesCount: metrics.webSearchesCount,
      rapidApiCallsCount: metrics.rapidApiCallsCount,
      toolResults: metrics.toolResults,
      totalInputTokens: metrics.totalInputTokens,
      totalOutputTokens: metrics.totalOutputTokens,
      totalCostCents: metrics.totalCostCents,
      modelId: metrics.modelId,
      generationTimeSeconds: metrics.generationTimeSeconds,
    });

    // Broadcast completion message
    await wsBroadcast({
      type: 'complete',
      data: { reportId },
    });

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    log.info('=== GTM AGENT WORKER COMPLETE ===', {
      reportId,
      elapsedSeconds: elapsed,
      costCents: metrics.totalCostCents,
    });

    // Acknowledge message (success)
    message.ack();

  } catch (error: any) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    log.error('=== GTM AGENT WORKER FAILED ===', { reportId, elapsedSeconds: elapsed, error: error.message });

    // Update report status to FAILED
    await updateAgentReport(env.DB, reportId, {
      status: 'FAILED',
      error: error.message || 'Unknown error',
    });

    // Broadcast error message
    try {
      const doId = env.REPORT_COORDINATOR.idFromName(reportId);
      const doStub = env.REPORT_COORDINATOR.get(doId);
      await doStub.fetch(
        new Request('http://do/broadcast', {
          method: 'POST',
          body: JSON.stringify({
            type: 'error',
            data: { error: error.message || 'Unknown error' },
          }),
        })
      );
    } catch (broadcastError) {
      log.warn('Failed to broadcast error', { reportId });
    }

    // Don't ack - let it go to DLQ for observability
  }
}
