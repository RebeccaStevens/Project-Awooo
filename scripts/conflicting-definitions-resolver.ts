/**
 * Fixes conflicts by deleting the unwanted files.
 */

import * as fs from 'fs-extra';
import * as path from 'path';

fs.remove(path.join(__dirname, '../node_modules/electron/node_modules/@types/node'));
