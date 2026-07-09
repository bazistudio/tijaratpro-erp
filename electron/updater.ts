import { autoUpdater } from "electron-updater";
import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { logger } from "./logger";
import { syncEngine } from "./services/syncEngine";
import { closeDb } from "./db";
import { showNotification } from "./notifications";

export function setupUpdater(mainWindow: BrowserWindow) {
  // We want full control over the download and install process
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    logger.info('Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    logger.info(`Update available: ${info.version}`);
  });

  autoUpdater.on('update-not-available', () => {
    logger.info('App is up to date.');
  });

  autoUpdater.on('error', (err) => {
    logger.error(`
--- Update Error ---
Current version: ${app.getVersion()}
Error: ${err.message}
Stack Trace:\n${err.stack || 'None'}
--------------------
`);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.round(progressObj.percent);
    logger.info(`Downloading update... ${percent}%`);
  });

  autoUpdater.on('update-downloaded', (info) => {
    logger.info(`Update downloaded: ${info.version}`);
    
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'TijaratPro Update Ready',
      message: 'A new version has been downloaded and is ready to install.',
      buttons: ['Install Now', 'Later'],
      defaultId: 0,
      cancelId: 1
    }).then(({ response }) => {
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
