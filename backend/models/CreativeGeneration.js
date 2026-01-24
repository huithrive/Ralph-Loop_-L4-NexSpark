// Creative Generation Model
// Handles database operations for creative generation jobs

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class CreativeGeneration {
  /**
   * Create a new creative generation job
   * @param {Object} data - Generation job data
   * @returns {Promise<Object>} Created generation job
   */
  static async create(data) {
    const {
      jobId = uuidv4(),
      provider = 'pixverse',
      prompt,
      negative_prompt,
      image_url,
      duration = 5,
      quality = '720p',
      style,
      motion_mode = 'normal',
      seed,
      provider_img_id,
      provider_video_id
    } = data;

    const sql = `
      INSERT INTO creative_generations (
        job_id, provider, prompt, negative_prompt, image_url,
        duration, quality, style, motion_mode, seed,
        provider_img_id, provider_video_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      jobId, provider, prompt, negative_prompt, image_url,
      duration, quality, style, motion_mode, seed,
      provider_img_id, provider_video_id, 'pending'
    ];

    try {
      const result = await query(sql, values);
      logger.info('Creative generation job created', { jobId, provider });
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create creative generation job', error, { jobId });
      throw new Error(`Failed to create generation job: ${error.message}`);
    }
  }

  /**
   * Find generation job by job ID
   * @param {string} jobId - Job ID
   * @returns {Promise<Object|null>} Generation job or null
   */
  static async findByJobId(jobId) {
    const sql = `
      SELECT * FROM creative_generations
      WHERE job_id = $1
    `;

    try {
      const result = await query(sql, [jobId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to find creative generation job', error, { jobId });
      throw new Error(`Failed to find generation job: ${error.message}`);
    }
  }

  /**
   * Update generation job status and data
   * @param {string} jobId - Job ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated generation job
   */
  static async update(jobId, updates) {
    const allowedFields = [
      'status', 'provider_img_id', 'provider_video_id',
      'video_url', 'img_url', 'file_size', 'width', 'height',
      'completed_at', 'error_message'
    ];

    const setClause = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(field => {
      if (allowedFields.includes(field)) {
        setClause.push(`${field} = $${paramIndex}`);
        values.push(updates[field]);
        paramIndex++;
      }
    });

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(jobId);
    const sql = `
      UPDATE creative_generations
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE job_id = $${paramIndex}
      RETURNING *
    `;

    try {
      const result = await query(sql, values);
      if (result.rows.length === 0) {
        throw new Error('Generation job not found');
      }
      logger.info('Creative generation job updated', { jobId, updates: Object.keys(updates) });
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to update creative generation job', error, { jobId });
      throw new Error(`Failed to update generation job: ${error.message}`);
    }
  }

  /**
   * List recent generation jobs
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of generation jobs
   */
  static async list(options = {}) {
    const {
      limit = 20,
      offset = 0,
      status,
      provider
    } = options;

    let whereClause = '';
    const values = [];
    let paramIndex = 1;

    const conditions = [];
    if (status) {
      conditions.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }
    if (provider) {
      conditions.push(`provider = $${paramIndex}`);
      values.push(provider);
      paramIndex++;
    }

    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    values.push(limit, offset);
    const sql = `
      SELECT
        id, job_id, provider, status, prompt, duration, quality, style,
        video_url, started_at, completed_at, created_at
      FROM creative_generations
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    try {
      const result = await query(sql, values);
      return result.rows;
    } catch (error) {
      logger.error('Failed to list creative generation jobs', error);
      throw new Error(`Failed to list generation jobs: ${error.message}`);
    }
  }

  /**
   * Get generation statistics
   * @returns {Promise<Object>} Generation statistics
   */
  static async getStats() {
    const sql = `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN status IN ('pending', 'generating') THEN 1 END) as active,
        provider,
        DATE(created_at) as date
      FROM creative_generations
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY provider, DATE(created_at)
      ORDER BY date DESC, provider
    `;

    try {
      const result = await query(sql);

      // Calculate totals
      const totalSql = `
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          COUNT(CASE WHEN status IN ('pending', 'generating') THEN 1 END) as active
        FROM creative_generations
      `;

      const totalResult = await query(totalSql);

      // Parse string numbers to integers
      const totals = totalResult.rows[0];
      const parsedTotals = {
        total: parseInt(totals.total),
        completed: parseInt(totals.completed),
        failed: parseInt(totals.failed),
        active: parseInt(totals.active)
      };

      return {
        totals: parsedTotals,
        daily_stats: result.rows
      };
    } catch (error) {
      logger.error('Failed to get creative generation stats', error);
      throw new Error(`Failed to get generation stats: ${error.message}`);
    }
  }

  /**
   * Clean up old completed jobs
   * @param {number} daysOld - Days old to consider for cleanup (0 = all)
   * @returns {Promise<number>} Number of jobs cleaned up
   */
  static async cleanup(daysOld = 30) {
    let sql;

    if (daysOld === 0) {
      // For testing: clean up all jobs
      sql = 'DELETE FROM creative_generations';
    } else {
      sql = `
        DELETE FROM creative_generations
        WHERE status IN ('completed', 'failed', 'deleted')
        AND created_at < CURRENT_DATE - INTERVAL '${daysOld} days'
      `;
    }

    try {
      const result = await query(sql);
      logger.info('Creative generation cleanup completed', { deleted: result.rowCount, daysOld });
      return result.rowCount;
    } catch (error) {
      logger.error('Failed to cleanup creative generation jobs', error);
      throw new Error(`Failed to cleanup generation jobs: ${error.message}`);
    }
  }
}

module.exports = CreativeGeneration;