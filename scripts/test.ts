/**
 * Run the tests.
 */

// Do this as the first thing so that any code reading it knows the right env.
// tslint:disable:no-object-mutation
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';
// tslint:enable:no-object-mutation

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (error) => {
  // tslint:disable-next-line:no-throw
  throw error;
});

import { run as runTests } from 'jest-cli';

import { loadClientEnvironment } from '../config/env';

(async () => {
  // Ensure environment variables are read.
  await loadClientEnvironment();

  runTests(process.argv.slice(2));
})()
  .catch((error) => {
    if (error !== undefined && error.message !== undefined) {
      console.error(error.message);
    }
    process.exit(1);
  });
