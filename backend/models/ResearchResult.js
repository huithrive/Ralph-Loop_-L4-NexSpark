const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * ResearchResult model for handling research_results table operations
 */
class ResearchResult {
  constructor(data = {}) {
    this.id = data.id || null;
    this.website_url = data.website_url || null;
    this.product_description = data.product_description || null;
    this.market_size = data.market_size || null;
    this.competitors = data.competitors || null;
    this.target_audience = data.target_audience || null;
    this.channels = data.channels || null;
    this.pain_points = data.pain_points || null;
    this.raw_response = data.raw_response || null;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  /**
   * Create a new research result
   * @param {object} data - Research result data
   * @returns {Promise<ResearchResult>} - Created research result
   */
  static async create(data) {
    try {
      const id = uuidv4();
      const sql = `
        INSERT INTO research_results (
          id, website_url, product_description, market_size,
          competitors, target_audience, channels, pain_points, raw_response
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const values = [
        id,
        data.website_url,
        data.product_description,
        JSON.stringify(data.market_size),
        JSON.stringify(data.competitors),
        JSON.stringify(data.target_audience),
        JSON.stringify(data.channels),
        JSON.stringify(data.pain_points),
        data.raw_response
      ];

      const result = await query(sql, values);

      logger.info('Research result created', {
        researchId: id,
        websiteUrl: data.website_url
      });

      return new ResearchResult(result.rows[0]);

    } catch (error) {
      logger.error('Failed to create research result', error, {
        websiteUrl: data.website_url
      });
      throw error;
    }
  }

  /**
   * Find research result by ID
   * @param {string} id - Research result ID
   * @returns {Promise<ResearchResult|null>} - Found research result or null
   */
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM research_results WHERE id = $1';
      const result = await query(sql, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      // Parse JSON fields
      row.market_size = row.market_size ? JSON.parse(row.market_size) : null;
      row.competitors = row.competitors ? JSON.parse(row.competitors) : null;
      row.target_audience = row.target_audience ? JSON.parse(row.target_audience) : null;
      row.channels = row.channels ? JSON.parse(row.channels) : null;
      row.pain_points = row.pain_points ? JSON.parse(row.pain_points) : null;

      return new ResearchResult(row);

    } catch (error) {
      logger.error('Failed to find research result by ID', error, { researchId: id });
      throw error;
    }
  }

  /**
   * Find research results by website URL
   * @param {string} websiteUrl - Website URL to search for
   * @param {number} limit - Maximum number of results (default: 10)
   * @returns {Promise<ResearchResult[]>} - Array of research results
   */
  static async findByWebsiteUrl(websiteUrl, limit = 10) {
    try {
      const sql = `
        SELECT * FROM research_results
        WHERE website_url = $1
        ORDER BY created_at DESC
        LIMIT $2
      `;

      const result = await query(sql, [websiteUrl, limit]);

      return result.rows.map(row => {
        // Parse JSON fields
        row.market_size = row.market_size ? JSON.parse(row.market_size) : null;
        row.competitors = row.competitors ? JSON.parse(row.competitors) : null;
        row.target_audience = row.target_audience ? JSON.parse(row.target_audience) : null;
        row.channels = row.channels ? JSON.parse(row.channels) : null;
        row.pain_points = row.pain_points ? JSON.parse(row.pain_points) : null;

        return new ResearchResult(row);
      });

    } catch (error) {
      logger.error('Failed to find research results by URL', error, { websiteUrl });
      throw error;
    }
  }

  /**
   * Get recent research results
   * @param {number} limit - Maximum number of results (default: 20)
   * @param {number} offset - Number of results to skip (default: 0)
   * @returns {Promise<{results: ResearchResult[], total: number}>} - Results and total count
   */
  static async getRecent(limit = 20, offset = 0) {
    try {
      const countSql = 'SELECT COUNT(*) FROM research_results';
      const countResult = await query(countSql);
      const total = parseInt(countResult.rows[0].count);

      const sql = `
        SELECT * FROM research_results
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;

      const result = await query(sql, [limit, offset]);

      const results = result.rows.map(row => {
        // Parse JSON fields
        row.market_size = row.market_size ? JSON.parse(row.market_size) : null;
        row.competitors = row.competitors ? JSON.parse(row.competitors) : null;
        row.target_audience = row.target_audience ? JSON.parse(row.target_audience) : null;
        row.channels = row.channels ? JSON.parse(row.channels) : null;
        row.pain_points = row.pain_points ? JSON.parse(row.pain_points) : null;

        return new ResearchResult(row);
      });

      return { results, total };

    } catch (error) {
      logger.error('Failed to get recent research results', error);
      throw error;
    }
  }

  /**
   * Update research result
   * @param {string} id - Research result ID
   * @param {object} updates - Fields to update
   * @returns {Promise<ResearchResult|null>} - Updated research result or null
   */
  static async update(id, updates) {
    try {
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      // Build dynamic update query
      Object.keys(updates).forEach(key => {
        if (['market_size', 'competitors', 'target_audience', 'channels', 'pain_points'].includes(key)) {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(updates[key]));
        } else if (key !== 'id' && key !== 'created_at') {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
        }
        paramCount++;
      });

      if (updateFields.length === 0) {
        return await ResearchResult.findById(id);
      }

      values.push(id);

      const sql = `
        UPDATE research_results
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await query(sql, values);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      // Parse JSON fields
      row.market_size = row.market_size ? JSON.parse(row.market_size) : null;
      row.competitors = row.competitors ? JSON.parse(row.competitors) : null;
      row.target_audience = row.target_audience ? JSON.parse(row.target_audience) : null;
      row.channels = row.channels ? JSON.parse(row.channels) : null;
      row.pain_points = row.pain_points ? JSON.parse(row.pain_points) : null;

      logger.info('Research result updated', { researchId: id });

      return new ResearchResult(row);

    } catch (error) {
      logger.error('Failed to update research result', error, { researchId: id });
      throw error;
    }
  }

  /**
   * Delete research result
   * @param {string} id - Research result ID
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  static async delete(id) {
    try {
      const sql = 'DELETE FROM research_results WHERE id = $1';
      const result = await query(sql, [id]);

      const deleted = result.rowCount > 0;

      if (deleted) {
        logger.info('Research result deleted', { researchId: id });
      }

      return deleted;

    } catch (error) {
      logger.error('Failed to delete research result', error, { researchId: id });
      throw error;
    }
  }

  /**
   * Check if research exists for URL (for caching)
   * @param {string} websiteUrl - Website URL
   * @param {number} maxAgeHours - Maximum age in hours (default: 24)
   * @returns {Promise<ResearchResult|null>} - Recent research result or null
   */
  static async findRecentByUrl(websiteUrl, maxAgeHours = 24) {
    try {
      const sql = `
        SELECT * FROM research_results
        WHERE website_url = $1
          AND created_at > NOW() - INTERVAL '${maxAgeHours} hours'
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const result = await query(sql, [websiteUrl]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      // Parse JSON fields
      row.market_size = row.market_size ? JSON.parse(row.market_size) : null;
      row.competitors = row.competitors ? JSON.parse(row.competitors) : null;
      row.target_audience = row.target_audience ? JSON.parse(row.target_audience) : null;
      row.channels = row.channels ? JSON.parse(row.channels) : null;
      row.pain_points = row.pain_points ? JSON.parse(row.pain_points) : null;

      return new ResearchResult(row);

    } catch (error) {
      logger.error('Failed to find recent research by URL', error, { websiteUrl });
      throw error;
    }
  }

  /**
   * Convert to plain object
   * @returns {object} - Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      website_url: this.website_url,
      product_description: this.product_description,
      market_size: this.market_size,
      competitors: this.competitors,
      target_audience: this.target_audience,
      channels: this.channels,
      pain_points: this.pain_points,
      raw_response: this.raw_response,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = ResearchResult;