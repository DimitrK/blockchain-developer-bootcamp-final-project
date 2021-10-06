const path = require('path');
const isStaging = require('./environment/isStaging');
const isProduction = require('./environment/isProd');

const cachePath = process.env.CACHE_DIRECTORY_PATH;
const defaultCacheDirectory = './node_modules/.cache/webpack';

const getRelativePath = (...paths) => {
  const dest = path.join(cachePath || defaultCacheDirectory, ...paths);
  return cachePath ? dest : path.resolve(dest);
};

const getModeNamespace = () => {
  switch (true) {
    case isStaging():
      return 'staging';
    case isProduction():
      return 'production';
    default:
      return 'dev';
  }
};

module.exports = namespace => (type = '', useModeNamespace = false) => {
  const modeNamespace = useModeNamespace ? getModeNamespace() : '';
  return getRelativePath(namespace, type, modeNamespace);
};
