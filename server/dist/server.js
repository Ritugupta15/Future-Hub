"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_js_1 = require("./app.js");
const db_js_1 = require("./database/db.js");
const seed_js_1 = require("./database/seed.js");
const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';
async function bootstrap() {
    try {
        const db = (0, db_js_1.getDatabase)();
        (0, db_js_1.initializeDatabase)(db);
        // Check if careers table has records, if not seed it
        const countRow = db.prepare('SELECT COUNT(*) as count FROM careers').get();
        if (countRow.count === 0) {
            console.log('Database empty. Running initial seed...');
            (0, seed_js_1.seedDatabase)(db);
        }
        const app = (0, app_js_1.createApp)();
        const server = app.listen(PORT, HOST, () => {
            console.log(`=======================================================`);
            console.log(` FutureHub Production Server running on ${HOST}:${PORT}`);
            console.log(` Health check: http://${HOST}:${PORT}/api/health`);
            console.log(`=======================================================`);
        });
        const shutdown = () => {
            console.log('Gracefully shutting down FutureHub server...');
            server.close(() => {
                console.log('HTTP server closed.');
                process.exit(0);
            });
        };
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }
    catch (error) {
        console.error('Fatal error during server bootstrap:', error);
        process.exit(1);
    }
}
bootstrap();
