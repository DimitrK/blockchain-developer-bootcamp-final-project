const merge = require('lodash/merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const git = require('../gitRevision');
const isProduction = require('../environment/isProd');

function createHtmlWebpackPlugin(options = {}) {
  const version = isProduction() ? git.version() : git.commithash();

  const defaultOpts = {
    showErrors: true,
    template: './index.html',
    meta: {
      version
    }
  };

  const opts = merge(defaultOpts, options);

  return new HtmlWebpackPlugin(opts);
}

module.exports = createHtmlWebpackPlugin;
