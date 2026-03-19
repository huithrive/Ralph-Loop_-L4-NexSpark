module.exports = {
  apps: [
    {
      name: 'auxora-landing',
      script: 'npx',
      args: 'wrangler dev --local --port 3000 --ip 0.0.0.0',
      cwd: '/home/user/webapp/backend/strategist',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork'
    }
  ]
};
