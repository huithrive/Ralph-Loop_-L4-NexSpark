// Optimizer Service - Module 4 Analyzer
// Automated campaign optimization based on performance triggers

const AnalyticsService = require('./analyticsService');
const GoMarbleMcpService = require('../gomarbleMcpService');
const logger = require('../../utils/logger');
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

class OptimizerService {
  constructor() {
    this.analyticsService = new AnalyticsService();
    this.gomarbleService = new GoMarbleMcpService();
    this.optimizationRules = this.loadOptimizationRules();
    this.isOptimizing = new Set(); // Track campaigns currently being optimized
  }

  /**
   * Load optimization rules and thresholds
   * @private
   */
  loadOptimizationRules() {
    return {
      low_ctr: {
        threshold: 1.0, // CTR < 1%
        actions: ['pause_ad', 'suggest_creative', 'adjust_targeting'],
        priority: 'high'
      },
      high_cpa: {
        threshold: 75.0, // CPA > $75
        actions: ['adjust_bidding', 'narrow_targeting', 'pause_if_severe'],
        priority: 'high'
      },
      low_roas: {
        threshold: 1.5, // ROAS < 1.5x
        actions: ['decrease_budget', 'optimize_targeting', 'pause_if_critical'],
        priority: 'critical'
      },
      high_frequency: {
        threshold: 3.0, // Frequency > 3
        actions: ['expand_audience', 'refresh_creative'],
        priority: 'medium'
      },
      low_conversion_rate: {
        threshold: 2.0, // Conversion rate < 2%
        actions: ['optimize_landing_page', 'adjust_targeting', 'test_new_offer'],
        priority: 'medium'
      },
      budget_pacing: {
        threshold: 1.5, // Spending > 150% of daily budget
        actions: ['adjust_bids', 'schedule_optimization'],
        priority: 'medium'
      }
    };
  }

  /**
   * Run optimization analysis for a campaign
   * @param {string} campaignId - Campaign ID
   * @param {Object} options - Optimization options
   * @returns {Promise<Object>} Optimization results
   */
  async optimizeCampaign(campaignId, options = {}) {
    try {
      const {
        autoExecute = false, // Whether to automatically execute optimizations
        dryRun = true, // Whether this is a test run
        rulesOverride = null // Custom optimization rules
      } = options;

      logger.info('Starting campaign optimization', {
        campaignId,
        autoExecute,
        dryRun
      });

      // Prevent concurrent optimization of the same campaign
      if (this.isOptimizing.has(campaignId)) {
        throw new Error('Campaign is already being optimized');
      }

      this.isOptimizing.add(campaignId);

      try {
        // Get current performance data
        const performance = await this.analyticsService.getPerformanceData(campaignId, {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          endDate: new Date()
        });

        // Analyze performance and detect issues
        const issues = await this.detectOptimizationTriggers(performance);

        if (issues.length === 0) {
          logger.info('No optimization needed', { campaignId });
          return {
            campaign_id: campaignId,
            status: 'no_optimization_needed',
            performance: performance.metrics,
            message: 'Campaign is performing within acceptable parameters',
            checked_at: new Date().toISOString()
          };
        }

        // Generate optimization recommendations
        const recommendations = await this.generateOptimizations(issues, performance, rulesOverride);

        // Execute optimizations if requested
        let executionResults = [];
        if (autoExecute && !dryRun) {
          executionResults = await this.executeOptimizations(campaignId, recommendations);
        }

        // Store optimization actions
        await this.storeOptimizationActions(campaignId, performance.metrics.user_id || null, issues, recommendations, executionResults);

        const result = {
          campaign_id: campaignId,
          campaign_name: performance.campaign_name,
          status: autoExecute && !dryRun ? 'optimizations_executed' : 'recommendations_generated',
          performance: performance.metrics,
          issues_detected: issues.length,
          issues: issues,
          recommendations: recommendations,
          execution_results: executionResults,
          dry_run: dryRun,
          optimized_at: new Date().toISOString()
        };

        logger.info('Campaign optimization completed', {
          campaignId,
          issuesCount: issues.length,
          recommendationsCount: recommendations.length,
          executed: autoExecute && !dryRun
        });

        return result;

      } finally {
        this.isOptimizing.delete(campaignId);
      }

    } catch (error) {
      this.isOptimizing.delete(campaignId);
      logger.error('Campaign optimization failed', error, { campaignId });
      throw error;
    }
  }

  /**
   * Detect optimization triggers based on performance data
   * @private
   */
  async detectOptimizationTriggers(performance) {
    const issues = [];
    const metrics = performance.metrics;

    // Check each optimization rule
    for (const [ruleType, rule] of Object.entries(this.optimizationRules)) {
      let triggered = false;
      let actualValue = null;

      switch (ruleType) {
        case 'low_ctr':
          actualValue = metrics.ctr;
          triggered = metrics.ctr < rule.threshold;
          break;

        case 'high_cpa':
          actualValue = metrics.cpa;
          triggered = metrics.cpa > rule.threshold;
          break;

        case 'low_roas':
          actualValue = metrics.roas;
          triggered = metrics.roas < rule.threshold && metrics.spend > 50; // Only if significant spend
          break;

        case 'high_frequency':
          actualValue = metrics.frequency;
          triggered = metrics.frequency > rule.threshold;
          break;

        case 'low_conversion_rate':
          actualValue = metrics.conversion_rate;
          triggered = metrics.conversion_rate < rule.threshold && metrics.clicks > 100; // Significant clicks
          break;

        case 'budget_pacing':
          // Mock budget check - in production, compare to actual daily budget
          const expectedDailySpend = 50; // Mock daily budget
          const actualDailySpend = metrics.spend / (metrics.date_range_days || 7);
          actualValue = actualDailySpend / expectedDailySpend;
          triggered = actualValue > rule.threshold;
          break;
      }

      if (triggered) {
        issues.push({
          rule_type: ruleType,
          priority: rule.priority,
          threshold: rule.threshold,
          actual_value: actualValue,
          message: this.generateIssueMessage(ruleType, actualValue, rule.threshold),
          suggested_actions: rule.actions
        });
      }
    }

    // Sort by priority (critical > high > medium > low)
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    issues.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return issues;
  }

  /**
   * Generate issue message
   * @private
   */
  generateIssueMessage(ruleType, actualValue, threshold) {
    switch (ruleType) {
      case 'low_ctr':
        return `Low click-through rate: ${actualValue}% (below ${threshold}%)`;
      case 'high_cpa':
        return `High cost per acquisition: $${actualValue} (above $${threshold})`;
      case 'low_roas':
        return `Low return on ad spend: ${actualValue}x (below ${threshold}x)`;
      case 'high_frequency':
        return `High ad frequency: ${actualValue} (above ${threshold})`;
      case 'low_conversion_rate':
        return `Low conversion rate: ${actualValue}% (below ${threshold}%)`;
      case 'budget_pacing':
        return `Budget pacing issue: ${(actualValue * 100).toFixed(0)}% of daily budget (above ${threshold * 100}%)`;
      default:
        return `Performance issue detected: ${ruleType}`;
    }
  }

  /**
   * Generate specific optimization recommendations
   * @private
   */
  async generateOptimizations(issues, performance, rulesOverride = null) {
    const recommendations = [];

    for (const issue of issues) {
      const actions = await this.generateActionsForIssue(issue, performance);
      recommendations.push(...actions);
    }

    // Remove duplicates and prioritize
    const uniqueRecommendations = this.deduplicateRecommendations(recommendations);

    return uniqueRecommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  /**
   * Generate specific actions for an issue
   * @private
   */
  async generateActionsForIssue(issue, performance) {
    const actions = [];
    const metrics = performance.metrics;

    switch (issue.rule_type) {
      case 'low_ctr':
        actions.push({
          action_type: 'suggest_creative',
          priority: 'high',
          description: 'Create new video creative with stronger hook',
          implementation: 'Use creative generation API with high-performing style',
          estimated_impact: 'CTR improvement: 1.5-3x',
          confidence: 0.8
        });

        if (metrics.frequency > 2) {
          actions.push({
            action_type: 'expand_audience',
            priority: 'medium',
            description: 'Expand target audience to reduce frequency',
            implementation: 'Increase age range or add lookalike audiences',
            estimated_impact: 'Frequency reduction: 30-50%',
            confidence: 0.7
          });
        }
        break;

      case 'high_cpa':
        actions.push({
          action_type: 'adjust_bidding',
          priority: 'high',
          description: 'Lower target cost per acquisition bid',
          implementation: 'Decrease CPA bid by 20-30%',
          estimated_impact: 'CPA reduction: 15-25%',
          confidence: 0.75
        });

        actions.push({
          action_type: 'narrow_targeting',
          priority: 'medium',
          description: 'Focus on highest-converting audiences',
          implementation: 'Remove bottom 25% performing demographics',
          estimated_impact: 'CPA improvement: 10-20%',
          confidence: 0.65
        });
        break;

      case 'low_roas':
        if (metrics.roas < 1.2) {
          actions.push({
            action_type: 'pause_campaign',
            priority: 'critical',
            description: 'Pause campaign to prevent further losses',
            implementation: 'Immediately pause campaign via API',
            estimated_impact: 'Stop losses immediately',
            confidence: 0.95
          });
        } else {
          actions.push({
            action_type: 'decrease_budget',
            priority: 'high',
            description: 'Reduce daily budget by 50%',
            implementation: 'Update campaign budget via API',
            estimated_impact: 'Risk reduction while optimizing',
            confidence: 0.8
          });
        }
        break;

      case 'high_frequency':
        actions.push({
          action_type: 'refresh_creative',
          priority: 'medium',
          description: 'Add new creative variants to reduce ad fatigue',
          implementation: 'Generate 2-3 new video variants',
          estimated_impact: 'Frequency reset and CTR improvement',
          confidence: 0.7
        });
        break;
    }

    return actions;
  }

  /**
   * Remove duplicate recommendations
   * @private
   */
  deduplicateRecommendations(recommendations) {
    const seen = new Set();
    return recommendations.filter(rec => {
      const key = rec.action_type;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Execute optimization actions
   * @private
   */
  async executeOptimizations(campaignId, recommendations) {
    const results = [];

    for (const recommendation of recommendations) {
      try {
        const result = await this.executeOptimizationAction(campaignId, recommendation);
        results.push(result);

        // Add delay between actions to avoid rate limits
        await this.sleep(1000);

      } catch (error) {
        logger.error('Failed to execute optimization action', error, {
          campaignId,
          action: recommendation.action_type
        });

        results.push({
          action_type: recommendation.action_type,
          status: 'failed',
          error: error.message,
          executed_at: new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**
   * Execute a single optimization action
   * @private
   */
  async executeOptimizationAction(campaignId, recommendation) {
    const mockAccessToken = 'mock_access_token'; // In production, get from OAuth

    switch (recommendation.action_type) {
      case 'pause_campaign':
        // Pause campaign via GoMarble MCP or direct API
        await this.gomarbleService.updateCampaignStatus(mockAccessToken, campaignId, 'meta', 'paused');
        return {
          action_type: 'pause_campaign',
          status: 'completed',
          description: 'Campaign paused successfully',
          executed_at: new Date().toISOString()
        };

      case 'adjust_bidding':
        // Adjust bidding strategy - mock implementation
        return {
          action_type: 'adjust_bidding',
          status: 'completed',
          description: 'CPA bid reduced by 25%',
          changes: { previous_cpa_bid: 50, new_cpa_bid: 37.5 },
          executed_at: new Date().toISOString()
        };

      case 'decrease_budget':
        // Reduce budget - mock implementation
        return {
          action_type: 'decrease_budget',
          status: 'completed',
          description: 'Daily budget reduced by 50%',
          changes: { previous_budget: 100, new_budget: 50 },
          executed_at: new Date().toISOString()
        };

      case 'suggest_creative':
        // Generate new creative suggestion
        return {
          action_type: 'suggest_creative',
          status: 'completed',
          description: 'New creative suggestions generated',
          suggestions: [
            'Create video with product demonstration',
            'Test user testimonial format',
            'Try before/after style creative'
          ],
          executed_at: new Date().toISOString()
        };

      default:
        return {
          action_type: recommendation.action_type,
          status: 'not_implemented',
          description: 'Action not yet implemented',
          executed_at: new Date().toISOString()
        };
    }
  }

  /**
   * Store optimization actions in database
   * @private
   */
  async storeOptimizationActions(campaignId, userId, issues, recommendations, executionResults) {
    try {
      for (const issue of issues) {
        const query = `
          INSERT INTO optimization_actions (campaign_id, user_id, trigger_type, trigger_value, trigger_threshold, action_type, action_data, result, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;

        // Find corresponding recommendations
        const relatedActions = recommendations.filter(r =>
          issue.suggested_actions.includes(r.action_type)
        );

        for (const action of relatedActions) {
          const executionResult = executionResults.find(r => r.action_type === action.action_type);

          await pool.query(query, [
            campaignId,
            userId,
            issue.rule_type,
            issue.actual_value,
            issue.threshold,
            action.action_type,
            JSON.stringify(action),
            JSON.stringify(executionResult || {}),
            executionResult ? executionResult.status : 'planned'
          ]);
        }
      }

      logger.debug('Optimization actions stored', {
        campaignId,
        issuesCount: issues.length,
        actionsCount: recommendations.length
      });

    } catch (error) {
      logger.error('Failed to store optimization actions', error);
      // Don't throw - storage failure shouldn't break the optimization
    }
  }

  /**
   * Get optimization history for a campaign
   */
  async getOptimizationHistory(campaignId, limit = 20) {
    try {
      const query = `
        SELECT trigger_type, trigger_value, trigger_threshold, action_type, action_data, result, status, created_at, completed_at
        FROM optimization_actions
        WHERE campaign_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `;

      const result = await pool.query(query, [campaignId, limit]);

      return result.rows.map(row => ({
        trigger: {
          type: row.trigger_type,
          value: row.trigger_value,
          threshold: row.trigger_threshold
        },
        action: {
          type: row.action_type,
          data: row.action_data,
          result: row.result,
          status: row.status
        },
        timestamps: {
          created_at: row.created_at,
          completed_at: row.completed_at
        }
      }));

    } catch (error) {
      logger.error('Failed to get optimization history', error);
      return [];
    }
  }

  /**
   * Pure function: Evaluate optimization rules against a metrics snapshot.
   * Used by OpenClaw heartbeatLoop — no side effects, just returns triggered rules.
   * @param {Object} metrics - From analyticsService.getClientMetricsSnapshot()
   * @returns {Array<Object>} Triggered rules with severity and recommended action
   */
  evaluateRules(metrics) {
    const triggered = [];
    const rules = this.optimizationRules;

    if (!metrics || !metrics.hasCampaigns) return triggered;

    // Check each campaign
    for (const cm of (metrics.campaigns || [])) {
      // Low ROAS — critical
      if (cm.roas < (rules.low_roas?.threshold || 1.5) && cm.spend > 10) {
        const severity = cm.roas < 0.5 ? 'critical' : 'warning';
        triggered.push({
          rule: 'low_roas',
          severity,
          campaignId: cm.campaignId,
          platform: cm.platform,
          current: cm.roas,
          threshold: rules.low_roas?.threshold || 1.5,
          message: `ROAS ${cm.roas.toFixed(2)}x is below ${rules.low_roas?.threshold || 1.5}x threshold`,
          recommendedAction: severity === 'critical' ? 'pause_ad_set' : 'reduce_budget'
        });
      }

      // High CPA
      if (cm.cpa < Infinity && cm.cpa > (rules.high_cpa?.threshold || 75)) {
        triggered.push({
          rule: 'high_cpa',
          severity: 'warning',
          campaignId: cm.campaignId,
          platform: cm.platform,
          current: cm.cpa,
          threshold: rules.high_cpa?.threshold || 75,
          message: `CPA $${cm.cpa.toFixed(2)} exceeds $${rules.high_cpa?.threshold || 75} threshold`,
          recommendedAction: 'adjust_bidding'
        });
      }

      // Low CTR
      if (cm.ctr < (rules.low_ctr?.threshold || 1.0) && cm.spend > 10) {
        triggered.push({
          rule: 'low_ctr',
          severity: 'warning',
          campaignId: cm.campaignId,
          platform: cm.platform,
          current: cm.ctr,
          threshold: rules.low_ctr?.threshold || 1.0,
          message: `CTR ${cm.ctr.toFixed(2)}% is below ${rules.low_ctr?.threshold || 1.0}% minimum`,
          recommendedAction: 'creative_swap'
        });
      }

      // High Frequency (ad fatigue)
      if (cm.frequency > (rules.high_frequency?.threshold || 3.0)) {
        triggered.push({
          rule: 'high_frequency',
          severity: 'warning',
          campaignId: cm.campaignId,
          platform: cm.platform,
          current: cm.frequency,
          threshold: rules.high_frequency?.threshold || 3.0,
          message: `Frequency ${cm.frequency.toFixed(1)} exceeds ${rules.high_frequency?.threshold || 3.0} — ad fatigue likely`,
          recommendedAction: 'creative_refresh'
        });
      }
    }

    // Budget pacing (aggregate level)
    if (metrics.budgetPacing > 2.0) {
      triggered.push({
        rule: 'budget_pacing',
        severity: 'critical',
        current: metrics.budgetPacing,
        threshold: 2.0,
        message: `Budget pacing at ${(metrics.budgetPacing * 100).toFixed(0)}% — emergency overspend`,
        recommendedAction: 'emergency_pause'
      });
    } else if (metrics.budgetPacing > 1.5) {
      triggered.push({
        rule: 'budget_pacing',
        severity: 'warning',
        current: metrics.budgetPacing,
        threshold: 1.5,
        message: `Budget pacing at ${(metrics.budgetPacing * 100).toFixed(0)}% — overspending`,
        recommendedAction: 'reduce_bids'
      });
    }

    // Milestone checks
    const config = require('../../config/openclawConfig');
    if (config.milestones) {
      for (const target of (config.milestones.roasTargets || [])) {
        if (metrics.blendedRoas >= target) {
          triggered.push({
            rule: 'milestone_roas',
            severity: 'info',
            current: metrics.blendedRoas,
            threshold: target,
            message: `ROAS milestone reached: ${metrics.blendedRoas.toFixed(2)}x ≥ ${target}x`,
            recommendedAction: 'celebrate'
          });
        }
      }
    }

    return triggered;
  }

  /**
   * Get service health status
   */
  async getHealthStatus() {
    try {
      return {
        service: 'OptimizerService',
        status: 'operational',
        optimization_rules: Object.keys(this.optimizationRules).length,
        capabilities: [
          'Performance issue detection',
          'Automated optimization recommendations',
          'Campaign action execution',
          'Optimization tracking',
          'Risk management'
        ],
        active_optimizations: this.isOptimizing.size
      };

    } catch (error) {
      logger.error('Failed to get optimizer health status', error);
      return {
        service: 'OptimizerService',
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

module.exports = OptimizerService;