/**
 * File System utility functions.
 */

import { PathLike, promises as fs } from 'fs';
import * as path from 'path';

/**
 * Write a file to disk.
 *
 * Works like `fs.writeFile` except that the directory will be created first if it doesn't exist.
 */
export async function writeFile(
  file: string,
  data: any,
  options?: {
    readonly encoding?: string | null;
    readonly mode?: string | number;
    readonly flag?: string | number;
  } | string | null
): Promise<void> {
  const dir = path.dirname(file);
  await ensureDirectoryExists(dir);
  return fs.writeFile(file, data, options);
}

/**
 * Copy and paste a file.
 *
 * Works like `fs.copyFile` except that the dest directory will be created first if it doesn't exist.
 */
export async function copyFile(src: PathLike, dest: string, flags?: number): Promise<void> {
  const dir = path.dirname(dest);
  await ensureDirectoryExists(dir);
  return fs.copyFile(src, dest, flags);
}

/**
 * Write a file to disk.
 *
 * Works like `fs.writeFile` except that the directory will be created first if it doesn't exist
 */
export async function ensureDirectoryExists(dir: string): Promise<void> {
  const dirStat = await fs.stat(dir)
    // Ignore errors.
    // tslint:disable-next-line:no-empty
    .catch(() => {});

  // If it doesn't exist, create it.
  if (dirStat === undefined) {
    // Typings incorrect.
    // @ts-ignore
    return fs.mkdir(dir, { recursive: true });
  }

  // If it's not a directory, try and create it.
  if (!dirStat.isDirectory()) {
    // Typings incorrect.
    // @ts-ignore
    return fs.mkdir(dir, { recursive: true });
  }

  // Otherwise it exists.
  return Promise.resolve();
}

/**
 * Empties out the given directory.
 *
 * @param dir The directory to empty
 */
export async function emptyDirectory(dir: string): Promise<void> {
  const stat = await fs.stat(dir)
    // Ignore errors.
    // tslint:disable-next-line:no-empty
    .catch(() => {});

  if (stat === undefined) {
    return Promise.resolve();
  }

  if (!stat.isDirectory()) {
    return Promise.reject(new Error(`Not a directory "${dir}"`));
  }

  const items = await fs.readdir(dir);
  await Promise.all(
    items.map(async (item) => remove(path.join(dir, item)))
  );
}

/**
 * Remove a file, director or symbolic link.
 *
 * @param itemPath The path to the item
 */
export async function remove(itemPath: string): Promise<void> {
  const stat = await fs.stat(itemPath);

  if (stat.isDirectory()) {
    await emptyDirectory(itemPath);
    return fs.rmdir(itemPath);
  }

  if (stat.isFile() || stat.isSymbolicLink()) {
    return fs.unlink(itemPath);
  }

  return Promise.reject(new Error(`Cannot remove "${itemPath}" - unknown kind of item.`));
}

/**
 * Read a utf8 encoded file from disk.
 */
export async function readFile(filePath: PathLike | fs.FileHandle): Promise<string> {
  return fs.readFile(filePath, { encoding: 'utf8', flag: 'r' });
}
