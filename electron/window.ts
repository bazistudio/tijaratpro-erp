import { BrowserWindow, screen } from "electron";
import path from "path";

// --------------------------------------------------------------------------
// Window state (size, position) is kept in-memory for the session.
// For persistence across restarts you can serialise these to electron-store.
// --------------------------------------------------------------------------
interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  isMaximized: boolean;
}

function getInitialWindowState(): WindowState {
  // Default: 80% of the primary display, centred
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  return {
    width: Math.round(sw * 0.85),
    height: Math.round(sh * 0.9),
    isMaximized: false,
  };
}

// --------------------------------------------------------------------------
// createWindow  –  call from main.ts after app is ready
// --------------------------------------------------------------------------
export function createWindow(): BrowserWindow {
  const state = getInitialWindowState();

  const win = new BrowserWindow({
    // ── Size & position ──────────────────────────────────────────────────
    width: state.width,
    height: state.height,
    minWidth: 1024,
    minHeight: 680,
    center: true,

    // ── Appearance ───────────────────────────────────────────────────────
    title: "Tijarat Pro – Admin",
    backgroundColor: "#0a0a0a",          // matches your dark theme bg
    show: false,                          // avoid flicker; show after ready
    titleBarStyle: "hidden",             // clean, frameless-style look
    trafficLightPosition: { x: 16, y: 16 }, // macOS traffic lights inset

    // ── Security ─────────────────────────────────────────────────────────
    webPreferences: {
      // Point to the compiled preload script
      preload: path.join(__dirname, "preload.js"),

      // Security hardening
      contextIsolation: true,           // renderer cannot access Node APIs
      nodeIntegration: false,           // no Node in renderer
      sandbox: true,                    // OS-level sandbox
      webSecurity: true,
      allowRunningInsecureContent: false,

      // Disable features the admin panel doesn't need
      spellcheck: false,
    },
  });

  // ── Show window only when content is painted (no white flash) ──────────
  win.once("ready-to-show", () => {
    if (state.isMaximized) {
      win.maximize();
    } else {
      win.show();
    }
  });

  // ── Window state tracking ──────────────────────────────────────────────
  const saveState = () => {
    if (!win.isDestroyed()) {
      state.isMaximized = win.isMaximized();
      if (!state.isMaximized) {
        const bounds = win.getBounds();
        state.width = bounds.width;
        state.height = bounds.height;
        state.x = bounds.x;
        state.y = bounds.y;
      }
    }
  };

  win.on("resize", saveState);
  win.on("move", saveState);
  win.on("close", saveState);

  // ── IPC: custom title-bar controls ─────────────────────────────────────
  // These are handled through preload → ipcRenderer → ipcMain automatically
  // via the handlers in main.ts. Extend here if you add a custom title bar.

  return win;
}
