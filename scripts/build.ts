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
import * as path from 'path';
import webpack from 'webpack';

import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles';
import FileSizeReporter from 'react-dev-utils/FileSizeReporter';
import formatWebpackMessages from 'react-dev-utils/formatWebpackMessages';
import printBuildError from 'react-dev-utils/printBuildError';
import printHostingInstructions from 'react-dev-utils/printHostingInstructions';

import { loadClientEnvironment } from '../config/env';
import * as paths from '../config/paths';
import { getConfig } from '../config/webpack.config.prod';

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
  fs.emptyDirSync(paths.APP_BUILD);

  // Merge with the public folder
  await copyPublicFolder();

  const config = await getConfig();

  // Start the webpack build
  const { stats, warnings } = await build(config);

  if (warnings.length) {
    console.info(chalk.yellow('Compiled with warnings.\n'));
    console.warn(warnings.join('\n\n'));
    console.info(
      `\nSearch for the ${
        chalk.underline(chalk.yellow('keywords'))
      } to learn more about each warning.`
    );
  } else {
    console.info(chalk.green('Compiled successfully.\n'));
  }

  console.info('File sizes after gzip:\n');
  printFileSizesAfterBuild(
    stats,
    previousFileSizes,
    paths.APP_BUILD,
    WARN_AFTER_BUNDLE_GZIP_SIZE,
    WARN_AFTER_CHUNK_GZIP_SIZE
  );
  console.info();

  const appPackage = await import(paths.APP_PACKAGE_DOT_JSON);
  const publicUrl = paths.PUBLIC_URL;
  const publicPath = config.output !== undefined ? config.output.publicPath : paths.PUBLIC_URL;
  const buildFolder = path.relative(process.cwd(), paths.APP_BUILD);

  printHostingInstructions(
    appPackage,
    publicUrl,
    publicPath,
    buildFolder,
    true
  );
})()
  .catch((error) => {
    if (error !== undefined) {
      console.info(chalk.red('Failed to compile.\n'));
      printBuildError(error);
    }
    process.exit(1);
  });

interface IBuildInfo {
  readonly stats: webpack.Stats;
  readonly warnings: Array<string>;
}

// Create the production build and print the deployment instructions.
async function build(config: webpack.Configuration): Promise<IBuildInfo> {
  console.info('Creating an optimized production build...');

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
