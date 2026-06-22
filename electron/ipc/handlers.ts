import { ipcMain, BrowserWindow, app } from 'electron';
import { mutateEntity, queryEntity, queryAll } from '../db/queries';
import { setToken, getToken, clearToken } from '../auth/storage';
import { createBackup, getBackupStatus } from '../services/backupEngine';
import { restoreDatabase } from '../services/restoreEngine';
import { configStore } from '../services/config';
import { validatePayload } from './validation';

export function setupIpcHandlers() {
  ipcMain.handle('db:mutate', (_event, entityType: string, operation: 'CREATE'|'UPDATE'|'DELETE', payload: any) => {
    let validatedPayload;
    try {
      validatedPayload = validatePayload(entityType, operation, payload);
    } catch (err: any) {
      console.error('[IPC Security] Payload validation failed for db:mutate', err.errors || err);
      throw new Error(`[IPC Security] Invalid payload for ${entityType} ${operation}`);
    }

    try {
      return mutateEntity(entityType, operation, validatedPayload);
    } catch (err: any) {
      console.error(`[DB Error] Mutation failed for ${entityType} ${operation}:`, err);
      throw new Error(`Database mutation failed: ${err.message}`);
    }
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
    (configStore as any).set('backupPath', backupPath);
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
