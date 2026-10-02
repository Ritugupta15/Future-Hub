"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = getDatabase;
exports.initializeDatabase = initializeDatabase;
exports.closeDatabase = closeDatabase;
const node_sqlite_1 = require("node:sqlite");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let dbInstance = null;
function getDatabase(customPath) {
    if (customPath) {
        if (dbInstance) {
            try {
                dbInstance.close();
            }
            catch (e) { }
        }
        const db = new node_sqlite_1.DatabaseSync(customPath);
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
            path_1.default.resolve(process.cwd(), 'server/futurehub.db'),
            path_1.default.resolve(process.cwd(), 'futurehub.db'),
            path_1.default.resolve(__dirname, '../../futurehub.db'),
            path_1.default.resolve(__dirname, '../../../futurehub.db')
        ];
        dbPath = candidatePaths.find(p => fs_1.default.existsSync(p)) || path_1.default.resolve(process.cwd(), 'server/futurehub.db');
    }
    if (dbPath !== ':memory:') {
        const parentDir = path_1.default.dirname(dbPath);
        if (!fs_1.default.existsSync(parentDir)) {
            fs_1.default.mkdirSync(parentDir, { recursive: true });
        }
    }
    const db = new node_sqlite_1.DatabaseSync(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');
    if (dbPath !== ':memory:') {
        try {
            db.exec('PRAGMA journal_mode = WAL;');
        }
        catch { }
    }
    dbInstance = db;
    return dbInstance;
}
function initializeDatabase(db) {
    const database = db || getDatabase();
    // Try several candidate paths for schema.sql
    const candidatePaths = [
        path_1.default.resolve(__dirname, 'schema.sql'),
        path_1.default.resolve(__dirname, '../src/database/schema.sql'),
        path_1.default.resolve(process.cwd(), 'src/database/schema.sql'),
        path_1.default.resolve(process.cwd(), 'server/src/database/schema.sql')
    ];
    let loaded = false;
    for (const p of candidatePaths) {
        if (fs_1.default.existsSync(p)) {
            const schemaSql = fs_1.default.readFileSync(p, 'utf8');
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
        const tableInfo = database.prepare('PRAGMA table_info(users)').all();
        const columnNames = new Set(tableInfo.map(c => c.name));
        if (!columnNames.has('education')) {
            database.exec('ALTER TABLE users ADD COLUMN education TEXT;');
        }
        if (!columnNames.has('experience_level')) {
            database.exec('ALTER TABLE users ADD COLUMN experience_level TEXT;');
        }
    }
    catch (err) {
        // ignore if table doesn't exist yet
    }
}
function closeDatabase() {
    if (dbInstance) {
        try {
            dbInstance.close();
        }
        catch (e) { }
        dbInstance = null;
    }
}
