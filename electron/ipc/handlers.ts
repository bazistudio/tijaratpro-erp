import { ipcMain } from 'electron';
import { mutateEntity, queryEntity, queryAll } from '../db/queries';

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

  // Future expansion: sync status, log retrieval, etc.
}
