// pm2 cho API. KHÔNG đặt secret ở đây: mọi cấu hình nằm trong .env (app tự đọc theo đường dẫn tuyệt đối).
// Dùng:  pm2 start ecosystem.config.cjs && pm2 save
module.exports = {
  apps: [
    {
      name: 'icards-api',
      cwd: __dirname,
      script: 'dist/main.js',
      env: { NODE_ENV: 'production' },
      max_restarts: 10,
      restart_delay: 3000,
    },
  ],
};
