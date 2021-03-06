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
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const getLocalIdent = require('css-loader/lib/getLocalIdent');


module.exports = {
  entry: ['@babel/polyfill', './index.js'],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.js',
  },
  resolve: {
    extensions: ['.scss', '.css', '.js', '.jsx', '.json'],
    fallback: {
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify/browser.js',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      Buffer: 'buffer',
    },
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, './tsconfig.json'),
        extensions: [".js", ".jsx", ".ts"],
        baseUrl: path.resolve(__dirname, '.')
      })
    ]
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
      __MOVIEDB_API_KEY__: JSON.stringify(process.env.MOVIEDB_API_KEY),
      __MOVIEDB_API_URL__: JSON.stringify(process.env.MOVIEDB_API_URL)
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
        test: /\.s?css$/,
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
              localIdentName: '[path][name]__[local]',
              getLocalIdent: (loaderContext, localIdentName, localName, options) => {
                return loaderContext.resourcePath.includes('antd') ?
                  localName :
                  getLocalIdent(loaderContext, localIdentName, localName, options);
              }
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
              sourceMap: true
            },
          },
        ],
      },
      // {
      //   test: /\.(js|jsx)$/,
      //   exclude: /node_modules/,
      //   use: 'babel-loader',
      // },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'esbuild-loader',
        options: {
          target: 'es2015',  // Syntax to compile to (see options below for possible values)
          loader: 'jsx',
          implementation: require('esbuild')
        }
      }
    ],
  },
  devServer: {
    historyApiFallback: true,
    client: {
      overlay: {
        errors: true,
        warnings: false
      }
    }
  },
  watchOptions: {
    ignored: /node_modules/
  }
};
