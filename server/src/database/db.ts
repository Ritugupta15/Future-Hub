import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let dbInstance: DatabaseSync | null = null;

export function getDatabase(customPath?: string): DatabaseSync {
  if (customPath) {
    if (dbInstance) {
      try {
        dbInstance.close();
      } catch (e) {}
    }
    const db = new DatabaseSync(customPath);
    db.exec('PRAGMA foreign_keys = ON;');
    dbInstance = db;
    return dbInstance;
  }

  if (dbInstance) {
    return dbInstance;
  }

  let dbPath = process.env.DATABASE_PATH;
  if (!dbPath) {
    const candidatePaths = [
      path.resolve(process.cwd(), 'server/futurehub.db'),
      path.resolve(process.cwd(), 'futurehub.db'),
      path.resolve(__dirname, '../../futurehub.db'),
      path.resolve(__dirname, '../../../futurehub.db')
    ];
    dbPath = candidatePaths.find(p => fs.existsSync(p)) || path.resolve(process.cwd(), 'server/futurehub.db');
  }

  if (dbPath !== ':memory:') {
    const parentDir = path.dirname(dbPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  if (dbPath !== ':memory:') {
    try {
      db.exec('PRAGMA journal_mode = WAL;');
    } catch {}
  }

  dbInstance = db;
  return dbInstance;
}

export function initializeDatabase(db?: DatabaseSync): void {
  const database = db || getDatabase();
  
  // Try several candidate paths for schema.sql
  const candidatePaths = [
    path.resolve(__dirname, 'schema.sql'),
    path.resolve(__dirname, '../src/database/schema.sql'),
    path.resolve(process.cwd(), 'src/database/schema.sql'),
    path.resolve(process.cwd(), 'server/src/database/schema.sql')
  ];

  let loaded = false;
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      const schemaSql = fs.readFileSync(p, 'utf8');
      database.exec(schemaSql);
      loaded = true;
      break;
    }
  }

  if (!loaded) {
    console.warn('Warning: schema.sql could not be found in candidate paths:', candidatePaths);
  }

  // Idempotent column migration for users table
  try {
    const tableInfo = database.prepare('PRAGMA table_info(users)').all() as Array<{ name: string }>;
    const columnNames = new Set(tableInfo.map(c => c.name));
    if (!columnNames.has('education')) {
      database.exec('ALTER TABLE users ADD COLUMN education TEXT;');
    }
    if (!columnNames.has('experience_level')) {
      database.exec('ALTER TABLE users ADD COLUMN experience_level TEXT;');
    }
  } catch (err) {
    // ignore if table doesn't exist yet
  }
}

export function closeDatabase(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch (e) {}
    dbInstance = null;
  }
}
