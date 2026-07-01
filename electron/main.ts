import { app, BrowserWindow, shell, ipcMain, Menu, dialog, screen } from "electron";
import path from "path";
import { createWindow } from "./window";
import { setupSecurity } from "./security";
import { initDb } from "./db/index";
import { setupIpcHandlers } from "./ipc/handlers";
import { syncEngine } from "./services/syncEngine";
import { setupCrashHandler, setAppReadyForUse } from "./crashHandler";
import { logger } from "./logger";
import { createSplashWindow, updateSplashStatus } from "./splash";
import Store from 'electron-store';

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

// --------------------------------------------------------------------------
// Single Instance Lock
// --------------------------------------------------------------------------
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  logger.info("Another instance is already running. Quitting this instance.");
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    logger.info("Second instance launched. Focusing existing window.");
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Handle protocol open for macOS
app.on('open-url', (event, url) => {
  event.preventDefault();
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

const crashStore = new Store<{ startupCrashes: number; gpuCrashes: number }>({ name: 'crash-state', defaults: { startupCrashes: 0, gpuCrashes: 0 } });

if ((crashStore.get('gpuCrashes') as number) >= 3) {
  app.disableHardwareAcceleration();
}

app.whenReady().then(async () => {
  const startupStart = performance.now();
  
  const sysMem = process.getSystemMemoryInfo ? process.getSystemMemoryInfo() : null;
  const cpus = require('os').cpus();
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();
  
  const gpuStatus = app.getGPUFeatureStatus();
  logger.info(`GPU Status (2D Canvas): ${gpuStatus['2d_canvas']}, (WebGL): ${gpuStatus.webgl}`);

  logger.info(`
--- Electron Health Report ---
Version: ${app.getVersion()}
Electron: ${process.versions.electron}
Node: ${process.versions.node}
OS: ${process.platform} ${process.arch}
CPU: ${cpus.length > 0 ? cpus[0].model : 'Unknown'} (${cpus.length} cores)
RAM: ${sysMem ? `${Math.round(sysMem.total / 1024)}MB Total, ${Math.round(sysMem.free / 1024)}MB Free` : 'Unknown'}
GPU: 2D Canvas=${gpuStatus['2d_canvas']}, WebGL=${gpuStatus.webgl}
Locale: ${app.getLocale()}
Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
Displays: ${displays.length} connected
Resolution: ${primaryDisplay.size.width}x${primaryDisplay.size.height} (Primary)
Scale Factor: ${primaryDisplay.scaleFactor}
SQLite Path: ${path.join(app.getPath('userData'), 'tijarat_local.db')}
------------------------------
`);
  
  setupCrashHandler();

  // 0. Remove Default Menu
  if (!isDev) {
    Menu.setApplicationMenu(null);
  }

  // 1. Harden security before any window opens
  setupSecurity();

  const splash = createSplashWindow();

  updateSplashStatus(splash, "Preparing workspace...");

  let startupTimeout: NodeJS.Timeout | null = null;
  if (!isDev) {
    startupTimeout = setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) return;
      
      const response = dialog.showMessageBoxSync({
        type: 'warning',
        title: 'Startup Timeout',
        message: 'Startup is taking longer than expected.',
        detail: 'TijaratPro might be stuck initializing or downloading an update. What would you like to do?',
        buttons: ['Retry', 'Open Logs', 'Exit'],
        defaultId: 0,
        cancelId: 2,
        noLink: true
      });
      
      if (response === 0) {
        app.relaunch();
        app.exit(0);
      } else if (response === 1) {
        shell.showItemInFolder(path.join(app.getPath('userData'), 'logs', 'main.log'));
        app.quit();
      } else if (response === 2) {
        app.quit();
      }
    }, 30000); // 30 sec in production
  }

  updateSplashStatus(splash, "Loading local database...");
  initDb();
  
  setupIpcHandlers();
  
  updateSplashStatus(splash, "Starting services...");
  syncEngine.start(); // MUST be called after initDb()
  
  mainWindow = createWindow();
  logger.info('Main window created');

  // 3. Load the web content
  if (isDev) {
    // In development: connect to the running `next dev` server
    let loaded = false;
    for (let i = 0; i < 30; i++) {
      try {
        await mainWindow.loadURL(NEXT_DEV_URL);
        loaded = true;
        break;
      } catch (err) {
        updateSplashStatus(splash, `Waiting for Next.js... (${i + 1}/30)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!loaded) {
      console.error("[electron] Failed to connect to Next.js dev server.");
    }
    
    if (process.env.OPEN_DEVTOOLS !== 'false') {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  } else {
    updateSplashStatus(splash, "Checking updates...");
    const indexPath = path.join(__dirname, "../out/index.html");
    await mainWindow.loadFile(indexPath);
    
    // Setup auto-updater in production only
    const { setupUpdater } = require('./updater');
    setupUpdater(mainWindow);

    // DevTools Production Lock
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow?.webContents.closeDevTools();
    });

    mainWindow.webContents.on("before-input-event", (event, input) => {
      const isF12 = input.key === "F12";
      const isInspect = input.control && input.shift && input.key.toLowerCase() === "i";
      const isMacInspect = input.meta && input.alt && input.key.toLowerCase() === "i";
      const isF5 = input.key === "F5";
      const isCtrlR = (input.control || input.meta) && input.key.toLowerCase() === "r";
      
      if (isF12 || isInspect || isMacInspect || isF5 || isCtrlR) {
        event.preventDefault();
      }
    });
  }

  // Fade transition from splash to main window
  mainWindow.once('ready-to-show', () => {
    if (startupTimeout) clearTimeout(startupTimeout);
    
    mainWindow!.setOpacity(0);
    mainWindow!.show();
    
    const FADE_DURATION = 200;
    const FADE_INTERVAL = 20;
    const FADE_STEP = FADE_INTERVAL / FADE_DURATION;
    
    let splashOpacity = 1;
    let mainOpacity = 0;
    
    // Clear timeout/interval on exit
    app.once('before-quit', () => {
      if (startupTimeout) clearTimeout(startupTimeout);
      if (fadeInterval) clearInterval(fadeInterval);
    });
    
    const fadeInterval = setInterval(() => {
      splashOpacity -= FADE_STEP;
      mainOpacity += FADE_STEP;
      
      if (!splash.isDestroyed()) splash.setOpacity(Math.max(0, splashOpacity));
      if (!mainWindow!.isDestroyed()) mainWindow!.setOpacity(Math.min(1, mainOpacity));
      
      if (splashOpacity <= 0) {
        clearInterval(fadeInterval);
        if (!splash.isDestroyed()) splash.destroy();
        if (!mainWindow!.isDestroyed()) {
          mainWindow!.setOpacity(1);
          logger.info(`Startup completed in ${Math.round(performance.now() - startupStart)} ms`);
          // Reset startup crashes immediately since we successfully loaded
          crashStore.set('startupCrashes', 0);
          
          // Reset GPU crashes only after 5 minutes of stability
          setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              crashStore.set('gpuCrashes', 0);
              logger.info('GPU stability threshold reached. Crash counter reset.');
            }
          }, 5 * 60 * 1000); // 5 minutes

          setAppReadyForUse(true);
        }
      }
    }, FADE_INTERVAL);
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
  logger.info("All windows closed.");
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  logger.info("App before-quit fired.");
});

app.on("will-quit", () => {
  logger.info("App will-quit fired.");
});

app.on("quit", () => {
  logger.info("App quit fired.");
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
