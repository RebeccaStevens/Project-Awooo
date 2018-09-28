/**
 * The Webpack config for the server side rendering in a production environment.
 */

import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';

import getCSSModuleLocalIdent from 'react-dev-utils/getCSSModuleLocalIdent';

import { loadClientEnvironment } from './env';
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
  const publicPath = `${paths.SSR_BUILD}/`;

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

    getStyle: (cssOptions?): Array<any> => {
      return [
        {
          loader: 'css-loader/locals',
          options: {
            ...cssOptions
          }
        }
      ];
    },

    svg: {
      loader: '@svgr/webpack?emitFile=false'
    },

    image: {
      loader: 'url-loader?emitFile=false',
      options: {
        limit: 10000,
        name: 'static/media/[hash:32].[ext]'
      }
    },

    graphql: {
      loader: 'graphql-tag/loader?emitFile=false'
    },

    file: {
      loader: 'file-loader?emitFile=false',
      options: {
        name: 'static/media/[hash:32].[ext]'
      }
    }
  };

  return {
    mode: 'production',

    target: 'node',

    externals: [nodeExternals()],

    // Don't attempt to continue if there are any errors.
    bail: true,

    devtool: false,

    entry: [
      '@babel/polyfill',
      paths.SSR_INDEX
    ],

    output: {
      path: paths.SSR_BUILD,
      filename: 'index.js',
      chunkFilename: '[name].js',
      publicPath,
      library: 'app',
      libraryTarget: 'commonjs2'
    },

    optimization: {
      minimize: false
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
                paths.SSR_INDEX,
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
                paths.SSR_INDEX,
                ...paths.APP_SRC_PATHS
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
              use: loaders.getStyle({ importLoaders: 2 })
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
                }
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

    ],

    performance: {
      hints: false
    }
  };
}
