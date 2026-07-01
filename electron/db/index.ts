import Database, { Database as BetterSqlite3Database } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { initializeSchema } from './schema';
import { logger } from '../logger';

// db is initialized lazily inside initDb() — NEVER at module load time.
// app.getPath() is only valid after app is ready.
let _db: BetterSqlite3Database | null = null;
let dbClosed = false;

export function getDb(): BetterSqlite3Database {
  if (!_db) {
    throw new Error('[DB] Database not initialized. Call initDb() first inside app.whenReady().');
  }
  return _db;
}

export function closeDb() {
  if (_db && !dbClosed) {
    try {
      _db.close();
      _db = null;
      dbClosed = true;
    } catch (err) {
      logger.error('Failed to close database safely:', err);
    }
  }
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

  // Backup DB before running schema migrations (Keep last 5)
  // Doing this before opening the database connection ensures a clean snapshot
  if (fs.existsSync(dbPath)) {
    try {
      const backupDir = path.join(app.getPath('userData'), 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `tijarat_local_${timestamp}.db.backup`);
      fs.copyFileSync(dbPath, backupPath);
      logger.info(`Database backup created at ${backupPath}`);
      
      // Cleanup older backups
      const backups = fs.readdirSync(backupDir)
        .filter(f => f.startsWith('tijarat_local_') && f.endsWith('.db.backup'))
        .sort(); // Sorting ISO strings works chronologically
        
      if (backups.length > 5) {
        for (let i = 0; i < backups.length - 5; i++) {
          fs.unlinkSync(path.join(backupDir, backups[i]));
        }
      }
    } catch (err) {
      logger.error('Failed to create database backup:', err);
    }
  }

  _db = new Database(dbPath, {
    // Remove verbose in production — swap with syncLogger
  });
  dbClosed = false;

  // Enforce WAL mode for concurrency and foreign key constraints
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  initializeSchema(_db);
}
