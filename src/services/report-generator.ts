/**
 * Report Generator Service
 * Manages state machine for report generation with resume capability
 */

import { generateId } from './database';
import {
  analyzeInterview as analyzeInterviewTranscript,
  verifyWebsiteAndResearch,
  generateGTMStrategy,
  generateStrategyReport,
  type InterviewTranscript,
  type BusinessProfile,
  type GTMStrategy
} from './post-interview-analysis';

export type GenerationState =
  | 'NOT_STARTED'
  | 'ANALYZING'
  | 'PROFILE_REVIEW'
  | 'RESEARCHING'
  | 'PREVIEW_READY'
  | 'PAYMENT_REQUIRED'
  | 'GENERATING_STRATEGY'
  | 'COMPLETE'
  | 'FAILED';

export interface GenerationProgress {
  generationId: string;
  interviewId: string;
  userId: string;
  currentState: GenerationState;
  progressPercent: number;
  step1Data?: BusinessProfile;
  step2Data?: any;
  paid: boolean;
  reportId?: string;
  error?: string;
}

export class ReportGenerator {
  private db: D1Database;
  private env: any;

  constructor(db: D1Database, env: any) {
    this.db = db;
    this.env = env;
  }

  /**
   * Start new generation
   */
  async start(interviewId: string, userId: string): Promise<string> {
    const genId = generateId('gen_');

    await this.db.prepare(`
      INSERT INTO report_generations (
        id, interview_id, user_id, current_state, progress_percent, started_at, last_updated_at
      ) VALUES (?, ?, ?, 'NOT_STARTED', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(genId, interviewId, userId).run();

    await this.logEvent(genId, 'CREATED', null, 'NOT_STARTED', {});

    console.log('✅ Report generation created:', genId);
    return genId;
  }

  /**
   * Get current state
   */
  async getState(generationId: string): Promise<GenerationProgress | null> {
    const state = await this.db.prepare(`
      SELECT * FROM report_generations WHERE id = ?
    `).bind(generationId).first();

    if (!state) return null;

    return {
      generationId: state.id as string,
      interviewId: state.interview_id as string,
      userId: state.user_id as string,
      currentState: state.current_state as GenerationState,
      progressPercent: state.progress_percent as number,
      step1Data: state.step_1_analysis ? JSON.parse(state.step_1_analysis as string) : undefined,
      step2Data: state.step_2_research ? JSON.parse(state.step_2_research as string) : undefined,
      paid: Boolean(state.paid),
      reportId: state.report_id as string | undefined,
      error: state.error_message as string | undefined
    };
  }

  /**
   * Execute Step 1: Analysis
   */
  async executeStep1(generationId: string, interview: any): Promise<BusinessProfile> {
    await this.setState(generationId, 'ANALYZING', 10);

    const transcript: InterviewTranscript = {
      userId: interview.user_id,
      interviewId: interview.id,
      responses: interview.responses,
      completedAt: interview.completed_at || new Date().toISOString()
    };

    const claudeApiKey = this.env.ANTHROPIC_API_KEY || '';
    const businessProfile = await analyzeInterviewTranscript(transcript, claudeApiKey);

    // Save step 1 data
    await this.db.prepare(`
      UPDATE report_generations
      SET step_1_analysis = ?, last_updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(JSON.stringify(businessProfile), generationId).run();

    await this.setState(generationId, 'PROFILE_REVIEW', 35);
    await this.logEvent(generationId, 'STATE_CHANGE', 'ANALYZING', 'PROFILE_REVIEW', { businessProfile });

    return businessProfile;
  }

  /**
   * Execute Step 2: Research
   */
  async executeStep2(generationId: string, website: string): Promise<any> {
    await this.setState(generationId, 'RESEARCHING', 40);

    const claudeApiKey = this.env.ANTHROPIC_API_KEY || '';
    const rapidApiKey = this.env.RAPIDAPI_KEY || '';

    const research = await verifyWebsiteAndResearch(website, claudeApiKey, rapidApiKey);

    // Save step 2 data
    await this.db.prepare(`
      UPDATE report_generations
      SET step_2_research = ?, last_updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(JSON.stringify(research), generationId).run();

    await this.setState(generationId, 'PREVIEW_READY', 60);
    await this.logEvent(generationId, 'STATE_CHANGE', 'RESEARCHING', 'PREVIEW_READY', { competitors: research.competitors });

    return research;
  }

  /**
   * Execute Step 4: Generate Strategy
   */
  async executeStep4(generationId: string): Promise<{ strategy: GTMStrategy; reportId: string }> {
    await this.setState(generationId, 'GENERATING_STRATEGY', 70);

    const state = await this.getState(generationId);
    if (!state || !state.step1Data || !state.step2Data) {
      throw new Error('Missing required data from previous steps');
    }

    const businessProfile = state.step1Data;
    const research = state.step2Data;

    const claudeApiKey = this.env.ANTHROPIC_API_KEY || '';
    const rapidApiKey = this.env.RAPIDAPI_KEY || '';

    // Generate GTM strategy
    const strategy = await generateGTMStrategy(
      businessProfile,
      research.competitors || [],
      research.scraped_content || '',
      claudeApiKey,
      rapidApiKey
    );

    // Generate HTML report
    const htmlReport = generateStrategyReport(strategy);

    // Save to strategy_reports table
    const reportId = generateId('rpt_');
    await this.db.prepare(`
      INSERT INTO strategy_reports (
        id, user_id, interview_id, generation_id,
        brand_name, business_profile, gtm_strategy, html_report,
        version, is_latest, paid, payment_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      reportId,
      state.userId,
      state.interviewId,
      generationId,
      businessProfile.brandName || 'Unknown',
      JSON.stringify(businessProfile),
      JSON.stringify(strategy),
      htmlReport,
      state.paid ? 1 : 0,
      state.reportId || null
    ).run();

    // Complete generation
    await this.db.prepare(`
      UPDATE report_generations
      SET current_state = 'COMPLETE',
          progress_percent = 100,
          report_id = ?,
          step_4_strategy = ?,
          completed_at = CURRENT_TIMESTAMP,
          last_updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(reportId, JSON.stringify(strategy), generationId).run();

    await this.logEvent(generationId, 'STATE_CHANGE', 'GENERATING_STRATEGY', 'COMPLETE', { reportId });

    return { strategy, reportId };
  }

  /**
   * Resume generation from current state
   */
  async resume(generationId: string, interview?: any): Promise<any> {
    const state = await this.getState(generationId);
    if (!state) {
      throw new Error('Generation not found');
    }

    await this.logEvent(generationId, 'RESUME', state.currentState, state.currentState, {});

    switch (state.currentState) {
      case 'NOT_STARTED':
      case 'ANALYZING':
        if (!interview) {
          throw new Error('Interview data required for analysis');
        }
        return await this.executeStep1(generationId, interview);

      case 'PROFILE_REVIEW':
        // User needs to review, return current data
        return { state: 'PROFILE_REVIEW', data: state.step1Data };

      case 'RESEARCHING':
        if (!state.step1Data) {
          throw new Error('Missing analysis data');
        }
        return await this.executeStep2(generationId, state.step1Data.website);

      case 'PREVIEW_READY':
        // User needs to see preview, return current data
        return { state: 'PREVIEW_READY', data: { profile: state.step1Data, research: state.step2Data } };

      case 'PAYMENT_REQUIRED':
        // Waiting for payment
        return { state: 'PAYMENT_REQUIRED', requiresPayment: true };

      case 'GENERATING_STRATEGY':
        if (!state.paid) {
          throw new Error('Payment required before generating strategy');
        }
        return await this.executeStep4(generationId);

      case 'COMPLETE':
        // Already done
        return { state: 'COMPLETE', reportId: state.reportId };

      case 'FAILED':
        // Retry from failed step
        const failedStep = state.step1Data ? 2 : 1;
        if (failedStep === 1 && interview) {
          return await this.executeStep1(generationId, interview);
        } else if (failedStep === 2 && state.step1Data) {
          return await this.executeStep2(generationId, state.step1Data.website);
        }
        throw new Error('Cannot resume: missing required data');

      default:
        throw new Error('Unknown state: ' + state.currentState);
    }
  }

  /**
   * Private: Update state
   */
  private async setState(generationId: string, state: GenerationState, progress: number) {
    await this.db.prepare(`
      UPDATE report_generations
      SET current_state = ?, progress_percent = ?, last_updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(state, progress, generationId).run();
  }

  /**
   * Private: Log event
   */
  private async logEvent(
    generationId: string,
    eventType: string,
    fromState: string | null,
    toState: string | null,
    details: any
  ) {
    const eventId = generateId('evt_');
    await this.db.prepare(`
      INSERT INTO generation_events (id, generation_id, event_type, from_state, to_state, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(eventId, generationId, eventType, fromState, toState, JSON.stringify(details)).run();
  }
}
