/**
 * This is the main file.
 * It is the entrypoint of the program and runs the main thread.
 */

import { app, BrowserWindow, protocol } from 'electron';
import * as fs from 'fs-extra';
import mime from 'mime/lite';
import * as path from 'path';

import { getAssetURL } from './util';

// The arguments passed in.
const args = process.argv.slice(2);

// Use debug mode?
const debug = args.includes('--debug');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// tslint:disable-next-line:no-let
let mainWindow: BrowserWindow | undefined;

const APP_PROTOCOL =
  process.env.NODE_ENV === 'production'
  ? (() => {
    if (process.env.APP_PROTOCOL === undefined) {
      throw new Error('APP_PROTOCOL not set'); // tslint:disable-line:no-throw
    }
    return process.env.APP_PROTOCOL;
  })()
  : undefined;

const APP_HOST =
  process.env.NODE_ENV === 'production'
  ? (() => {
    if (process.env.APP_HOST === undefined) {
      throw new Error('APP_HOST not set'); // tslint:disable-line:no-throw
    }
    return process.env.APP_HOST;
  })()
  : undefined;

// Register the custom schemes.
protocol.registerStandardSchemes(
  process.env.NODE_ENV === 'production'
  ? [APP_PROTOCOL as string]
  : []
);

/**
 * Create the main window of the app.
 */
function createMainWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    titleBarStyle: 'hidden'
  });

  mainWindow.loadURL(getAssetURL('index.html'));

  if (debug) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    mainWindow.maximize();
  }

  // Dereference the main window when it is closed.
  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });

  // Show the window once it's ready.
  mainWindow.once('ready-to-show', () => {
    if (mainWindow === undefined) {
      return;
    }

    mainWindow.show();
  });
}

// Create the main window once electron is ready.
app.once('ready', () => {
  registerProtocols();
  createMainWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform === 'darwin') {
    return;
  }

  app.quit();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === undefined) {
    createMainWindow();
  }
});

/**
 * Registers any custom protocols in the app.
 */
function registerProtocols(): void {
  if (process.env.NODE_ENV === 'production') {
    protocol.registerStringProtocol(APP_PROTOCOL as string, async (request, callback) => {
      const relativePath = request.url.substr((APP_HOST as string).length);
      const filePath = path.normalize(`${__dirname}/${relativePath}`);
      const fileExt = path.extname(filePath);

      const data = await fs.readFile(filePath, { encoding: 'utf-8' });

      // @ts-ignore
      callback({
        data,
        mimeType: mime.getType(fileExt)
      });
    });
  }
}
