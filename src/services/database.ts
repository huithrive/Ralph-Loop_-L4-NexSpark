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
    
    let finalInterviewId = interviewId;
    
    // If no interview ID, create new interview
    if (!finalInterviewId) {
      finalInterviewId = generateId('int_');
      const version = await getLatestVersion(db, userId);
      
      await db.prepare(`
        INSERT INTO interviews (id, user_id, version, current_question, completed)
        VALUES (?, ?, ?, ?, ?)
      `).bind(finalInterviewId, userId, version, currentQuestion, completed ? 1 : 0).run();
      
      console.log('Created new interview:', finalInterviewId, version);
    } else {
      // Update existing interview
      await db.prepare(`
        UPDATE interviews 
        SET current_question = ?, 
            updated_at = CURRENT_TIMESTAMP,
            completed = ?
        WHERE id = ?
      `).bind(currentQuestion, completed ? 1 : 0, finalInterviewId).run();
      
      console.log('Updated interview:', finalInterviewId);
    }
    
    // Save responses
    if (responses && responses.length > 0) {
      for (const response of responses) {
        const responseId = generateId('resp_');
        const questionNumber = parseInt(response.questionId.replace('q', ''));
        
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
          `).bind(response.answer, existing.id).run();
        } else {
          // Insert new response
          await db.prepare(`
            INSERT INTO interview_responses 
            (id, interview_id, question_id, question_number, question, answer)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(
            responseId,
            finalInterviewId,
            response.questionId,
            questionNumber,
            response.question,
            response.answer
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

// Get interview history for user
export async function getInterviewHistory(db: D1Database, userId: string) {
  try {
    const interviews = await db.prepare(`
      SELECT * FROM interview_history 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).bind(userId).all();
    
    return interviews.results || [];
  } catch (error) {
    console.error('Error getting interview history:', error);
    return [];
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
