import * as fs from 'fs-extra';
import * as path from 'path';

const PUBLIC_PATH =
  process.env.PUBLIC_URL === undefined
  ? '.'
  : process.env.PUBLIC_URL;

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());

/**
 * Get the absolute path from the given relative path.
 */
function resolveApp(relativePath: string): string {
  return path.resolve(appDirectory, relativePath);
}

/**
 * Ensure there is/isn't a trailing slash at the end of the given path.
 *
 * @param inputPath The path to test.
 * @param needsSlash Wether the path needs a trailing slash or not.
 * @returns The path adjusted to have/not have the trailing slash.
 */
function ensureSlash(inputPath: string, needsSlash: boolean): string {
  const hasSlash = inputPath.endsWith('/');

  if (hasSlash && !needsSlash) {
    return inputPath.substr(0, inputPath.length - 1);
  }

  if (!hasSlash && needsSlash) {
    return `${inputPath}/`;
  }

  return inputPath;
}

export const CONFIG_PATH = resolveApp('config');

export const APP_INDEX = resolveApp('src/gui/index.tsx');
export const APP_HTML = resolveApp('src/gui/index.html.ejs');
export const APP_BUILD_DEV = resolveApp('build/dev');
export const APP_BUILD_PROD = resolveApp('build/prod');
export const APP_PATH = resolveApp('.');
export const APP_PUBLIC = resolveApp('public');
export const APP_PACKAGE_DOT_JSON = resolveApp('package.json');
export const APP_SRC = resolveApp('src');
export const APP_SRC_PATHS = [APP_SRC, CONFIG_PATH];

export const SSR_INDEX = resolveApp('src/ssr.tsx');
export const SSR_BUILD = resolveApp('build/ssr');

export const DOTENV = resolveApp('.env');
export const NODE_MODULES = resolveApp('node_modules');
export const POSTCSS_CONFIG = resolveApp('postcss.config.js');
export const BABEL_CONFIG = resolveApp('babel.config.js');

export const TSLINT = resolveApp('tslint.json');
export const TS_CONFIG = resolveApp('tsconfig.json');
export const TS_CONFIG_DEV = resolveApp('tsconfig.dev.json');
export const TS_CONFIG_PROD = resolveApp('tsconfig.prod.json');
export const TS_CONFIG_TOOLS = resolveApp('tsconfig.tools.json');

export const PUBLIC_URL = ensureSlash(PUBLIC_PATH, false);
export const SERVED_PATH = ensureSlash(PUBLIC_PATH, true);

export function getAppBuildPath(environment: string | undefined): string {
  if (environment === 'production') {
    return APP_BUILD_PROD;
  }
  return APP_BUILD_DEV;
}
