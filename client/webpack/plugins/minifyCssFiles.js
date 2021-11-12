const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const minifyCssFiles = () =>
  new OptimizeCssAssetsPlugin({
    cssProcessorOptions: {
      map: {
        inline: false,
        annotation: true
      }
    },
    cssProcessorPluginOptions: {
      preset: ['default', {discardComments: {removeAll: true}}]
    }
  });


module.exports = minifyCssFiles;
