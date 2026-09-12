"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_js_1 = require("../database/db.js");
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret-futurehub-key-change-in-production-2026!';
const JWT_EXPIRES_IN = '7d';
class AuthService {
    static generateToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            name: user.name
        };
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
    static verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    static async register(data) {
        const { email, password, name, year = '', department = '', education = '', experience_level = '' } = data;
        if (!email || !email.includes('@')) {
            throw new Error('Please provide a valid email address.');
        }
        if (!password || password.length < 6) {
            throw new Error('Password must be at least 6 characters long.');
        }
        if (!name || name.trim().length === 0) {
            throw new Error('Name is required.');
        }
        const db = (0, db_js_1.getDatabase)();
        const cleanEmail = email.trim().toLowerCase();
        // Check duplicate email
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
        if (existing) {
            throw new Error('An account with this email address already exists.');
        }
        // Hash password with bcrypt salt rounds = 10
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        // Insert user
        const insertStmt = db.prepare(`
      INSERT INTO users (email, password_hash, name, year, department, education, experience_level)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        insertStmt.run(cleanEmail, passwordHash, name.trim(), year, department, education, experience_level);
        // Retrieve inserted user
        const userRow = db.prepare(`
      SELECT id, email, name, year, department, education, experience_level, created_at, updated_at
      FROM users WHERE email = ?
    `).get(cleanEmail);
        // Create corresponding initial profile
        const profileStmt = db.prepare(`
      INSERT OR IGNORE INTO profiles (user_id, dream_career, bio)
      VALUES (?, '', '')
    `);
        profileStmt.run(userRow.id);
        const token = this.generateToken(userRow);
        return { user: userRow, token };
    }
    static async login(email, password) {
        if (!email || !password) {
            throw new Error('Email and password are required.');
        }
        const db = (0, db_js_1.getDatabase)();
        const cleanEmail = email.trim().toLowerCase();
        const userRow = db.prepare(`
      SELECT id, email, password_hash, name, year, department, education, experience_level, created_at, updated_at
      FROM users WHERE email = ?
    `).get(cleanEmail);
        if (!userRow) {
            throw new Error('Invalid email or password.');
        }
        const isMatch = await bcryptjs_1.default.compare(password, userRow.password_hash);
        if (!isMatch) {
            throw new Error('Invalid email or password.');
        }
        const safeUser = {
            id: userRow.id,
            email: userRow.email,
            name: userRow.name,
            year: userRow.year,
            department: userRow.department,
            education: userRow.education,
            experience_level: userRow.experience_level,
            created_at: userRow.created_at,
            updated_at: userRow.updated_at
        };
        const token = this.generateToken(safeUser);
        return { user: safeUser, token };
    }
    static getUserById(userId) {
        const db = (0, db_js_1.getDatabase)();
        const user = db.prepare(`
      SELECT id, email, name, year, department, education, experience_level, created_at, updated_at
      FROM users WHERE id = ?
    `).get(userId);
        return user || null;
    }
}
exports.AuthService = AuthService;
