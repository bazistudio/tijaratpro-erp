import Database, { Database as BetterSqlite3Database } from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import { initializeSchema } from './schema';

// db is initialized lazily inside initDb() — NEVER at module load time.
// app.getPath() is only valid after app is ready.
let _db: BetterSqlite3Database | null = null;

export function getDb(): BetterSqlite3Database {
  if (!_db) {
    throw new Error('[DB] Database not initialized. Call initDb() first inside app.whenReady().');
  }
  return _db;
}

// Proxy db reference — routes all calls to the lazily-initialized _db instance.
// Typed explicitly so TypeScript can name it in .d.ts declarations (fixes TS4023).
export const db: BetterSqlite3Database = new Proxy({} as BetterSqlite3Database, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  }
});

export function initDb() {
  if (_db) return; // Idempotent — safe to call multiple times

  const dbPath = path.join(app.getPath('userData'), 'tijarat_local.db');

  _db = new Database(dbPath, {
    // Remove verbose in production — swap with syncLogger
  });

  // Enforce WAL mode for concurrency and foreign key constraints
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  initializeSchema(_db);
}
