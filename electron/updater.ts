import { autoUpdater } from "electron-updater";
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { logger } from "./logger";
import { syncEngine } from "./services/syncEngine";
import { closeDb } from "./db";

export function setupUpdater(mainWindow: BrowserWindow) {
  // We want full control over the download and install process
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    logger.info('Checking for updates...');
    mainWindow.webContents.send('updater:status', 'Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    logger.info(`Update available: ${info.version}`);
    mainWindow.webContents.send('updater:available', info);
  });

  autoUpdater.on('update-not-available', () => {
    logger.info('App is up to date.');
    mainWindow.webContents.send('updater:status', 'App is up to date.');
  });

  autoUpdater.on('error', (err) => {
    logger.error(`
--- Update Error ---
Current version: ${app.getVersion()}
Error: ${err.message}
Stack Trace:\n${err.stack || 'None'}
--------------------
`);
    mainWindow.webContents.send('updater:error', err.message);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.round(progressObj.percent);
    logger.info(`Downloading update... ${percent}%`);
    mainWindow.webContents.send('updater:progress', progressObj);
  });

  autoUpdater.on('update-downloaded', (info) => {
    logger.info(`Update downloaded: ${info.version}`);
    mainWindow.webContents.send('updater:downloaded', info);
    
    const response = dialog.showMessageBoxSync(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: `Version ${info.version} has been downloaded and is ready to install.`,
      detail: 'Would you like to restart the application and apply the update now?',
      buttons: ['Restart & Install Now', 'Install on Next Launch'],
      defaultId: 0,
      cancelId: 1
    });

    if (response === 0) {
      app.removeAllListeners("window-all-closed");
      const windows = BrowserWindow.getAllWindows();
      windows.forEach((win) => win.close());
      try {
        syncEngine.stop();
        closeDb();
      } catch (err) {}
      autoUpdater.quitAndInstall(false, true);
    }
  });

  // Handle IPC calls from the renderer safely
  if (!ipcMain.listenerCount('updater:check')) {
    ipcMain.handle('updater:check', () => {
      return autoUpdater.checkForUpdatesAndNotify();
    });
  }

  if (!ipcMain.listenerCount('updater:install')) {
    ipcMain.handle('updater:install', () => {
      try {
        syncEngine.stop();
        closeDb();
      } catch (err) {}
      autoUpdater.quitAndInstall(false, true);
    });
  }
}
