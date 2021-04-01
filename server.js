const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://test.api.kachexiongdi.com',
    changeOrigoin: true,
    pathRewrite: { '^/api': '' },
  })
);

app.use('/', express.static(path.join(__dirname, 'out')));

// 未找到
app.use(function (req, res, next) {
  res.status(404).sendFile(path.join(__dirname, 'out/404/index.html'));
});

// 服务端错误
app.use(function (err, req, res, next) {
  res.status(500).sendFile(path.join(__dirname, 'out/500/index.html'));
});

app.listen(9040, () => {
  console.log('http://127.0.0.1:9040');
});
