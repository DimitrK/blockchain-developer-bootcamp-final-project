const {merge} = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const common = require('./webpack.common');
const s3 = require('./webpack/s3');
const cdndomain = process.env.CDN_DOMAIN;
const minifyCssFiles = require('@webpack/plugins/minifyCssFiles');
const {isEsm} = require('./webpack/babelMode');

const nodeEnv = process.env.NODE_ENV || 'development';
const publicPath = `https://${cdndomain}/${s3path}/`;
const babelModeSuffix = isEsm() ? 'esm' : 'cjs';
const dist = path.resolve(__dirname, 'dist', babelModeSuffix);
const s3path = getS3Path(s3AppPath, nodeEnv);

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new UglifyJSPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[name].[contenthash].css'
    }),
    minifyCssFiles(),
    process.env.ROLLBAR_POST_SERVER_TOKEN &&
      new RollbarSourceMapPlugin({
        ignoreErrors: true,
        accessToken: process.env.ROLLBAR_POST_SERVER_TOKEN,
        version: git.version(),
        publicPath: publicPath.substring(0, publicPath.length - 1)
      }),
    s3({bucket: 'workablehr-ui', basePath: s3path, directory: dist})
  ],
  optimization: {
    moduleIds: 'deterministic',
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 5,
          mangle: true,
          module: false,
          nameCache: {},
          sourceMap: true,
          /*
           * Module Federation seems to rely on writing variables to the global namespace
           * and the combination of `topLevel:true` with both our source map options
           * (`hidden-source-map` and `eval-source-map`) seems to break it.
           * Keeping top-level variables unmangled allows it to function correctly.
           */
          toplevel: false,
          warnings: false
        }
      })
    ]
  }
});
