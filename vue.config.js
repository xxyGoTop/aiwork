const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer")
const { argv } = require("yargs")

const IS_DEV = process.env.NODE_ENV === "development"
const {
  PUBLIC_PATH = "/",
  VUE_APP_BASE_URL = "/",
  VUE_APP_API,
} = process.env
const publicPath = IS_DEV ? VUE_APP_BASE_URL : /^https?:/.test(PUBLIC_PATH) ? PUBLIC_PATH : VUE_APP_BASE_URL

module.exports = {
  publicPath,
  assetsDir: "assets",
  productionSourceMap: IS_DEV,
  lintOnSave: IS_DEV ? "error" : false,
  devServer: {
    port: 8080,
    disableHostCheck: true,
    proxy: { 
      [VUE_APP_API]: {
        target: "http://49.233.92.53/",
        pathRewrite: {
          [`^${VUE_APP_API}`]: "",
        },
      },
    },
  },
  configureWebpack: {
    externals: {
      "BMap": "BMap",
    },
    optimization: {
      splitChunks: {
        name: IS_DEV,
        cacheGroups: {
          frame: {
            name: "chunk-frame",
            test: /[\\/]node_modules[\\/](vue|vuex|vue-router)[\\/]/,
            priority: 20,
            chunks: "initial",
          },
          elementui: {
            name: "chunk-elementui",
            test: /[\\/]node_modules[\\/]element-ui[\\/]/,
            priority: 10,
            chunks: "initial",
          },
        },
      },
    },
  },
  chainWebpack(config) {
    if (argv.stats) {
      config.plugin("BundleAnalyzerPlugin").use(BundleAnalyzerPlugin)
    }
  },
}
