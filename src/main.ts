/**
 * This is the main file.
 * It is the entrypoint of the program and runs the main thread.
 */

import { app, BrowserWindow } from 'electron';

import { getAssetURL } from './util';

// The arguments passed in.
const args = process.argv.slice(2);

// Use debug mode?
const debug = args.includes('--debug');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// tslint:disable-next-line:no-let
let mainWindow: BrowserWindow | undefined;

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
app.once('ready', createMainWindow);

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
