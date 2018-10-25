/**
 * General utility functions.
 */

import * as path from 'path';

const args = process.argv.slice(2);

const devServer =
  process.env.NODE_ENV === 'production'
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

      const value = args[portIndex + 1];

      // Trim the trailing slash if there is one.
      if (value.endsWith('/')) {
        return value.slice(0, -1);
      }
      return value;
    })();

const APP_HOST =
  process.env.NODE_ENV === 'production'
  ? (() => {
    if (process.env.APP_HOST === undefined) {
      throw new Error('APP_HOST not set'); // tslint:disable-line:no-throw
    }
    return process.env.APP_HOST;
  })()
  : undefined;

/**
 * Get the url of an asset.
 * @param path The path to the asset relative to `src`.
 */
export function getAssetURL(assetPath: string): string {
  return (
    process.env.NODE_ENV === 'production'
    ? path.normalize(`${APP_HOST}/${assetPath}`)
    : path.normalize(`${devServer}/${assetPath}`)
  );
}
