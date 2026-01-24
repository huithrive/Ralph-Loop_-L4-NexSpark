// PixVerse API Service
// Provides image upload, video generation, and status polling

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class PixverseService {
  constructor() {
    this.baseURL = 'https://app-api.pixverseai.cn';
    this.apiKey = process.env.PIXVERSE_API_KEY;
    this.defaultModel = 'v4.5';
    this.pollInterval = 3000; // 3 seconds as recommended
    this.maxPollAttempts = 100; // ~5 minutes max wait

    if (!this.apiKey) {
      logger.warn('PIXVERSE_API_KEY not found, service will use mock mode');
      this.mockMode = true;
    }
  }

  /**
   * Generate common headers for API requests
   * @returns {Object} Headers object
   */
  getHeaders(contentType = 'application/json') {
    return {
      'API-KEY': this.apiKey,
      'Ai-trace-id': uuidv4(),
      'Content-Type': contentType
    };
  }

  /**
   * Upload image file to PixVerse and get img_id
   * @param {string|Buffer} imageData - File path string or Buffer
   * @param {string} filename - Original filename (optional)
   * @returns {Promise<Object>} { img_id, img_url }
   */
  async uploadImage(imageData, filename = 'image.jpg') {
    if (this.mockMode) {
      return this.mockUploadImage(imageData, filename);
    }

    try {
      const formData = new FormData();

      if (typeof imageData === 'string') {
        // File path provided
        formData.append('image', fs.createReadStream(imageData));
      } else if (Buffer.isBuffer(imageData)) {
        // Buffer provided
        formData.append('image', imageData, { filename });
      } else {
        throw new Error('imageData must be file path string or Buffer');
      }

      const headers = {
        'API-KEY': this.apiKey,
        'Ai-trace-id': uuidv4(),
        ...formData.getHeaders()
      };

      const response = await axios.post(
        `${this.baseURL}/openapi/v2/image/upload`,
        formData,
        { headers, timeout: 30000 }
      );

      if (response.data.ErrCode !== 0) {
        throw new Error(`Upload failed: ${response.data.ErrMsg}`);
      }

      logger.info('Image uploaded to PixVerse', {
        img_id: response.data.Resp.img_id,
        img_url: response.data.Resp.img_url
      });

      return {
        img_id: response.data.Resp.img_id,
        img_url: response.data.Resp.img_url
      };

    } catch (error) {
      logger.error('PixVerse image upload failed', error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  /**
   * Upload image from URL to PixVerse
   * @param {string} imageUrl - Public image URL
   * @returns {Promise<Object>} { img_id, img_url }
   */
  async uploadImageFromUrl(imageUrl) {
    if (this.mockMode) {
      return this.mockUploadImage(imageUrl);
    }

    try {
      const formData = new FormData();
      formData.append('image_url', imageUrl);

      const headers = {
        'API-KEY': this.apiKey,
        'Ai-trace-id': uuidv4(),
        ...formData.getHeaders()
      };

      const response = await axios.post(
        `${this.baseURL}/openapi/v2/image/upload`,
        formData,
        { headers, timeout: 30000 }
      );

      if (response.data.ErrCode !== 0) {
        throw new Error(`Upload failed: ${response.data.ErrMsg}`);
      }

      return {
        img_id: response.data.Resp.img_id,
        img_url: response.data.Resp.img_url
      };

    } catch (error) {
      logger.error('PixVerse image URL upload failed', error);
      throw new Error(`Image URL upload failed: ${error.message}`);
    }
  }

  /**
   * Generate video from image
   * @param {Object} options - Video generation options
   * @param {number} options.img_id - Image ID from upload
   * @param {string} options.prompt - Video description prompt
   * @param {number} options.duration - Video length (5, 8, or 10)
   * @param {string} options.quality - Video quality ('360p', '540p', '720p', '1080p')
   * @param {string} options.model - Model version ('v3.5', 'v4', 'v4.5', 'v5', 'v5.5')
   * @param {string} options.style - Style for v3.5 model
   * @param {string} options.motion_mode - 'normal' or 'fast'
   * @param {string} options.negative_prompt - What to avoid
   * @param {number} options.seed - Random seed for reproducibility
   * @returns {Promise<Object>} { video_id, status }
   */
  async generateVideo(options) {
    if (this.mockMode) {
      return this.mockGenerateVideo(options);
    }

    try {
      const {
        img_id,
        prompt,
        duration = 5,
        quality = '720p',
        model = this.defaultModel,
        style,
        motion_mode = 'normal',
        negative_prompt,
        seed
      } = options;

      // Validate required fields
      if (!img_id || !prompt) {
        throw new Error('img_id and prompt are required');
      }

      const payload = {
        duration,
        img_id,
        model,
        prompt,
        quality,
        motion_mode
      };

      // Add optional parameters if provided
      if (style && model === 'v3.5') payload.style = style;
      if (negative_prompt) payload.negative_prompt = negative_prompt;
      if (seed) payload.seed = seed;

      const response = await axios.post(
        `${this.baseURL}/openapi/v2/video/img/generate`,
        payload,
        {
          headers: this.getHeaders(),
          timeout: 30000
        }
      );

      if (response.data.ErrCode !== 0) {
        throw new Error(`Generation failed: ${response.data.ErrMsg}`);
      }

      logger.info('Video generation started', {
        video_id: response.data.Resp.video_id,
        model,
        duration,
        quality
      });

      return {
        video_id: response.data.Resp.video_id,
        status: 'generating'
      };

    } catch (error) {
      logger.error('PixVerse video generation failed', error);
      throw new Error(`Video generation failed: ${error.message}`);
    }
  }

  /**
   * Check video generation status
   * @param {number} videoId - Video ID from generation
   * @returns {Promise<Object>} Status object with video data
   */
  async checkVideoStatus(videoId) {
    if (this.mockMode) {
      return this.mockCheckVideoStatus(videoId);
    }

    try {
      const response = await axios.get(
        `${this.baseURL}/openapi/v2/video/result/${videoId}`,
        {
          headers: this.getHeaders(),
          timeout: 10000
        }
      );

      if (response.data.ErrCode !== 0) {
        throw new Error(`Status check failed: ${response.data.ErrMsg}`);
      }

      const data = response.data.Resp;
      const statusMap = {
        1: 'completed',
        5: 'generating',
        6: 'deleted',
        7: 'content_failed',
        8: 'generation_failed'
      };

      return {
        video_id: data.id,
        status: statusMap[data.status] || 'unknown',
        video_url: data.url,
        prompt: data.prompt,
        negative_prompt: data.negative_prompt,
        style: data.style,
        seed: data.seed,
        width: data.outputWidth,
        height: data.outputHeight,
        resolution: data.resolution_ratio,
        file_size: data.size,
        created_at: data.create_time,
        updated_at: data.modify_time
      };

    } catch (error) {
      logger.error('PixVerse status check failed', error);
      throw new Error(`Status check failed: ${error.message}`);
    }
  }

  /**
   * Poll video status until completion
   * @param {number} videoId - Video ID to poll
   * @param {function} onProgress - Progress callback
   * @returns {Promise<Object>} Final video data
   */
  async pollVideoCompletion(videoId, onProgress = null) {
    let attempts = 0;

    while (attempts < this.maxPollAttempts) {
      try {
        const status = await this.checkVideoStatus(videoId);

        if (onProgress) {
          onProgress(status);
        }

        if (status.status === 'completed') {
          logger.info('Video generation completed', {
            video_id: videoId,
            video_url: status.video_url
          });
          return status;
        }

        if (['content_failed', 'generation_failed', 'deleted'].includes(status.status)) {
          throw new Error(`Video generation failed with status: ${status.status}`);
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, this.pollInterval));

      } catch (error) {
        if (attempts >= this.maxPollAttempts - 1) {
          throw error;
        }
        logger.warn('Polling attempt failed, retrying...', { attempt: attempts + 1 });
        attempts++;
        await new Promise(resolve => setTimeout(resolve, this.pollInterval));
      }
    }

    throw new Error('Video generation timeout - exceeded maximum polling attempts');
  }

  /**
   * Complete workflow: upload image and generate video
   * @param {string|Buffer} imageData - Image file path or Buffer
   * @param {Object} videoOptions - Video generation options
   * @returns {Promise<Object>} Complete generation result
   */
  async createVideoFromImage(imageData, videoOptions) {
    try {
      // Step 1: Upload image
      logger.info('Starting image upload');
      const uploadResult = await this.uploadImage(imageData);

      // Step 2: Generate video
      logger.info('Starting video generation');
      const generateResult = await this.generateVideo({
        img_id: uploadResult.img_id,
        ...videoOptions
      });

      // Step 3: Poll for completion
      logger.info('Polling for completion');
      const completedVideo = await this.pollVideoCompletion(generateResult.video_id);

      return {
        img_id: uploadResult.img_id,
        img_url: uploadResult.img_url,
        ...completedVideo
      };

    } catch (error) {
      logger.error('Complete video creation failed', error);
      throw new Error(`Video creation failed: ${error.message}`);
    }
  }

  /**
   * Get available models and styles
   * @returns {Object} Available options
   */
  getAvailableOptions() {
    return {
      models: ['v3.5', 'v4', 'v4.5', 'v5', 'v5.5'],
      qualities: ['360p', '540p', '720p', '1080p'],
      durations: [5, 8, 10],
      styles: ['anime', '3d_animation', 'clay', 'comic', 'cyberpunk'], // v3.5 only
      motion_modes: ['normal', 'fast'],
      camera_movements: [
        'zoom_in', 'zoom_out', 'pan_left', 'pan_right',
        'tilt_up', 'tilt_down', 'rotate_clockwise', 'rotate_counter'
      ]
    };
  }

  // Mock methods for testing
  mockUploadImage(imageData, filename = 'image.jpg') {
    return Promise.resolve({
      img_id: Math.floor(Math.random() * 1000000),
      img_url: `https://mock.pixverse.ai/uploads/${Date.now()}-${filename}`
    });
  }

  mockGenerateVideo(options) {
    return Promise.resolve({
      video_id: Math.floor(Math.random() * 1000000),
      status: 'generating'
    });
  }

  mockCheckVideoStatus(videoId) {
    // Simulate random progress
    const statuses = ['generating', 'generating', 'completed'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return Promise.resolve({
      video_id: videoId,
      status,
      video_url: status === 'completed' ?
        `https://mock.pixverse.ai/videos/${videoId}.mp4` : null,
      prompt: 'Mock video generation',
      width: 1080,
      height: 1920,
      resolution: '1080p',
      file_size: '5.2MB',
      created_at: new Date().toISOString()
    });
  }
}

module.exports = PixverseService;