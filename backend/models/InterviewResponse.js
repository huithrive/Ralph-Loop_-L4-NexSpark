const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * InterviewResponse model for handling interview_responses table operations
 */
class InterviewResponse {
  constructor(data = {}) {
    this.id = data.id || null;
    this.session_id = data.session_id || null;
    this.question_number = data.question_number || null;
    this.question_text = data.question_text || null;
    this.response_text = data.response_text || null;
    this.created_at = data.created_at || null;
  }

  /**
   * Create a new interview response
   * @param {object} data - Response data
   * @returns {Promise<InterviewResponse>} - Created interview response
   */
  static async create(data) {
    try {
      const id = uuidv4();
      const sql = `
        INSERT INTO interview_responses (
          id, session_id, question_number, question_text, response_text
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const values = [
        id,
        data.session_id,
        data.question_number,
        data.question_text,
        data.response_text
      ];

      const result = await query(sql, values);

      logger.info('Interview response created', {
        responseId: id,
        sessionId: data.session_id,
        questionNumber: data.question_number
      });

      return new InterviewResponse(result.rows[0]);

    } catch (error) {
      logger.error('Failed to create interview response', error, {
        sessionId: data.session_id,
        questionNumber: data.question_number
      });
      throw error;
    }
  }

  /**
   * Find interview response by ID
   * @param {string} id - Response ID
   * @returns {Promise<InterviewResponse|null>} - Found response or null
   */
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM interview_responses WHERE id = $1';
      const result = await query(sql, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return new InterviewResponse(result.rows[0]);

    } catch (error) {
      logger.error('Failed to find interview response by ID', error, { responseId: id });
      throw error;
    }
  }

  /**
   * Find all responses for a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<InterviewResponse[]>} - Array of interview responses
   */
  static async findBySessionId(sessionId) {
    try {
      const sql = `
        SELECT * FROM interview_responses
        WHERE session_id = $1
        ORDER BY question_number ASC
      `;

      const result = await query(sql, [sessionId]);

      return result.rows.map(row => new InterviewResponse(row));

    } catch (error) {
      logger.error('Failed to find interview responses by session ID', error, { sessionId });
      throw error;
    }
  }

  /**
   * Find response by session and question number
   * @param {string} sessionId - Session ID
   * @param {number} questionNumber - Question number
   * @returns {Promise<InterviewResponse|null>} - Found response or null
   */
  static async findBySessionAndQuestion(sessionId, questionNumber) {
    try {
      const sql = `
        SELECT * FROM interview_responses
        WHERE session_id = $1 AND question_number = $2
      `;

      const result = await query(sql, [sessionId, questionNumber]);

      if (result.rows.length === 0) {
        return null;
      }

      return new InterviewResponse(result.rows[0]);

    } catch (error) {
      logger.error('Failed to find interview response by session and question', error, {
        sessionId,
        questionNumber
      });
      throw error;
    }
  }

  /**
   * Update interview response
   * @param {string} id - Response ID
   * @param {object} updates - Fields to update
   * @returns {Promise<InterviewResponse|null>} - Updated response or null
   */
  static async update(id, updates) {
    try {
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      // Build dynamic update query
      Object.keys(updates).forEach(key => {
        if (key !== 'id' && key !== 'created_at' && key !== 'session_id') {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
          paramCount++;
        }
      });

      if (updateFields.length === 0) {
        return await InterviewResponse.findById(id);
      }

      values.push(id);

      const sql = `
        UPDATE interview_responses
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await query(sql, values);

      if (result.rows.length === 0) {
        return null;
      }

      logger.info('Interview response updated', { responseId: id });

      return new InterviewResponse(result.rows[0]);

    } catch (error) {
      logger.error('Failed to update interview response', error, { responseId: id });
      throw error;
    }
  }

  /**
   * Delete interview response
   * @param {string} id - Response ID
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  static async delete(id) {
    try {
      const sql = 'DELETE FROM interview_responses WHERE id = $1';
      const result = await query(sql, [id]);

      const deleted = result.rowCount > 0;

      if (deleted) {
        logger.info('Interview response deleted', { responseId: id });
      }

      return deleted;

    } catch (error) {
      logger.error('Failed to delete interview response', error, { responseId: id });
      throw error;
    }
  }

  /**
   * Delete all responses for a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<number>} - Number of responses deleted
   */
  static async deleteBySessionId(sessionId) {
    try {
      const sql = 'DELETE FROM interview_responses WHERE session_id = $1';
      const result = await query(sql, [sessionId]);

      logger.info('Interview responses deleted for session', {
        sessionId,
        deletedCount: result.rowCount
      });

      return result.rowCount;

    } catch (error) {
      logger.error('Failed to delete interview responses by session', error, { sessionId });
      throw error;
    }
  }

  /**
   * Get session transcript as text
   * @param {string} sessionId - Session ID
   * @returns {Promise<string>} - Formatted transcript
   */
  static async getSessionTranscript(sessionId) {
    try {
      const responses = await InterviewResponse.findBySessionId(sessionId);

      if (responses.length === 0) {
        return '';
      }

      let transcript = '';
      responses.forEach(response => {
        transcript += `Q${response.question_number}: ${response.question_text}\n`;
        transcript += `A${response.question_number}: ${response.response_text || '[No response]'}\n\n`;
      });

      return transcript.trim();

    } catch (error) {
      logger.error('Failed to generate session transcript', error, { sessionId });
      throw error;
    }
  }

  /**
   * Get response statistics for a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<object>} - Response statistics
   */
  static async getSessionStats(sessionId) {
    try {
      const sql = `
        SELECT
          COUNT(*) as total_responses,
          COUNT(CASE WHEN response_text IS NOT NULL AND response_text != '' THEN 1 END) as answered_responses,
          AVG(LENGTH(response_text)) as avg_response_length
        FROM interview_responses
        WHERE session_id = $1
      `;

      const result = await query(sql, [sessionId]);

      if (result.rows.length === 0) {
        return {
          total_responses: 0,
          answered_responses: 0,
          avg_response_length: 0,
          completion_rate: 0
        };
      }

      const stats = result.rows[0];
      const completionRate = stats.total_responses > 0
        ? (stats.answered_responses / stats.total_responses) * 100
        : 0;

      return {
        total_responses: parseInt(stats.total_responses),
        answered_responses: parseInt(stats.answered_responses),
        avg_response_length: parseFloat(stats.avg_response_length) || 0,
        completion_rate: Math.round(completionRate * 100) / 100
      };

    } catch (error) {
      logger.error('Failed to get session statistics', error, { sessionId });
      throw error;
    }
  }

  /**
   * Check if response exists for session and question
   * @param {string} sessionId - Session ID
   * @param {number} questionNumber - Question number
   * @returns {Promise<boolean>} - True if response exists
   */
  static async exists(sessionId, questionNumber) {
    try {
      const sql = `
        SELECT 1 FROM interview_responses
        WHERE session_id = $1 AND question_number = $2
        LIMIT 1
      `;

      const result = await query(sql, [sessionId, questionNumber]);
      return result.rows.length > 0;

    } catch (error) {
      logger.error('Failed to check if response exists', error, {
        sessionId,
        questionNumber
      });
      throw error;
    }
  }

  /**
   * Get word count for response
   * @returns {number} - Word count
   */
  getWordCount() {
    if (!this.response_text) {
      return 0;
    }

    return this.response_text.trim().split(/\s+/).length;
  }

  /**
   * Check if response is empty
   * @returns {boolean} - True if response is empty
   */
  isEmpty() {
    return !this.response_text || this.response_text.trim() === '';
  }

  /**
   * Convert to plain object
   * @returns {object} - Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      session_id: this.session_id,
      question_number: this.question_number,
      question_text: this.question_text,
      response_text: this.response_text,
      word_count: this.getWordCount(),
      is_empty: this.isEmpty(),
      created_at: this.created_at
    };
  }
}

module.exports = InterviewResponse;