const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * GTMReport model for handling gtm_reports table operations
 */
class GTMReport {
  constructor(data = {}) {
    this.id = data.id || null;
    this.research_id = data.research_id || null;
    this.interview_session_id = data.interview_session_id || null;
    this.report_data = data.report_data || null;
    this.status = data.status || 'draft';
    this.pdf_url = data.pdf_url || null;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  /**
   * Create a new GTM report
   * @param {object} data - Report data
   * @returns {Promise<GTMReport>} - Created GTM report
   */
  static async create(data) {
    try {
      const id = uuidv4();
      const sql = `
        INSERT INTO gtm_reports (
          id, research_id, interview_session_id, report_data, status, pdf_url
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const values = [
        id,
        data.research_id,
        data.interview_session_id || null,
        JSON.stringify(data.report_data),
        data.status || 'draft',
        data.pdf_url || null
      ];

      const result = await query(sql, values);

      logger.info('GTM report created', {
        reportId: id,
        researchId: data.research_id,
        status: data.status || 'draft'
      });

      return new GTMReport(result.rows[0]);

    } catch (error) {
      logger.error('Failed to create GTM report', error, {
        researchId: data.research_id
      });
      throw error;
    }
  }

  /**
   * Find GTM report by ID
   * @param {string} id - Report ID
   * @returns {Promise<GTMReport|null>} - Found report or null
   */
  static async findById(id) {
    try {
      const sql = 'SELECT * FROM gtm_reports WHERE id = $1';
      const result = await query(sql, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];

      // Parse JSON fields
      // JSONB field is already parsed by PostgreSQL, no need to JSON.parse()

      return new GTMReport(row);

    } catch (error) {
      logger.error('Failed to find GTM report by ID', error, { reportId: id });
      throw error;
    }
  }

  /**
   * Find GTM reports by research ID
   * @param {string} researchId - Research ID
   * @returns {Promise<GTMReport[]>} - Array of GTM reports
   */
  static async findByResearchId(researchId) {
    try {
      const sql = `
        SELECT * FROM gtm_reports
        WHERE research_id = $1
        ORDER BY created_at DESC
      `;

      const result = await query(sql, [researchId]);

      return result.rows.map(row => {
        // Parse JSON fields
        // JSONB field is already parsed by PostgreSQL, no need to JSON.parse()
        return new GTMReport(row);
      });

    } catch (error) {
      logger.error('Failed to find GTM reports by research ID', error, { researchId });
      throw error;
    }
  }

  /**
   * Find GTM report by research and interview session
   * @param {string} researchId - Research ID
   * @param {string} sessionId - Interview session ID
   * @returns {Promise<GTMReport|null>} - Found report or null
   */
  static async findByResearchAndSession(researchId, sessionId) {
    try {
      const sql = `
        SELECT * FROM gtm_reports
        WHERE research_id = $1 AND interview_session_id = $2
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const result = await query(sql, [researchId, sessionId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      // JSONB field is already parsed by PostgreSQL, no need to JSON.parse()

      return new GTMReport(row);

    } catch (error) {
      logger.error('Failed to find GTM report by research and session', error, {
        researchId,
        sessionId
      });
      throw error;
    }
  }

  /**
   * Get recent GTM reports
   * @param {number} limit - Maximum number of results (default: 20)
   * @param {number} offset - Number of results to skip (default: 0)
   * @returns {Promise<{reports: GTMReport[], total: number}>} - Reports and total count
   */
  static async getRecent(limit = 20, offset = 0) {
    try {
      const countSql = 'SELECT COUNT(*) FROM gtm_reports';
      const countResult = await query(countSql);
      const total = parseInt(countResult.rows[0].count);

      const sql = `
        SELECT * FROM gtm_reports
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;

      const result = await query(sql, [limit, offset]);

      const reports = result.rows.map(row => {
        // Parse JSON fields
        // JSONB field is already parsed by PostgreSQL, no need to JSON.parse()
        return new GTMReport(row);
      });

      return { reports, total };

    } catch (error) {
      logger.error('Failed to get recent GTM reports', error);
      throw error;
    }
  }

  /**
   * Get reports by status
   * @param {string} status - Report status
   * @param {number} limit - Maximum number of results
   * @param {number} offset - Number of results to skip
   * @returns {Promise<{reports: GTMReport[], total: number}>} - Reports and total count
   */
  static async getByStatus(status, limit = 20, offset = 0) {
    try {
      const countSql = 'SELECT COUNT(*) FROM gtm_reports WHERE status = $1';
      const countResult = await query(countSql, [status]);
      const total = parseInt(countResult.rows[0].count);

      const sql = `
        SELECT * FROM gtm_reports
        WHERE status = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await query(sql, [status, limit, offset]);

      const reports = result.rows.map(row => {
        // JSONB field is already parsed by PostgreSQL, no need to JSON.parse()
        return new GTMReport(row);
      });

      return { reports, total };

    } catch (error) {
      logger.error('Failed to get GTM reports by status', error, { status });
      throw error;
    }
  }

  /**
   * Update GTM report
   * @param {string} id - Report ID
   * @param {object} updates - Fields to update
   * @returns {Promise<GTMReport|null>} - Updated report or null
   */
  static async update(id, updates) {
    try {
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      // Build dynamic update query
      Object.keys(updates).forEach(key => {
        if (key === 'report_data') {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(updates[key]));
        } else if (key !== 'id' && key !== 'created_at') {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
        }
        paramCount++;
      });

      if (updateFields.length === 0) {
        return await GTMReport.findById(id);
      }

      values.push(id);

      const sql = `
        UPDATE gtm_reports
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await query(sql, values);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      // JSONB field is already parsed by PostgreSQL, no need to JSON.parse()

      logger.info('GTM report updated', { reportId: id });

      return new GTMReport(row);

    } catch (error) {
      logger.error('Failed to update GTM report', error, { reportId: id });
      throw error;
    }
  }

  /**
   * Mark report as final
   * @param {string} id - Report ID
   * @param {string} pdfUrl - Optional PDF URL
   * @returns {Promise<GTMReport|null>} - Updated report or null
   */
  static async markAsFinal(id, pdfUrl = null) {
    try {
      const updates = { status: 'final' };
      if (pdfUrl) {
        updates.pdf_url = pdfUrl;
      }

      const report = await GTMReport.update(id, updates);

      if (report) {
        logger.info('GTM report marked as final', {
          reportId: id,
          hasPdf: !!pdfUrl
        });
      }

      return report;

    } catch (error) {
      logger.error('Failed to mark GTM report as final', error, { reportId: id });
      throw error;
    }
  }

  /**
   * Delete GTM report
   * @param {string} id - Report ID
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  static async delete(id) {
    try {
      const sql = 'DELETE FROM gtm_reports WHERE id = $1';
      const result = await query(sql, [id]);

      const deleted = result.rowCount > 0;

      if (deleted) {
        logger.info('GTM report deleted', { reportId: id });
      }

      return deleted;

    } catch (error) {
      logger.error('Failed to delete GTM report', error, { reportId: id });
      throw error;
    }
  }

  /**
   * Get report sections
   * @returns {object|null} - Report sections or null
   */
  getSections() {
    if (!this.report_data) {
      return null;
    }

    return {
      executiveSummary: this.report_data.executiveSummary || null,
      marketAnalysis: this.report_data.marketAnalysis || null,
      targetAudience: this.report_data.targetAudience || null,
      competitiveLandscape: this.report_data.competitiveLandscape || null,
      channelStrategy: this.report_data.channelStrategy || null,
      actionPlan: this.report_data.actionPlan || null,
      kpisMetrics: this.report_data.kpisMetrics || null
    };
  }

  /**
   * Get section by name
   * @param {string} sectionName - Name of the section
   * @returns {object|null} - Section data or null
   */
  getSection(sectionName) {
    const sections = this.getSections();
    return sections ? sections[sectionName] || null : null;
  }

  /**
   * Check if report is complete (has all 7 sections)
   * @returns {boolean} - True if report has all sections
   */
  isComplete() {
    const sections = this.getSections();
    if (!sections) {
      return false;
    }

    const requiredSections = [
      'executiveSummary',
      'marketAnalysis',
      'targetAudience',
      'competitiveLandscape',
      'channelStrategy',
      'actionPlan',
      'kpisMetrics'
    ];

    return requiredSections.every(section => sections[section] !== null);
  }

  /**
   * Get completion percentage
   * @returns {number} - Completion percentage (0-100)
   */
  getCompletionPercentage() {
    const sections = this.getSections();
    if (!sections) {
      return 0;
    }

    const requiredSections = [
      'executiveSummary',
      'marketAnalysis',
      'targetAudience',
      'competitiveLandscape',
      'channelStrategy',
      'actionPlan',
      'kpisMetrics'
    ];

    const completedSections = requiredSections.filter(section =>
      sections[section] !== null
    ).length;

    return Math.round((completedSections / requiredSections.length) * 100);
  }

  /**
   * Check if report is draft
   * @returns {boolean} - True if report is in draft status
   */
  isDraft() {
    return this.status === 'draft';
  }

  /**
   * Check if report is final
   * @returns {boolean} - True if report is final
   */
  isFinal() {
    return this.status === 'final';
  }

  /**
   * Get estimated reading time in minutes
   * @returns {number} - Estimated reading time
   */
  getEstimatedReadingTime() {
    if (!this.report_data) {
      return 0;
    }

    // Estimate based on sections (rough calculation)
    const sections = this.getSections();
    const completedSections = Object.values(sections).filter(section => section !== null).length;

    // Assume each section takes 2-3 minutes to read
    return completedSections * 2.5;
  }

  /**
   * Convert to plain object
   * @returns {object} - Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      research_id: this.research_id,
      interview_session_id: this.interview_session_id,
      report_data: this.report_data,
      status: this.status,
      pdf_url: this.pdf_url,
      created_at: this.created_at,
      updated_at: this.updated_at,
      completion_percentage: this.getCompletionPercentage(),
      is_complete: this.isComplete(),
      is_draft: this.isDraft(),
      is_final: this.isFinal(),
      estimated_reading_time: this.getEstimatedReadingTime()
    };
  }
}

module.exports = GTMReport;