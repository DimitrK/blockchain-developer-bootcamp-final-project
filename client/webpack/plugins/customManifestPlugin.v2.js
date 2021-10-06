const path = require('path');
const isDev = require('../environment/isDev');
const gitRevision = require('../gitRevision');

const emitCountMap = new Map();

const getFileType = chunkName =>
  chunkName
    .replace(/\?.*/, '')
    .split('.')
    .pop();

module.exports = injectRevision => ({
  apply(compiler) {
    const publicPath = compiler.options.output.publicPath;

    const outputFolder = compiler.options.output.path;

    const getOutputFile = revision => path.resolve(outputFolder, `manifest${revision}.json`);

    const outputFile = getOutputFile(injectRevision ? '.' + gitRevision.commithash() : '');

    const vendorAssets = {};

    const emit = compilation => {
      const emitCount = emitCountMap.get(outputFile) - 1;
      emitCountMap.set(outputFile, emitCount);

      const runtimeChunkFiles = compilation.chunks.find(chunk => (/runtime/).test(chunk.name)).files;
      const runtime = Array.from(runtimeChunkFiles)[0];
      let assets = {
        runtime: `${publicPath}${runtime}`.replace(/\\/g, '/')
      };

      assets = compilation.chunkGroups.reduce((h, entry) => {
        if (!entry.name) {
          return h;
        }

        return {
          ...h,
          [entry.name]: entry.chunks.reduce(
            (chunks, chunk) => ({
              ...chunks,
              ...Array.from(chunk.files)
                .filter(chunkName => !(/(runtime|\.map$)/).test(chunkName))
                .reduce((byExt, chunkName) => {
                  const ext = getFileType(chunkName);
                  if (!byExt[ext]) {
                    byExt[ext] = [];
                  }

                  const pathname = `${publicPath}${chunkName}`.replace(/\\/g, '/');
                  byExt[ext].push(pathname);
                  return byExt;
                }, chunks)
            }),
            {}
          )
        };
      }, assets);

      assets = compilation
        .getStats()
        .toJson()
        .assets.reduce((h, asset) => {
          const isEntry = asset.chunks.length > 0;
          if (!asset.name || isEntry || (/\.map$/).test(asset.name)) {
            return h;
          }

          let assetName = asset.name;
          const assetPath = `${publicPath}${asset.name}`.replace(/\\/g, '/');

          if ((/^(vendor\/\w+|sw)\..*(js|css|svg|png|jpe?g|html)$/).test(assetName)) {
            assetName = assetName.replace(/^(vendor\/\w+|sw)\..+$/, '$1');
            vendorAssets[assetName] = assetPath;
            return h;
          }

          return {
            ...h,
            [assetName]: assetPath
          };
        }, assets);

      const bundledAssets = JSON.stringify({...assets, ...vendorAssets});

      const addManifestToAssets = manifestFile => {
        const outputName = path.relative(outputFolder, manifestFile || outputFile);

        compilation.assets[outputName] = {
          source() {
            return bundledAssets;
          },
          size() {
            return bundledAssets.length;
          }
        };
      };

      const isLastEmit = emitCount === 0;
      if (isLastEmit) {
        addManifestToAssets();
        if (gitRevision.isReleaseCandidate()) {
          addManifestToAssets(getOutputFile(`.${gitRevision.version()}`));
        } else if (!isDev()) {
          addManifestToAssets(getOutputFile('.latest'));
        }
      }
      // compiler.hooks.webpackManifestPluginAfterEmit.call(assets);
    };

    const beforeRun = (_, callback) => {
      emitCountMap.set(outputFile, (emitCountMap.get(outputFile) || 0) + 1);
      if (callback) {
        callback();
      }
    };

    const pluginOptions = {
      name: 'manifest-by-entry',
      stage: Infinity
    };
    // compiler.hooks.webpackManifestPluginAfterEmit = new SyncWaterfallHook(['assets']);

    compiler.hooks.emit.tap(pluginOptions, emit);

    compiler.hooks.run.tap(pluginOptions, beforeRun);
    compiler.hooks.watchRun.tap(pluginOptions, beforeRun);
  }
});
