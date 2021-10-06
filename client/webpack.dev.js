const {merge} = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const getAppName = require('./webpack/getAppName');
const common = require('./webpack.common');

module.exports = merge({
  mode: 'development',
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].css'
    }),
    new WebpackBuildNotifierPlugin({
      title: getAppName(),
      sound: false,
      timeout: 2
    }),
  ],
  optimization: {
    moduleIds: 'named',
    minimize: false
  }
}, common);
