require('@babel/register');
require('@babel/polyfill');
const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const compact = require('lodash/compact');
const getIndexHtmlName = require('./webpack/getIndexHtmlName');
const createHtmlWebpackPlugin = require('./webpack/plugins/createHtmlWebpackPlugin');
const bundleAnalyzer = require('./webpack/bundleAnalyzer');
const git = require('./webpack/gitRevision');
const {isEsm} = require('./webpack/babelMode');
const indexName = getIndexHtmlName(process.env.NODE_ENV);
const babelModeSuffix = isEsm() ? 'esm' : 'cjs';
// const LavaMoatPlugin = require('lavamoat-webpack');
const dist = path.resolve(__dirname, 'dist', babelModeSuffix);

module.exports = {
  entry: ['@babel/polyfill', './index.js'],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.js',
  },
  resolve: {
    extensions: ['.scss', '.css', '.js', '.jsx', '.json'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
    fallback: {
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify/browser.js',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      Buffer: 'buffer',
    },
  },
  plugins: [
    createHtmlWebpackPlugin(),
    new CopyWebpackPlugin([
      { from: './app/_redirects' },
      { from: './app/images', to: 'images/' },
    ]),
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(git.version()),
      __COMMIT_HASH__: JSON.stringify(git.commithash() || 'NA'),
      __ENV__: JSON.stringify(process.env.NODE_ENV),
      __ROLLBAR_ACCESS_TOKEN__: JSON.stringify(process.env.ROLLBAR_ACCESS_TOKEN),
    }),
    new Dotenv(),
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
    // bundleAnalyzer(),
    // new LavaMoatPlugin({
    //   writeAutoConfig: true,
    // }),
  ],
  optimization: {
    concatenateModules: false,
    mangleWasmImports: true,
    splitChunks: {
      maxInitialRequests: 10,
      maxAsyncRequests: 10,
      automaticNameDelimiter: '.'
    },
  },
  module: {
    rules: [
      {
        test: /\.jpe?g$|\.ico$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
        use: ['file-loader?name=[name].[ext]'],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              import: true,
              importLoaders: 1,
              camelCase: true,
              localIdentName: '[path][name]__[local]'
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                ident: 'postcss',
                plugins: compact([
                  require('postcss-custom-properties')(),
                  require('autoprefixer')({
                    overrideBrowserslist: ['defaults', 'safari >=10', 'ie >=10']
                  })
                ])
              }
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              includePaths: [path.join(__dirname, 'app/styles')],
            },
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
    ],
  },
  devServer: {
    stats: 'minimal',
    contentBase: dist,
    historyApiFallback: true
  },
  watchOptions: {
    ignored: /node_modules/
  }
};
