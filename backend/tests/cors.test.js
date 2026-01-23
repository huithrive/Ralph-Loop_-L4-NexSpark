const request = require('supertest');

// We need to start the actual server to test CORS
describe('CORS Configuration Integration Tests', () => {
  let serverUrl;
  let server;

  beforeAll((done) => {
    // Start the server for testing
    const { spawn } = require('child_process');
    const path = require('path');

    // Set test environment
    process.env.NODE_ENV = 'development';
    process.env.PORT = '3002'; // Use different port to avoid conflicts

    server = spawn('node', [path.join(__dirname, '../server.js')], {
      env: { ...process.env, PORT: '3002' },
      stdio: 'pipe'
    });

    serverUrl = 'http://localhost:3002';

    // Wait for server to start
    setTimeout(() => {
      done();
    }, 3000);
  });

  afterAll((done) => {
    if (server) {
      server.kill();
      setTimeout(done, 1000);
    } else {
      done();
    }
  });

  test('should allow CORS preflight requests from any origin in development', async () => {
    const response = await request(serverUrl)
      .options('/api/health')
      .set('Origin', 'file://')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'content-type');

    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('*');
    expect(response.headers['access-control-allow-methods']).toContain('GET');
    expect(response.headers['access-control-allow-methods']).toContain('POST');
    expect(response.headers['access-control-allow-methods']).toContain('PUT');
    expect(response.headers['access-control-allow-methods']).toContain('DELETE');
    expect(response.headers['access-control-allow-headers']).toContain('Content-Type');
    expect(response.headers['access-control-allow-headers']).toContain('Authorization');
  });

  test('should allow GET requests from file:// origin', async () => {
    const response = await request(serverUrl)
      .get('/api/health')
      .set('Origin', 'file://');

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('*');
    expect(response.body.status).toBe('ok');
  });

  test('should allow POST requests from arbitrary origins', async () => {
    // Test with a POST endpoint that exists
    const response = await request(serverUrl)
      .post('/api/strategist/research')
      .set('Origin', 'https://example.com')
      .send({
        website_url: 'https://example.com',
        product_description: 'Test product for CORS testing'
      });

    // We expect either success or validation error, but CORS should allow the request
    expect(response.headers['access-control-allow-origin']).toBe('*');
    // Status could be 400 (validation error) or other, but it shouldn't be CORS-blocked
    expect(response.status).not.toBe(0); // 0 would indicate CORS block
  });

  test('should allow requests from localhost variations', async () => {
    const origins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'https://localhost:3000'
    ];

    for (const origin of origins) {
      const response = await request(serverUrl)
        .get('/api/health')
        .set('Origin', origin);

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.body.status).toBe('ok');
    }
  });

  test('should not include credentials in development mode', async () => {
    const response = await request(serverUrl)
      .options('/api/health')
      .set('Origin', 'https://example.com')
      .set('Access-Control-Request-Method', 'GET');

    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('*');
    // Credentials should not be set to true with wildcard origin
    expect(response.headers['access-control-allow-credentials']).toBeUndefined();
  });

  test('should handle missing Origin header gracefully', async () => {
    const response = await request(serverUrl)
      .get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});