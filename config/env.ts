import * as fs from 'fs-extra';
import * as path from 'path';

import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

import * as paths from './paths';

if (process.env.NODE_ENV === undefined) {
  // tslint:disable-next-line:no-throw
  throw new Error(
    'The NODE_ENV environment variable is required but was not specified.'
  );
}

const appDirectory = fs.realpathSync(process.cwd());

// tslint:disable-next-line:no-object-mutation
process.env.NODE_PATH =
  process.env.NODE_PATH === undefined
  ? ''
  : process.env.NODE_PATH
    .split(path.delimiter)
    .filter((folder) => folder.length > 0 && !path.isAbsolute(folder))
    .map((folder) => path.resolve(appDirectory, folder))
    .join(path.delimiter);

/**
 * Environment variables regex.
 */
const APP_REGEX = /^APP_/i;

/**
 * Load .env* files.
 */
async function doLoadClientEnvironment(): Promise<void> {
  // Sorted by precedence.
  const dotenvFiles =
    process.env.NODE_ENV === 'test'
    ? [
      // The test environment should not include local .env files - tests should run the same for everyone.
      `${paths.DOTENV}.${process.env.NODE_ENV}`,
      paths.DOTENV
    ]
    : [
      `${paths.DOTENV}.${process.env.NODE_ENV}.local`,
      `${paths.DOTENV}.local`,
      `${paths.DOTENV}.${process.env.NODE_ENV}`,
      paths.DOTENV
    ];

  // Load the .env* files.
  dotenvFiles.forEach((dotenvFile) => {
    if (fs.existsSync(dotenvFile)) {
      dotenvExpand(
        dotenv.config({
          path: dotenvFile
        })
      );
    }
  });
}

// Load Environment Variables as soon as possible (i.e. as soon as this file is imported).
const loadEnvironmentVariablesPromise = doLoadClientEnvironment();

/**
 * Loads the client environment (loads .env* files).
 */
export async function loadClientEnvironment(): Promise<void> {
  return loadEnvironmentVariablesPromise;
}

interface IRawClientEnvironment {
  // tslint:disable-next-line:no-any
  readonly [key: string]: any;
}

interface IStringifiedClientEnvironment {
  // tslint:disable-next-line:no-duplicate-string
  readonly 'process.env': {
    readonly [key: string]: string;
  };
}

/**
 * Get the client environment.
 */
export function getClientEnvironment(publicUrl: string): {
  readonly raw: IRawClientEnvironment;
  readonly stringified: IStringifiedClientEnvironment;
} {
  const nodeEnv =
    process.env.NODE_ENV === undefined
    ? 'development'
    : process.env.NODE_ENV;

  const raw = Object.keys(process.env)
    .filter((key) => APP_REGEX.test(key))
    .reduce(
      (env, key) => {
        return {
          ...env,
          [key]: process.env[key]
        };
      },
      {
        // Useful for determining whether we’re running in production mode.
        // Most importantly, it switches React into the correct mode.
        NODE_ENV: nodeEnv,

        // Useful for resolving the correct path to static assets in `public`.
        // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
        // This should only be used as an escape hatch. Normally you would put
        // images into the `src` and `import` them in code to get their paths.
        PUBLIC_URL: publicUrl
      }
    );

  // Stringify all values.
  const stringified: IStringifiedClientEnvironment = {
    'process.env': Object.keys(raw)
      .reduce<Partial<IStringifiedClientEnvironment>>(
        (env, key) => {
          return {
            ...env,
            [key]: JSON.stringify(raw[key])
          };
        },
        {}
      ) as IStringifiedClientEnvironment['process.env']
  };

  return { raw, stringified };
}
