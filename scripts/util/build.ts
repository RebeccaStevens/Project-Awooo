/**
 * Util functions for the scripts.
 */

import { render as renderEjs } from 'ejs';
import { promises as fs } from 'fs';
import * as path from 'path';
import { rollup, RollupBuild, RollupDirOptions, RollupFileOptions, RollupSingleFileBuild, watch as rollupWatch } from 'rollup';

import { getClientEnvironment } from '../../config/env';
import * as paths from '../../config/paths';

import { copyFile, emptyDirectory, readFile, writeFile } from '../../src/util/fs';

export async function buildDevBundle(watch: boolean = false): Promise<void> {
  const rollupConfig = (await import('../../config/rollup.config.dev')).default;
  return buildBundle(rollupConfig, watch);
}

export async function buildProdBundle(watch: boolean = false): Promise<void> {
  const rollupConfig = (await import('../../config/rollup.config.prod')).default;
  return buildBundle(rollupConfig, watch);
}

async function buildBundle(rollupConfig: Array<RollupFileOptions | RollupDirOptions>, watch: boolean = false): Promise<void> {
  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  await emptyDirectory(paths.getAppBuildPath(process.env.NODE_ENV));

  await copyPublicFolder();
  await generateHtml();

  const rollupConfigArray = Array.isArray(rollupConfig)
    ? rollupConfig
    : [rollupConfig];

  if (watch) {
    rollupConfigArray.forEach((config) => {
      // Weird issue where ts isn't detecting that the rollup function can take
      // either RollupDirOptions or RollupFileOptions as an argument.
      // @ts-ignore
      return rollupWatch(config);
    });
  } else {
    const rollupBuilds = await Promise.all(rollupConfigArray.map((config) => {
      // Weird issue where ts isn't detecting that the rollup function can take
      // either RollupDirOptions or RollupFileOptions as an argument.
      // @ts-ignore
      return rollup(config) as Promise<RollupSingleFileBuild | RollupBuild>;
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
}

async function copyPublicFolder(): Promise<void> {
  const whitelist: Array<string> = [];
  const blacklist: Array<string> = [];

  const files = await fs.readdir(paths.APP_PUBLIC);

  await Promise.all(
    files.map(async (file) => {
      const srcPath = path.normalize(`${paths.APP_PUBLIC}/${file}`);
      const destPath = path.normalize(`${paths.getAppBuildPath(process.env.NODE_ENV)}/${file}`);

      if (
        file.length > 0 &&
        !blacklist.includes(file) &&
        (
          whitelist.includes(file) ||
          !file.startsWith('.')
        )
      ) {
        return copyFile(srcPath, destPath);
      }
      return Promise.resolve();
    })
  );
}

async function generateHtml(): Promise<void> {
  const publicUrl = paths.PUBLIC_URL;
  const env = getClientEnvironment(publicUrl);

  const appHtml = await readFile(paths.APP_HTML);
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
  await writeFile(path.join(paths.getAppBuildPath(process.env.NODE_ENV), 'index.html'), renderedHtml, { encoding: 'utf8' });
}
