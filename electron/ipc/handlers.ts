import { ipcMain, BrowserWindow, app } from 'electron';
import { mutateEntity, queryEntity, queryAll } from '../db/queries';
import { setToken, getToken, clearToken } from '../auth/storage';
import { createBackup, getBackupStatus } from '../services/backupEngine';
import { restoreDatabase } from '../services/restoreEngine';
import { configStore } from '../services/config';

export function setupIpcHandlers() {
  ipcMain.handle('db:mutate', (_event, entityType: string, operation: 'CREATE'|'UPDATE'|'DELETE', payload: any) => {
    return mutateEntity(entityType, operation, payload);
  });

  ipcMain.handle('db:query', (_event, entityType: string, id: string) => {
    return queryEntity(entityType, id);
  });

  ipcMain.handle('db:queryAll', (_event, entityType: string) => {
    return queryAll(entityType);
  });


  // Auth / SafeStorage
  ipcMain.handle('auth:setToken', (_event, key: string, token: string) => {
    setToken(key, token);
  });

  ipcMain.handle('auth:getToken', (_event, key: string) => {
    return getToken(key);
  });

  ipcMain.handle('auth:clearToken', (_event, key: string) => {
    clearToken(key);
  });

  // Backup Engine
  ipcMain.handle('db:backup', async () => {
    return createBackup();
  });

  ipcMain.handle('db:restore', async (_event, backupFilePath: string) => {
    return restoreDatabase(backupFilePath);
  });

  ipcMain.handle('db:get-backup-status', () => {
    return getBackupStatus();
  });

  ipcMain.handle('db:set-backup-path', (_event, backupPath: string) => {
    configStore.set('backupPath', backupPath);
    return { success: true };
  });

  // Desktop Shell Controls
  ipcMain.handle('app:minimize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.minimize();
  });

  ipcMain.handle('app:maximize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  ipcMain.handle('app:close', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.close();
  });

  ipcMain.handle('app:getSystemInfo', () => {
    return {
      appVersion: app.getVersion(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      platform: process.platform,
      arch: process.arch,
      memoryUsage: process.getSystemMemoryInfo ? process.getSystemMemoryInfo() : process.memoryUsage()
    };
  });
}
