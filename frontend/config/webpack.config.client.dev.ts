/**
 * The Webpack config for the development environment.
 *
 * This config is focused on developer experience and fast rebuilds.
 * The production configuration is different and lives in a separate file.
 */

import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';

import getCSSModuleLocalIdent from 'react-dev-utils/getCSSModuleLocalIdent';
import ModuleScopePlugin from 'react-dev-utils/ModuleScopePlugin';
import WatchMissingNodeModulesPlugin from 'react-dev-utils/WatchMissingNodeModulesPlugin';

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
  // In development, we always serve from the root. This makes config easier.
  const publicPath = '/';

  // `publicUrl` is just like `publicPath`, but we will provide it to our app
  // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
  // Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
  const publicUrl = '';

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
        'style-loader',
        {
          loader: 'css-loader',
          options: cssOptions
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
        name: 'static/media/[name].[hash:8].[ext]'
      }
    },

    graphql: {
      loader: 'graphql-tag/loader'
    },

    file: {
      loader: 'file-loader',
      options: {
        name: 'static/media/[name].[hash:8].[ext]'
      }
    }
  };

  return {
    mode: 'development',

    target: 'web',

    // You may want 'eval' instead if you prefer to see the compiled output in DevTools.
    // See the discussion in https://github.com/facebook/create-react-app/issues/343
    devtool: 'cheap-module-source-map',

    entry: [
      '@babel/polyfill',
      paths.APP_POLYFILLS,
      'react-dev-utils/webpackHotDevClient',
      paths.APP_INDEX
    ],

    output: {
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: true,

      // This does not produce a real file. It's just the virtual path that is
      // served by WebpackDevServer in development. This is the JS bundle
      // containing code from all our entry points, and the Webpack runtime.
      filename: 'static/js/bundle.js',

      // There are also additional JS chunk files if you use code splitting.
      chunkFilename: 'static/js/[name].chunk.js',

      // This is the URL that app is served from.
      publicPath,

      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: (info) =>
        path
          .resolve(info.absoluteResourcePath)
          .replace(/\\/g, '/')
    },

    optimization: {
      minimize: false,

      // Automatically split vendor and commons
      splitChunks: {
        chunks: 'all',
        name: 'vendors'
      },

      // Keep the runtime chunk seperated to enable long term caching.
      runtimeChunk: true,

      // Add module names to factory functions so they appear in browser profiler.
      namedModules: true,
      namedChunks: true
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
            // "style" loader turns CSS into JS modules that inject <style> tags.
            // In production, we use a plugin to extract that CSS to a file, but
            // in development "style" loader enables hot editing of CSS.
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

            // Opt-in support for SASS (using .scss or .sass extensions).
            // Chains the sass-loader with the css-loader and the style-loader
            // to immediately apply all styles to the DOM.
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
      // Generates an `index.html` file with the <script> injected and parameters set.
      // <link rel="shortcut icon" href="<%= PUBLIC_URL =>/favicon.ico">
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.APP_HTML,
        templateParameters: {
          REACT_APP_MARKUP: '',
          ...env.raw
        }
      }),

      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
      new webpack.DefinePlugin(env.stringified),

      // This is necessary to emit hot updates (currently CSS only):
      new webpack.HotModuleReplacementPlugin(),

      // Watcher doesn't work well if you mistype casing in a path so we use
      // a plugin that prints an error when you attempt to do this.
      // See https://github.com/facebookincubator/create-react-app/issues/240
      new CaseSensitivePathsPlugin(),

      // If you require a missing module and then `npm install` it, you still have
      // to restart the development server for Webpack to discover it. This plugin
      // makes the discovery automatic so you don't have to restart.
      // See https://github.com/facebookincubator/create-react-app/issues/186
      new WatchMissingNodeModulesPlugin(paths.NODE_MODULES),

      // Perform type checking and linting in a separate process to speed up compilation
      new ForkTsCheckerWebpackPlugin({
        async: true,
        watch: paths.APP_SRC,
        tsconfig: paths.TS_CONFIG_DEV,
        tslint: paths.TSLINT,
        ignoreLints: [
          'no-unsafe-any'
        ]
      })
    ],

    // Turn off performance hints during development because we don't do any
    // splitting or minification in interest of speed. These warnings become
    // cumbersome.
    performance: {
      hints: false
    }
  };
}
