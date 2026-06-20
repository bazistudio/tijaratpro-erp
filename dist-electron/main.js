"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// electron/main.ts
var import_electron6 = require("electron");
var import_path4 = __toESM(require("path"));

// electron/window.ts
var import_electron = require("electron");
var import_path = __toESM(require("path"));
function getInitialWindowState() {
  const { width: sw, height: sh } = import_electron.screen.getPrimaryDisplay().workAreaSize;
  return {
    width: Math.round(sw * 0.85),
    height: Math.round(sh * 0.9),
    isMaximized: false
  };
}
function createWindow() {
  const state = getInitialWindowState();
  const win = new import_electron.BrowserWindow({
    // ── Size & position ──────────────────────────────────────────────────
    width: state.width,
    height: state.height,
    minWidth: 1024,
    minHeight: 680,
    center: true,
    // ── Appearance ───────────────────────────────────────────────────────
    title: "Tijarat Pro \u2013 Admin",
    backgroundColor: "#0a0a0a",
    // matches your dark theme bg
    show: false,
    // avoid flicker; show after ready
    titleBarStyle: "hidden",
    // clean, frameless-style look
    trafficLightPosition: { x: 16, y: 16 },
    // macOS traffic lights inset
    // ── Security ─────────────────────────────────────────────────────────
    webPreferences: {
      // Point to the compiled preload script
      preload: import_path.default.join(__dirname, "preload.js"),
      // Security hardening
      contextIsolation: true,
      // renderer cannot access Node APIs
      nodeIntegration: false,
      // no Node in renderer
      sandbox: true,
      // OS-level sandbox
      webSecurity: true,
      allowRunningInsecureContent: false,
      // Disable features the admin panel doesn't need
      spellcheck: false
    }
  });
  win.once("ready-to-show", () => {
    if (state.isMaximized) {
      win.maximize();
    } else {
      win.show();
    }
  });
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
  return win;
}

// electron/security.ts
var import_electron2 = require("electron");
var CSP = [
  "default-src 'self'",
  // Next.js needs inline scripts in dev; tighten in production
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // Allow styles from self + inline (required by many UI libraries)
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fonts from Google Fonts CDN
  "font-src 'self' https://fonts.gstatic.com",
  // Images: self + data URIs + your API origin
  "img-src 'self' data: blob: https:",
  // XHR / Fetch: allow calls to your backend API
  "connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* wss://localhost:* https:",
  // Media (audio / video)
  "media-src 'self'",
  // Block all plugins (Flash, etc.)
  "object-src 'none'",
  // Disallow iframes from foreign origins
  "frame-src 'self'"
].join("; ");
var ALLOWED_PERMISSIONS = /* @__PURE__ */ new Set([
  "clipboard-read",
  "clipboard-write",
  "notifications"
]);
function setupSecurity() {
  import_electron2.app.on("web-contents-created", (_event, contents) => {
    contents.on("will-navigate", (event, navigationUrl) => {
      const allowed = navigationUrl.startsWith("http://localhost:3000") || navigationUrl.startsWith("file://");
      if (!allowed) {
        console.warn(`[security] Blocked navigation to: ${navigationUrl}`);
        event.preventDefault();
        import_electron2.shell.openExternal(navigationUrl);
      }
    });
    contents.setWindowOpenHandler(({ url }) => {
      console.warn(`[security] Blocked window.open for: ${url}`);
      import_electron2.shell.openExternal(url);
      return { action: "deny" };
    });
  });
  import_electron2.app.whenReady().then(() => {
    const ses = import_electron2.session.defaultSession;
    ses.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [CSP]
        }
      });
    });
    ses.setPermissionRequestHandler((_webContents, permission, callback) => {
      const granted = ALLOWED_PERMISSIONS.has(permission);
      if (!granted) {
        console.warn(`[security] Permission denied: ${permission}`);
      }
      callback(granted);
    });
    ses.setPermissionCheckHandler((_webContents, permission) => {
      return ALLOWED_PERMISSIONS.has(permission);
    });
  });
}

// electron/db/index.ts
var import_better_sqlite3 = __toESM(require("better-sqlite3"));
var import_path2 = __toESM(require("path"));
var import_electron3 = require("electron");

// electron/db/schema.ts
function initializeSchema(db2) {
  db2.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      updatedAt INTEGER NOT NULL,
      version INTEGER NOT NULL DEFAULT 1
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      version INTEGER NOT NULL DEFAULT 1
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL,
      updatedAt INTEGER NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY, -- Same as operation_log ID for tracing
      entity_type TEXT NOT NULL,
      operation TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
      payload TEXT NOT NULL, -- JSON
      timestamp INTEGER NOT NULL
    );
  `);
  db2.exec(`
    CREATE TABLE IF NOT EXISTS operation_log (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      status TEXT NOT NULL -- 'pending', 'synced', 'failed'
    );
  `);
}

// electron/db/index.ts
var _db = null;
function getDb() {
  if (!_db) {
    throw new Error("[DB] Database not initialized. Call initDb() first inside app.whenReady().");
  }
  return _db;
}
var db = new Proxy({}, {
  get(_target, prop) {
    return getDb()[prop];
  }
});
function initDb() {
  if (_db) return;
  const dbPath = import_path2.default.join(import_electron3.app.getPath("userData"), "tijarat_local.db");
  _db = new import_better_sqlite3.default(dbPath, {
    // Remove verbose in production — swap with syncLogger
  });
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  initializeSchema(_db);
}

// electron/ipc/handlers.ts
var import_electron5 = require("electron");

// electron/cache/memoryCache.ts
var MemoryCache = class {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
  }
  // Generate composite keys like "users:123"
  getKey(entityType, id) {
    return `${entityType}:${id}`;
  }
  get(entityType, id) {
    return this.cache.get(this.getKey(entityType, id));
  }
  set(entityType, id, data) {
    const key = this.getKey(entityType, id);
    const existing = this.cache.get(key);
    if (!existing || data.version >= existing.version) {
      this.cache.set(key, data);
    }
  }
  delete(entityType, id) {
    this.cache.delete(this.getKey(entityType, id));
  }
  clear() {
    this.cache.clear();
  }
};
var memoryCache = new MemoryCache();

// electron/db/queries.ts
var import_uuid = require("uuid");

// electron/services/api.ts
var import_axios = __toESM(require("axios"));
var API_BASE_URL = process.env.API_BASE_URL || "http://localhost:4000/api";
var apiClient = import_axios.default.create({
  baseURL: API_BASE_URL,
  timeout: 5e3
});
var api = {
  // Resolves conflicts by checking server.updatedAt > local.updatedAt
  syncEntity: async (entityType, operation, payload) => {
    const endpoint = `/${entityType}`;
    try {
      let response;
      if (operation === "CREATE") {
        response = await apiClient.post(endpoint, payload);
      } else if (operation === "UPDATE") {
        response = await apiClient.put(`${endpoint}/${payload.id}`, payload);
      } else if (operation === "DELETE") {
        response = await apiClient.delete(`${endpoint}/${payload.id}`);
      }
      return { success: true, data: response?.data };
    } catch (error) {
      if (error.response && error.response.status === 409) {
        return { success: false, conflict: true, serverData: error.response.data.serverEntity };
      }
      throw error;
    }
  }
};

// electron/services/logger.ts
var import_fs = __toESM(require("fs"));
var import_path3 = __toESM(require("path"));
var import_electron4 = require("electron");
var syncLogPath = null;
function getLogPath() {
  if (!syncLogPath) {
    const logDir = import_path3.default.join(import_electron4.app.getPath("userData"), "logs");
    if (!import_fs.default.existsSync(logDir)) {
      import_fs.default.mkdirSync(logDir, { recursive: true });
    }
    syncLogPath = import_path3.default.join(logDir, "sync.log");
  }
  return syncLogPath;
}
var syncLogger = {
  info: (message, meta = {}) => {
    const entry = `[INFO] ${(/* @__PURE__ */ new Date()).toISOString()} - ${message} - ${JSON.stringify(meta)}
`;
    import_fs.default.appendFileSync(getLogPath(), entry);
  },
  error: (message, error) => {
    const entry = `[ERROR] ${(/* @__PURE__ */ new Date()).toISOString()} - ${message} - ${error?.message || error}
`;
    import_fs.default.appendFileSync(getLogPath(), entry);
  }
};

// electron/services/syncEngine.ts
var SyncEngine = class {
  constructor() {
    this.isOnline = true;
    this.isSyncing = false;
    this.timer = null;
  }
  // Called explicitly from main.ts after app.whenReady() and initDb()
  start() {
    this.startPolling();
  }
  setOnlineStatus(status) {
    this.isOnline = status;
    if (this.isOnline) {
      this.triggerSync();
    }
  }
  startPolling() {
    this.timer = setInterval(() => {
      this.triggerSync();
    }, 3e4);
  }
  // Event-driven trigger
  async triggerSync() {
    if (!this.isOnline) return;
    if (this.isSyncing) {
      syncLogger.info("Sync already running, skipping trigger.");
      return;
    }
    this.isSyncing = true;
    try {
      await this.processQueue();
    } catch (error) {
      syncLogger.error("Sync failed", error);
    } finally {
      this.isSyncing = false;
    }
  }
  async processQueue() {
    const queueStmt = db.prepare(`SELECT * FROM sync_queue ORDER BY timestamp ASC LIMIT 50`);
    const pendingItems = queueStmt.all();
    if (pendingItems.length === 0) return;
    for (const item of pendingItems) {
      const payload = JSON.parse(item.payload);
      try {
        const result = await api.syncEntity(item.entity_type, item.operation, payload);
        if (result.success && result.data) {
          const canonicalData = result.data;
          if (item.operation !== "DELETE") {
            const updates = Object.keys(canonicalData).filter((k) => k !== "id").map((k) => `${k} = @${k}`).join(", ");
            const stmt = db.prepare(`UPDATE ${item.entity_type} SET ${updates} WHERE id = @id`);
            stmt.run(canonicalData);
            memoryCache.set(item.entity_type, canonicalData.id, canonicalData);
          }
          this.markSynced(item.id);
        } else if (result.conflict && result.serverData) {
          this.resolveConflict(item.entity_type, payload, result.serverData);
          this.markSynced(item.id);
        }
      } catch (error) {
        syncLogger.error(`Failed to sync item ${item.id}`, error);
        this.markFailed(item.id);
      }
    }
  }
  markSynced(id) {
    const transaction = db.transaction(() => {
      db.prepare(`DELETE FROM sync_queue WHERE id = ?`).run(id);
      db.prepare(`UPDATE operation_log SET status = 'synced' WHERE id = ?`).run(id);
    });
    transaction();
    syncLogger.info(`Successfully synced item`, { id });
  }
  markFailed(id) {
    db.prepare(`UPDATE operation_log SET status = 'failed' WHERE id = ?`).run(id);
  }
  resolveConflict(entityType, localData, serverData) {
    const serverWins = serverData.version > localData.version || serverData.version === localData.version && serverData.updatedAt > localData.updatedAt;
    if (serverWins) {
      syncLogger.info("Conflict resolved: Server wins", { entityType, id: localData.id });
      const updates = Object.keys(serverData).filter((k) => k !== "id").map((k) => `${k} = @${k}`).join(", ");
      const stmt = db.prepare(`UPDATE ${entityType} SET ${updates} WHERE id = @id`);
      stmt.run(serverData);
      memoryCache.set(entityType, serverData.id, serverData);
    } else {
      syncLogger.info("Conflict resolved: Local wins", { entityType, id: localData.id });
    }
  }
};
var syncEngine = new SyncEngine();

// electron/db/queries.ts
function mutateEntity(entityType, operation, payload) {
  const timestamp = Date.now();
  const opId = (0, import_uuid.v7)();
  if (operation === "CREATE") {
    payload.version = 1;
  } else if (operation === "UPDATE") {
    payload.version = (payload.version || 1) + 1;
  }
  payload.updatedAt = timestamp;
  const transaction = db.transaction(() => {
    if (operation === "CREATE") {
      const cols = Object.keys(payload).join(", ");
      const placeholders = Object.keys(payload).map((k) => `@${k}`).join(", ");
      const stmt = db.prepare(`INSERT INTO ${entityType} (${cols}) VALUES (${placeholders})`);
      stmt.run(payload);
    } else if (operation === "UPDATE") {
      const updates = Object.keys(payload).filter((k) => k !== "id").map((k) => `${k} = @${k}`).join(", ");
      const stmt = db.prepare(`UPDATE ${entityType} SET ${updates} WHERE id = @id`);
      stmt.run(payload);
    } else if (operation === "DELETE") {
      const stmt = db.prepare(`DELETE FROM ${entityType} WHERE id = ?`);
      stmt.run(payload.id);
    }
    const queueStmt = db.prepare(`
      INSERT INTO sync_queue (id, entity_type, operation, payload, timestamp) 
      VALUES (@id, @entity_type, @operation, @payload, @timestamp)
    `);
    queueStmt.run({
      id: opId,
      entity_type: entityType,
      operation,
      payload: JSON.stringify(payload),
      timestamp
    });
    const logStmt = db.prepare(`
      INSERT INTO operation_log (id, entity_type, operation, payload, timestamp, status)
      VALUES (@id, @entity_type, @operation, @payload, @timestamp, 'pending')
    `);
    logStmt.run({
      id: opId,
      entity_type: entityType,
      operation,
      payload: JSON.stringify(payload),
      timestamp
    });
  });
  transaction();
  if (operation === "DELETE") {
    memoryCache.delete(entityType, payload.id);
  } else {
    memoryCache.set(entityType, payload.id, payload);
  }
  syncEngine.triggerSync().catch(console.error);
  return { success: true, opId };
}
function queryEntity(entityType, id) {
  const cached = memoryCache.get(entityType, id);
  if (cached) return cached;
  const stmt = db.prepare(`SELECT * FROM ${entityType} WHERE id = ?`);
  const result = stmt.get(id);
  if (result) {
    memoryCache.set(entityType, id, result);
  }
  return result;
}
function queryAll(entityType) {
  const stmt = db.prepare(`SELECT * FROM ${entityType}`);
  return stmt.all();
}

// electron/ipc/handlers.ts
function setupIpcHandlers() {
  import_electron5.ipcMain.handle("db:mutate", (_event, entityType, operation, payload) => {
    return mutateEntity(entityType, operation, payload);
  });
  import_electron5.ipcMain.handle("db:query", (_event, entityType, id) => {
    return queryEntity(entityType, id);
  });
  import_electron5.ipcMain.handle("db:queryAll", (_event, entityType) => {
    return queryAll(entityType);
  });
}

// electron/main.ts
var isDev = !import_electron6.app.isPackaged;
var NEXT_DEV_URL = "http://localhost:3000";
var mainWindow = null;
import_electron6.app.whenReady().then(async () => {
  setupSecurity();
  initDb();
  setupIpcHandlers();
  syncEngine.start();
  mainWindow = createWindow();
  if (isDev) {
    await mainWindow.loadURL(NEXT_DEV_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexPath = import_path4.default.join(__dirname, "../out/index.html");
    await mainWindow.loadFile(indexPath);
  }
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith("file://") && !url.startsWith(NEXT_DEV_URL)) {
      import_electron6.shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });
  import_electron6.app.on("activate", () => {
    if (import_electron6.BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });
});
import_electron6.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    import_electron6.app.quit();
  }
});
import_electron6.ipcMain.handle("app:getInfo", () => ({
  version: import_electron6.app.getVersion(),
  name: import_electron6.app.getName(),
  isDev,
  platform: process.platform
}));
import_electron6.ipcMain.handle("app:quit", () => {
  import_electron6.app.quit();
});
import_electron6.ipcMain.handle("app:openExternal", (_event, url) => {
  const safeUrl = new URL(url);
  if (safeUrl.protocol === "https:" || safeUrl.protocol === "http:") {
    import_electron6.shell.openExternal(url);
  }
});
//# sourceMappingURL=main.js.map