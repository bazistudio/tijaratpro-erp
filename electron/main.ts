import { app, BrowserWindow, shell, ipcMain } from "electron";
import path from "path";
import { createWindow } from "./window";
import { setupSecurity } from "./security";
import { initDb } from "./db/index";
import { setupIpcHandlers } from "./ipc/handlers";
import { syncEngine } from "./services/syncEngine";
import { initBackupScheduler } from "./services/backupScheduler";

// --------------------------------------------------------------------------
// Environment helpers
// --------------------------------------------------------------------------
const isDev = !app.isPackaged;
const NEXT_DEV_URL = "http://localhost:3000";

// --------------------------------------------------------------------------
// App lifecycle
// --------------------------------------------------------------------------
let mainWindow: BrowserWindow | null = null;

// Register custom protocol for deep linking (tijaratpro://)
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('tijaratpro', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('tijaratpro');
}

// Handle protocol open for macOS
app.on('open-url', (event, url) => {
  event.preventDefault();
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(async () => {
  // 1. Harden security before any window opens
  setupSecurity();

  // 1.5 Init Local Database, IPC and Sync Engine
  initDb();
  setupIpcHandlers();
  syncEngine.start(); // MUST be called after initDb()
  initBackupScheduler(); // Start auto-backup checks

  // 2. Create the main window
  mainWindow = createWindow();

  // 3. Load the web content
  if (isDev) {
    // In development: connect to the running `next dev` server
    await mainWindow.loadURL(NEXT_DEV_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    // In production: load the Next.js static export from `out/`
    const indexPath = path.join(__dirname, "../out/index.html");
    await mainWindow.loadFile(indexPath);
    
    // Setup auto-updater in production only
    const { setupUpdater } = require('./updater');
    setupUpdater(mainWindow);
  }

  // 4. Open external links in the system browser, not in Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith("file://") && !url.startsWith(NEXT_DEV_URL)) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  // macOS: re-create window when the dock icon is clicked and no windows exist
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });
});

// Quit when all windows are closed (except macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// --------------------------------------------------------------------------
// IPC handlers (renderer ↔ main)
// --------------------------------------------------------------------------

/** Renderer can ask for basic app info */
ipcMain.handle("app:getInfo", () => ({
  version: app.getVersion(),
  name: app.getName(),
  isDev,
  platform: process.platform,
}));

/** Renderer can trigger a graceful quit */
ipcMain.handle("app:quit", () => {
  app.quit();
});

/** Renderer can open a URL in the system browser */
ipcMain.handle("app:openExternal", (_event, url: string) => {
  const safeUrl = new URL(url); // throws on invalid URLs
  if (safeUrl.protocol === "https:" || safeUrl.protocol === "http:") {
    shell.openExternal(url);
  }
});
