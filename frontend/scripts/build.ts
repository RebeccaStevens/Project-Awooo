/**
 * Create the production ready output.
 */

// Set the environment if it isn't set.
if (process.env.NODE_ENV === undefined) {
  // tslint:disable-next-line:no-object-mutation
  process.env.NODE_ENV = 'production';
} else {
  console.error(`Node Environment not set to "production" - was set to "${process.env.NODE_ENV}"`);
  process.exit(1);
}

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (error) => {
  // tslint:disable-next-line:no-throw
  throw error;
});

import chalk from 'chalk';
import * as fs from 'fs-extra';
import webpack from 'webpack';

import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles';
import FileSizeReporter from 'react-dev-utils/FileSizeReporter';
import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages';
import printBuildError from 'react-dev-utils/printBuildError';

import { loadClientEnvironment } from '../config/env';
import * as paths from '../config/paths';
import { getConfig as getClientWebpackConfig } from '../config/webpack.config.client.prod';
import { getConfig as getSSRWebpackConfig } from '../config/webpack.config.ssr.prod';

const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild;
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild;

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024;
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024;

(async (): Promise<void> => {
  // Load the environment variables before doing anything else.
  await loadClientEnvironment();

  // Warn and crash if required files are missing.
  if (!checkRequiredFiles([paths.APP_HTML, paths.APP_INDEX])) {
    return Promise.reject(new Error('Missing required files.'));
  }

  // First, read the current file sizes in build directory.
  // This lets us display how much they changed later.
  const previousFileSizes = await measureFileSizesBeforeBuild(paths.APP_BUILD);

  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  await Promise.all([
    fs.emptyDir(paths.APP_BUILD),
    fs.emptyDir(paths.SSR_BUILD)
  ]);

  console.info('Creating a build to enable serverside rendering...');
  const { warnings: ssrWarnings } = await build(await getSSRWebpackConfig());
  printBuildSuccess(ssrWarnings);

  // Load the module that was just compiled.
  // @ts-ignore
  const ssr = await import('../build/ssr');

  // tslint:disable-next-line:no-object-mutation
  process.env.REACT_APP_MARKUP = ssr.renderReactApp();

  // Start the webpack build
  console.info('Creating an optimized production build...');
  await copyPublicFolder();
  const { stats: clientStats, warnings: clientWarnings } = await build(await getClientWebpackConfig());
  printBuildSuccess(clientWarnings);

  console.info('Client file sizes after gzip:\n');
  printFileSizesAfterBuild(
    clientStats,
    previousFileSizes,
    paths.APP_BUILD,
    WARN_AFTER_BUNDLE_GZIP_SIZE,
    WARN_AFTER_CHUNK_GZIP_SIZE
  );
  console.info();
})()
  .catch((error) => {
    if (error !== undefined) {
      console.info(chalk.red('Failed to compete the build.\n'));
      printBuildError(error);
    }
    process.exit(1);
  });

interface IBuildInfo {
  readonly stats: webpack.Stats;
  readonly warnings: Array<string>;
}

function printBuildSuccess(warnings: Array<string>): void {
  if (warnings.length) {
    console.info(chalk.yellow('Compiled with warnings.\n'));
    console.warn(warnings.join('\n\n'));
    console.info(`\nSearch for the ${chalk.underline(chalk.yellow('keywords'))} to learn more about each warning.`);
  } else {
    console.info(chalk.green('Compiled successfully.\n'));
  }
}

// Create a webpack build.
async function build(config: webpack.Configuration): Promise<IBuildInfo> {
  const compiler = webpack(config);

  return new Promise<IBuildInfo>((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        return reject(error);
      }

      const statsJson = stats.toJson({});

      // tslint:disable-next-line:no-let
      let messages = {
        errors: statsJson.errors,
        warnings: statsJson.warnings
      };

      try {
        messages = formatWebpackMessages(statsJson);
      } catch (e) {}

      if (messages.errors.length > 0) {
        return reject(new Error(messages.errors[0]));
      }

      if (
        process.env.CI !== undefined &&
        (typeof process.env.CI !== 'string' || process.env.CI.toLowerCase() !== 'false') &&
        messages.warnings.length
      ) {
        console.info(
          chalk.yellow(
            '\nTreating warnings as errors because process.env.CI = true.\nMost CI servers set it automatically.\n'
          )
        );
        return reject(new Error(messages.warnings.join('\n\n')));
      }

      return resolve({
        stats,
        warnings: messages.warnings
      });
    });
  });
}

async function copyPublicFolder(): Promise<void> {
  return fs.copy(paths.APP_PUBLIC, paths.APP_BUILD, {
    dereference: true,
    filter: (file) => file !== paths.APP_HTML
  });
}
