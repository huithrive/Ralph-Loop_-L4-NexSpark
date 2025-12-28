module.exports = {
  apps: [
    {
      name: 'nexspark-landing',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=nexspark-interviews --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        OPENAI_API_KEY: 'REDACTED_OPENAI_KEY',
        OPENAI_BASE_URL: 'https://api.openai.com/v1',
        GOOGLE_CLIENT_ID: 'your-google-client-id',
        GOOGLE_CLIENT_SECRET: 'your-google-client-secret',
        GOOGLE_REDIRECT_URI: 'https://your-domain.pages.dev/auth/google/callback',
        ENVIRONMENT: 'development'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
