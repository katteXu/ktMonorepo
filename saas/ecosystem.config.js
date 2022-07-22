const path = require('path');
module.exports = {
  apps: [
    {
      name: 'kcsj-web-platform3',
      script: path.join(__dirname, 'server.js'),
      env_dev: {
        NEXT_ENV: 'dev',
      },
      env_pre: {
        NEXT_ENV: 'pre',
      },
      env_pro: {
        NEXT_ENV: 'pro',
      },
    },
  ],
};
