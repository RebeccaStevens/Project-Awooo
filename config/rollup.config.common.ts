/**
 * Rollup Config for the dev environment.
 */

import rollupPluginSvgr from '@svgr/rollup';
import rollupPluginCommonjs from 'rollup-plugin-commonjs';
import rollupPluginJson from 'rollup-plugin-json';
import rollupPluginNodeResolve from 'rollup-plugin-node-resolve';
import rollupPluginPostcss from 'rollup-plugin-postcss';
import rollupPluginReplace from 'rollup-plugin-replace';
import rollupPluginStrip from 'rollup-plugin-strip';
import { terser as rollupPluginTerser } from 'rollup-plugin-terser';
import rollupPluginTypescript from 'rollup-plugin-typescript';
import rollupPluginUrl from 'rollup-plugin-url';

export const mainThreadInput = 'src/main.ts';
export const rendererInput = 'src/gui/index.tsx';

// tslint:disable-next-line:typedef
export function getPlugins(environment: string) {
  return {
    commonjs: rollupPluginCommonjs({
      include: [
        'node_modules/**'
      ],
      namedExports: {
        'node_modules/react/index.js': ['Component', 'PureComponent', 'Fragment', 'Children', 'createElement'],
        'node_modules/react-dom/index.js': ['render'],
        'node_modules/mime/index.js': ['getExtension', 'getType'],
        'node_modules/mime/lite.js': ['getExtension', 'getType']
      }
    }),
    json: rollupPluginJson(),
    postcss: rollupPluginPostcss({
      config: {
        path: './postcss.config.js'
      },
      extract: true
    }),
    replace: rollupPluginReplace({
      values: {
        'process.env.NODE_ENV': JSON.stringify(environment),
        'process.env.APP_PROTOCOL': JSON.stringify('app'),
        'process.env.APP_HOST': JSON.stringify('app://local')
      }
    }),
    resolve: rollupPluginNodeResolve(),
    strip: rollupPluginStrip(),
    svgr: rollupPluginSvgr(),
    terser: rollupPluginTerser(),
    typescript: rollupPluginTypescript(),
    url: rollupPluginUrl()
  };
}

export const treeshake = {
  pureExternalModules: true,
  propertyReadSideEffects: false
};
