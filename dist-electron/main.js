"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// electron/updater.ts
var updater_exports = {};
__export(updater_exports, {
  setupUpdater: () => setupUpdater
});
function setupUpdater(mainWindow2) {
  import_electron_updater.autoUpdater.autoDownload = true;
  import_electron_updater.autoUpdater.autoInstallOnAppQuit = true;
  import_electron_updater.autoUpdater.on("checking-for-update", () => {
    mainWindow2.webContents.send("updater:status", "Checking for updates...");
  });
  import_electron_updater.autoUpdater.on("update-available", (info) => {
    mainWindow2.webContents.send("updater:available", info);
  });
  import_electron_updater.autoUpdater.on("update-not-available", () => {
    mainWindow2.webContents.send("updater:status", "App is up to date.");
  });
  import_electron_updater.autoUpdater.on("error", (err) => {
    mainWindow2.webContents.send("updater:error", err.message);
  });
  import_electron_updater.autoUpdater.on("download-progress", (progressObj) => {
    mainWindow2.webContents.send("updater:progress", progressObj);
  });
  import_electron_updater.autoUpdater.on("update-downloaded", (info) => {
    mainWindow2.webContents.send("updater:downloaded", info);
  });
  import_electron9.ipcMain.handle("updater:check", () => {
    return import_electron_updater.autoUpdater.checkForUpdatesAndNotify();
  });
  import_electron9.ipcMain.handle("updater:install", () => {
    import_electron_updater.autoUpdater.quitAndInstall();
  });
}
var import_electron_updater, import_electron9;
var init_updater = __esm({
  "electron/updater.ts"() {
    "use strict";
    import_electron_updater = require("electron-updater");
    import_electron9 = require("electron");
  }
});

// electron/main.ts
var import_electron10 = require("electron");
var import_path6 = __toESM(require("path"));

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
    frame: false,
    // fully frameless on Windows/Linux
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
var isDev = !import_electron2.app.isPackaged;
var CSP = isDev ? [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* wss://localhost:* https:",
  "media-src 'self'",
  "object-src 'none'",
  "frame-src 'self'"
].join("; ") : [
  "default-src 'self'",
  "script-src 'self'",
  // Removed unsafe-inline and unsafe-eval
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https:",
  // Removed localhost
  "media-src 'self'",
  "object-src 'none'",
  "frame-src 'none'"
  // No iframes in prod
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
      if (isDev) {
        callback({ responseHeaders: details.responseHeaders });
        return;
      }
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
      customerId TEXT,
      total REAL NOT NULL,
      status TEXT NOT NULL,
      items TEXT NOT NULL,
      paymentMethod TEXT,
      discount REAL,
      updatedAt INTEGER NOT NULL,
      version INTEGER NOT NULL DEFAULT 1
    );
  `);
  const newColumns = [
    "customerId TEXT",
    "items TEXT",
    "paymentMethod TEXT",
    "discount REAL"
  ];
  for (const col of newColumns) {
    try {
      db2.exec(`ALTER TABLE orders ADD COLUMN ${col};`);
    } catch (err) {
      if (!err.message.includes("duplicate column name")) {
        console.warn(`[DB] Migration warn: Could not add ${col} to orders:`, err);
      }
    }
  }
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
  db2.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      shop_id TEXT,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      metadata TEXT
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
var import_electron8 = require("electron");

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
    const auditStmt = db.prepare(`
      INSERT INTO audit_log (id, tenant_id, shop_id, user_id, action, entity, entity_id, timestamp, metadata)
      VALUES (@id, @tenant_id, @shop_id, @user_id, @action, @entity, @entity_id, @timestamp, @metadata)
    `);
    auditStmt.run({
      id: (0, import_uuid.v7)(),
      tenant_id: payload.tenantId || payload.tenant_id || "system",
      shop_id: payload.shopId || payload.shop_id || "system",
      user_id: payload.userId || payload.user_id || "system",
      action: operation,
      entity: entityType,
      entity_id: payload.id || opId,
      timestamp,
      metadata: JSON.stringify(payload)
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

// electron/auth/storage.ts
var import_electron5 = require("electron");
var import_electron_store = __toESM(require("electron-store"));
var store = new import_electron_store.default({
  name: "auth-tokens"
});
function setToken(key, token) {
  if (import_electron5.safeStorage.isEncryptionAvailable()) {
    const encrypted = import_electron5.safeStorage.encryptString(token);
    store.set(key, encrypted.toString("base64"));
  } else {
    store.set(key, Buffer.from(token, "utf-8").toString("base64"));
  }
}
function getToken(key) {
  const data = store.get(key);
  if (!data) return null;
  try {
    if (import_electron5.safeStorage.isEncryptionAvailable()) {
      return import_electron5.safeStorage.decryptString(Buffer.from(data, "base64"));
    } else {
      return Buffer.from(data, "base64").toString("utf-8");
    }
  } catch (err) {
    console.error("[safeStorage] Failed to decrypt token", err);
    return null;
  }
}
function clearToken(key) {
  store.delete(key);
}

// electron/services/backupEngine.ts
var import_fs2 = __toESM(require("fs"));
var import_path4 = __toESM(require("path"));
var import_zlib = __toESM(require("zlib"));
var import_promises = require("stream/promises");

// electron/services/config.ts
var import_electron_store2 = __toESM(require("electron-store"));
var defaultConfig = {
  backupPath: "",
  lastBackupDate: "",
  autoBackupEnabled: true
};
var configStore = new import_electron_store2.default({
  name: "tijarat-config",
  defaults: defaultConfig
});

// electron/services/backupEngine.ts
var import_electron6 = require("electron");
async function createBackup() {
  try {
    const backupPath = configStore.get("backupPath");
    if (!backupPath) {
      return { success: false, message: "Backup path not configured" };
    }
    if (!import_fs2.default.existsSync(backupPath)) {
      import_fs2.default.mkdirSync(backupPath, { recursive: true });
    }
    const dateStr = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    const backupFileName = `tijarat_backup_${dateStr}.db.gz`;
    const destinationFile = import_path4.default.join(backupPath, backupFileName);
    const tempDbPath = import_path4.default.join(import_electron6.app.getPath("temp"), `temp_backup_${dateStr}.db`);
    await db.backup(tempDbPath);
    const source = import_fs2.default.createReadStream(tempDbPath);
    const destination = import_fs2.default.createWriteStream(destinationFile);
    const gzip = import_zlib.default.createGzip();
    await (0, import_promises.pipeline)(source, gzip, destination);
    import_fs2.default.unlinkSync(tempDbPath);
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    configStore.set("lastBackupDate", todayStr);
    cleanupOldBackups(backupPath);
    return { success: true, message: "Backup completed successfully", backupFile: destinationFile };
  } catch (error) {
    console.error("Backup failed:", error);
    return { success: false, message: error.message || "Backup failed" };
  }
}
function cleanupOldBackups(backupPath) {
  try {
    const files = import_fs2.default.readdirSync(backupPath).filter((f) => f.startsWith("tijarat_backup_") && f.endsWith(".db.gz")).map((f) => ({ name: f, time: import_fs2.default.statSync(import_path4.default.join(backupPath, f)).mtime.getTime() })).sort((a, b) => b.time - a.time);
    if (files.length > 30) {
      const toDelete = files.slice(30);
      for (const file of toDelete) {
        import_fs2.default.unlinkSync(import_path4.default.join(backupPath, file.name));
      }
    }
  } catch (err) {
    console.error("Failed to cleanup old backups:", err);
  }
}
function getBackupStatus() {
  return {
    backupPath: configStore.get("backupPath"),
    lastBackupDate: configStore.get("lastBackupDate"),
    autoBackupEnabled: configStore.get("autoBackupEnabled")
  };
}

// electron/services/restoreEngine.ts
var import_fs3 = __toESM(require("fs"));
var import_path5 = __toESM(require("path"));
var import_zlib2 = __toESM(require("zlib"));
var import_promises2 = require("stream/promises");
var import_electron7 = require("electron");
async function restoreDatabase(backupFilePath) {
  try {
    if (!import_fs3.default.existsSync(backupFilePath)) {
      return { success: false, message: "Backup file does not exist" };
    }
    const userDataPath = import_electron7.app.getPath("userData");
    const currentDbPath = import_path5.default.join(userDataPath, "tijarat_local.db");
    const preRestorePath = import_path5.default.join(userDataPath, "tijarat_local.db.pre-restore");
    const extractedTempPath = import_path5.default.join(import_electron7.app.getPath("temp"), `restore_temp_${Date.now()}.db`);
    const source = import_fs3.default.createReadStream(backupFilePath);
    const destination = import_fs3.default.createWriteStream(extractedTempPath);
    const gunzip = import_zlib2.default.createGunzip();
    await (0, import_promises2.pipeline)(source, gunzip, destination);
    const stat = import_fs3.default.statSync(extractedTempPath);
    if (stat.size === 0) {
      import_fs3.default.unlinkSync(extractedTempPath);
      throw new Error("Extracted database is empty or corrupted.");
    }
    try {
      db.close();
    } catch (e) {
      console.warn("Error closing DB during restore:", e);
    }
    if (import_fs3.default.existsSync(currentDbPath)) {
      if (import_fs3.default.existsSync(preRestorePath)) {
        import_fs3.default.unlinkSync(preRestorePath);
      }
      import_fs3.default.renameSync(currentDbPath, preRestorePath);
    }
    try {
      import_fs3.default.copyFileSync(extractedTempPath, currentDbPath);
      import_fs3.default.unlinkSync(extractedTempPath);
      setTimeout(() => {
        import_electron7.app.relaunch();
        import_electron7.app.exit(0);
      }, 1e3);
      return { success: true, message: "Restore successful. Restarting application..." };
    } catch (restoreError) {
      console.error("Failed to copy restored DB, attempting rollback...", restoreError);
      if (import_fs3.default.existsSync(preRestorePath)) {
        import_fs3.default.renameSync(preRestorePath, currentDbPath);
      }
      return { success: false, message: "Restore failed, rolled back to previous state. " + restoreError.message };
    }
  } catch (error) {
    console.error("Restore sequence failed:", error);
    return { success: false, message: error.message || "Restore sequence failed" };
  }
}

// electron/ipc/validation.ts
var import_zod = require("zod");
var UserSchema = import_zod.z.object({
  id: import_zod.z.string().min(1),
  name: import_zod.z.string().min(1).optional(),
  email: import_zod.z.string().email().optional(),
  updatedAt: import_zod.z.number().optional(),
  version: import_zod.z.number().optional()
}).strict();
var ProductSchema = import_zod.z.object({
  id: import_zod.z.string().min(1),
  name: import_zod.z.string().min(1).optional(),
  price: import_zod.z.number().optional(),
  stock: import_zod.z.number().optional(),
  updatedAt: import_zod.z.number().optional(),
  version: import_zod.z.number().optional()
}).strict();
var OrderSchema = import_zod.z.object({
  id: import_zod.z.string().min(1),
  customerId: import_zod.z.string().optional().nullable(),
  total: import_zod.z.number().optional(),
  status: import_zod.z.string().optional(),
  items: import_zod.z.string().optional(),
  // usually JSON stringified
  paymentMethod: import_zod.z.string().optional().nullable(),
  discount: import_zod.z.number().optional().nullable(),
  updatedAt: import_zod.z.number().optional(),
  version: import_zod.z.number().optional()
}).strict();
function validatePayload(entityType, operation, payload) {
  if (operation === "DELETE") {
    const deleteSchema = import_zod.z.object({ id: import_zod.z.string().min(1) }).strict();
    return deleteSchema.parse(payload);
  }
  switch (entityType) {
    case "users":
      return UserSchema.parse(payload);
    case "products":
      return ProductSchema.parse(payload);
    case "orders": {
      const result = OrderSchema.safeParse(payload);
      if (!result.success) {
        console.error("[IPC Validation Error] orders:", JSON.stringify(result.error.format(), null, 2));
        console.error("VALIDATING ORDER PAYLOAD:", JSON.stringify(payload, null, 2));
        throw new Error(`[IPC Security] Invalid payload for orders ${operation}`);
      }
      return result.data;
    }
    default:
      throw new Error(`[IPC Validation] Unknown entity type: ${entityType}`);
  }
}

// electron/ipc/handlers.ts
function setupIpcHandlers() {
  import_electron8.ipcMain.handle("db:mutate", (_event, entityType, operation, payload) => {
    try {
      const validatedPayload = validatePayload(entityType, operation, payload);
      return mutateEntity(entityType, operation, validatedPayload);
    } catch (err) {
      console.error("[IPC Security] Payload validation failed for db:mutate", err.errors || err);
      throw new Error(`[IPC Security] Invalid payload for ${entityType} ${operation}`);
    }
  });
  import_electron8.ipcMain.handle("db:query", (_event, entityType, id) => {
    return queryEntity(entityType, id);
  });
  import_electron8.ipcMain.handle("db:queryAll", (_event, entityType) => {
    return queryAll(entityType);
  });
  import_electron8.ipcMain.handle("auth:setToken", (_event, key, token) => {
    setToken(key, token);
  });
  import_electron8.ipcMain.handle("auth:getToken", (_event, key) => {
    return getToken(key);
  });
  import_electron8.ipcMain.handle("auth:clearToken", (_event, key) => {
    clearToken(key);
  });
  import_electron8.ipcMain.handle("db:backup", async () => {
    return createBackup();
  });
  import_electron8.ipcMain.handle("db:restore", async (_event, backupFilePath) => {
    return restoreDatabase(backupFilePath);
  });
  import_electron8.ipcMain.handle("db:get-backup-status", () => {
    return getBackupStatus();
  });
  import_electron8.ipcMain.handle("db:set-backup-path", (_event, backupPath) => {
    configStore.set("backupPath", backupPath);
    return { success: true };
  });
  import_electron8.ipcMain.handle("app:minimize", () => {
    const win = import_electron8.BrowserWindow.getFocusedWindow();
    if (win) win.minimize();
  });
  import_electron8.ipcMain.handle("app:maximize", () => {
    const win = import_electron8.BrowserWindow.getFocusedWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });
  import_electron8.ipcMain.handle("app:close", () => {
    const win = import_electron8.BrowserWindow.getFocusedWindow();
    if (win) win.close();
  });
  import_electron8.ipcMain.handle("app:getSystemInfo", () => {
    return {
      appVersion: import_electron8.app.getVersion(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      platform: process.platform,
      arch: process.arch,
      memoryUsage: process.getSystemMemoryInfo ? process.getSystemMemoryInfo() : process.memoryUsage()
    };
  });
}

// electron/main.ts
var isDev2 = !import_electron10.app.isPackaged;
var NEXT_DEV_URL = "http://localhost:3000";
var mainWindow = null;
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    import_electron10.app.setAsDefaultProtocolClient("tijaratpro", process.execPath, [import_path6.default.resolve(process.argv[1])]);
  }
} else {
  import_electron10.app.setAsDefaultProtocolClient("tijaratpro");
}
import_electron10.app.on("open-url", (event, url) => {
  event.preventDefault();
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});
import_electron10.app.whenReady().then(async () => {
  setupSecurity();
  initDb();
  setupIpcHandlers();
  syncEngine.start();
  mainWindow = createWindow();
  if (isDev2) {
    let loaded = false;
    for (let i = 0; i < 30; i++) {
      try {
        await mainWindow.loadURL(NEXT_DEV_URL);
        loaded = true;
        break;
      } catch (err) {
        console.log(`[electron] Waiting for Next.js dev server to start (${i + 1}/30)...`);
        await new Promise((resolve) => setTimeout(resolve, 1e3));
      }
    }
    if (!loaded) {
      console.error("[electron] Failed to connect to Next.js dev server.");
    }
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexPath = import_path6.default.join(__dirname, "../out/index.html");
    await mainWindow.loadFile(indexPath);
    const { setupUpdater: setupUpdater2 } = (init_updater(), __toCommonJS(updater_exports));
    setupUpdater2(mainWindow);
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow?.webContents.closeDevTools();
    });
    mainWindow.webContents.on("before-input-event", (event, input) => {
      const isF12 = input.key === "F12";
      const isInspect = input.control && input.shift && input.key.toLowerCase() === "i";
      const isMacInspect = input.meta && input.alt && input.key.toLowerCase() === "i";
      if (isF12 || isInspect || isMacInspect) {
        event.preventDefault();
      }
    });
  }
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith("file://") && !url.startsWith(NEXT_DEV_URL)) {
      import_electron10.shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });
  import_electron10.app.on("activate", () => {
    if (import_electron10.BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });
});
import_electron10.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    import_electron10.app.quit();
  }
});
import_electron10.ipcMain.handle("app:getInfo", () => ({
  version: import_electron10.app.getVersion(),
  name: import_electron10.app.getName(),
  isDev: isDev2,
  platform: process.platform
}));
import_electron10.ipcMain.handle("app:quit", () => {
  import_electron10.app.quit();
});
import_electron10.ipcMain.handle("app:openExternal", (_event, url) => {
  const safeUrl = new URL(url);
  if (safeUrl.protocol === "https:" || safeUrl.protocol === "http:") {
    import_electron10.shell.openExternal(url);
  }
});
//# sourceMappingURL=main.js.map