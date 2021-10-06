const webpackSources = require('webpack-sources');
const {getHtmlFilename, getSWFilename} = require('./webpack/appBudles');

const replaceEnvOptions = envNames.reduce(
  (h, envName) => [
    ...h,
    {
      filename: getHtmlFilename(envName),
      pattern: '[ENV_CDN_URL]',
      replacement: `https://${process.env.CDN_DOMAIN}`
    },
    {
      filename: getHtmlFilename(envName),
      pattern: '[ENV_PUBLIC_URL]',
      replacement: envs[envName].publicUrl
    },
    {
      filename: getSWFilename(envName),
      pattern: '[ENV_BRIDGE_SERVER_URL]',
      replacement: envs[envName].bridgeApiServerUrl
    }
  ],
  []
);


module.exports = options = replaceEnvOptions => ({
  apply(compiler) {
    options = Array.isArray(options) ? options : [options];

    options.forEach(option => {
      if (!option.pattern || !option.replacement || !option.filename) {
        throw new Error('Replace plugin: options should have `filename`, `pattern` and `replacement` values');
      }
    });

    const emit = compilation => {
      options.forEach(option => {
        const file = compilation.assets[option.filename];
        if (!file) {
          throw new Error(`Replace plugin: Couldn't find file, to replace what you need in it - "${option.filename}"`);
        }

        const body = file.source();

        const newSource = () => body.replace(option.pattern, option.replacement);

        compilation.assets[option.filename] = new webpackSources.RawSource(newSource());
      });
    };

    const pluginOptions = {
      name: 'replace-in-files',
      stage: Infinity
    };

    compiler.hooks.emit.tap(pluginOptions, emit);
  }
});
