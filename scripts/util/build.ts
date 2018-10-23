/**
 * Util functions for the scripts.
 */

import { render as renderEjs } from 'ejs';
import * as fs from 'fs-extra';
import * as path from 'path';
import { rollup, RollupFileOptions } from 'rollup';

import { getClientEnvironment } from '../../config/env';
import * as paths from '../../config/paths';

export async function buildDevBundle(): Promise<void> {
  const rollupConfig = (await import('../../config/rollup.config.dev')).default;
  return buildBundle(rollupConfig);
}

export async function buildProdBundle(): Promise<void> {
  const rollupConfig = (await import('../../config/rollup.config.prod')).default;
  return buildBundle(rollupConfig);
}

async function buildBundle(rollupConfig: Array<RollupFileOptions>): Promise<void> {
  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  await fs.emptyDir(paths.getAppBuildPath(process.env.NODE_ENV));

  await copyPublicFolder();
  await generateHtml();

  const rollupConfigArray = Array.isArray(rollupConfig)
    ? rollupConfig
    : [rollupConfig];
  const rollupBuilds = await Promise.all(rollupConfigArray.map((config) => {
    return rollup(config);
  }));
  await Promise.all(
    rollupBuilds.map(async (rollupBuild, index) => {
      const config = rollupConfigArray[index];
      if (config.output === undefined) {
        return Promise.reject(new Error('output not defined'));
      }
      return rollupBuild.write(config.output);
    })
  );
}

async function copyPublicFolder(): Promise<void> {
  const whitelist: Array<string> = [];
  const blacklist: Array<string> = [];

  const files = await fs.readdir(paths.APP_PUBLIC);

  await Promise.all(
    files.map((file) => {
      const srcPath = path.normalize(`${paths.APP_PUBLIC}/${file}`);
      const destPath = path.normalize(`${paths.getAppBuildPath(process.env.NODE_ENV)}/${file}`);
      return fs.copy(srcPath, destPath, {
        overwrite: true,
        dereference: true,
        filter: () => {
          return (
            file.length > 0 &&
            !blacklist.includes(file) &&
            (
              whitelist.includes(file) ||
              !file.startsWith('.')
            )
          );
        }
      });
    })
  );
}

async function generateHtml(): Promise<void> {
  const publicUrl = paths.PUBLIC_URL;
  const env = getClientEnvironment(publicUrl);

  const appHtml = await fs.readFile(paths.APP_HTML, { encoding: 'utf-8' });
  const renderedHtml =
    await renderEjs(
      appHtml,
      {
        ...env.raw,
        APP_SCRIPT_PATH: `./${path.join(paths.PUBLIC_URL, 'app.mjs')}`, // TODO: get this info from elsewhere
        APP_STYLE_PATH: `./${path.join(paths.PUBLIC_URL, 'app.css')}` // TODO: get this info from elsewhere
      }, {
        async: true
      }
    );
  await fs.outputFile(path.join(paths.getAppBuildPath(process.env.NODE_ENV), 'index.html'), renderedHtml, { encoding: 'utf-8' });
}
