// Creative Generation API - Module 2 Spec Compliant
// Part of NexSpark Executor Module - Handles AI video/image generation

const express = require('express');
const multer = require('multer');
const { body, query, validationResult } = require('express-validator');
const Creative = require('../../models/Creative');
const PixverseService = require('../../services/pixverseService');
const logger = require('../../utils/logger');
const { success: formatSuccessResponse, error: formatErrorResponse } = require('../../utils/responseFormatter');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
    }
  }
});

/**
 * POST /api/executor/creative/generate
 * Generate video or image creative (spec compliant)
 */
router.post('/generate', upload.single('image'), [
  body('user_id').isUUID().withMessage('Valid user_id is required'),
  body('research_id').isUUID().withMessage('Valid research_id is required'),
  body('creative_type').isIn(['video', 'image']).withMessage('creative_type must be video or image'),
  body('prompt').notEmpty().withMessage('Prompt is required')
    .isLength({ max: 2048 }).withMessage('Prompt must be less than 2048 characters'),
  body('style').optional().isIn(['anime', '3d_animation', 'clay', 'cyberpunk', 'comic']).withMessage('Invalid style'),
  body('duration').optional().isIn([5, 8]).withMessage('Duration must be 5 or 8'),
  body('quality').optional().isIn(['360p', '540p', '720p', '1080p']).withMessage('Invalid quality'),
  body('motion_mode').optional().isIn(['normal', 'fast']).withMessage('Motion mode must be normal or fast'),
  body('camera_movement').optional().isIn([
    'zoom_in', 'zoom_out', 'horizontal_left', 'horizontal_right', 'vertical_up', 'vertical_down',
    'crane_up', 'camera_rotation', 'robo_arm', 'super_dolly_out', 'whip_pan', 'hitchcock',
    'left_follow', 'right_follow', 'pan_left', 'pan_right', 'fix_bg', 'quickly_zoom_in',
    'quickly_zoom_out', 'smooth_zoom_in'
  ]).withMessage('Invalid camera movement'),
  body('negative_prompt').optional().isLength({ max: 2048 }).withMessage('Negative prompt too long'),
  body('use_case').optional().isIn(['advertisement', 'seo_content', 'social_media']).withMessage('Invalid use_case')
], async (req, res) => {
  let tempFilePath = null;

  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      return res.status(400).json(formatErrorResponse(
        'Invalid request parameters',
        'VALIDATION_ERROR',
        errors.array()
      ));
    }

    // Extract data from request
    const creativeData = {
      user_id: req.body.user_id,
      research_id: req.body.research_id,
      creative_type: req.body.creative_type,
      source_image_url: req.body.source_image_url,
      prompt: req.body.prompt,
      style: req.body.style,
      duration: req.body.duration ? parseInt(req.body.duration) : 5,
      quality: req.body.quality || '720p',
      motion_mode: req.body.motion_mode || 'normal',
      camera_movement: req.body.camera_movement,
      negative_prompt: req.body.negative_prompt,
      use_case: req.body.use_case || 'advertisement'
    };

    // Handle image upload
    if (req.file) {
      tempFilePath = req.file.path;
      // For now, we'll use a placeholder URL - in production, upload to cloud storage
      creativeData.source_image_url = `https://storage.example.com/uploads/${req.file.filename}`;
    }

    logger.info('Creative generation requested', {
      user_id: creativeData.user_id,
      creative_type: creativeData.creative_type,
      style: creativeData.style,
      duration: creativeData.duration
    });

    // Create creative record in database
    const creative = await Creative.create(creativeData);

    // Start async generation if video type
    if (creativeData.creative_type === 'video') {
      generateVideoAsync(creative.id, tempFilePath || creativeData.source_image_url, creativeData);
    }

    // Cleanup temp file
    if (tempFilePath) {
      await fs.unlink(tempFilePath).catch(() => {});
    }

    // Return spec-compliant response
    const response = {
      creative_id: creative.id,
      video_id: null, // Will be updated when generation starts
      status: creative.status,
      video_url: creative.video_url,
      thumbnail_url: creative.thumbnail_url,
      duration: creative.duration,
      quality: creative.quality,
      created_at: creative.created_at
    };

    res.status(200).json(formatSuccessResponse(response, 'Creative generation started'));

  } catch (error) {
    if (tempFilePath) {
      await fs.unlink(tempFilePath).catch(() => {});
    }

    logger.error('Creative generation failed', error, {
      user_id: req.body.user_id,
      creative_type: req.body.creative_type
    });

    res.status(500).json(formatErrorResponse(
      'Creative generation failed',
      'GENERATION_ERROR',
      { error: error.message }
    ));
  }
});

/**
 * GET /api/executor/creative/:id
 * Get creative status and details (spec compliant)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const creative = await Creative.findById(id);

    if (!creative) {
      return res.status(404).json(formatErrorResponse(
        'Creative not found',
        'NOT_FOUND',
        { creative_id: id }
      ));
    }

    logger.info('Creative retrieved', { id, status: creative.status });

    // Return spec-compliant response
    const response = {
      creative_id: creative.id,
      video_id: creative.provider_video_id,
      status: creative.status,
      video_url: creative.video_url,
      thumbnail_url: creative.thumbnail_url,
      duration: creative.duration,
      quality: creative.quality,
      created_at: creative.created_at
    };

    res.status(200).json(formatSuccessResponse(response, 'Creative details retrieved'));

  } catch (error) {
    logger.error('Failed to get creative', error, { id: req.params.id });

    res.status(500).json(formatErrorResponse(
      'Failed to retrieve creative',
      'RETRIEVAL_ERROR',
      { creative_id: req.params.id, error: error.message }
    ));
  }
});

/**
 * GET /api/executor/creative/:id/status
 * Poll for status updates (spec compliant)
 */
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;

    const creative = await Creative.findById(id);

    if (!creative) {
      return res.status(404).json(formatErrorResponse(
        'Creative not found',
        'NOT_FOUND',
        { creative_id: id }
      ));
    }

    // If processing, check with provider for updates
    if (creative.status === 'processing' && creative.provider_video_id) {
      await updateCreativeStatus(creative);
      // Re-fetch updated creative
      const updatedCreative = await Creative.findById(id);
      if (updatedCreative) {
        Object.assign(creative, updatedCreative);
      }
    }

    logger.info('Creative status checked', { id, status: creative.status });

    const response = {
      creative_id: creative.id,
      status: creative.status,
      video_url: creative.video_url,
      thumbnail_url: creative.thumbnail_url,
      created_at: creative.created_at
    };

    res.status(200).json(formatSuccessResponse(response, `Creative status: ${creative.status}`));

  } catch (error) {
    logger.error('Failed to check creative status', error, { id: req.params.id });

    res.status(500).json(formatErrorResponse(
      'Status check failed',
      'STATUS_ERROR',
      { creative_id: req.params.id, error: error.message }
    ));
  }
});

/**
 * GET /api/executor/creatives
 * List all creatives for user (Module 3 integration)
 */
router.get('/', [
  query('user_id').optional().isUUID().withMessage('Invalid user_id'),
  query('research_id').optional().isUUID().withMessage('Invalid research_id'),
  query('creative_type').optional().isIn(['video', 'image']).withMessage('Invalid creative_type'),
  query('status').optional().isIn(['pending', 'processing', 'completed', 'failed']).withMessage('Invalid status'),
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
      creative_type: req.query.creative_type,
      status: req.query.status,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0
    };

    const creatives = await Creative.list(options);

    logger.info('Creatives listed', {
      user_id: options.user_id,
      total: creatives.length,
      creative_type: options.creative_type
    });

    // Format for spec compliance
    const response = creatives.map(creative => ({
      creative_id: creative.id,
      creative_type: creative.creative_type,
      video_id: creative.provider_video_id,
      status: creative.status,
      video_url: creative.video_url,
      thumbnail_url: creative.thumbnail_url,
      duration: creative.duration,
      quality: creative.quality,
      created_at: creative.created_at
    }));

    res.status(200).json(formatSuccessResponse(response, `Found ${response.length} creatives`));

  } catch (error) {
    logger.error('Failed to list creatives', error, req.query);

    res.status(500).json(formatErrorResponse(
      'Failed to list creatives',
      'LIST_ERROR',
      { error: error.message }
    ));
  }
});

// Private helper functions

/**
 * Generate video asynchronously
 * @private
 */
async function generateVideoAsync(creativeId, imageSource, creativeData) {
  try {
    const pixverseService = new PixverseService();

    // Update status to processing
    await Creative.update(creativeId, { status: 'processing' });

    // Upload image and generate video
    const result = await pixverseService.createVideoFromImage(imageSource, {
      prompt: creativeData.prompt,
      duration: creativeData.duration,
      quality: creativeData.quality,
      style: creativeData.style,
      motion_mode: creativeData.motion_mode,
      negative_prompt: creativeData.negative_prompt
    });

    // Update creative with results
    await Creative.update(creativeId, {
      status: result.status === 'completed' ? 'completed' : 'processing',
      provider_video_id: result.video_id?.toString(),
      video_url: result.video_url,
      thumbnail_url: result.img_url,
      metadata: JSON.stringify(result)
    });

    logger.info('Video generation completed', { creativeId, status: result.status });

  } catch (error) {
    logger.error('Async video generation failed', error, { creativeId });

    await Creative.update(creativeId, {
      status: 'failed',
      metadata: JSON.stringify({ error: error.message })
    }).catch(() => {});
  }
}

/**
 * Update creative status from provider
 * @private
 */
async function updateCreativeStatus(creative) {
  try {
    if (!creative.provider_video_id) return;

    const pixverseService = new PixverseService();
    const status = await pixverseService.checkVideoStatus(creative.provider_video_id);

    if (status.status === 'completed') {
      await Creative.update(creative.id, {
        status: 'completed',
        video_url: status.video_url,
        thumbnail_url: status.video_url, // Use video URL as thumbnail placeholder
        metadata: JSON.stringify(status)
      });
    } else if (['content_failed', 'generation_failed'].includes(status.status)) {
      await Creative.update(creative.id, {
        status: 'failed',
        metadata: JSON.stringify(status)
      });
    }

  } catch (error) {
    logger.error('Failed to update creative status', error, { creativeId: creative.id });
  }
}

module.exports = router;