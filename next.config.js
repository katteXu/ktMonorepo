const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const withLess = require('@zeit/next-less');
const withCss = require('@zeit/next-css');
const path = require('path');
const CONFIG = require('./config');
// 别名
const alias = {
  '@components': './components',
  '@api': './api',
  '@styles': './static/styles',
  '@imgs': './imgs',
  '@icons': './static/icons',
  '@utils': './utils',
  '@store': './store',
};

let config = {
  // 开发代理
  rewrites: () => [
    {
      source: '/api/:path*',
      destination: 'http://test.api.kachexiongdi.com/:path*',
      basePath: false,
    },
  ],
  trailingSlash: process.env.NODE_ENV !== 'development',

  assetPrefix: `${CONFIG.oss.path}/${CONFIG.oss.fold}`,

  webpack: (config, { isServer }) => {
    if (isServer) {
      const antStyles = /antd\/.*?\/style\/css.*?/;
      const origExternals = [...config.externals];
      config.externals = [
        (context, request, callback) => {
          if (request.match(antStyles)) return callback();
          if (typeof origExternals[0] === 'function') {
            origExternals[0](context, request, callback);
          } else {
            callback();
          }
        },
        ...(typeof origExternals[0] === 'function' ? [] : origExternals),
      ];

      config.module.rules.unshift({
        test: antStyles,
        use: 'null-loader',
      });
    }

    // 添加别名
    Object.keys(alias).forEach(key => {
      config.resolve.alias[key] = path.resolve(alias[key]);
    });

    config.plugins.push(
      new FilterWarningsPlugin({
        exclude: /mini-css-extract-plugin[^]*Conflicting order between:/,
      })
    );

    return config;
  },
};

config = withCss(config);

config = withLess(
  Object.assign({}, config, {
    cssModules: true,
    cssLoaderOptions: {
      localIdentName: '[local]__[hash:base64:5]',
      importLoaders: 1,
    },
  })
);

module.exports = config;
