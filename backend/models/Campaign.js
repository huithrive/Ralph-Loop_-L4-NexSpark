// Campaign Model - Module 3 Spec Compliant
// Handles database operations for advertising campaigns

const { query } = require('../config/database');
const logger = require('../utils/logger');

class Campaign {
  /**
   * Create a new campaign
   * @param {Object} data - Campaign data
   * @returns {Promise<Object>} Created campaign
   */
  static async create(data) {
    const {
      user_id,
      research_id,
      platform,
      campaign_name,
      objective,
      creative_ids,
      ad_copy,
      budget_daily,
      targeting
    } = data;

    const sql = `
      INSERT INTO campaigns (
        user_id, research_id, platform, campaign_name, objective,
        creative_ids, ad_copy, budget_daily, targeting, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      user_id, research_id, platform, campaign_name, objective,
      JSON.stringify(creative_ids), ad_copy, budget_daily,
      JSON.stringify(targeting), 'draft'
    ];

    try {
      const result = await query(sql, values);
      logger.info('Campaign created', { id: result.rows[0].id, campaign_name, platform });
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create campaign', error, { campaign_name });
      throw new Error(`Failed to create campaign: ${error.message}`);
    }
  }

  /**
   * Find campaign by ID
   * @param {string} id - Campaign ID
   * @returns {Promise<Object|null>} Campaign or null
   */
  static async findById(id) {
    const sql = `
      SELECT * FROM campaigns
      WHERE id = $1
    `;

    try {
      const result = await query(sql, [id]);
      const campaign = result.rows[0];

      if (campaign) {
        // Parse JSON fields with error handling
        try {
          campaign.creative_ids = JSON.parse(campaign.creative_ids || '[]');
        } catch (e) {
          // Handle legacy data that might be stored as comma-separated string
          if (typeof campaign.creative_ids === 'string') {
            campaign.creative_ids = campaign.creative_ids.split(',');
          } else if (Array.isArray(campaign.creative_ids)) {
            // Already an array, use as-is
            campaign.creative_ids = campaign.creative_ids;
          } else {
            campaign.creative_ids = [];
          }
        }

        try {
          campaign.targeting = JSON.parse(campaign.targeting || '{}');
        } catch (e) {
          campaign.targeting = {};
        }
      }

      return campaign || null;
    } catch (error) {
      logger.error('Failed to find campaign', error, { id });
      throw new Error(`Failed to find campaign: ${error.message}`);
    }
  }

  /**
   * Update campaign with platform-specific IDs
   * @param {string} id - Campaign ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated campaign
   */
  static async update(id, updates) {
    const allowedFields = [
      'status', 'meta_campaign_id', 'meta_ad_account_id', 'meta_ad_set_id', 'meta_ad_id',
      'google_campaign_id', 'google_ad_group_id', 'google_ad_id', 'budget_daily', 'ad_copy'
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
      UPDATE campaigns
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    try {
      const result = await query(sql, values);
      if (result.rows.length === 0) {
        throw new Error('Campaign not found');
      }

      const campaign = result.rows[0];
      // Parse JSON fields with error handling
      try {
        campaign.creative_ids = JSON.parse(campaign.creative_ids || '[]');
      } catch (e) {
        // Handle legacy data that might be stored as comma-separated string
        if (typeof campaign.creative_ids === 'string') {
          campaign.creative_ids = campaign.creative_ids.split(',');
        } else if (Array.isArray(campaign.creative_ids)) {
          // Already an array, use as-is
          campaign.creative_ids = campaign.creative_ids;
        } else {
          campaign.creative_ids = [];
        }
      }

      try {
        campaign.targeting = JSON.parse(campaign.targeting || '{}');
      } catch (e) {
        campaign.targeting = {};
      }

      logger.info('Campaign updated', { id, updates: Object.keys(updates) });
      return campaign;
    } catch (error) {
      logger.error('Failed to update campaign', error, { id });
      throw new Error(`Failed to update campaign: ${error.message}`);
    }
  }

  /**
   * List campaigns with filtering
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of campaigns
   */
  static async list(options = {}) {
    const {
      user_id,
      research_id,
      platform,
      status,
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
    if (platform) {
      conditions.push(`platform = $${paramIndex}`);
      values.push(platform);
      paramIndex++;
    }
    if (status) {
      conditions.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    values.push(limit, offset);
    const sql = `
      SELECT
        id, user_id, research_id, platform, campaign_name, objective,
        creative_ids, ad_copy, status, budget_daily, targeting,
        meta_campaign_id, meta_ad_account_id, google_campaign_id,
        created_at, updated_at
      FROM campaigns
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    try {
      const result = await query(sql, values);

      // Parse JSON fields for all campaigns
      const campaigns = result.rows.map(campaign => ({
        ...campaign,
        creative_ids: (() => {
          try {
            return JSON.parse(campaign.creative_ids || '[]');
          } catch (e) {
            if (typeof campaign.creative_ids === 'string') {
              return campaign.creative_ids.split(',');
            } else if (Array.isArray(campaign.creative_ids)) {
              return campaign.creative_ids;
            } else {
              return [];
            }
          }
        })(),
        targeting: (() => {
          try {
            return JSON.parse(campaign.targeting || '{}');
          } catch (e) {
            return {};
          }
        })()
      }));

      return campaigns;
    } catch (error) {
      logger.error('Failed to list campaigns', error, options);
      throw new Error(`Failed to list campaigns: ${error.message}`);
    }
  }

  /**
   * Get campaigns by platform IDs (for performance tracking)
   * @param {string} platform - Platform ('meta' or 'google')
   * @param {Array<string>} campaignIds - Platform-specific campaign IDs
   * @returns {Promise<Array>} Matching campaigns
   */
  static async findByPlatformIds(platform, campaignIds) {
    if (!campaignIds || campaignIds.length === 0) {
      return [];
    }

    const idField = platform === 'meta' ? 'meta_campaign_id' : 'google_campaign_id';
    const placeholders = campaignIds.map((_, index) => `$${index + 2}`).join(', ');

    const sql = `
      SELECT * FROM campaigns
      WHERE platform = $1 AND ${idField} IN (${placeholders})
    `;

    const values = [platform, ...campaignIds];

    try {
      const result = await query(sql, values);

      return result.rows.map(campaign => ({
        ...campaign,
        creative_ids: (() => {
          try {
            return JSON.parse(campaign.creative_ids || '[]');
          } catch (e) {
            if (typeof campaign.creative_ids === 'string') {
              return campaign.creative_ids.split(',');
            } else if (Array.isArray(campaign.creative_ids)) {
              return campaign.creative_ids;
            } else {
              return [];
            }
          }
        })(),
        targeting: (() => {
          try {
            return JSON.parse(campaign.targeting || '{}');
          } catch (e) {
            return {};
          }
        })()
      }));
    } catch (error) {
      logger.error('Failed to find campaigns by platform IDs', error, { platform, campaignIds });
      throw new Error(`Failed to find campaigns: ${error.message}`);
    }
  }

  /**
   * Get campaign statistics
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
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
        COUNT(CASE WHEN platform = 'meta' THEN 1 END) as meta_campaigns,
        COUNT(CASE WHEN platform = 'google' THEN 1 END) as google_campaigns,
        COUNT(CASE WHEN platform = 'both' THEN 1 END) as multi_platform,
        AVG(budget_daily) as avg_daily_budget,
        SUM(budget_daily) as total_daily_budget,
        DATE(created_at) as date
      FROM campaigns
      ${whereClause}
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    try {
      const result = await query(sql, values);

      // Get totals
      const totalSql = `
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
          COUNT(CASE WHEN platform = 'meta' THEN 1 END) as meta_campaigns,
          COUNT(CASE WHEN platform = 'google' THEN 1 END) as google_campaigns,
          COUNT(CASE WHEN platform = 'both' THEN 1 END) as multi_platform,
          AVG(budget_daily) as avg_daily_budget,
          SUM(budget_daily) as total_daily_budget
        FROM campaigns
        ${whereClause}
      `;

      const totalResult = await query(totalSql, values);

      return {
        totals: {
          total: parseInt(totalResult.rows[0].total),
          active: parseInt(totalResult.rows[0].active),
          paused: parseInt(totalResult.rows[0].paused),
          draft: parseInt(totalResult.rows[0].draft),
          meta_campaigns: parseInt(totalResult.rows[0].meta_campaigns),
          google_campaigns: parseInt(totalResult.rows[0].google_campaigns),
          multi_platform: parseInt(totalResult.rows[0].multi_platform),
          avg_daily_budget: parseFloat(totalResult.rows[0].avg_daily_budget) || 0,
          total_daily_budget: parseFloat(totalResult.rows[0].total_daily_budget) || 0
        },
        daily_stats: result.rows
      };
    } catch (error) {
      logger.error('Failed to get campaign statistics', error, { user_id });
      throw new Error(`Failed to get campaign statistics: ${error.message}`);
    }
  }

  /**
   * Clean up old completed campaigns
   * @param {number} daysOld - Days old to consider for cleanup
   * @returns {Promise<number>} Number of campaigns cleaned up
   */
  static async cleanup(daysOld = 90) {
    const sql = `
      DELETE FROM campaigns
      WHERE status = 'completed'
      AND created_at < CURRENT_DATE - INTERVAL '${daysOld} days'
    `;

    try {
      const result = await query(sql);
      logger.info('Campaign cleanup completed', { deleted: result.rowCount, daysOld });
      return result.rowCount;
    } catch (error) {
      logger.error('Failed to cleanup campaigns', error);
      throw new Error(`Failed to cleanup campaigns: ${error.message}`);
    }
  }
}

module.exports = Campaign;