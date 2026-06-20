import { autoUpdater } from "electron-updater";
import { BrowserWindow, ipcMain } from "electron";

export function setupUpdater(mainWindow: BrowserWindow) {
  // We want full control over the download and install process
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('updater:status', 'Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('updater:available', info);
  });

  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('updater:status', 'App is up to date.');
  });

  autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('updater:error', err.message);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('updater:progress', progressObj);
  });

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send('updater:downloaded', info);
  });

  // Handle IPC calls from the renderer
  ipcMain.handle('updater:check', () => {
    return autoUpdater.checkForUpdatesAndNotify();
  });

  ipcMain.handle('updater:install', () => {
    autoUpdater.quitAndInstall();
  });
}
