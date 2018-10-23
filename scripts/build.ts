/**
 * Create the production ready output.
 */

// Set the environment if it isn't set.
if (process.env.NODE_ENV === undefined) {
  // tslint:disable-next-line:no-object-mutation
  process.env.NODE_ENV = 'production';
} else if (process.env.NODE_ENV !== 'production') {
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
import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles';
import printBuildError from 'react-dev-utils/printBuildError';

import { loadClientEnvironment } from '../config/env';
import * as paths from '../config/paths';

import { buildProdBundle } from './util/build';

(async (): Promise<void> => {
  // Load the environment variables before doing anything else.
  await loadClientEnvironment();

  // Warn and crash if required files are missing.
  if (!checkRequiredFiles([paths.APP_HTML, paths.APP_INDEX])) {
    return Promise.reject(new Error('Missing required files.'));
  }

  console.info('Creating an optimized production build...');
  return buildProdBundle();
})()
  .catch((error) => {
    if (error !== undefined) {
      console.info(chalk.red('Failed to compile.\n'));
      printBuildError(error);
    }
    process.exit(1);
  });
