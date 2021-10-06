const path = require('path');
const {merge} = require('webpack-merge');
const isDev = require('./environment/isDev');
const isTest = require('./environment/isTest');
const getCacheDirectory = require('./getCacheDirectory');
const hamlcLoaderOpts = require('./hamlcLoaderOpts');
const {compact} = require('lodash');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const INTL_TEL_INPUT_PATH = /\/intl-tel-input\/build\//;
const IMAGE_CROP_PATH = /\/cropperjs\/dist\//;
const SHARED_LIBRARY_PATHS = [INTL_TEL_INPUT_PATH, IMAGE_CROP_PATH];
const SHARED_PATH = /shared\/ui\//;
const SHARED_CONTEXT_PATH = /shared\/contexts\//;

const excludePaths = Symbol();

const addLoader = (loader, options) => {
  if (typeof options === 'object') {
    return merge(loader, options);
  }
  return options && loader;
};

const composeExclude = exclude => {
  return exclude === false
    ? undefined
    : exclude
      ? Array.isArray(exclude)
        ? exclude.concat(SHARED_LIBRARY_PATHS)
        : SHARED_LIBRARY_PATHS.concat(exclude)
      : SHARED_LIBRARY_PATHS;
};

module.exports = namespace => {
  const loaders = [];
  const cacheDirectory = getCacheDirectory(namespace);

  const excludedPaths = [];

  const obj = {
    withJs: (options = {}) => {
      const {[excludePaths]: excludePathsSymbol = true} = options;
      loaders.push({
        ...addLoader(
          {
            test: /\.js$/,
            exclude: /[\\/]node_modules[\\/]/,
            use: {
              loader: 'babel-loader',
              options: {
                cacheDirectory: cacheDirectory('js')
              }
            }
          },
          options
        ),
        [excludePaths]: excludePathsSymbol
      });
      return obj;
    },
    withTs: (options = {}) => {
      const {[excludePaths]: excludePathsSymbol = true} = options;
      loaders.push({
        ...addLoader(
          {
            test: /\.tsx?$/,
            exclude: /[\\/]node_modules[\\/]/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  cacheDirectory: cacheDirectory('js')
                }
              },
              {
                loader: 'ts-loader',
                options: {
                  configFile: 'tsconfig.webpack.json'
                }
              }
            ]
          },
          options
        ),
        [excludePaths]: excludePathsSymbol
      });
      return obj;
    },
    withCss: ({
      test = /\.s?css$/,
      exclude,
      include,
      disableMiniCssExtractPlugin = isDev(),
      miniCssExtractPluginLoader = MiniCssExtractPlugin.loader,
      sourceMap = false,
      cssLoader = {},
      sassLoader = {},
      styleLoader = {},
      cacheLoader = {},
      ignore = false,
      withThemingVariables,
      [excludePaths]: excludePathsSymbol = true
    } = {}) => {
      loaders.push({
        test,
        exclude: composeExclude(exclude),
        include,
        use: compact([
          addLoader({loader: 'style-loader'}, styleLoader),
          addLoader({loader: 'css-hot-loader'}, isDev()),
          !disableMiniCssExtractPlugin && miniCssExtractPluginLoader,
          addLoader(
            {
              loader: 'cache-loader',
              options: {
                cacheDirectory: cacheDirectory('css')
              }
            },
            cacheLoader
          ),
          addLoader(
            {
              loader: 'css-loader',
              options: {
                minimize: !isDev(),
                sourceMap
              }
            },
            cssLoader
          ),
          {
            loader: 'postcss-loader',
            options: {
              sourceMap,
              ident: 'postcss',
              plugins: compact([
                withThemingVariables ? require('postcss-custom-properties')() : undefined,
                require('autoprefixer')({
                  overrideBrowserslist: ['defaults', 'safari >=10', 'ie >=10']
                })
              ])
            }
          },
          addLoader(
            {
              loader: 'sass-loader',
              options: {
                sourceMap
              }
            },
            sassLoader
          )
        ]),
        ...(ignore ? {use: {loader: 'ignore-loader'}} : {}),
        [excludePaths]: excludePathsSymbol
      });

      return obj;
    },
    withFiles: ({options = {}, ignore = false} = {}) => {
      loaders.push(
        addLoader(
          {
            exclude: composeExclude(),
            test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
            use: [
              {
                loader: ignore ? 'ignore-loader' : 'file-loader',
                options: {
                  name: `${isDev() ? '[path]' : ''}[name].[hash].[ext]`
                }
              }
            ]
          },
          options
        )
      );
      return obj;
    },
    withImages: ({fileLoader = {}, imageLoader = !isDev(), ignore = false, include, exclude} = {}) => {
      loaders.push({
        include,
        exclude: composeExclude(exclude),
        test: /\.(jpe?g|png|gif|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: compact([
          addLoader(
            {
              loader: 'file-loader',
              options: {
                name: `${isDev() ? '[path]' : ''}[name].[hash].[ext]`,
                emitFile: !ignore
              }
            },
            fileLoader
          ),
          !ignore &&
            addLoader(
              {
                loader: 'image-webpack-loader',
                options: {
                  gifsicle: {
                    interlaced: true
                  },
                  mozjpeg: {
                    progressive: true
                  },
                  optipng: {
                    optimizationLevel: 7
                  },
                  pngquant: {
                    quality: '65-90',
                    speed: 4
                  },
                  svgo: {
                    enabled: false
                  }
                }
              },
              imageLoader
            )
        ])
      });
      return obj;
    },
    withHamlc: () => {
      loaders.push({
        test: /\.hamlc$/,
        use: [
          {
            loader: 'cache-loader',
            options: {
              cacheDirectory: cacheDirectory('hamlc')
            }
          },
          {
            loader: path.join(__dirname, './loaders/hamlc'),
            options: hamlcLoaderOpts()
          }
        ]
      });
      return obj;
    },
    withCoffee: () => {
      loaders.push({
        test: /\.coffee$/,
        use: [
          {
            loader: 'cache-loader',
            options: {
              cacheDirectory: cacheDirectory('coffee')
            }
          },
          {
            loader: 'coffee-loader'
          }
        ]
      });
      return obj;
    },
    withYaml: () => {
      loaders.push({
        test: /\.ya?ml$/,
        loader: 'yml-loader'
      });
      return obj;
    },
    withHtml: () => {
      loaders.push({
        test: /\.html$/,
        loader: 'html-loader'
      });
      return obj;
    },
    withSvg: () => {
      loaders.push({
        test: /\.svg$/,
        loader: 'svg-sprite-loader'
      });
      return obj;
    },
    withWebWorker: (options = {}) => {
      if (isTest()) {
        return obj;
      }
      loaders.push({
        ...addLoader(
          {
            test: /\.worker\.(c|m)?js$/i,
            exclude: /[\\/]node_modules[\\/]/,
            use: {
              loader: 'worker-loader',
              options: {
                inline: 'fallback',
                esModule: false
              }
            }
          },
          options
        ),
      });
      return obj;
    },
    withAppSources: ({
      path: include = path.resolve('./'),
      scopedName = isDev() ? '[path][name]__[local]' : '[name]--[hash:base64:5]',
      miniCssExtractPluginLoader,
      cssLoader = {
        options: {
          modules: true,
          import: true,
          importLoaders: 1,
          camelCase: true,
          localIdentName: scopedName
        }
      }
    } = {}) => {
      if (Array.isArray(include)) {
        excludedPaths.push(...include);
      } else {
        excludedPaths.push(include);
      }

      return obj
        .withJs({
            include,
            use: {
              options: {
                babelrc: false,
                presets: ['@babel/preset-env', '@babel/preset-react'],
                plugins: [
                  '@babel/plugin-proposal-class-properties',
                  '@babel/plugin-proposal-optional-chaining',
                  '@babel/plugin-syntax-dynamic-import',
                  ['@babel/plugin-transform-runtime', {useESModules: false, corejs: 3}],
                  [
                    'react-css-modules',
                    {
                      generateScopedName: scopedName,
                      filetypes: {
                        '.scss': {
                          syntax: 'postcss-scss'
                        }
                      }
                    }
                  ]
                ]
              }
            },
            [excludePaths]: false
          })
        .withCss({
          include,
          sourceMap: !isDev(),
          styleLoader: isDev(),
          cacheLoader: false,
          miniCssExtractPluginLoader,
          cssLoader,
          withThemingVariables: true,
          [excludePaths]: false
        });
    },
    getLoaders: () => {
      return loaders.map(loader => {
        if (loader[excludePaths]) {
          return {
            ...loader,
            exclude: loader.exclude ? excludedPaths.concat(loader.exclude) : excludedPaths
          };
        }
        return loader;
      });
    }
  };

  obj.withShared = ({
    scopedName = '[path]___[name]__[local]',
    imageLoader,
    miniCssExtractPluginLoader,
    cssLoader,
    postCssLoader
  } = {}) => {
    return obj
      .withAppSources({
        path: [SHARED_PATH, /\/config\/webpack\/environment\//,
       SHARED_CONTEXT_PATH], scopedName,
        imageLoader,
        miniCssExtractPluginLoader,
        cssLoader,
        postCssLoader
      })
      .withCss({
        test: /\.css$/,
        include: SHARED_LIBRARY_PATHS,
        exclude: false,
        miniCssExtractPluginLoader,
        cssLoader,
        postCssLoader
      })
      .withImages({
        include: INTL_TEL_INPUT_PATH,
        exclude: false,
        imageLoader
      })
      .withWebWorker({
        include: [SHARED_PATH, /\/config\/webpack\/environment\//],
        use: [
          {
            loader: 'worker-loader',
            options: {
              inline: 'fallback',
              esModule: false
            }
          },
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          }
        ]
      });
  };

  return obj;
};
