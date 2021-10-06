const {resolve} = require('path');
const fs = require('fs-extra');
const pkg = require(resolve('./package.json'));
const {pathPrefix = '/ats/desktop'} = pkg;
const getCacheDirectory = require('../getCacheDirectory');
const cacheDir = getCacheDirectory(pathPrefix)();

fs.remove(cacheDir)
  .then(() => {
    // eslint-disable-next-line
    console.log(`> Cache folder ${cacheDir} deleted.`);
  })
  .catch(err => {
    /* eslint-disable */
    console.error(`> Could not delete: ${cacheDir}`);
    console.error(err);
    /* eslint-enable */
  });
