module.exports = {
  apps: [
    {
      name: 'simple-social-api',
      script: './src/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        JWT_SECRET:
          'UNWNjaGYWaEGVEjwYzFYCbksuczEQGsTRnkUekWcZLnwLBGRTKzJCjuWRSsdJwzt',
        JWT_EXPIRES_IN: '7d',
      },
    },
  ],
};
