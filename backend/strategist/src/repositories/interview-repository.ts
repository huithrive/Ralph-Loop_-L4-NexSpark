/**
 * Interview repository - manages interview operations
 */

import { generateId } from './base-repository';
import { createLogger } from '../utils/logger';

const log = createLogger({ context: '[InterviewRepo]' });

// Get next version number for user's interviews
export async function getNextVersion(db: D1Database, userId: string): Promise<number> {
  try {
    const result = await db.prepare(`
      SELECT MAX(version) as max_version
      FROM interviews
      WHERE user_id = ?
    `).bind(userId).first();

    return (result?.max_version || 0) + 1;
  } catch (error) {
    log.error('Error getting next version', error);
    return 1;
  }
}

// Check if user has incomplete interview
export async function getIncompleteInterview(db: D1Database, userId: string) {
  try {
    const interview = await db.prepare(`
      SELECT *
      FROM interviews
      WHERE user_id = ? AND is_latest = 1 AND status != 'COMPLETED'
      ORDER BY updated_at DESC
      LIMIT 1
    `).bind(userId).first();

    if (!interview) {
      return null;
    }

    // Get latest responses for this interview
    const responses = await db.prepare(`
      SELECT *
      FROM interview_responses
      WHERE interview_id = ? AND is_latest = 1
      ORDER BY question_number ASC
    `).bind(interview.id).all();

    return {
      ...interview,
      responses: responses.results || []
    };
  } catch (error) {
    log.error('Error getting incomplete interview', error);
    return null;
  }
}

// Save or update interview
export async function saveInterview(db: D1Database, data: any) {
  try {
    const { userId, interviewId, currentQuestion, responses, completed } = data;

    if (!interviewId) {
      throw new Error('interviewId is required - interview must be created from preview first');
    }

    // Check if interview exists
    const existing = await db.prepare(`
      SELECT id, status, paid, user_id FROM interviews WHERE id = ?
    `).bind(interviewId).first();

    if (!existing) {
      // Log additional debug info to understand why interview is missing
      log.error('Interview not found - checking for similar interviews', {
        requestedId: interviewId,
        userId: userId
      });

      // Check if there are ANY interviews for this user
      const userInterviews = await db.prepare(`
        SELECT id, status, paid, created_at FROM interviews
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 5
      `).bind(userId).all();

      log.error('Recent interviews for user', {
        userId: userId,
        count: userInterviews.results?.length || 0,
        interviews: userInterviews.results || []
      });

      throw new Error(`Interview ${interviewId} not found - preview must be created first`);
    }

    log.info('Interview found for save', {
      interviewId: existing.id,
      status: existing.status,
      paid: existing.paid,
      userId: existing.user_id
    });

    // Determine status based on progress
    let status = 'IN_PROGRESS';
    if (completed) {
      status = 'COMPLETED';
    } else if (currentQuestion && currentQuestion > 0) {
      status = 'IN_PROGRESS';
    }

    // Update existing interview (preview interview that transitions to IN_PROGRESS/COMPLETED)
    await db.prepare(`
      UPDATE interviews
      SET current_question = ?,
          status = ?,
          updated_at = CURRENT_TIMESTAMP,
          completed_at = ?
      WHERE id = ?
    `).bind(
      currentQuestion || 0,
      status,
      completed ? new Date().toISOString() : null,
      interviewId
    ).run();

    log.info('Updated interview', { interviewId, status });

    // Save responses
    if (responses && responses.length > 0) {
      for (const response of responses) {
        await saveResponse(db, interviewId, response);
      }
    }

    return { success: true, interviewId, status };
  } catch (error) {
    log.error('Error saving interview', error);
    throw error;
  }
}

// Save or update a single response
export async function saveResponse(db: D1Database, interviewId: string, response: any) {
  try {
    // Handle questionId if present, otherwise derive from question_number or index
    let questionNumber: number;
    if (response.questionId) {
      questionNumber = parseInt(response.questionId.replace('q', ''));
    } else if (response.question_number) {
      questionNumber = response.question_number;
    } else {
      throw new Error('questionNumber or questionId required');
    }

    const questionId = response.questionId || `q${questionNumber}`;
    const questionText = response.question || response.question_text || `Question ${questionNumber}`;
    const answerText = response.answer || '';

    // Check if response already exists for this interview/question
    const existing = await db.prepare(`
      SELECT id FROM interview_responses
      WHERE interview_id = ? AND question_number = ? AND is_latest = 1
    `).bind(interviewId, questionNumber).first();

    if (existing) {
      // Update existing response
      await db.prepare(`
        UPDATE interview_responses
        SET answer = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(answerText, existing.id).run();
    } else {
      // Insert new response
      const responseId = generateId('resp_');
      await db.prepare(`
        INSERT INTO interview_responses
        (id, interview_id, question_id, question_number, question_text, answer, version, is_latest)
        VALUES (?, ?, ?, ?, ?, ?, 1, 1)
      `).bind(
        responseId,
        interviewId,
        questionId,
        questionNumber,
        questionText,
        answerText
      ).run();
    }

    return { success: true };
  } catch (error) {
    log.error('Error saving response', error);
    throw error;
  }
}

// Complete interview
export async function completeInterview(db: D1Database, interviewId: string) {
  try {
    await db.prepare(`
      UPDATE interviews
      SET status = 'COMPLETED',
          completed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(interviewId).run();

    return { success: true };
  } catch (error) {
    log.error('Error completing interview', error);
    throw error;
  }
}

// Edit interview responses (creates new version)
export async function editInterviewResponses(
  db: D1Database,
  interviewId: string,
  updates: Array<{ questionNumber: number; answer: string }>
) {
  try {
    // Get current interview
    const interview = await db.prepare(`
      SELECT * FROM interviews WHERE id = ?
    `).bind(interviewId).first();

    if (!interview) {
      throw new Error('Interview not found');
    }

    // Get current version number
    const currentVersion = interview.version || 1;
    const newVersion = currentVersion + 1;

    // Mark old responses as not latest
    await db.prepare(`
      UPDATE interview_responses
      SET is_latest = 0
      WHERE interview_id = ?
    `).bind(interviewId).run();

    // Create new version of all responses
    const allResponses = await db.prepare(`
      SELECT * FROM interview_responses
      WHERE interview_id = ? AND version = ?
      ORDER BY question_number ASC
    `).bind(interviewId, currentVersion).all();

    for (const oldResponse of allResponses.results || []) {
      const responseId = generateId('resp_');

      // Check if this response was updated
      const update = updates.find(u => u.questionNumber === oldResponse.question_number);
      const newAnswer = update ? update.answer : oldResponse.answer;

      await db.prepare(`
        INSERT INTO interview_responses
        (id, interview_id, question_id, question_number, question_text, answer, version, is_latest)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `).bind(
        responseId,
        interviewId,
        oldResponse.question_id,
        oldResponse.question_number,
        oldResponse.question_text,
        newAnswer,
        newVersion
      ).run();
    }

    // Update interview version
    await db.prepare(`
      UPDATE interviews
      SET version = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(newVersion, interviewId).run();

    // Mark any existing reports as needing regeneration
    await db.prepare(`
      UPDATE reports
      SET needs_regeneration = 1
      WHERE interview_id = ? AND is_latest = 1
    `).bind(interviewId).run();

    return { success: true, version: newVersion };
  } catch (error) {
    log.error('Error editing interview responses', error);
    throw error;
  }
}

// Get user's latest interviews (for dashboard)
export async function getUserInterviews(
  db: D1Database,
  userId: string,
  limit: number = 10,
  offset: number = 0
) {
  try {
    // Get latest interviews with report info from both reports and agent_reports tables
    const interviews = await db.prepare(`
      SELECT
        i.*,
        (SELECT COUNT(*) FROM interview_responses WHERE interview_id = i.id AND is_latest = 1) as response_count,
        COALESCE(ar.id, r.id) as report_id,
        COALESCE(ar.status, r.status) as report_status,
        COALESCE(ar.progress, r.progress) as report_progress,
        r.needs_regeneration,
        COALESCE(ar.html_report, r.html_report) as html_report,
        COALESCE(ar.created_at, r.created_at) as report_created_at,
        COALESCE(ar.generation_started_at, r.generation_started_at) as report_generation_started_at,
        CASE WHEN ar.id IS NOT NULL THEN 1 ELSE 0 END as is_agent_report
      FROM interviews i
      LEFT JOIN reports r ON i.id = r.interview_id AND r.is_latest = 1
      LEFT JOIN (
        SELECT * FROM (
          SELECT *, ROW_NUMBER() OVER (PARTITION BY interview_id ORDER BY created_at DESC, id DESC) as rn
          FROM agent_reports
        )
        WHERE rn = 1
      ) ar ON i.id = ar.interview_id
      WHERE i.user_id = ? AND i.is_latest = 1
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all();

    // Get total count
    const total = await db.prepare(`
      SELECT COUNT(*) as count FROM interviews
      WHERE user_id = ? AND is_latest = 1
    `).bind(userId).first();

    const totalCount = total?.count || 0;

    return {
      interviews: interviews.results || [],
      total: totalCount,
      page: Math.floor(offset / limit),
      pageSize: limit,
      hasMore: (offset + limit) < totalCount,
      hasPrevious: offset > 0
    };
  } catch (error) {
    log.error('Error getting user interviews', error);
    return {
      interviews: [],
      total: 0,
      page: 0,
      pageSize: limit,
      hasMore: false,
      hasPrevious: false
    };
  }
}

// Get specific interview with latest responses and report
export async function getInterview(db: D1Database, interviewId: string) {
  try {
    const interview = await db.prepare(`
      SELECT * FROM interviews WHERE id = ?
    `).bind(interviewId).first();

    if (!interview) {
      return null;
    }

    // Get latest responses
    const responses = await db.prepare(`
      SELECT * FROM interview_responses
      WHERE interview_id = ? AND is_latest = 1
      ORDER BY question_number ASC
    `).bind(interviewId).all();

    // Get latest report
    const report = await db.prepare(`
      SELECT * FROM reports
      WHERE interview_id = ? AND is_latest = 1
      LIMIT 1
    `).bind(interviewId).first();

    return {
      ...interview,
      responses: responses.results || [],
      report: report || null
    };
  } catch (error) {
    log.error('Error getting interview', error);
    return null;
  }
}

// Mark interview as paid
export async function markInterviewPaid(
  db: D1Database,
  interviewId: string,
  paymentId: string
) {
  try {
    await db.prepare(`
      UPDATE interviews
      SET paid = 1, payment_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(paymentId, interviewId).run();

    return { success: true };
  } catch (error) {
    log.error('Error marking interview as paid', error);
    throw error;
  }
}

/**
 * Delete an interview and all related data
 */
export async function deleteInterview(db: D1Database, interviewId: string) {
  try {
    // Delete interview (CASCADE will delete responses and analysis)
    await db.prepare(`
      DELETE FROM interviews WHERE id = ?
    `).bind(interviewId).run();

    log.info('Interview deleted', { interviewId });
    return { success: true };
  } catch (error) {
    log.error('Error deleting interview', error);
    throw error;
  }
}

/**
 * Create interview from URL (preview flow)
 * Creates interview with status='PREVIEW' and associated report
 */
export async function createPreviewInterview(
  db: D1Database,
  data: {
    userId: string;
    website: string;
  }
) {
  try {
    const interviewId = generateId('int_');
    const reportId = generateId('rep_');

    // Get next version for user
    const version = await getNextVersion(db, data.userId);

    // Create interview with PREVIEW status
    const insertResult = await db.prepare(`
      INSERT INTO interviews (
        id, user_id, status, version, is_latest,
        preview_url, paid, current_question, total_questions
      )
      VALUES (?, ?, 'PREVIEW', ?, 1, ?, 0, 0, 6)
    `).bind(
      interviewId,
      data.userId,
      version,
      data.website
    ).run();

    log.info('Created preview interview', {
      interviewId,
      version,
      website: data.website,
      insertSuccess: insertResult.success,
      meta: insertResult.meta
    });

    // Verify interview was actually created
    const verify = await db.prepare(`
      SELECT id, status, paid FROM interviews WHERE id = ?
    `).bind(interviewId).first();

    if (!verify) {
      log.error('Interview creation failed - record not found after INSERT', { interviewId });
      throw new Error('Failed to create interview - database insert did not persist');
    }

    log.info('Interview creation verified in database', {
      interviewId,
      status: verify.status,
      paid: verify.paid
    });

    // Create associated report with PREVIEW status
    await db.prepare(`
      INSERT INTO reports (
        id, interview_id, user_id, status, progress, version, is_latest
      )
      VALUES (?, ?, ?, 'PREVIEW', 0, 1, 1)
    `).bind(
      reportId,
      interviewId,
      data.userId
    ).run();

    log.info('Created preview report', { reportId, interviewId });

    return { success: true, interviewId, reportId };
  } catch (error) {
    log.error('Error creating preview interview', error);
    throw error;
  }
}
