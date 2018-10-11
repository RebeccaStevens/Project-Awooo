/**
 * Utility functions.
 */

import * as path from 'path';

const args = process.argv.slice(2);

const devServer = process.env.NODE_ENV === 'production'
  ? undefined
  : (() => {
      const portIndex = args.indexOf('--devserver');
      if (portIndex < 0) {
        // tslint:disable-next-line:no-throw
        throw new Error('Dev Server not specified. Use `--devserver` command line argument.');
      }
      if (args.length <= portIndex + 1 || args[portIndex + 1].startsWith('-')) {
        // tslint:disable-next-line:no-throw
        throw new Error('Dev Server value not given after `--devserver` command line argument.');
      }

      return args[portIndex + 1];
    })();

/**
 * Get the url of an asset.
 * @param path The path to the asset relative to `src`.
 */
export function getAssetURL(assetPath: string): string {
  return (
    process.env.NODE_ENV === 'production'
    ? `file://${path.join(process.cwd(), 'build', assetPath)}`
    : `${devServer}/${assetPath}`
  );
}
