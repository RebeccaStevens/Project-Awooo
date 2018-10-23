/**
 * Start the app for local development.
 */

const args = process.argv.slice(2);

// Set the environment if it isn't set.
if (process.env.NODE_ENV === undefined) {
  // tslint:disable-next-line:no-object-mutation
  process.env.NODE_ENV = args.includes('--production') || args.includes('-p')
    ? 'production'
    : 'development';
}

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (error) => {
  // tslint:disable-next-line:no-throw
  throw error;
});

import chalk from 'chalk';
import proc from 'child_process';
import electron from 'electron';
import devServer from 'live-server';
import checkRequiredFiles from 'react-dev-utils/checkRequiredFiles';
import {
  choosePort,
  prepareUrls
} from 'react-dev-utils/WebpackDevServerUtils';

import { loadClientEnvironment } from '../config/env';
import * as paths from '../config/paths';

import { buildDevBundle } from './util/build';

const electronDevEntryPoint = 'scripts/util/electron-dev-entry.js';
const defaultPort = 8080;

(async (): Promise<void> => {
  // Load the environment variables before doing anything else.
  await loadClientEnvironment();

  // Warn and crash if required files are missing.
  if (!checkRequiredFiles([paths.APP_HTML, paths.APP_INDEX])) {
    return Promise.reject(new Error('Missing required files.'));
  }

  if (process.env.NODE_ENV === 'production') {
    return startProduction();
  }

  return startDevelopment();
})()
  .catch((error) => {
    if (error !== undefined && error.message !== undefined) {
      console.error(error.message);
    }
    process.exit(1);
  });

/**
 * Start the app in a preview mode of the prodcution release.
 * (Does not use the dev server)
 */
async function startProduction(): Promise<void> {
  console.info(chalk.cyan('Opening app...\n'));

  // Open electron.
  // @ts-ignore
  const app = proc.spawn(electron, [`${paths.APP_BUILD_PROD}/main.js`]);

  // Forward output to the console.
  app.stdout.on('data', outputInfo);
  app.stderr.on('data', outputError);

  // Exit when the app is closed.
  app.once('exit', () => {
    process.exit();
  });
}

/**
 * Start the app for local development.
 */
async function startDevelopment(): Promise<void> {
  const host =
    process.env.HOST === undefined
    ? '0.0.0.0'
    : process.env.HOST;

  const requestedPort =
    process.env.PORT === undefined
    ? defaultPort
    : parseInt(process.env.PORT, 10);

  if (process.env.HOST !== undefined) {
    console.info(
      [
        `${chalk.cyan(
          `Attempting to bind to HOST environment variable: ${
            chalk.yellow(chalk.bold(process.env.HOST))
          }`
        )}`,
        `If this was unintentional, check that you haven't mistakenly set it in your shell.`,
        `Learn more here: ${chalk.yellow('https://bit.ly/2mwWSwH')}`,
        ``
      ].join('\n')
    );
  }

  // We attempt to use the default port but if it is busy, we offer the user to
  // run on a different port. `choosePort()` Promise resolves to the next free port.
  const port = await choosePort(host, requestedPort);

  // Don't have a port?
  if (port === null) {
    return Promise.reject(new Error('Could not find a port to run on.'));
  }

  const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';

  if (protocol === 'https') {
    // tslint:disable-next-line:no-throw
    throw new Error('This dev script is not configured to run with https yet.');
  }

  const urls = prepareUrls(protocol, host, port);

  await buildDevBundle();

  // Compilation success.
  console.info(chalk.cyan('Opening app...\n'));

  // Open electron.
  // @ts-ignore
  const app = proc.spawn(electron, [electronDevEntryPoint, '--devserver', urls.localUrlForBrowser]);

  // Forward output to the console.
  app.stdout.on('data', outputInfo);
  app.stderr.on('data', outputError);

  // Start the dev server.
  devServer.start({
    port,
    host,
    root: paths.getAppBuildPath(process.env.NODE_ENV),
    open: false,
    file: 'index.html',
    wait: 100,
    logLevel: 1
  });

  // Exit when the app is closed.
  app.once('exit', () => {
    devServer.shutdown();
    process.exit();
  });

  (['SIGINT', 'SIGTERM'] as Array<NodeJS.Signals>)
    .forEach((sig) => {
      process.on(sig, () => {
        devServer.shutdown();
        process.exit();
      });
    });
}

function outputInfo(data: any): void {
  console.info(
    data
    .toString()
    .trimEnd()
  );
}

function outputError(data: any): void {
  console.error(
    data
    .toString()
    .trimEnd()
  );
}
