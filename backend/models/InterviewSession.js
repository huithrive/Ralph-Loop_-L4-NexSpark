const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * InterviewSession model for handling interview_sessions table operations
 */
class InterviewSession {
  constructor(data = {}) {
    this.id = data.id || null;
    this.research_id = data.research_id || null;
    this.status = data.status || 'in_progress';
    this.current_question = data.current_question || 1;
    this.analysis = data.analysis || null;
    this.started_at = data.started_at || null;
    this.completed_at = data.completed_at || null;
  }

  /**
   * Create a new interview session
   * @param {object} data - Session data
   * @returns {Promise<InterviewSession>} - Created interview session
   */
  static async create(data) {
    try {
      const id = uuidv4();
      const sql = `
        INSERT INTO interview_sessions (
          id, research_id, status, current_question
        ) VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const values = [
        id,
        data.research_id,
        data.status || 'in_progress',
        data.current_question || 1
      ];

      const result = await query(sql, values);

      logger.info('Interview session created', {
        sessionId: id,
        researchId: data.research_id
      });

      return new InterviewSession(result.rows[0]);

    } catch (error) {
      logger.error('Failed to create interview session', error, {
        researchId: data.research_id
      });
      throw error;
    }
  }

  /**
   * Find interview session by ID
   * @param {string} id - Session ID
   * @returns {Promise<InterviewSession|null>} - Found session or null
   */
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM interview_sessions WHERE id = $1';
      const result = await query(sql, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      // JSONB fields are already parsed by PostgreSQL
      // row.analysis is already an object, no need to JSON.parse()

      return new InterviewSession(row);

    } catch (error) {
      logger.error('Failed to find interview session by ID', error, { sessionId: id });
      throw error;
    }
  }

  /**
   * Find interview sessions by research ID
   * @param {string} researchId - Research ID
   * @returns {Promise<InterviewSession[]>} - Array of interview sessions
   */
  static async findByResearchId(researchId) {
    try {
      const sql = `
        SELECT * FROM interview_sessions
        WHERE research_id = $1
        ORDER BY started_at DESC
      `;

      const result = await query(sql, [researchId]);

      return result.rows.map(row => {
        // Parse JSON fields
        // JSONB field is already parsed, no need to JSON.parse()
        return new InterviewSession(row);
      });

    } catch (error) {
      logger.error('Failed to find interview sessions by research ID', error, { researchId });
      throw error;
    }
  }

  /**
   * Update interview session
   * @param {string} id - Session ID
   * @param {object} updates - Fields to update
   * @returns {Promise<InterviewSession|null>} - Updated session or null
   */
  static async update(id, updates) {
    try {
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      // Build dynamic update query
      Object.keys(updates).forEach(key => {
        if (key === 'analysis') {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(updates[key]));
        } else if (key !== 'id' && key !== 'started_at') {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
        }
        paramCount++;
      });

      if (updateFields.length === 0) {
        return await InterviewSession.findById(id);
      }

      values.push(id);

      const sql = `
        UPDATE interview_sessions
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await query(sql, values);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      // JSONB fields are already parsed by PostgreSQL
      // row.analysis is already an object, no need to JSON.parse()

      logger.info('Interview session updated', { sessionId: id });

      return new InterviewSession(row);

    } catch (error) {
      logger.error('Failed to update interview session', error, { sessionId: id });
      throw error;
    }
  }

  /**
   * Complete interview session
   * @param {string} id - Session ID
   * @param {object} analysis - Interview analysis data
   * @returns {Promise<InterviewSession|null>} - Updated session or null
   */
  static async complete(id, analysis) {
    try {
      const sql = `
        UPDATE interview_sessions
        SET status = 'completed',
            analysis = $1,
            completed_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await query(sql, [JSON.stringify(analysis), id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      // JSONB field is already parsed by PostgreSQL, no need to JSON.parse()

      logger.info('Interview session completed', { sessionId: id });

      return new InterviewSession(row);

    } catch (error) {
      logger.error('Failed to complete interview session', error, { sessionId: id });
      throw error;
    }
  }

  /**
   * Advance to next question
   * @param {string} id - Session ID
   * @returns {Promise<InterviewSession|null>} - Updated session or null
   */
  static async advanceQuestion(id) {
    try {
      const sql = `
        UPDATE interview_sessions
        SET current_question = current_question + 1
        WHERE id = $1 AND status = 'in_progress'
        RETURNING *
      `;

      const result = await query(sql, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      // JSONB field is already parsed by PostgreSQL, no need to JSON.parse()

      logger.debug('Interview question advanced', {
        sessionId: id,
        currentQuestion: row.current_question
      });

      return new InterviewSession(row);

    } catch (error) {
      logger.error('Failed to advance interview question', error, { sessionId: id });
      throw error;
    }
  }

  /**
   * Get active sessions (not completed)
   * @param {number} limit - Maximum number of results
   * @param {number} offset - Number of results to skip
   * @returns {Promise<{sessions: InterviewSession[], total: number}>} - Active sessions and count
   */
  static async getActive(limit = 20, offset = 0) {
    try {
      const countSql = `
        SELECT COUNT(*) FROM interview_sessions
        WHERE status != 'completed'
      `;
      const countResult = await query(countSql);
      const total = parseInt(countResult.rows[0].count);

      const sql = `
        SELECT * FROM interview_sessions
        WHERE status != 'completed'
        ORDER BY started_at DESC
        LIMIT $1 OFFSET $2
      `;

      const result = await query(sql, [limit, offset]);

      const sessions = result.rows.map(row => {
        // JSONB field is already parsed, no need to JSON.parse()
        return new InterviewSession(row);
      });

      return { sessions, total };

    } catch (error) {
      logger.error('Failed to get active interview sessions', error);
      throw error;
    }
  }

  /**
   * Get completed sessions
   * @param {number} limit - Maximum number of results
   * @param {number} offset - Number of results to skip
   * @returns {Promise<{sessions: InterviewSession[], total: number}>} - Completed sessions and count
   */
  static async getCompleted(limit = 20, offset = 0) {
    try {
      const countSql = `
        SELECT COUNT(*) FROM interview_sessions
        WHERE status = 'completed'
      `;
      const countResult = await query(countSql);
      const total = parseInt(countResult.rows[0].count);

      const sql = `
        SELECT * FROM interview_sessions
        WHERE status = 'completed'
        ORDER BY completed_at DESC
        LIMIT $1 OFFSET $2
      `;

      const result = await query(sql, [limit, offset]);

      const sessions = result.rows.map(row => {
        // JSONB field is already parsed, no need to JSON.parse()
        return new InterviewSession(row);
      });

      return { sessions, total };

    } catch (error) {
      logger.error('Failed to get completed interview sessions', error);
      throw error;
    }
  }

  /**
   * Delete interview session and all related responses
   * @param {string} id - Session ID
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  static async delete(id) {
    try {
      // Delete related responses first
      await query('DELETE FROM interview_responses WHERE session_id = $1', [id]);

      // Delete the session
      const sql = 'DELETE FROM interview_sessions WHERE id = $1';
      const result = await query(sql, [id]);

      const deleted = result.rowCount > 0;

      if (deleted) {
        logger.info('Interview session and responses deleted', { sessionId: id });
      }

      return deleted;

    } catch (error) {
      logger.error('Failed to delete interview session', error, { sessionId: id });
      throw error;
    }
  }

  /**
   * Check if session is in progress
   * @returns {boolean} - True if session is in progress
   */
  isInProgress() {
    return this.status === 'in_progress';
  }

  /**
   * Check if session is completed
   * @returns {boolean} - True if session is completed
   */
  isCompleted() {
    return this.status === 'completed';
  }

  /**
   * Get session duration in minutes
   * @returns {number|null} - Duration in minutes or null if not completed
   */
  getDurationMinutes() {
    if (!this.completed_at || !this.started_at) {
      return null;
    }

    const start = new Date(this.started_at);
    const end = new Date(this.completed_at);
    const durationMs = end.getTime() - start.getTime();

    return Math.round(durationMs / (1000 * 60));
  }

  /**
   * Convert to plain object
   * @returns {object} - Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      research_id: this.research_id,
      status: this.status,
      current_question: this.current_question,
      analysis: this.analysis,
      started_at: this.started_at,
      completed_at: this.completed_at,
      duration_minutes: this.getDurationMinutes()
    };
  }
}

module.exports = InterviewSession;