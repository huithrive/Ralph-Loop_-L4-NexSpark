/**
 * Database helper functions for interview management
 */

// Generate unique ID
export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Get latest interview version for user
export async function getLatestVersion(db: D1Database, userId: string): Promise<string> {
  try {
    const result = await db.prepare(`
      SELECT version 
      FROM interviews 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `).bind(userId).first();
    
    if (!result || !result.version) {
      return 'v1.0';
    }
    
    // Extract version number and increment
    const match = result.version.match(/v(\d+)\.(\d+)/);
    if (match) {
      const major = parseInt(match[1]);
      const minor = parseInt(match[2]);
      return `v${major}.${minor + 1}`;
    }
    
    return 'v1.0';
  } catch (error) {
    console.error('Error getting latest version:', error);
    return 'v1.0';
  }
}

// Check if user has incomplete interview
export async function getIncompleteInterview(db: D1Database, userId: string) {
  try {
    const interview = await db.prepare(`
      SELECT * 
      FROM interviews 
      WHERE user_id = ? AND completed = FALSE 
      ORDER BY updated_at DESC 
      LIMIT 1
    `).bind(userId).first();
    
    if (!interview) {
      return null;
    }
    
    // Get responses for this interview
    const responses = await db.prepare(`
      SELECT * 
      FROM interview_responses 
      WHERE interview_id = ? 
      ORDER BY question_number ASC
    `).bind(interview.id).all();
    
    return {
      ...interview,
      responses: responses.results || []
    };
  } catch (error) {
    console.error('Error getting incomplete interview:', error);
    return null;
  }
}

// Save or update interview
export async function saveInterview(db: D1Database, data: any) {
  try {
    const { userId, interviewId, currentQuestion, responses, completed } = data;

    let finalInterviewId = interviewId || generateId('int_');

    // Check if interview exists
    const existing = await db.prepare(`
      SELECT id FROM interviews WHERE id = ?
    `).bind(finalInterviewId).first();

    if (!existing) {
      // Create new interview (with client-provided or generated ID)
      const version = await getLatestVersion(db, userId);

      await db.prepare(`
        INSERT INTO interviews (id, user_id, version, current_question, completed)
        VALUES (?, ?, ?, ?, ?)
      `).bind(finalInterviewId, userId, version, currentQuestion || 0, completed ? 1 : 0).run();

      console.log('Created new interview:', finalInterviewId, 'version:', version);
    } else {
      // Update existing interview
      await db.prepare(`
        UPDATE interviews
        SET current_question = ?,
            updated_at = CURRENT_TIMESTAMP,
            completed = ?
        WHERE id = ?
      `).bind(currentQuestion || 0, completed ? 1 : 0, finalInterviewId).run();

      console.log('Updated interview:', finalInterviewId);
    }
    
    // Save responses
    if (responses && responses.length > 0) {
      for (const response of responses) {
        const responseId = generateId('resp_');

        // Handle questionId if present, otherwise derive from question_number or index
        let questionNumber: number;
        if (response.questionId) {
          questionNumber = parseInt(response.questionId.replace('q', ''));
        } else if (response.question_number) {
          questionNumber = response.question_number;
        } else {
          // Fallback: use index
          questionNumber = responses.indexOf(response) + 1;
        }

        const questionId = response.questionId || `q${questionNumber}`;
        // Ensure all values are defined (D1 doesn't accept undefined)
        const questionText = response.question || `Question ${questionNumber}`;
        const answerText = response.answer || '';

        // Check if response already exists
        const existing = await db.prepare(`
          SELECT id FROM interview_responses
          WHERE interview_id = ? AND question_number = ?
        `).bind(finalInterviewId, questionNumber).first();

        if (existing) {
          // Update existing response
          await db.prepare(`
            UPDATE interview_responses
            SET answer = ?
            WHERE id = ?
          `).bind(answerText, existing.id).run();
        } else {
          // Insert new response
          await db.prepare(`
            INSERT INTO interview_responses
            (id, interview_id, question_id, question_number, question, answer)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(
            responseId,
            finalInterviewId,
            questionId,
            questionNumber,
            questionText,
            answerText
          ).run();
        }
      }
    }
    
    return { success: true, interviewId: finalInterviewId };
  } catch (error) {
    console.error('Error saving interview:', error);
    throw error;
  }
}

// Complete interview
export async function completeInterview(db: D1Database, interviewId: string) {
  try {
    await db.prepare(`
      UPDATE interviews 
      SET completed = TRUE, 
          completed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(interviewId).run();
    
    return { success: true };
  } catch (error) {
    console.error('Error completing interview:', error);
    throw error;
  }
}

// Get interview history for user with pagination
export async function getInterviewHistory(
  db: D1Database,
  userId: string,
  limit: number = 10,
  offset: number = 0
) {
  try {
    // Get paginated interviews
    const interviews = await db.prepare(`
      SELECT * FROM interview_history
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all();

    // Get total count for pagination
    const total = await db.prepare(`
      SELECT COUNT(*) as count FROM interviews WHERE user_id = ?
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
    console.error('Error getting interview history:', error);
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

// Get specific interview with responses
export async function getInterview(db: D1Database, interviewId: string) {
  try {
    const interview = await db.prepare(`
      SELECT * FROM interviews WHERE id = ?
    `).bind(interviewId).first();
    
    if (!interview) {
      return null;
    }
    
    const responses = await db.prepare(`
      SELECT * FROM interview_responses 
      WHERE interview_id = ? 
      ORDER BY question_number ASC
    `).bind(interviewId).all();
    
    const analysis = await db.prepare(`
      SELECT * FROM interview_analysis 
      WHERE interview_id = ? 
      LIMIT 1
    `).bind(interviewId).first();
    
    return {
      ...interview,
      responses: responses.results || [],
      analysis: analysis || null
    };
  } catch (error) {
    console.error('Error getting interview:', error);
    return null;
  }
}

// Save interview analysis
export async function saveAnalysis(db: D1Database, interviewId: string, analysis: any) {
  try {
    const analysisId = generateId('ana_');

    await db.prepare(`
      INSERT INTO interview_analysis
      (id, interview_id, brand_profile, recommendations, next_steps, full_analysis)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      analysisId,
      interviewId,
      JSON.stringify(analysis.brandProfile || {}),
      JSON.stringify(analysis.recommendations || {}),
      JSON.stringify(analysis.nextSteps || []),
      analysis.fullAnalysis || ''
    ).run();

    return { success: true, analysisId };
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
}

// ==============================================
// AUTHENTICATION HELPER FUNCTIONS
// ==============================================

/**
 * Get user by email (for account linking)
 */
export async function getUserByEmail(db: D1Database, email: string) {
  try {
    return await db.prepare(`
      SELECT * FROM users WHERE email = ?
    `).bind(email).first();
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

/**
 * Get all authentication methods for a user
 */
export async function getUserAuthProviders(db: D1Database, userId: string) {
  try {
    const results = await db.prepare(`
      SELECT
        id,
        provider,
        email,
        provider_user_id,
        is_primary,
        verified,
        last_used_at,
        created_at
      FROM auth_providers
      WHERE user_id = ?
      ORDER BY is_primary DESC, created_at ASC
    `).bind(userId).all();

    return results.results || [];
  } catch (error) {
    console.error('Error getting user auth providers:', error);
    return [];
  }
}

/**
 * Check if user can unlink an auth method
 * Users must have at least one auth method
 */
export async function canUnlinkAuthMethod(
  db: D1Database,
  userId: string,
  authProviderId: string
): Promise<boolean> {
  try {
    const count = await db.prepare(`
      SELECT COUNT(*) as count FROM auth_providers WHERE user_id = ?
    `).bind(userId).first();

    return (count?.count || 0) > 1; // Must keep at least one auth method
  } catch (error) {
    console.error('Error checking if can unlink:', error);
    return false;
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

    console.log('Interview deleted:', interviewId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting interview:', error);
    throw error;
  }
}

// ==============================================
// REPORT GENERATION FUNCTIONS
// ==============================================

/**
 * Create new report generation
 */
export async function createReportGeneration(
  db: D1Database,
  data: {
    id: string;
    userId: string;
    interviewId: string;
    currentState: string;
    progressPercent: number;
    paid: boolean;
    paymentId?: string | null;
    createdAt: string;
    updatedAt: string;
  }
) {
  try {
    // Ensure all values are primitive types for D1
    const id = String(data.id);
    const interviewId = String(data.interviewId);
    const userId = String(data.userId);
    const currentState = String(data.currentState);
    const progressPercent = Number(data.progressPercent) || 0;
    const paid = data.paid ? 1 : 0;
    const paymentId = typeof data.paymentId === 'string' ? data.paymentId : null;
    const startedAt = String(data.createdAt);
    const lastUpdatedAt = String(data.updatedAt);

    console.log('Creating report generation:', { id, interviewId, userId, currentState, paid, paymentId });

    await db.prepare(`
      INSERT INTO report_generations (
        id, interview_id, user_id, current_state, progress_percent, paid, payment_id, started_at, last_updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      interviewId,
      userId,
      currentState,
      progressPercent,
      paid,
      paymentId,
      startedAt,
      lastUpdatedAt
    ).run();

    return { success: true, generationId: id };
  } catch (error) {
    console.error('Error creating generation:', error);
    throw error;
  }
}

/**
 * Get generation state
 */
export async function getGenerationState(db: D1Database, generationId: string) {
  try {
    return await db.prepare(`
      SELECT * FROM report_generations WHERE id = ?
    `).bind(generationId).first();
  } catch (error) {
    console.error('Error getting generation state:', error);
    return null;
  }
}

/**
 * Get generation by interview ID
 */
export async function getGenerationByInterview(db: D1Database, interviewId: string) {
  try {
    return await db.prepare(`
      SELECT * FROM report_generations
      WHERE interview_id = ?
      ORDER BY started_at DESC
      LIMIT 1
    `).bind(interviewId).first();
  } catch (error) {
    console.error('Error getting generation by interview:', error);
    return null;
  }
}

/**
 * Update generation state
 */
export async function updateGenerationState(
  db: D1Database,
  generationId: string,
  updates: {
    currentState?: string;
    progressPercent?: number;
    step1Data?: string;
    step2Data?: string;
    paid?: boolean;
    paymentId?: string;
    error?: string;
  }
) {
  try {
    // Build dynamic update query based on what fields are provided
    const fields: string[] = ['last_updated_at = CURRENT_TIMESTAMP'];
    const values: any[] = [];

    if (updates.currentState !== undefined) {
      fields.push('current_state = ?');
      values.push(updates.currentState);
    }
    if (updates.progressPercent !== undefined) {
      fields.push('progress_percent = ?');
      values.push(updates.progressPercent);
    }
    if (updates.step1Data !== undefined) {
      fields.push('step1_data = ?');
      values.push(updates.step1Data);
    }
    if (updates.step2Data !== undefined) {
      fields.push('step2_data = ?');
      values.push(updates.step2Data);
    }
    if (updates.paid !== undefined) {
      fields.push('paid = ?');
      values.push(updates.paid ? 1 : 0);
    }
    if (updates.paymentId !== undefined) {
      fields.push('payment_id = ?');
      values.push(updates.paymentId);
    }
    if (updates.error !== undefined) {
      fields.push('error = ?');
      values.push(updates.error);
    }

    const query = `
      UPDATE report_generations
      SET ${fields.join(', ')}
      WHERE id = ?
    `;

    await db.prepare(query).bind(...values, generationId).run();

    return { success: true };
  } catch (error) {
    console.error('Error updating generation state:', error);
    throw error;
  }
}

/**
 * Save step data
 */
export async function saveStepData(
  db: D1Database,
  generationId: string,
  stepNumber: number,
  data: any
) {
  try {
    const columnName = `step_${stepNumber}_${
      stepNumber === 1 ? 'analysis' :
      stepNumber === 2 ? 'research' :
      stepNumber === 3 ? 'payment_intent' :
      'strategy'
    }`;

    await db.prepare(`
      UPDATE report_generations
      SET ${columnName} = ?, last_updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(JSON.stringify(data), generationId).run();

    return { success: true };
  } catch (error) {
    console.error('Error saving step data:', error);
    throw error;
  }
}

/**
 * Mark generation as paid
 */
export async function markGenerationPaid(
  db: D1Database,
  generationId: string,
  paymentId: string
) {
  try {
    await db.prepare(`
      UPDATE report_generations
      SET paid = 1, payment_id = ?, last_updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(paymentId, generationId).run();

    return { success: true };
  } catch (error) {
    console.error('Error marking generation as paid:', error);
    throw error;
  }
}

/**
 * Complete generation and link to report
 */
export async function completeGeneration(
  db: D1Database,
  generationId: string,
  reportId: string
) {
  try {
    await db.prepare(`
      UPDATE report_generations
      SET current_state = 'COMPLETE',
          progress_percent = 100,
          report_id = ?,
          completed_at = CURRENT_TIMESTAMP,
          last_updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(reportId, generationId).run();

    return { success: true };
  } catch (error) {
    console.error('Error completing generation:', error);
    throw error;
  }
}

/**
 * Mark generation as failed
 */
export async function markGenerationFailed(
  db: D1Database,
  generationId: string,
  step: number,
  errorMessage: string
) {
  try {
    await db.prepare(`
      UPDATE report_generations
      SET current_state = 'FAILED',
          failed_at_step = ?,
          error_message = ?,
          retry_count = retry_count + 1,
          last_updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(step, errorMessage, generationId).run();

    return { success: true };
  } catch (error) {
    console.error('Error marking generation as failed:', error);
    throw error;
  }
}

/**
 * Get all reports for user (paginated)
 */
export async function getUserReports(
  db: D1Database,
  userId: string,
  limit: number = 10,
  offset: number = 0
) {
  try {
    const reports = await db.prepare(`
      SELECT
        sr.*,
        i.created_at as interview_date,
        rg.current_state as generation_state
      FROM strategy_reports sr
      LEFT JOIN interviews i ON sr.interview_id = i.id
      LEFT JOIN report_generations rg ON sr.generation_id = rg.id
      WHERE sr.user_id = ? AND sr.is_latest = 1
      ORDER BY sr.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(userId, limit, offset).all();

    const total = await db.prepare(`
      SELECT COUNT(*) as count FROM strategy_reports
      WHERE user_id = ? AND is_latest = 1
    `).bind(userId).first();

    return {
      reports: reports.results || [],
      total: total?.count || 0,
      hasMore: (offset + limit) < (total?.count || 0)
    };
  } catch (error) {
    console.error('Error getting user reports:', error);
    return { reports: [], total: 0, hasMore: false };
  }
}

/**
 * Get specific report
 */
export async function getReport(db: D1Database, reportId: string) {
  try {
    return await db.prepare(`
      SELECT * FROM strategy_reports WHERE id = ?
    `).bind(reportId).first();
  } catch (error) {
    console.error('Error getting report:', error);
    return null;
  }
}

/**
 * Delete report
 */
export async function deleteReport(db: D1Database, reportId: string) {
  try {
    await db.prepare(`
      DELETE FROM strategy_reports WHERE id = ?
    `).bind(reportId).run();

    return { success: true };
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
}

/**
 * Log generation event
 */
export async function logGenerationEvent(
  db: D1Database,
  generationId: string,
  eventType: string,
  fromState: string | null,
  toState: string | null,
  details: any = {}
) {
  try {
    const eventId = generateId('evt_');

    await db.prepare(`
      INSERT INTO generation_events (
        id, generation_id, event_type, from_state, to_state, details
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      eventId,
      generationId,
      eventType,
      fromState,
      toState,
      JSON.stringify(details)
    ).run();

    return { success: true };
  } catch (error) {
    console.error('Error logging event:', error);
    // Don't throw - logging failure shouldn't break generation
    return { success: false };
  }
}
