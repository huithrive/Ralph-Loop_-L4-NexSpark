// Creative Generation Service Tests

const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const CreativeService = require('../services/creativeService');
const PixverseService = require('../services/pixverseService');
const CreativeGeneration = require('../models/CreativeGeneration');

// Create test app
const app = express();
app.use(express.json());

// Mock environment variables for testing
process.env.PIXVERSE_API_KEY = 'test-api-key';

describe('CreativeService', () => {
  let creativeService;

  beforeEach(() => {
    creativeService = new CreativeService();
    // Clear any active generations
    creativeService.activeGenerations.clear();
  });

  describe('Provider Management', () => {
    test('should get available providers', () => {
      const providers = creativeService.getProviders();
      expect(providers).toHaveProperty('pixverse');
      expect(providers.pixverse).toHaveProperty('name', 'PixVerse');
      expect(providers.pixverse).toHaveProperty('capabilities');
      expect(providers.pixverse.capabilities).toContain('image-to-video');
    });

    test('should select default provider when none specified', () => {
      const provider = creativeService.selectProvider();
      expect(provider).toBe('pixverse');
    });

    test('should select specified provider if available', () => {
      const provider = creativeService.selectProvider('pixverse');
      expect(provider).toBe('pixverse');
    });

    test('should throw error if no providers available', () => {
      // Temporarily remove API key to make provider unavailable
      delete process.env.PIXVERSE_API_KEY;
      const serviceWithoutKey = new CreativeService();

      expect(() => {
        serviceWithoutKey.selectProvider();
      }).toThrow('No available creative generation providers');

      // Restore API key
      process.env.PIXVERSE_API_KEY = 'test-api-key';
    });
  });

  describe('Video Generation', () => {
    test('should start video generation from image', async () => {
      const mockImageData = Buffer.from('fake-image-data');
      const options = {
        prompt: 'A person walking through a city',
        duration: 5,
        quality: '720p'
      };

      const result = await creativeService.generateVideoFromImage(mockImageData, options);

      expect(result).toHaveProperty('job_id');
      expect(result).toHaveProperty('status', 'starting');
      expect(result).toHaveProperty('provider', 'pixverse');
      expect(result).toHaveProperty('estimated_time');
      expect(result).toHaveProperty('message');

      // Check that job is tracked
      expect(creativeService.activeGenerations.has(result.job_id)).toBe(true);
    });

    test('should handle text-to-video generation (placeholder)', async () => {
      const options = {
        prompt: 'A beautiful sunset over mountains',
        duration: 8
      };

      const result = await creativeService.generateVideoFromText(options);

      expect(result).toHaveProperty('job_id');
      expect(result).toHaveProperty('status', 'pending');
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('not yet implemented');
    });

    test('should throw error with invalid options', async () => {
      const mockImageData = Buffer.from('fake-image-data');
      const options = {}; // Missing required prompt

      await expect(
        creativeService.generateVideoFromImage(mockImageData, options)
      ).rejects.toThrow();
    });
  });

  describe('Status Management', () => {
    test('should get generation status', async () => {
      // Start a generation first
      const mockImageData = Buffer.from('fake-image-data');
      const options = { prompt: 'Test video' };

      const generation = await creativeService.generateVideoFromImage(mockImageData, options);

      // Get status
      const status = await creativeService.getGenerationStatus(generation.job_id);

      expect(status).toHaveProperty('job_id', generation.job_id);
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('provider', 'pixverse');
      expect(status).toHaveProperty('started_at');
      expect(status).toHaveProperty('options');
    });

    test('should throw error for non-existent job', async () => {
      const fakeJobId = 'non-existent-job-id';

      await expect(
        creativeService.getGenerationStatus(fakeJobId)
      ).rejects.toThrow('Generation job not found');
    });
  });

  describe('Job Listing', () => {
    test('should list generation jobs', async () => {
      // Start multiple generations
      const mockImageData = Buffer.from('fake-image-data');

      const gen1 = await creativeService.generateVideoFromImage(mockImageData, { prompt: 'Video 1' });
      const gen2 = await creativeService.generateVideoFromImage(mockImageData, { prompt: 'Video 2' });

      const list = creativeService.listGenerations(10);

      expect(list).toHaveProperty('jobs');
      expect(list).toHaveProperty('total');
      expect(list).toHaveProperty('active');
      expect(list.jobs).toHaveLength(2);
      expect(list.total).toBe(2);
      expect(list.active).toBeGreaterThan(0);
    });

    test('should limit number of jobs returned', () => {
      // Add multiple jobs
      for (let i = 0; i < 5; i++) {
        creativeService.activeGenerations.set(`job-${i}`, {
          status: 'completed',
          provider: 'pixverse',
          startTime: new Date(Date.now() - i * 1000)
        });
      }

      const list = creativeService.listGenerations(3);

      expect(list.jobs).toHaveLength(3);
      expect(list.total).toBe(5);
    });
  });

  describe('Creative Options', () => {
    test('should get creative options', () => {
      const options = creativeService.getCreativeOptions();

      expect(options).toHaveProperty('providers');
      expect(options).toHaveProperty('styles');
      expect(options).toHaveProperty('models');
      expect(options).toHaveProperty('qualities');
      expect(options).toHaveProperty('durations');
      expect(options).toHaveProperty('motion_modes');
      expect(options).toHaveProperty('supported_formats');
      expect(options).toHaveProperty('limits');

      expect(options.providers).toContain('pixverse');
      expect(options.qualities).toContain('720p');
      expect(options.durations).toContain(5);
    });
  });

  describe('Cleanup', () => {
    test('should clean up old jobs', () => {
      // Add old completed job
      const oldJob = {
        status: 'completed',
        completedAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        provider: 'pixverse',
        startTime: new Date()
      };

      // Add recent job
      const recentJob = {
        status: 'completed',
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        provider: 'pixverse',
        startTime: new Date()
      };

      creativeService.activeGenerations.set('old-job', oldJob);
      creativeService.activeGenerations.set('recent-job', recentJob);

      expect(creativeService.activeGenerations.size).toBe(2);

      creativeService.cleanupOldJobs(24); // 24 hours max age

      expect(creativeService.activeGenerations.size).toBe(1);
      expect(creativeService.activeGenerations.has('recent-job')).toBe(true);
      expect(creativeService.activeGenerations.has('old-job')).toBe(false);
    });
  });
});

describe('PixverseService', () => {
  let pixverseService;

  beforeEach(() => {
    pixverseService = new PixverseService();
  });

  describe('Mock Mode', () => {
    test('should work in mock mode without API key', () => {
      delete process.env.PIXVERSE_API_KEY;
      const mockService = new PixverseService();

      expect(mockService.mockMode).toBe(true);
    });

    test('should mock image upload', async () => {
      delete process.env.PIXVERSE_API_KEY;
      const mockService = new PixverseService();

      const result = await mockService.uploadImage('test-image.jpg');

      expect(result).toHaveProperty('img_id');
      expect(result).toHaveProperty('img_url');
      expect(typeof result.img_id).toBe('number');
      expect(result.img_url).toContain('mock.pixverse.ai');
    });

    test('should mock video generation', async () => {
      delete process.env.PIXVERSE_API_KEY;
      const mockService = new PixverseService();

      const options = {
        img_id: 12345,
        prompt: 'Test video generation'
      };

      const result = await mockService.generateVideo(options);

      expect(result).toHaveProperty('video_id');
      expect(result).toHaveProperty('status', 'generating');
      expect(typeof result.video_id).toBe('number');
    });

    test('should mock status checking', async () => {
      delete process.env.PIXVERSE_API_KEY;
      const mockService = new PixverseService();

      const status = await mockService.checkVideoStatus(12345);

      expect(status).toHaveProperty('video_id', 12345);
      expect(status).toHaveProperty('status');
      expect(['generating', 'completed']).toContain(status.status);
    });
  });

  describe('Configuration', () => {
    test('should have correct default configuration', () => {
      expect(pixverseService.baseURL).toBe('https://app-api.pixverse.ai');
      expect(pixverseService.defaultModel).toBe('v4.5');
      expect(pixverseService.pollInterval).toBe(3000);
    });

    test('should generate proper headers', () => {
      process.env.PIXVERSE_API_KEY = 'test-key';
      const service = new PixverseService();

      const headers = service.getHeaders();

      expect(headers).toHaveProperty('API-KEY', 'test-key');
      expect(headers).toHaveProperty('Ai-trace-id');
      expect(headers).toHaveProperty('Content-Type', 'application/json');
    });
  });

  describe('Available Options', () => {
    test('should return available options', () => {
      const options = pixverseService.getAvailableOptions();

      expect(options).toHaveProperty('models');
      expect(options).toHaveProperty('qualities');
      expect(options).toHaveProperty('durations');
      expect(options).toHaveProperty('styles');
      expect(options).toHaveProperty('motion_modes');
      expect(options).toHaveProperty('camera_movements');

      expect(options.models).toContain('v4.5');
      expect(options.qualities).toContain('720p');
      expect(options.durations).toContain(5);
      expect(options.styles).toContain('anime');
    });
  });

  describe('Validation', () => {
    test('should validate required fields for video generation', async () => {
      const options = {
        // Missing img_id and prompt
        duration: 5
      };

      await expect(
        pixverseService.generateVideo(options)
      ).rejects.toThrow('img_id and prompt are required');
    });
  });

  afterEach(() => {
    // Restore environment variables
    process.env.PIXVERSE_API_KEY = 'test-api-key';
  });
});

describe('CreativeGeneration Model', () => {
  beforeEach(async () => {
    // Clean up test data
    await CreativeGeneration.cleanup(0);
  });

  describe('CRUD Operations', () => {
    test('should create generation job', async () => {
      const data = {
        prompt: 'Test video generation',
        duration: 5,
        quality: '720p',
        provider: 'pixverse'
      };

      const job = await CreativeGeneration.create(data);

      expect(job).toHaveProperty('id');
      expect(job).toHaveProperty('job_id');
      expect(job).toHaveProperty('prompt', 'Test video generation');
      expect(job).toHaveProperty('status', 'pending');
    });

    test('should find job by job_id', async () => {
      const data = {
        prompt: 'Findable video',
        duration: 8
      };

      const created = await CreativeGeneration.create(data);
      const found = await CreativeGeneration.findByJobId(created.job_id);

      expect(found).toBeTruthy();
      expect(found.job_id).toBe(created.job_id);
      expect(found.prompt).toBe('Findable video');
    });

    test('should return null for non-existent job', async () => {
      const found = await CreativeGeneration.findByJobId('00000000-0000-0000-0000-000000000000');
      expect(found).toBeNull();
    });

    test('should update job status and data', async () => {
      const data = {
        prompt: 'Updatable video',
        duration: 10
      };

      const job = await CreativeGeneration.create(data);

      const updates = {
        status: 'completed',
        video_url: 'https://example.com/video.mp4',
        width: 1920,
        height: 1080,
        completed_at: new Date()
      };

      const updated = await CreativeGeneration.update(job.job_id, updates);

      expect(updated.status).toBe('completed');
      expect(updated.video_url).toBe('https://example.com/video.mp4');
      expect(updated.width).toBe(1920);
      expect(updated.height).toBe(1080);
    });
  });

  describe('Listing and Statistics', () => {
    test('should list recent jobs', async () => {
      // Create multiple jobs
      for (let i = 0; i < 3; i++) {
        await CreativeGeneration.create({
          prompt: `Test video ${i}`,
          duration: 5
        });
      }

      const jobs = await CreativeGeneration.list({ limit: 5 });

      expect(jobs).toHaveLength(3);
      expect(jobs[0]).toHaveProperty('prompt');
      expect(jobs[0]).toHaveProperty('status');
    });

    test('should filter by status', async () => {
      // Create jobs with different statuses
      const pendingJob = await CreativeGeneration.create({
        prompt: 'Pending video',
        duration: 5
      });

      await CreativeGeneration.update(pendingJob.job_id, { status: 'completed' });

      await CreativeGeneration.create({
        prompt: 'Still pending video',
        duration: 5
      });

      const pendingJobs = await CreativeGeneration.list({ status: 'pending' });
      const completedJobs = await CreativeGeneration.list({ status: 'completed' });

      expect(pendingJobs).toHaveLength(1);
      expect(completedJobs).toHaveLength(1);
      expect(pendingJobs[0].prompt).toBe('Still pending video');
    });

    test('should get generation statistics', async () => {
      // Create test jobs
      await CreativeGeneration.create({
        prompt: 'Test 1',
        duration: 5
      });

      const job2 = await CreativeGeneration.create({
        prompt: 'Test 2',
        duration: 8
      });

      await CreativeGeneration.update(job2.job_id, { status: 'completed' });

      const stats = await CreativeGeneration.getStats();

      expect(stats).toHaveProperty('totals');
      expect(stats).toHaveProperty('daily_stats');
      expect(stats.totals.total).toBeGreaterThan(0);
      expect(parseInt(stats.totals.completed)).toBeGreaterThan(0);
    });
  });

  afterAll(async () => {
    // Clean up all test data
    await CreativeGeneration.cleanup(0);
  });
});