// Creative Model - Module 2 Spec Compliant
// Handles database operations for creatives using the new schema

const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class Creative {
  /**
   * Create a new creative
   * @param {Object} data - Creative data
   * @returns {Promise<Object>} Created creative
   */
  static async create(data) {
    const {
      user_id,
      research_id,
      creative_type,
      source_image_url,
      prompt,
      style,
      duration,
      quality,
      motion_mode,
      camera_movement,
      negative_prompt,
      use_case,
      provider = 'pixverse'
    } = data;

    const sql = `
      INSERT INTO creatives (
        user_id, research_id, creative_type, source_image_url, prompt,
        style, duration, quality, motion_mode, camera_movement,
        negative_prompt, use_case, provider, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      user_id, research_id, creative_type, source_image_url, prompt,
      style, duration, quality, motion_mode, camera_movement,
      negative_prompt, use_case, provider, 'pending'
    ];

    try {
      const result = await query(sql, values);
      logger.info('Creative created', { id: result.rows[0].id, creative_type, provider });
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create creative', error, { creative_type });
      throw new Error(`Failed to create creative: ${error.message}`);
    }
  }

  /**
   * Find creative by ID
   * @param {string} id - Creative ID
   * @returns {Promise<Object|null>} Creative or null
   */
  static async findById(id) {
    const sql = `
      SELECT * FROM creatives
      WHERE id = $1
    `;

    try {
      const result = await query(sql, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Failed to find creative', error, { id });
      throw new Error(`Failed to find creative: ${error.message}`);
    }
  }

  /**
   * Update creative status and results
   * @param {string} id - Creative ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated creative
   */
  static async update(id, updates) {
    const allowedFields = [
      'status', 'provider_video_id', 'video_url', 'thumbnail_url', 'metadata'
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

    values.push(id);
    const sql = `
      UPDATE creatives
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    try {
      const result = await query(sql, values);
      if (result.rows.length === 0) {
        throw new Error('Creative not found');
      }
      logger.info('Creative updated', { id, updates: Object.keys(updates) });
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to update creative', error, { id });
      throw new Error(`Failed to update creative: ${error.message}`);
    }
  }

  /**
   * List creatives with filtering
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of creatives
   */
  static async list(options = {}) {
    const {
      user_id,
      research_id,
      creative_type,
      status,
      provider,
      limit = 20,
      offset = 0
    } = options;

    let whereClause = '';
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (user_id) {
      conditions.push(`user_id = $${paramIndex}`);
      values.push(user_id);
      paramIndex++;
    }
    if (research_id) {
      conditions.push(`research_id = $${paramIndex}`);
      values.push(research_id);
      paramIndex++;
    }
    if (creative_type) {
      conditions.push(`creative_type = $${paramIndex}`);
      values.push(creative_type);
      paramIndex++;
    }
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
        id, user_id, research_id, creative_type, source_image_url,
        prompt, style, duration, quality, motion_mode, camera_movement,
        negative_prompt, use_case, provider, status, video_url,
        thumbnail_url, created_at, updated_at
      FROM creatives
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    try {
      const result = await query(sql, values);
      return result.rows;
    } catch (error) {
      logger.error('Failed to list creatives', error, options);
      throw new Error(`Failed to list creatives: ${error.message}`);
    }
  }

  /**
   * Get creatives for campaign creation (Module 3 integration)
   * @param {string} user_id - User ID
   * @param {string} research_id - Research ID
   * @returns {Promise<Array>} Available creatives
   */
  static async getForCampaign(user_id, research_id) {
    const sql = `
      SELECT
        id, creative_type, video_url, thumbnail_url, duration,
        quality, style, prompt, created_at
      FROM creatives
      WHERE user_id = $1 AND research_id = $2 AND status = 'completed'
      AND video_url IS NOT NULL
      ORDER BY created_at DESC
    `;

    try {
      const result = await query(sql, [user_id, research_id]);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get creatives for campaign', error, { user_id, research_id });
      throw new Error(`Failed to get creatives for campaign: ${error.message}`);
    }
  }

  /**
   * Get creative statistics
   * @param {string} user_id - User ID (optional)
   * @returns {Promise<Object>} Statistics
   */
  static async getStats(user_id = null) {
    let whereClause = '';
    const values = [];

    if (user_id) {
      whereClause = 'WHERE user_id = $1';
      values.push(user_id);
    }

    const sql = `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN status IN ('pending', 'processing') THEN 1 END) as active,
        COUNT(CASE WHEN creative_type = 'video' THEN 1 END) as videos,
        COUNT(CASE WHEN creative_type = 'image' THEN 1 END) as images,
        provider,
        DATE(created_at) as date
      FROM creatives
      ${whereClause}
      AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY provider, DATE(created_at)
      ORDER BY date DESC, provider
    `;

    try {
      const result = await query(sql, values);

      // Get totals
      const totalSql = `
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          COUNT(CASE WHEN status IN ('pending', 'processing') THEN 1 END) as active,
          COUNT(CASE WHEN creative_type = 'video' THEN 1 END) as videos,
          COUNT(CASE WHEN creative_type = 'image' THEN 1 END) as images
        FROM creatives
        ${whereClause}
      `;

      const totalResult = await query(totalSql, values);

      return {
        totals: {
          total: parseInt(totalResult.rows[0].total),
          completed: parseInt(totalResult.rows[0].completed),
          failed: parseInt(totalResult.rows[0].failed),
          active: parseInt(totalResult.rows[0].active),
          videos: parseInt(totalResult.rows[0].videos),
          images: parseInt(totalResult.rows[0].images)
        },
        daily_stats: result.rows
      };
    } catch (error) {
      logger.error('Failed to get creative statistics', error, { user_id });
      throw new Error(`Failed to get creative statistics: ${error.message}`);
    }
  }

  /**
   * Clean up old completed creatives
   * @param {number} daysOld - Days old to consider for cleanup
   * @returns {Promise<number>} Number of creatives cleaned up
   */
  static async cleanup(daysOld = 30) {
    // For test mode (daysOld = 0), delete all creatives
    // For production, only delete completed/failed creatives older than specified days
    const sql = daysOld === 0 ? `
      DELETE FROM creatives
      WHERE created_at < CURRENT_DATE + INTERVAL '1 day'
    ` : `
      DELETE FROM creatives
      WHERE status IN ('completed', 'failed')
      AND created_at < CURRENT_DATE - INTERVAL '${daysOld} days'
    `;

    try {
      const result = await query(sql);
      logger.info('Creative cleanup completed', { deleted: result.rowCount, daysOld });
      return result.rowCount;
    } catch (error) {
      logger.error('Failed to cleanup creatives', error);
      throw new Error(`Failed to cleanup creatives: ${error.message}`);
    }
  }
}

module.exports = Creative;