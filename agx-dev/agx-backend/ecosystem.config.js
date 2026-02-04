module.exports = {
  apps: [{
    name: 'agx-backend',
    script: 'dist/main.js',
    cwd: '/root/agx-dev/agx-backend',
    env_file: '.env',
    env: {
      NODE_ENV: 'production',
    },
    error_file: '/root/.pm2/logs/agx-backend-error.log',
    out_file: '/root/.pm2/logs/agx-backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '800M',
  }]
};
