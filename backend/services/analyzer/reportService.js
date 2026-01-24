// Report Service - Module 4 Analyzer
// Weekly report generation and email delivery

const AnalyticsService = require('./analyticsService');
const OptimizerService = require('./optimizerService');
const DashboardService = require('./dashboardService');
const logger = require('../../utils/logger');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class ReportService {
  constructor() {
    this.analyticsService = new AnalyticsService();
    this.optimizerService = new OptimizerService();
    this.dashboardService = new DashboardService();
  }

  /**
   * Generate weekly performance report
   * @param {string} userId - User ID
   * @param {Object} options - Report options
   * @returns {Promise<Object>} Generated report
   */
  async generateWeeklyReport(userId, options = {}) {
    try {
      const {
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        endDate = new Date(),
        reportType = 'weekly_performance',
        includePDF = false,
        sendEmail = false,
        emailAddress = null
      } = options;

      logger.info('Generating weekly report', {
        userId,
        reportType,
        dateRange: { startDate, endDate },
        includePDF,
        sendEmail
      });

      // Collect data for the report
      const reportData = await this.collectReportData(userId, startDate, endDate);

      // Generate insights and recommendations
      const insights = await this.generateReportInsights(reportData);
      const recommendations = await this.generateReportRecommendations(reportData, insights);

      // Compile final report
      const report = {
        report_id: require('uuid').v4(),
        user_id: userId,
        report_type: reportType,
        date_range: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
        },
        generated_at: new Date().toISOString(),

        // Report sections
        executive_summary: this.generateExecutiveSummary(reportData, insights),
        performance_overview: reportData.performance_overview,
        campaign_analysis: reportData.campaign_analysis,
        revenue_analysis: reportData.revenue_analysis,
        goal_progress: reportData.goal_progress,
        optimization_actions: reportData.optimization_history,
        insights_and_trends: insights,
        recommendations: recommendations,
        next_steps: this.generateNextSteps(recommendations),

        // Metadata
        data_quality: this.assessDataQuality(reportData),
        report_version: '1.0'
      };

      // Store report in database
      await this.storeReport(userId, report, startDate, endDate);

      // Generate PDF if requested
      if (includePDF) {
        report.pdf_url = await this.generatePDFReport(report);
      }

      // Send email if requested
      if (sendEmail && emailAddress) {
        await this.sendEmailReport(emailAddress, report);
      }

      logger.info('Weekly report generated successfully', {
        userId,
        reportId: report.report_id,
        sectionsCount: Object.keys(report).length - 4, // Exclude metadata
        includedPDF: !!report.pdf_url
      });

      return report;

    } catch (error) {
      logger.error('Failed to generate weekly report', error, { userId });
      throw error;
    }
  }

  /**
   * Collect all data needed for the report
   * @private
   */
  async collectReportData(userId, startDate, endDate) {
    try {
      logger.debug('Collecting report data', { userId, startDate, endDate });

      // Get user's campaigns
      const campaignsQuery = `
        SELECT id, campaign_name, platform, status, budget_daily, created_at
        FROM campaigns
        WHERE user_id = $1
        AND created_at <= $2
        ORDER BY created_at DESC
      `;

      const campaignsResult = await pool.query(campaignsQuery, [userId, endDate]);
      const campaigns = campaignsResult.rows;

      // Collect performance data for all campaigns
      const campaignAnalysis = [];
      let totalMetrics = {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: 0,
        revenue: 0
      };

      for (const campaign of campaigns) {
        try {
          const performance = await this.analyticsService.getPerformanceData(campaign.id, {
            startDate,
            endDate,
            dataSource: 'auto'
          });

          const metrics = performance.metrics || {};

          // Add to totals
          Object.keys(totalMetrics).forEach(key => {
            totalMetrics[key] += metrics[key] || 0;
          });

          campaignAnalysis.push({
            campaign_id: campaign.id,
            campaign_name: campaign.campaign_name,
            platform: campaign.platform,
            status: campaign.status,
            performance: metrics,
            insights: performance.insights || []
          });

        } catch (error) {
          logger.warn('Failed to get performance for campaign', error, { campaignId: campaign.id });

          campaignAnalysis.push({
            campaign_id: campaign.id,
            campaign_name: campaign.campaign_name,
            platform: campaign.platform,
            status: campaign.status,
            performance: {},
            error: 'Performance data unavailable'
          });
        }
      }

      // Calculate derived metrics
      if (totalMetrics.impressions > 0) {
        totalMetrics.ctr = parseFloat(((totalMetrics.clicks / totalMetrics.impressions) * 100).toFixed(2));
      }
      if (totalMetrics.clicks > 0) {
        totalMetrics.cpc = parseFloat((totalMetrics.spend / totalMetrics.clicks).toFixed(2));
        totalMetrics.conversion_rate = parseFloat(((totalMetrics.conversions / totalMetrics.clicks) * 100).toFixed(2));
      }
      if (totalMetrics.conversions > 0) {
        totalMetrics.cpa = parseFloat((totalMetrics.spend / totalMetrics.conversions).toFixed(2));
      }
      if (totalMetrics.spend > 0) {
        totalMetrics.roas = parseFloat((totalMetrics.revenue / totalMetrics.spend).toFixed(2));
      }

      // Get revenue data
      const revenueAnalysis = await this.dashboardService.getRevenueTrackingData(userId);

      // Get goal progress
      const goalProgress = await this.dashboardService.getGoalProgressData(userId);

      // Get optimization history
      const optimizationHistory = await this.getOptimizationHistory(userId, startDate, endDate);

      return {
        campaigns_count: campaigns.length,
        active_campaigns: campaigns.filter(c => c.status === 'active').length,
        performance_overview: totalMetrics,
        campaign_analysis: campaignAnalysis,
        revenue_analysis: revenueAnalysis,
        goal_progress: goalProgress,
        optimization_history: optimizationHistory,
        date_range_days: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      };

    } catch (error) {
      logger.error('Failed to collect report data', error);
      throw error;
    }
  }

  /**
   * Get optimization history for the period
   * @private
   */
  async getOptimizationHistory(userId, startDate, endDate) {
    try {
      const query = `
        SELECT campaign_id, trigger_type, action_type, result, status, created_at
        FROM optimization_actions
        WHERE user_id = $1
        AND created_at BETWEEN $2 AND $3
        ORDER BY created_at DESC
      `;

      const result = await pool.query(query, [userId, startDate, endDate]);

      const actions = result.rows.map(row => ({
        campaign_id: row.campaign_id,
        trigger: row.trigger_type,
        action: row.action_type,
        result: row.result,
        status: row.status,
        date: row.created_at
      }));

      // Summarize actions by type
      const summary = actions.reduce((acc, action) => {
        acc[action.action] = (acc[action.action] || 0) + 1;
        return acc;
      }, {});

      return {
        total_actions: actions.length,
        completed_actions: actions.filter(a => a.status === 'completed').length,
        actions_by_type: summary,
        recent_actions: actions.slice(0, 10) // Last 10 actions
      };

    } catch (error) {
      logger.error('Failed to get optimization history', error);
      return {
        total_actions: 0,
        completed_actions: 0,
        actions_by_type: {},
        recent_actions: []
      };
    }
  }

  /**
   * Generate executive summary
   * @private
   */
  generateExecutiveSummary(reportData, insights) {
    const performance = reportData.performance_overview;
    const revenue = reportData.revenue_analysis;
    const goalProgress = reportData.goal_progress;

    let summaryText = `Performance Overview for ${reportData.date_range_days} days: `;

    if (performance.spend > 0) {
      summaryText += `Invested $${performance.spend.toLocaleString()} in advertising, `;
      summaryText += `generated ${performance.impressions.toLocaleString()} impressions and ${performance.clicks.toLocaleString()} clicks. `;

      if (performance.roas > 0) {
        if (performance.roas >= 3) {
          summaryText += `Strong ROAS of ${performance.roas}x indicates profitable campaigns. `;
        } else if (performance.roas >= 1.5) {
          summaryText += `Moderate ROAS of ${performance.roas}x shows potential for optimization. `;
        } else {
          summaryText += `Low ROAS of ${performance.roas}x requires immediate attention. `;
        }
      }
    } else {
      summaryText += `No advertising spend recorded for this period. `;
    }

    if (revenue.current_month > 0) {
      summaryText += `Current month revenue: $${revenue.current_month.toLocaleString()}`;
      if (revenue.growth_percentage !== 0) {
        summaryText += ` (${revenue.growth_percentage > 0 ? '+' : ''}${revenue.growth_percentage}% vs previous month). `;
      }
    }

    if (goalProgress.progress_percentage > 0) {
      summaryText += `${goalProgress.progress_percentage.toFixed(1)}% progress toward $${goalProgress.goal_amount.toLocaleString()} goal.`;
    }

    return {
      text: summaryText,
      key_metrics: {
        total_spend: performance.spend,
        total_revenue: performance.revenue,
        roas: performance.roas,
        goal_progress: goalProgress.progress_percentage,
        active_campaigns: reportData.active_campaigns
      },
      status: this.determineOverallStatus(performance, revenue, goalProgress)
    };
  }

  /**
   * Generate insights from report data
   * @private
   */
  async generateReportInsights(reportData) {
    const insights = [];
    const performance = reportData.performance_overview;
    const campaigns = reportData.campaign_analysis;

    // Performance insights
    if (performance.ctr > 0) {
      if (performance.ctr >= 2) {
        insights.push({
          type: 'positive',
          category: 'performance',
          title: 'Strong Ad Engagement',
          description: `Your ${performance.ctr}% click-through rate is above industry average, indicating strong ad creative performance.`,
          impact: 'high',
          metric: 'ctr'
        });
      } else if (performance.ctr < 1) {
        insights.push({
          type: 'opportunity',
          category: 'performance',
          title: 'Low Ad Engagement',
          description: `CTR of ${performance.ctr}% suggests ad creatives may need refreshing or targeting adjustment.`,
          impact: 'medium',
          metric: 'ctr'
        });
      }
    }

    // ROAS insights
    if (performance.roas > 0) {
      if (performance.roas >= 4) {
        insights.push({
          type: 'positive',
          category: 'revenue',
          title: 'Excellent Return on Investment',
          description: `${performance.roas}x ROAS indicates very profitable campaigns. Consider scaling successful campaigns.`,
          impact: 'high',
          metric: 'roas'
        });
      } else if (performance.roas < 2) {
        insights.push({
          type: 'warning',
          category: 'revenue',
          title: 'Low Return on Investment',
          description: `${performance.roas}x ROAS suggests campaigns need optimization or budget reallocation.`,
          impact: 'high',
          metric: 'roas'
        });
      }
    }

    // Campaign distribution insights
    const platformDistribution = campaigns.reduce((acc, c) => {
      acc[c.platform] = (acc[c.platform] || 0) + 1;
      return acc;
    }, {});

    if (Object.keys(platformDistribution).length === 1) {
      const platform = Object.keys(platformDistribution)[0];
      insights.push({
        type: 'opportunity',
        category: 'strategy',
        title: 'Single Platform Dependency',
        description: `All campaigns are running on ${platform}. Consider diversifying to other platforms for risk mitigation.`,
        impact: 'medium',
        metric: 'diversification'
      });
    }

    // Optimization insights
    if (reportData.optimization_history.total_actions > 0) {
      const completionRate = (reportData.optimization_history.completed_actions / reportData.optimization_history.total_actions) * 100;

      if (completionRate >= 80) {
        insights.push({
          type: 'positive',
          category: 'optimization',
          title: 'Strong Optimization Execution',
          description: `${completionRate.toFixed(1)}% of optimization recommendations were successfully implemented.`,
          impact: 'medium',
          metric: 'optimization'
        });
      }
    }

    return insights;
  }

  /**
   * Generate recommendations based on data and insights
   * @private
   */
  async generateReportRecommendations(reportData, insights) {
    const recommendations = [];
    const performance = reportData.performance_overview;

    // Performance-based recommendations
    if (performance.ctr < 1.5) {
      recommendations.push({
        priority: 'high',
        category: 'creative',
        title: 'Refresh Ad Creatives',
        description: 'Create new video content with stronger hooks to improve click-through rates',
        action: 'Use the creative generation API to develop 3-5 new video variants',
        expected_impact: 'CTR improvement: 50-150%',
        effort: 'medium',
        timeline: '1-2 weeks'
      });
    }

    if (performance.roas < 2.5 && performance.spend > 100) {
      recommendations.push({
        priority: 'critical',
        category: 'optimization',
        title: 'Optimize Campaign Performance',
        description: 'Low ROAS indicates campaigns need immediate attention',
        action: 'Run automated optimization to pause underperforming ads and reallocate budget',
        expected_impact: 'ROAS improvement: 25-50%',
        effort: 'low',
        timeline: '1-3 days'
      });
    }

    if (reportData.active_campaigns === 0) {
      recommendations.push({
        priority: 'critical',
        category: 'growth',
        title: 'Launch New Campaigns',
        description: 'No active campaigns means missed growth opportunities',
        action: 'Create and launch new campaigns using successful historical patterns',
        expected_impact: 'Revenue growth: 100-300%',
        effort: 'high',
        timeline: '1 week'
      });
    }

    // Goal progress recommendations
    if (reportData.goal_progress.progress_percentage < 25) {
      recommendations.push({
        priority: 'high',
        category: 'strategy',
        title: 'Accelerate Goal Progress',
        description: `Currently at ${reportData.goal_progress.progress_percentage.toFixed(1)}% of revenue goal`,
        action: 'Increase daily ad spend and expand to additional platforms',
        expected_impact: 'Goal timeline improvement: 2-4 weeks',
        effort: 'medium',
        timeline: '1 week'
      });
    }

    // Strategic recommendations
    const platforms = [...new Set(reportData.campaign_analysis.map(c => c.platform))];
    if (platforms.length === 1) {
      recommendations.push({
        priority: 'medium',
        category: 'diversification',
        title: 'Expand Platform Presence',
        description: 'Single platform dependency creates risk',
        action: `Launch campaigns on ${platforms[0] === 'meta' ? 'Google Ads' : 'Meta'} to diversify traffic sources`,
        expected_impact: 'Risk reduction and 20-40% reach increase',
        effort: 'medium',
        timeline: '2-3 weeks'
      });
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Generate next steps section
   * @private
   */
  generateNextSteps(recommendations) {
    const nextSteps = [];

    // Immediate actions (next 7 days)
    const immediateActions = recommendations.filter(r =>
      r.timeline.includes('days') || r.priority === 'critical'
    ).slice(0, 3);

    if (immediateActions.length > 0) {
      nextSteps.push({
        timeframe: 'Next 7 Days',
        actions: immediateActions.map(r => ({
          title: r.title,
          description: r.action,
          priority: r.priority
        }))
      });
    }

    // Short-term actions (next 30 days)
    const shortTermActions = recommendations.filter(r =>
      r.timeline.includes('week') && !immediateActions.includes(r)
    ).slice(0, 2);

    if (shortTermActions.length > 0) {
      nextSteps.push({
        timeframe: 'Next 30 Days',
        actions: shortTermActions.map(r => ({
          title: r.title,
          description: r.action,
          priority: r.priority
        }))
      });
    }

    // Add review checkpoint
    nextSteps.push({
      timeframe: 'Weekly Review',
      actions: [{
        title: 'Performance Review',
        description: 'Review campaign performance and adjust strategies based on weekly data',
        priority: 'medium'
      }]
    });

    return nextSteps;
  }

  /**
   * Determine overall performance status
   * @private
   */
  determineOverallStatus(performance, revenue, goalProgress) {
    let score = 0;

    // ROAS scoring
    if (performance.roas >= 3) score += 3;
    else if (performance.roas >= 2) score += 2;
    else if (performance.roas >= 1) score += 1;

    // Revenue growth scoring
    if (revenue.growth_percentage >= 20) score += 3;
    else if (revenue.growth_percentage >= 5) score += 2;
    else if (revenue.growth_percentage >= 0) score += 1;

    // Goal progress scoring
    if (goalProgress.progress_percentage >= 75) score += 3;
    else if (goalProgress.progress_percentage >= 50) score += 2;
    else if (goalProgress.progress_percentage >= 25) score += 1;

    if (score >= 7) return 'excellent';
    if (score >= 5) return 'good';
    if (score >= 3) return 'fair';
    return 'needs_improvement';
  }

  /**
   * Assess data quality
   * @private
   */
  assessDataQuality(reportData) {
    let quality = 'high';
    const issues = [];

    if (reportData.campaigns_count === 0) {
      quality = 'low';
      issues.push('No campaigns found');
    }

    if (reportData.performance_overview.spend === 0) {
      quality = 'medium';
      issues.push('No advertising spend recorded');
    }

    const campaignsWithErrors = reportData.campaign_analysis.filter(c => c.error).length;
    if (campaignsWithErrors > 0) {
      if (campaignsWithErrors / reportData.campaigns_count > 0.5) {
        quality = 'low';
      } else {
        quality = 'medium';
      }
      issues.push(`${campaignsWithErrors} campaigns missing performance data`);
    }

    return {
      overall: quality,
      issues,
      completeness: Math.max(0, 100 - (issues.length * 20))
    };
  }

  /**
   * Store report in database
   * @private
   */
  async storeReport(userId, report, startDate, endDate) {
    try {
      const query = `
        INSERT INTO weekly_reports (user_id, report_type, date_range_start, date_range_end, report_data, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;

      const result = await pool.query(query, [
        userId,
        report.report_type,
        startDate,
        endDate,
        JSON.stringify(report),
        'completed'
      ]);

      logger.debug('Report stored in database', {
        reportId: result.rows[0].id,
        userId
      });

    } catch (error) {
      logger.error('Failed to store report', error);
      // Don't throw - report generation success doesn't depend on storage
    }
  }

  /**
   * Generate PDF report (mock implementation)
   * @private
   */
  async generatePDFReport(report) {
    try {
      // Mock PDF generation - in production, use libraries like puppeteer, jsPDF, or PDFKit
      await this.sleep(2000); // Simulate PDF generation time

      const pdfUrl = `https://storage.example.com/reports/${report.report_id}.pdf`;

      logger.info('PDF report generated', {
        reportId: report.report_id,
        pdfUrl
      });

      return pdfUrl;

    } catch (error) {
      logger.error('Failed to generate PDF report', error);
      return null;
    }
  }

  /**
   * Send email report (mock implementation)
   * @private
   */
  async sendEmailReport(emailAddress, report) {
    try {
      // Mock email sending - in production, use SendGrid, SES, or similar
      await this.sleep(1000); // Simulate email sending time

      logger.info('Email report sent', {
        reportId: report.report_id,
        emailAddress,
        recipient: emailAddress
      });

      // Update database
      const query = `
        UPDATE weekly_reports
        SET email_sent = true, email_sent_at = CURRENT_TIMESTAMP
        WHERE report_data->>'report_id' = $1
      `;

      await pool.query(query, [report.report_id]);

      return true;

    } catch (error) {
      logger.error('Failed to send email report', error);
      return false;
    }
  }

  /**
   * Get report history for user
   */
  async getReportHistory(userId, limit = 10) {
    try {
      const query = `
        SELECT id, report_type, date_range_start, date_range_end, pdf_url, email_sent, status, created_at
        FROM weekly_reports
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `;

      const result = await pool.query(query, [userId, limit]);

      return result.rows.map(row => ({
        report_id: row.id,
        report_type: row.report_type,
        date_range: {
          start: row.date_range_start,
          end: row.date_range_end
        },
        pdf_url: row.pdf_url,
        email_sent: row.email_sent,
        status: row.status,
        created_at: row.created_at
      }));

    } catch (error) {
      logger.error('Failed to get report history', error);
      return [];
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus() {
    try {
      return {
        service: 'ReportService',
        status: 'operational',
        capabilities: [
          'Weekly report generation',
          'Performance analysis',
          'Insights generation',
          'Recommendation engine',
          'PDF report creation',
          'Email delivery',
          'Report history tracking'
        ]
      };

    } catch (error) {
      logger.error('Failed to get report health status', error);
      return {
        service: 'ReportService',
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Utility: Sleep for specified milliseconds
   * @private
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ReportService;