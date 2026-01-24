// Creative Generation Service
// Orchestrates multiple AI video/image generation providers with fallback support

const PixverseService = require('./pixverseService');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class CreativeService {
  constructor() {
    this.providers = {
      pixverse: new PixverseService()
    };

    // Add fallback providers when available
    // TODO: Implement Kling AI and RunwayML when needed

    this.defaultProvider = 'pixverse';
    this.fallbackOrder = ['pixverse']; // Will expand with more providers

    // Generation status tracking
    this.activeGenerations = new Map();
  }

  /**
   * Get available providers and their capabilities
   * @returns {Object} Provider information
   */
  getProviders() {
    return {
      pixverse: {
        name: 'PixVerse',
        available: !!process.env.PIXVERSE_API_KEY,
        capabilities: ['image-to-video', 'text-to-video'],
        models: ['v3.5', 'v4', 'v4.5', 'v5', 'v5.5'],
        styles: ['anime', '3d_animation', 'clay', 'comic', 'cyberpunk'],
        max_duration: 10,
        max_resolution: '1080p'
      }
      // Add other providers here when implemented
    };
  }

  /**
   * Get the best available provider for the request
   * @param {string} preferredProvider - Preferred provider name
   * @returns {string} Provider name to use
   */
  selectProvider(preferredProvider = null) {
    if (preferredProvider && this.providers[preferredProvider]) {
      const provider = this.getProviders()[preferredProvider];
      if (provider.available) {
        return preferredProvider;
      }
    }

    // Find first available provider in fallback order
    for (const providerName of this.fallbackOrder) {
      const provider = this.getProviders()[providerName];
      if (provider.available) {
        return providerName;
      }
    }

    throw new Error('No available creative generation providers');
  }

  /**
   * Generate video from image with automatic provider selection
   * @param {string|Buffer} imageData - Image file path or Buffer
   * @param {Object} options - Generation options
   * @param {string} options.prompt - Video description
   * @param {number} options.duration - Video length (5, 8, or 10)
   * @param {string} options.quality - Video quality
   * @param {string} options.style - Visual style
   * @param {string} options.motion_mode - Motion intensity
   * @param {string} options.provider - Preferred provider
   * @returns {Promise<Object>} Generation job info
   */
  async generateVideoFromImage(imageData, options = {}) {
    const jobId = uuidv4();

    try {
      // Validate required fields
      if (!options.prompt) {
        throw new Error('Prompt is required for video generation');
      }

      // Select provider
      const providerName = this.selectProvider(options.provider);
      const provider = this.providers[providerName];

      logger.info('Starting video generation', {
        jobId,
        provider: providerName,
        options: { ...options, provider: undefined }
      });

      // Track generation job
      this.activeGenerations.set(jobId, {
        status: 'starting',
        provider: providerName,
        startTime: new Date(),
        options
      });

      // Start generation (async)
      this.generateAsync(jobId, provider, imageData, options);

      return {
        job_id: jobId,
        status: 'starting',
        provider: providerName,
        estimated_time: '30-90 seconds',
        message: 'Video generation started. Use job_id to check status.'
      };

    } catch (error) {
      logger.error('Video generation failed to start', error, { jobId });
      this.activeGenerations.set(jobId, {
        status: 'failed',
        error: error.message,
        startTime: new Date()
      });
      throw error;
    }
  }

  /**
   * Generate video from text prompt
   * @param {Object} options - Generation options
   * @param {string} options.prompt - Video description
   * @param {number} options.duration - Video length
   * @param {string} options.quality - Video quality
   * @param {string} options.style - Visual style
   * @param {string} options.provider - Preferred provider
   * @returns {Promise<Object>} Generation job info
   */
  async generateVideoFromText(options = {}) {
    // For now, text-to-video will use the same flow as image-to-video
    // but without the initial image upload step
    const jobId = uuidv4();

    try {
      const providerName = this.selectProvider(options.provider);

      logger.info('Text-to-video not yet implemented, using placeholder', {
        jobId,
        provider: providerName
      });

      // Track as placeholder for now
      this.activeGenerations.set(jobId, {
        status: 'pending',
        provider: providerName,
        startTime: new Date(),
        options,
        note: 'Text-to-video feature coming soon'
      });

      return {
        job_id: jobId,
        status: 'pending',
        provider: providerName,
        message: 'Text-to-video generation is not yet implemented'
      };

    } catch (error) {
      logger.error('Text-to-video generation failed', error, { jobId });
      throw error;
    }
  }

  /**
   * Check generation job status
   * @param {string} jobId - Job ID from generation request
   * @returns {Promise<Object>} Job status and result
   */
  async getGenerationStatus(jobId) {
    const job = this.activeGenerations.get(jobId);

    if (!job) {
      throw new Error('Generation job not found');
    }

    try {
      // If job has a video_id, check with the provider
      if (job.video_id && job.provider) {
        const provider = this.providers[job.provider];
        const status = await provider.checkVideoStatus(job.video_id);

        // Update job status
        job.lastCheck = new Date();
        job.providerStatus = status;

        if (status.status === 'completed') {
          job.status = 'completed';
          job.result = status;
          job.completedAt = new Date();
        } else if (['content_failed', 'generation_failed'].includes(status.status)) {
          job.status = 'failed';
          job.error = `Provider error: ${status.status}`;
        }

        this.activeGenerations.set(jobId, job);
      }

      return {
        job_id: jobId,
        status: job.status,
        provider: job.provider,
        started_at: job.startTime,
        completed_at: job.completedAt,
        duration: job.completedAt ?
          Math.round((job.completedAt - job.startTime) / 1000) + ' seconds' :
          Math.round((new Date() - job.startTime) / 1000) + ' seconds elapsed',
        result: job.result || null,
        error: job.error || null,
        options: job.options
      };

    } catch (error) {
      logger.error('Status check failed', error, { jobId });
      job.status = 'error';
      job.error = error.message;
      this.activeGenerations.set(jobId, job);

      throw new Error(`Status check failed: ${error.message}`);
    }
  }

  /**
   * List all active and recent generation jobs
   * @param {number} limit - Number of jobs to return
   * @returns {Array} List of generation jobs
   */
  listGenerations(limit = 20) {
    const jobs = Array.from(this.activeGenerations.entries())
      .map(([jobId, job]) => ({
        job_id: jobId,
        status: job.status,
        provider: job.provider,
        started_at: job.startTime,
        completed_at: job.completedAt
      }))
      .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))
      .slice(0, limit);

    return {
      jobs,
      total: this.activeGenerations.size,
      active: jobs.filter(j => ['starting', 'generating'].includes(j.status)).length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => ['failed', 'error'].includes(j.status)).length
    };
  }

  /**
   * Get creative generation options for UI
   * @returns {Object} Available options across all providers
   */
  getCreativeOptions() {
    const providers = this.getProviders();

    // Combine options from all available providers
    const allStyles = new Set();
    const allModels = new Set();
    const qualities = new Set(['360p', '540p', '720p', '1080p']);
    const durations = new Set([5, 8, 10]);

    Object.values(providers).forEach(provider => {
      if (provider.available) {
        provider.styles?.forEach(style => allStyles.add(style));
        provider.models?.forEach(model => allModels.add(model));
      }
    });

    return {
      providers: Object.keys(providers).filter(key => providers[key].available),
      styles: Array.from(allStyles),
      models: Array.from(allModels),
      qualities: Array.from(qualities),
      durations: Array.from(durations),
      motion_modes: ['normal', 'fast'],
      camera_movements: [
        'zoom_in', 'zoom_out', 'pan_left', 'pan_right',
        'tilt_up', 'tilt_down', 'rotate_clockwise', 'rotate_counter'
      ],
      supported_formats: {
        input: ['jpg', 'jpeg', 'png', 'webp'],
        output: ['mp4']
      },
      limits: {
        max_image_size: '20MB',
        max_dimensions: '10000x10000',
        max_video_duration: 10,
        max_prompt_length: 2048
      }
    };
  }

  /**
   * Clean up old completed jobs (housekeeping)
   * @param {number} maxAge - Maximum age in hours
   */
  cleanupOldJobs(maxAge = 24) {
    const cutoff = new Date(Date.now() - (maxAge * 60 * 60 * 1000));
    let cleaned = 0;

    for (const [jobId, job] of this.activeGenerations.entries()) {
      if (job.completedAt && job.completedAt < cutoff) {
        this.activeGenerations.delete(jobId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} old generation jobs`);
    }
  }

  // Private methods

  /**
   * Handle async video generation
   * @private
   */
  async generateAsync(jobId, provider, imageData, options) {
    try {
      const job = this.activeGenerations.get(jobId);

      // Update status to generating
      job.status = 'generating';
      this.activeGenerations.set(jobId, job);

      // Start the generation process
      const result = await provider.createVideoFromImage(imageData, options);

      // Update job with video_id for status polling
      job.video_id = result.video_id;
      job.img_id = result.img_id;
      job.img_url = result.img_url;

      // If generation completed immediately
      if (result.status === 'completed') {
        job.status = 'completed';
        job.result = result;
        job.completedAt = new Date();
      }

      this.activeGenerations.set(jobId, job);

      logger.info('Video generation completed', {
        jobId,
        video_id: result.video_id,
        status: result.status
      });

    } catch (error) {
      logger.error('Async video generation failed', error, { jobId });

      const job = this.activeGenerations.get(jobId);
      job.status = 'failed';
      job.error = error.message;
      job.completedAt = new Date();
      this.activeGenerations.set(jobId, job);
    }
  }
}

module.exports = CreativeService;