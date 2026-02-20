module.exports = {
  apps: [
    {
      name: 'auxora-landing',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=nexspark-interviews --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        OPENAI_API_KEY: 'REPLACE_WITH_OPENAI_KEY',
        OPENAI_BASE_URL: 'https://api.openai.com/v1',
        ANTHROPIC_API_KEY: 'REPLACE_WITH_ANTHROPIC_KEY',
        RAPIDAPI_KEY: 'REPLACE_WITH_RAPIDAPI_KEY',
        RAPIDAPI_HOST: 'rapidapi.com',
        STRIPE_SECRET_KEY: 'REPLACE_WITH_STRIPE_SECRET_KEY',
        STRIPE_PUBLISHABLE_KEY: 'REPLACE_WITH_STRIPE_PUBLISHABLE_KEY',
        GOOGLE_CLIENT_ID: 'REPLACE_WITH_GOOGLE_CLIENT_ID',
        GOOGLE_CLIENT_SECRET: 'REPLACE_WITH_GOOGLE_CLIENT_SECRET',
        GOOGLE_REDIRECT_URI: 'http://localhost:3000/auth/google/callback',
        ENVIRONMENT: 'development'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
