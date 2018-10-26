/**
 * Fixes conflicts by deleting the unwanted files.
 */

import * as path from 'path';

import { remove } from '../src/util/fs';

// Remove conflicting versions of node.

remove(path.join(__dirname, '../node_modules/electron/node_modules/@types/node'))
  // Ignore errors
  // tslint:disable-next-line:no-empty
  .catch(() => {});

remove(path.join(__dirname, '../node_modules/@types/dotenv/node_modules/@types/node'))
  // Ignore errors
  // tslint:disable-next-line:no-empty
  .catch(() => {});

remove(path.join(__dirname, '../node_modules/@types/mkdirp/node_modules/@types/node'))
  // Ignore errors
  // tslint:disable-next-line:no-empty
  .catch(() => {});
