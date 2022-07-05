const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { argv } = require('yargs');

const IS_DEV = process.env.NODE_ENV === 'development';
const {
  PUBLIC_PATH = '/',
  VUE_APP_BASE_URL = '/',
  VUE_APP_LIVE_API,
  VUE_APP_OM_API,
  VUE_APP_FILE_API,
  VUE_APP_ADDR_API,
  VUE_APP_BILL_API,
  VUE_APP_ALTER_API,
} = process.env;
const publicPath = IS_DEV ? VUE_APP_BASE_URL : /^https?:/.test(PUBLIC_PATH) ? PUBLIC_PATH : VUE_APP_BASE_URL;

const PORT = 8089;

module.exports = {
  publicPath,
  assetsDir: 'assets',
  productionSourceMap: IS_DEV,
  devServer: {
    port: PORT,
    disableHostCheck: true,
    // sockPath: '/sockjs-msm',
    proxy: {
      '/api-mock': {
        target: 'http://192.168.49.123:9099/',
        pathRewrite: {
          '^/api-mock': ''
        }
      },
      [VUE_APP_OM_API]: {
        target: 'http://10.255.244.20:9099/',
        // target: 'http://192.168.49.90:9099/',
        pathRewrite: {
          [`^${VUE_APP_OM_API}`]: '',
        },
      },
      [VUE_APP_FILE_API]: {
        target: 'http://test.file.clp.api:30880/',
        // target: 'http://10.53.253.58:8080/',
        pathRewrite: {
          [`^${VUE_APP_FILE_API}`]: '',
        },
      },
      [VUE_APP_LIVE_API]: {
        target: 'http://10.255.244.20:9099/',
        pathRewrite: {
          [`^${VUE_APP_LIVE_API}`]: '/live',
        },
      },
      [VUE_APP_ADDR_API]: {
        // target: 'http://192.168.47.210:8080/',
        target: 'http://192.168.49.116:8080/address_web_adm_war_exploded',
        pathRewrite: {
          [`^${VUE_APP_ADDR_API}`]: '',
        },
      },
      [VUE_APP_BILL_API]: {
        target: 'http://10.255.244.18:8080/',
        pathRewrite: {
          [`^${VUE_APP_BILL_API}`]: '',
        },
      },
      [VUE_APP_ALTER_API]: {
        target: 'http://10.255.244.17:9099/',
        pathRewrite: {
          [`^${VUE_APP_ALTER_API}`]: '',
        },
      },
      // sso 登录跳转
      '/callback': {
        target: 'http://10.255.244.20:9099',
        onProxyRes: (proxyRes) => {
          if (proxyRes.statusCode === 302) {
            proxyRes.headers['location'] = `http://preomall.dangdang.com:${PORT}`;
          }
        },
      },
    },
  },
  configureWebpack: {
    optimization: {
      splitChunks: {
        name: IS_DEV,
        cacheGroups: {
          frame: {
            name: 'chunk-frame',
            test: /[\\/]node_modules[\\/](vue|vuex|vue-router)[\\/]/,
            priority: 20,
            chunks: 'initial',
          },
          elementui: {
            name: 'chunk-elementui',
            test: /[\\/]node_modules[\\/]element-ui[\\/]/,
            priority: 10,
            chunks: 'initial',
          },
        },
      },
    },
  },
  chainWebpack(config) {
    if (argv.stats) {
      config.plugin('BundleAnalyzerPlugin').use(BundleAnalyzerPlugin);
    }
  },
};
