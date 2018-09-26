/**
 * The Webpack config for the production environment.
 *
 * This config is focused on producing a fast and minimal bundle (it compiles slow).
 * The development configuration is different and lives in a separate file.
 */

import * as path from 'path';
import webpack from 'webpack';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import safePostCssParser from 'postcss-safe-parser';

import SWPrecacheWebpackPlugin from 'sw-precache-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';

import getCSSModuleLocalIdent from 'react-dev-utils/getCSSModuleLocalIdent';
import InlineChunkHtmlPlugin from 'react-dev-utils/InlineChunkHtmlPlugin';
import ModuleScopePlugin from 'react-dev-utils/ModuleScopePlugin';

import { getClientEnvironment, loadClientEnvironment } from './env';
import * as paths from './paths';

/**
 * The config.
 *
 * Note:
 * All environment variables need to be loaded before using this value.
 * If you cannot guarantee that they have been, use the method `getConfig()` instead.
 */
// tslint:disable-next-line:no-default-export
export default createConfig();

/**
 * Get the config.
 *
 * Note:
 * This method ensures all environment variables have been loaded before generating the config.
 */
export async function getConfig(): Promise<webpack.Configuration> {
  await loadClientEnvironment();
  return createConfig();
}

/**
 * Create a new webpack config option.
 *
 * Note: All environment variables need to be loaded before calling this method.
 */
// tslint:disable-next-line:no-big-function
function createConfig(): webpack.Configuration {
  // Webpack uses `publicPath` to determine where the app is being served from.
  // It requires a trailing slash, or the file assets will get an incorrect path.
  const publicPath = paths.SERVED_PATH;

  // Source maps are resource heavy and can cause out of memory issue for large source files.
  const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

  // `publicUrl` is just like `publicPath`, but we will provide it to our app
  // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
  // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
  const publicUrl = paths.PUBLIC_URL;

  // Get environment variables to inject into our app.
  const env = getClientEnvironment(publicUrl);

  // style files regexes
  const cssRegex = /\.css$/;
  const cssModuleRegex = /\.module\.css$/;
  const sassRegex = /\.(scss|sass)$/;
  const sassModuleRegex = /\.module\.(scss|sass)$/;

  const loaders = {
    babel: {
      loader: 'babel-loader',
      options: {
        configFile: paths.BABEL_CONFIG,
        cacheDirectory: true,
        highlightCode: true
      }
    },

    typeScript: {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
        configFile: paths.TS_CONFIG_TOOLS
      }
    },

    getStyle: (cssOptions?, preProcessor?: string): Array<any> => {
      const styleLoaders = [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            sourceMap: shouldUseSourceMap,
            ...cssOptions
          }
        },
        {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            configFile: paths.POSTCSS_CONFIG
          }
        }
      ];

      if (preProcessor) {
        return [
          ...styleLoaders,
          preProcessor
        ];
      }

      return styleLoaders;
    },

    svg: {
      loader: '@svgr/webpack'
    },

    image: {
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: 'static/media/[hash:32].[ext]'
      }
    },

    graphql: {
      loader: 'graphql-tag/loader'
    },

    file: {
      loader: 'file-loader',
      options: {
        name: 'static/media/[hash:32].[ext]'
      }
    }
  };

  return {
    mode: 'production',

    target: 'web',

    // Don't attempt to continue if there are any errors.
    bail: true,

    // We generate sourcemaps in production. This is slow but gives good results.
    // You can exclude the *.map files from the build during deployment.
    devtool: shouldUseSourceMap ? 'source-map' : false,

    entry: [
      paths.APP_POLYFILLS,
      paths.APP_INDEX
    ],

    output: {
      // The build folder.
      path: paths.APP_BUILD,

      // Generated JS file names (with nested folders).
      // There will be one main bundle, and one file per asynchronous chunk.
      filename: 'static/js/[chunkhash:32].js',

      chunkFilename: 'static/js/[chunkhash:32].js',

      // We inferred the "public path" (such as / or /my-project) from homepage.
      publicPath,

      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: (info) =>
        path
          .relative(paths.APP_SRC, info.absoluteResourcePath)
          .replace(/\\/g, '/')
    },

    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              // we want terser to parse ecma 8 code. However, we don't want it
              // to apply any minfication steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 8
            },

            compress: {
              ecma: 5,
              warnings: false,

              // Disabled because of an issue with Uglify breaking seemingly valid code:
              // https://github.com/facebook/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false
            },

            mangle: {
              safari10: true
            },

            output: {
              ecma: 5,

              comments: false,

              // Turned on because emoji and regex is not minified properly using default
              // https://github.com/facebook/create-react-app/issues/2488
              ascii_only: true
            }
          },

          // Use multi-process parallel running to improve the build speed
          // Default number of concurrent runs: os.cpus().length - 1
          parallel: true,

          // Enable file caching
          cache: true,

          sourceMap: shouldUseSourceMap
        }),

        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            parser: safePostCssParser
          }
        })
      ],

      // Automatically split vendor and commons
      // https://twitter.com/wSokra/status/969633336732905474
      // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
      splitChunks: {
        chunks: 'all',
        name: false
      },

      // Keep the runtime chunk seperated to enable long term caching
      // https://twitter.com/wSokra/status/969679223278505985
      runtimeChunk: true
    },

    resolve: {
      extensions: [
        '.web.mjs',
        '.web.js',
        '.web.ts',
        '.web.jsx',
        '.web.tsx',
        '.mjs',
        '.js',
        '.ts',
        '.json',
        '.jsx',
        '.tsx'
      ],

      alias: {
        // Support React Native Web
        // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
        'react-native': 'react-native-web'
      },

      plugins: [
        // Prevents users from importing files from outside of src/ (or node_modules/).
        // This often causes confusion because we only process files within src/ with babel.
        // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
        // please link the files into your node_modules/ and let module-resolution kick in.
        // Make sure your source files are compiled, as they will not be processed in any way.
        new ModuleScopePlugin(paths.APP_SRC, [paths.APP_PACKAGE_DOT_JSON]),

        new TsconfigPathsPlugin({ configFile: paths.TS_CONFIG_TOOLS })
      ]
    },

    module: {
      strictExportPresence: true,

      rules: [
        {
          oneOf: [
            {
              test: /\.(tsx?)$/,
              include: [
                paths.APP_INDEX,
                ...paths.APP_SRC_PATHS
              ],
              use: [
                loaders.babel,
                loaders.typeScript
              ]
            },

            {
              test: /\.(jsx?|mjs)$/,
              include: [
                paths.APP_INDEX,
                ...paths.APP_SRC_PATHS,
                path.resolve(paths.APP_PATH, 'node_modules/react-native-uncompiled')
              ],
              use: loaders.babel
            },

            // "postcss" loader applies autoprefixer to our CSS.
            // "css" loader resolves paths in CSS and adds assets as dependencies.
            // `MiniCSSExtractPlugin` extracts styles into CSS
            // files. If you use code splitting, async bundles will have their own separate CSS chunk file.
            // By default we support CSS Modules with the extension .module.css
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: loaders.getStyle({
                importLoaders: 1
              })
            },

            // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
            // using the extension .module.css
            {
              test: cssModuleRegex,
              use: loaders.getStyle({
                importLoaders: 1,
                modules: true,
                getLocalIdent: getCSSModuleLocalIdent
              })
            },

            // Opt-in support for SASS. The logic here is somewhat similar
            // as in the CSS routine, except that "sass-loader" runs first
            // to compile SASS files into CSS.
            // By default we support SASS Modules with the
            // extensions .module.scss or .module.sass
            {
              test: sassRegex,
              exclude: sassModuleRegex,
              use: loaders.getStyle({ importLoaders: 2 }, 'sass-loader')
            },

            // Adds support for CSS Modules, but using SASS
            // using the extension .module.scss or .module.sass
            {
              test: sassModuleRegex,
              use: loaders.getStyle(
                {
                  importLoaders: 2,
                  modules: true,
                  getLocalIdent: getCSSModuleLocalIdent
                },
                'sass-loader'
              )
            },

            // The GraphQL loader preprocesses GraphQL queries in .graphql files.
            {
              test: /\.(graphql)$/,
              loader: loaders.graphql
            },

            // Images.
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              use: loaders.image
            },

            // SVGs in jsx/tsx files.
            {
              test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
              issuer: {
                test: /\.(j|t)sx?$/
              },
              use: [
                loaders.babel,
                loaders.svg,
                loaders.image
              ]
            },

            // SVGs in other files.
            {
              test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
              loader: loaders.image
            }

            // , {
            //   // Exclude `js` files to keep "css" loader working as it injects
            //   // its runtime that would otherwise be processed through "file" loader.
            //   // Also exclude `html`, `json` and `ejs` extensions so they get processed
            //   // by webpacks internal loaders.
            //   exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/, /\.ejs$/],
            //   loader: loaders.file
            // }
          ]
        }
      ]
    },

    plugins: [
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.APP_HTML,
        templateParameters: env.raw,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true
        }
      }),

      // Inlines the webpack runtime script. This script is too small to warrant
      // a network request.
      new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime~.+[.]js/]),

      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
      // It is absolutely essential that NODE_ENV was set to production here.
      // Otherwise React will be compiled in the very slow development mode.
      new webpack.DefinePlugin(env.stringified),

      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: 'static/css/[contenthash:32].css',
        chunkFilename: 'static/css/[contenthash:32].css'
      }),

      // Generate a manifest file which contains a mapping of all asset filenames
      // to their corresponding output file so that tools can pick it up without
      // having to parse `index.html`.
      new ManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath
      }),

      // Generate a service worker script that will precache, and keep up to date,
      // the HTML & assets that are part of the Webpack build.
      new SWPrecacheWebpackPlugin({
        // By default, a cache-busting query parameter is appended to requests
        // used to populate the caches, to ensure the responses are fresh.
        // If a URL is already hashed by Webpack, then there is no concern
        // about it being stale, and the cache-busting can be skipped.
        dontCacheBustUrlsMatching: /\.\w{8}\./,

        filename: 'service-worker.js',

        logger(message: string): void {
          if (message.indexOf('Total precache size is') === 0) {
            // This message occurs for every build and is a bit too noisy.
            return;
          }
          if (message.indexOf('Skipping static resource') === 0) {
            // This message obscures real errors so we ignore it.
            // https://github.com/facebook/create-react-app/issues/2612
            return;
          }

          console.info(message);
        },

        minify: true,

        // For unknown URLs, fallback to the index page
        navigateFallback: publicUrl + '/index.html',

        // Ignores URLs starting from /__ (useful for Firebase):
        // https://github.com/facebookincubator/create-react-app/issues/2237#issuecomment-302693219
        navigateFallbackWhitelist: [/^(?!\/__).*/],

        // Don't precache sourcemaps (they're large) and build asset manifest:
        staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],

        // Disabling skipWaiting ensures better compatibility with web apps that
        // use deferred or lazy-loading, at the expense of "keeping around" the
        // previously cached version of your web app until all open instances have
        // been closed.
        // See https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle#skip_the_waiting_phase
        skipWaiting: false
      })
    ],

    // Turn off performance processing because we utilize
    // our own hints via the FileSizeReporter
    performance: {
      hints: false
    }
  };
}
