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
        ANTHROPIC_API_KEY: 'REDACTED_ANTHROPIC_KEY',
        RAPIDAPI_KEY: 'REDACTED_RAPIDAPI_KEY',
        RAPIDAPI_HOST: 'rapidapi.com',
        STRIPE_SECRET_KEY: 'sk_test_your_stripe_secret_key_here',
        STRIPE_PUBLISHABLE_KEY: 'pk_test_your_stripe_publishable_key_here',
        GOOGLE_CLIENT_ID: 'REDACTED_GOOGLE_CLIENT_ID',
        GOOGLE_CLIENT_SECRET: 'REDACTED_GOOGLE_CLIENT_SECRET',
        GOOGLE_REDIRECT_URI: 'http://localhost:3000/auth/google/callback',
        ENVIRONMENT: 'development'
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
