import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// --------------------------------------------------------------------------
// Type definitions exposed to the renderer (window.electron)
// --------------------------------------------------------------------------
export interface AppInfo {
  version: string;
  name: string;
  isDev: boolean;
  platform: NodeJS.Platform;
}

export interface ElectronAPI {
  /** Returns basic information about the running app */
  getAppInfo: () => Promise<AppInfo>;

  /** Quits the desktop application */
  quit: () => Promise<void>;

  /** Opens a URL safely in the system default browser */
  openExternal: (url: string) => Promise<void>;

  /** Subscribe to a named event pushed from the main process */
  on: (channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void) => void;

  /** Unsubscribe from a named main-process event */
  off: (channel: string, listener: (...args: unknown[]) => void) => void;

  db: {
    mutate: (entityType: string, operation: 'CREATE'|'UPDATE'|'DELETE', payload: any) => Promise<{ success: boolean; opId: string }>;
    query: (entityType: string, id: string) => Promise<any>;
    queryAll: (entityType: string) => Promise<any[]>;
  };
}

// --------------------------------------------------------------------------
// Allowed IPC channels (whitelist for security)
// --------------------------------------------------------------------------
const ALLOWED_CHANNELS = ["app:notification", "app:updateAvailable"] as const;
type AllowedChannel = (typeof ALLOWED_CHANNELS)[number];

function isAllowedChannel(channel: string): channel is AllowedChannel {
  return (ALLOWED_CHANNELS as readonly string[]).includes(channel);
}

// --------------------------------------------------------------------------
// Expose the API on window.electron
// --------------------------------------------------------------------------
const electronAPI: ElectronAPI = {
  getAppInfo: () => ipcRenderer.invoke("app:getInfo"),

  quit: () => ipcRenderer.invoke("app:quit"),

  openExternal: (url: string) => ipcRenderer.invoke("app:openExternal", url),

  on: (channel, listener) => {
    if (!isAllowedChannel(channel)) {
      console.warn(`[preload] Blocked subscription to unknown channel: ${channel}`);
      return;
    }
    ipcRenderer.on(channel, listener);
  },

  off: (channel, listener) => {
    if (!isAllowedChannel(channel)) return;
    ipcRenderer.off(channel, listener as never);
  },

  db: {
    mutate: (entityType, operation, payload) => ipcRenderer.invoke('db:mutate', entityType, operation, payload),
    query: (entityType, id) => ipcRenderer.invoke('db:query', entityType, id),
    queryAll: (entityType) => ipcRenderer.invoke('db:queryAll', entityType),
  }
};

contextBridge.exposeInMainWorld("electron", electronAPI);
