const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const isAnalyze = require('./environment/isAnalyze');

module.exports = () =>
  isAnalyze() &&
  new BundleAnalyzerPlugin({
    analyzerMode: 'static'
  });
