/**
 * Rollup Config for the production environment.
 */

import { RollupFileOptions } from 'rollup';

import * as paths from './paths';
import { getPlugins, mainThreadInput, rendererInput, treeshake } from './rollup.config.common';

const environment = 'production';

if (process.env.NODE_ENV !== 'production') {
  // tslint:disable-next-line:no-throw
  throw new Error(`Incorrect environment set (${process.env.NODE_ENV}) - it should be set to ${environment}`);
}

const plugins = getPlugins(environment);
const outPath = paths.APP_BUILD_PROD;

const mainThreadConfig: RollupFileOptions = {
  input: mainThreadInput,

  output: {
    file: `${outPath}/main.js`,
    chunkFileNames: '[name]-[hash].js',
    assetFileNames: '[name]-[hash][extname]',
    format: 'cjs'
  },

  external: [
    'electron'
  ],

  plugins: [
    plugins.resolve,
    plugins.commonjs,
    plugins.typescript,
    plugins.json,
    plugins.strip,
    plugins.replace,
    plugins.terser
  ],

  treeshake
};

const rendererConfig: RollupFileOptions = {
  input: rendererInput,

  output: {
    file: `${outPath}/app.mjs`,
    chunkFileNames: '[name]-[hash].mjs',
    assetFileNames: '[name]-[hash][extname]',
    format: 'esm'
  },

  plugins: [
    plugins.resolve,
    plugins.commonjs,
    plugins.typescript,
    plugins.json,
    plugins.postcss,
    plugins.url,
    plugins.svgr,
    plugins.strip,
    plugins.replace,
    plugins.terser
  ],

  treeshake
};

export default [
  mainThreadConfig,
  rendererConfig
];
