/**
 * Rollup Config for the dev environment.
 */

import { RollupFileOptions } from 'rollup';

import * as paths from './paths';
import { getPlugins, mainThreadInput, rendererInput, treeshake } from './rollup.config.common';

const environment = 'development';

if (process.env.NODE_ENV !== 'development') {
  // tslint:disable-next-line:no-throw
  throw new Error(`Incorrect environment set (${process.env.NODE_ENV}) - it should be set to ${environment}`);
}

const plugins = getPlugins(environment);
const outPath = paths.APP_BUILD_DEV;

const mainThreadConfig: RollupFileOptions = {
  input: mainThreadInput,

  output: {
    file: `${outPath}/main.js`,
    chunkFileNames: '[name].js',
    assetFileNames: '[name][extname]',
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
    plugins.replace
  ],

  treeshake,

  watch: {
    include: [
      'src/**'
    ]
  }
};

const rendererConfig: RollupFileOptions = {
  input: rendererInput,

  output: {
    file: `${outPath}/app.mjs`,
    chunkFileNames: '[name].mjs',
    assetFileNames: '[name][extname]',
    format: 'esm',
    sourcemap: true
  },

  experimentalCodeSplitting: true,
  manualChunks: {
    react: [
      'node_modules/react/index.js',
      'node_modules/react-dom/index.js'
    ]
  },

  plugins: [
    plugins.resolve,
    plugins.commonjs,
    plugins.typescript,
    plugins.json,
    plugins.postcss,
    plugins.url,
    plugins.svgr,
    plugins.replace
  ],

  treeshake,

  watch: {
    include: [
      'src/**'
    ]
  }
};

export default [
  mainThreadConfig,
  rendererConfig
];
