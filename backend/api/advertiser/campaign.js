// Campaign Management API - Module 3 Spec Compliant
// Part of NexSpark Advertiser Module - Handles Meta and Google Ads campaigns

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Campaign = require('../../models/Campaign');
const Creative = require('../../models/Creative');
const GoMarbleMcpService = require('../../services/gomarbleMcpService');
const logger = require('../../utils/logger');
const { success: formatSuccessResponse, error: formatErrorResponse } = require('../../utils/responseFormatter');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const gomarbleService = new GoMarbleMcpService();

/**
 * POST /api/advertiser/campaign/create
 * Create Meta Ads and/or Google Ads campaign (spec compliant)
 */
router.post('/create', [
  body('user_id').isUUID().withMessage('Valid user_id is required'),
  body('research_id').isUUID().withMessage('Valid research_id is required'),
  body('platform').isIn(['meta', 'google', 'both']).withMessage('Platform must be meta, google, or both'),
  body('creative_ids').isArray({ min: 1 }).withMessage('At least one creative_id is required'),
  body('creative_ids.*').isUUID().withMessage('All creative_ids must be valid UUIDs'),
  body('campaign_name').notEmpty().withMessage('Campaign name is required'),
  body('objective').optional().isIn(['conversions', 'traffic', 'awareness']).withMessage('Invalid objective'),
  body('budget_daily').isFloat({ min: 5, max: 500 }).withMessage('Daily budget must be between $5 and $500'),
  body('targeting').isObject().withMessage('Targeting configuration is required'),
  body('ad_copy').optional().isString().withMessage('Ad copy must be string')
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        'VALIDATION_ERROR',
        errors.array()
      ));
    }

    const {
      user_id,
      research_id,
      platform,
      creative_ids,
      campaign_name,
      objective = 'conversions',
      budget_daily,
      targeting,
      ad_copy
    } = req.body;

    logger.info('Campaign creation requested', {
      user_id,
      research_id,
      platform,
      campaign_name,
      budget_daily
    });

    // Verify creatives exist and are completed
    const creatives = await Creative.getForCampaign(user_id, research_id);
    const availableCreativeIds = creatives.map(c => c.id);
    const invalidCreativeIds = creative_ids.filter(id => !availableCreativeIds.includes(id));

    if (invalidCreativeIds.length > 0) {
      return res.status(400).json(formatErrorResponse(
        'Some creative IDs are not available',
        'INVALID_CREATIVES',
        {
          invalid_creative_ids: invalidCreativeIds,
          available_creative_ids: availableCreativeIds
        }
      ));
    }

    // Create campaign record in database
    const campaignData = {
      user_id,
      research_id,
      platform,
      campaign_name,
      objective,
      creative_ids,
      ad_copy,
      budget_daily,
      targeting
    };

    const campaign = await Campaign.create(campaignData);

    logger.info('Campaign record created', { campaign_id: campaign.id, platform });

    // Start async campaign creation
    createCampaignAsync(campaign.id, campaignData, creatives);

    // Return immediate response
    const response = {
      campaign_id: campaign.id,
      campaign_name: campaign.campaign_name,
      platform: campaign.platform,
      status: campaign.status,
      budget_daily: campaign.budget_daily,
      created_at: campaign.created_at,
      next_steps: [
        'Campaign creation is in progress',
        'Use GET /api/advertiser/campaign/:id to check status',
        'Campaign will be active once setup is complete'
      ]
    };

    res.status(200).json(formatSuccessResponse(response, 'Campaign creation started'));

  } catch (error) {
    logger.error('Campaign creation failed', error, {
      user_id: req.body.user_id,
      campaign_name: req.body.campaign_name
    });

    res.status(500).json(formatErrorResponse(
      'Campaign creation failed',
      'CAMPAIGN_CREATE_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * GET /api/advertiser/campaign/:id
 * Get campaign details and status
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json(formatErrorResponse(
        'Campaign not found',
        'NOT_FOUND',
        { campaign_id: id }
      ));
    }

    logger.info('Campaign retrieved', { id, status: campaign.status });

    const response = {
      campaign_id: campaign.id,
      campaign_name: campaign.campaign_name,
      platform: campaign.platform,
      objective: campaign.objective,
      status: campaign.status,
      budget_daily: campaign.budget_daily,
      creative_ids: campaign.creative_ids,
      ad_copy: campaign.ad_copy,
      targeting: campaign.targeting,
      meta_campaign_id: campaign.meta_campaign_id,
      google_campaign_id: campaign.google_campaign_id,
      created_at: campaign.created_at,
      updated_at: campaign.updated_at
    };

    res.status(200).json(formatSuccessResponse(response, 'Campaign details retrieved'));

  } catch (error) {
    logger.error('Failed to get campaign', error, { id: req.params.id });

    res.status(500).json(formatErrorResponse(
      'Failed to retrieve campaign',
      'CAMPAIGN_GET_ERROR',
      { campaign_id: req.params.id, error: error.message }
    ));
  }
});

/**
 * PUT /api/advertiser/campaign/:id/status
 * Update campaign status
 */
router.put('/:id/status', [
  body('status').isIn(['active', 'paused', 'draft']).withMessage('Status must be active, paused, or draft')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        'VALIDATION_ERROR',
        errors.array()
      ));
    }

    const { id } = req.params;
    const { status } = req.body;

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json(formatErrorResponse(
        'Campaign not found',
        'NOT_FOUND',
        { campaign_id: id }
      ));
    }

    logger.info('Campaign status update requested', { id, new_status: status, current_status: campaign.status });

    // Update local campaign status
    const updatedCampaign = await Campaign.update(id, { status });

    // Update status on external platforms if campaign is live
    if (campaign.meta_campaign_id || campaign.google_campaign_id) {
      updatePlatformStatusAsync(campaign, status);
    }

    const response = {
      campaign_id: updatedCampaign.id,
      campaign_name: updatedCampaign.campaign_name,
      platform: updatedCampaign.platform,
      status: updatedCampaign.status,
      updated_at: updatedCampaign.updated_at
    };

    res.status(200).json(formatSuccessResponse(response, `Campaign status updated to ${status}`));

  } catch (error) {
    logger.error('Failed to update campaign status', error, { id: req.params.id });

    res.status(500).json(formatErrorResponse(
      'Failed to update campaign status',
      'STATUS_UPDATE_ERROR',
      { campaign_id: req.params.id, error: error.message }
    ));
  }
});

/**
 * GET /api/advertiser/campaigns
 * List campaigns for user
 */
router.get('/', [
  query('user_id').optional().isUUID().withMessage('Invalid user_id'),
  query('research_id').optional().isUUID().withMessage('Invalid research_id'),
  query('platform').optional().isIn(['meta', 'google', 'both']).withMessage('Invalid platform'),
  query('status').optional().isIn(['draft', 'active', 'paused', 'completed']).withMessage('Invalid status'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(formatErrorResponse(
        'Invalid query parameters',
        'VALIDATION_ERROR',
        errors.array()
      ));
    }

    const options = {
      user_id: req.query.user_id,
      research_id: req.query.research_id,
      platform: req.query.platform,
      status: req.query.status,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0
    };

    const campaigns = await Campaign.list(options);

    logger.info('Campaigns listed', {
      user_id: options.user_id,
      total: campaigns.length,
      platform: options.platform
    });

    const response = campaigns.map(campaign => ({
      campaign_id: campaign.id,
      campaign_name: campaign.campaign_name,
      platform: campaign.platform,
      objective: campaign.objective,
      status: campaign.status,
      budget_daily: campaign.budget_daily,
      creative_count: campaign.creative_ids.length,
      meta_campaign_id: campaign.meta_campaign_id,
      google_campaign_id: campaign.google_campaign_id,
      created_at: campaign.created_at,
      updated_at: campaign.updated_at
    }));

    res.status(200).json(formatSuccessResponse(response, `Found ${response.length} campaigns`));

  } catch (error) {
    logger.error('Failed to list campaigns', error, req.query);

    res.status(500).json(formatErrorResponse(
      'Failed to list campaigns',
      'CAMPAIGN_LIST_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * GET /api/advertiser/campaign/:id/performance
 * Get campaign performance data
 */
router.get('/:id/performance', async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return res.status(404).json(formatErrorResponse(
        'Campaign not found',
        'NOT_FOUND',
        { campaign_id: id }
      ));
    }

    logger.info('Campaign performance requested', { id, platform: campaign.platform });

    // Get performance data from GoMarble MCP (mock for now)
    const performanceData = {
      campaign_id: campaign.id,
      campaign_name: campaign.campaign_name,
      platform: campaign.platform,
      date_range: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      },
      metrics: {
        impressions: Math.floor(Math.random() * 10000),
        clicks: Math.floor(Math.random() * 500),
        conversions: Math.floor(Math.random() * 50),
        spend: parseFloat((Math.random() * 100).toFixed(2)),
        ctr: parseFloat((Math.random() * 5).toFixed(2)) + '%',
        cpc: parseFloat((Math.random() * 2).toFixed(2)),
        roas: parseFloat(((Math.random() * 3) + 1).toFixed(2))
      },
      status: campaign.status,
      last_updated: new Date().toISOString()
    };

    res.status(200).json(formatSuccessResponse(performanceData, 'Campaign performance retrieved'));

  } catch (error) {
    logger.error('Failed to get campaign performance', error, { id: req.params.id });

    res.status(500).json(formatErrorResponse(
      'Failed to get campaign performance',
      'PERFORMANCE_ERROR',
      { campaign_id: req.params.id, error: error.message }
    ));
  }
});

// Private helper functions

/**
 * Create campaign on external platforms asynchronously
 * @private
 */
async function createCampaignAsync(campaignId, campaignData, creatives) {
  try {
    logger.info('Starting async campaign creation', { campaignId, platform: campaignData.platform });

    // Mock access token for now - in production, get from OAuth
    const accessToken = 'mock_access_token';

    let updates = {};

    if (campaignData.platform === 'meta' || campaignData.platform === 'both') {
      try {
        const metaResult = await gomarbleService.createMetaCampaign(accessToken, campaignData);
        updates.meta_campaign_id = metaResult.campaign_id;
        updates.meta_ad_account_id = metaResult.ad_account_id;
        updates.meta_ad_set_id = metaResult.ad_set_id;
        updates.meta_ad_id = metaResult.ad_id;
        logger.info('Meta campaign created', { campaignId, meta_campaign_id: metaResult.campaign_id });
      } catch (error) {
        logger.error('Meta campaign creation failed', error, { campaignId });
      }
    }

    if (campaignData.platform === 'google' || campaignData.platform === 'both') {
      try {
        const googleResult = await gomarbleService.createGoogleCampaign(accessToken, campaignData);
        updates.google_campaign_id = googleResult.campaign_id;
        updates.google_ad_group_id = googleResult.ad_group_id;
        updates.google_ad_id = googleResult.ad_id;
        logger.info('Google campaign created', { campaignId, google_campaign_id: googleResult.campaign_id });
      } catch (error) {
        logger.error('Google campaign creation failed', error, { campaignId });
      }
    }

    // Update campaign status based on success
    const hasMetaCampaign = updates.meta_campaign_id;
    const hasGoogleCampaign = updates.google_campaign_id;

    if (campaignData.platform === 'both') {
      updates.status = (hasMetaCampaign && hasGoogleCampaign) ? 'active' : 'paused';
    } else if (campaignData.platform === 'meta') {
      updates.status = hasMetaCampaign ? 'active' : 'paused';
    } else if (campaignData.platform === 'google') {
      updates.status = hasGoogleCampaign ? 'active' : 'paused';
    }

    await Campaign.update(campaignId, updates);

    logger.info('Campaign creation completed', {
      campaignId,
      status: updates.status,
      meta_success: !!hasMetaCampaign,
      google_success: !!hasGoogleCampaign
    });

  } catch (error) {
    logger.error('Async campaign creation failed', error, { campaignId });

    await Campaign.update(campaignId, { status: 'paused' }).catch(() => {});
  }
}

/**
 * Update campaign status on external platforms
 * @private
 */
async function updatePlatformStatusAsync(campaign, status) {
  try {
    const accessToken = 'mock_access_token'; // In production, get from OAuth

    if (campaign.meta_campaign_id) {
      await gomarbleService.updateCampaignStatus(accessToken, campaign.meta_campaign_id, 'meta', status);
    }

    if (campaign.google_campaign_id) {
      await gomarbleService.updateCampaignStatus(accessToken, campaign.google_campaign_id, 'google', status);
    }

    logger.info('Platform status updated', { campaign_id: campaign.id, status });

  } catch (error) {
    logger.error('Failed to update platform status', error, { campaign_id: campaign.id, status });
  }
}

module.exports = router;